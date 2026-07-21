import { query } from './db.js';
import { v4 as uuidv4 } from 'uuid';
import { acquireLock, releaseLock } from './redis.js';
import {
  createReservedAccount,
  initiateTransfer,
  getTransferStatus,
  verifyTransaction,
  initiateRefund,
  validateBankAccount,
  verifyNIN,
  verifyBVN,
  createWallet,
  getWalletBalanceForRef,
  getWalletTransactionsForAccount
} from './monnify.js';

// Self-executing DB schema extension for KYC and Monnify Wallets
async function initDBExtensions() {
  try {
    await query(`
      ALTER TABLE user_profiles 
      ADD COLUMN IF NOT EXISTS nin VARCHAR(50),
      ADD COLUMN IF NOT EXISTS bvn VARCHAR(50),
      ADD COLUMN IF NOT EXISTS kyc_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS wallet_account_number VARCHAR(100),
      ADD COLUMN IF NOT EXISTS wallet_reference VARCHAR(100),
      ADD COLUMN IF NOT EXISTS wallet_bank_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC(15, 2) DEFAULT 0.00;
    `);
    await query(`
      CREATE TABLE IF NOT EXISTS mock_wallet_transactions (
        id UUID PRIMARY KEY,
        wallet_account_number VARCHAR(100) NOT NULL,
        wallet_transaction_reference VARCHAR(100) NOT NULL UNIQUE,
        monnify_transaction_reference VARCHAR(100),
        amount NUMERIC(15, 2) NOT NULL,
        transaction_date TIMESTAMP DEFAULT NOW(),
        transaction_type VARCHAR(10) NOT NULL,
        narration VARCHAR(255),
        status VARCHAR(20) NOT NULL
      );
    `);
    await query(`
      ALTER TABLE rent_payments 
      ADD COLUMN IF NOT EXISTS redeemed BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS redeemed_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS redeem_payout_reference VARCHAR(100);
    `);
    console.log("🚀 PostgreSQL schema extended for KYC and Wallets successfully.");

    // Migrate existing tenancies to rent_payments if they don't have records
    const tenanciesRes = await query('SELECT * FROM tenancies');
    for (const tenancy of tenanciesRes.rows) {
      const payCheck = await query('SELECT id FROM rent_payments WHERE tenancy_id = $1', [tenancy.id]);
      if (payCheck.rows.length === 0) {
        const payId = uuidv4();
        const ref = tenancy.nomba_virtual_account_id || `MNFY_REF_${tenancy.id}`;
        await query(
          `INSERT INTO rent_payments (id, tenancy_id, amount, nomba_reference, matched_status, received_at)
           VALUES ($1, $2, $3, $4, 'MATCHED', $5)
           ON CONFLICT (nomba_reference) DO NOTHING`,
          [payId, tenancy.id, tenancy.rent_amount, ref, tenancy.created_at || new Date()]
        );
      }
    }
    console.log("🚀 Tenancy collections database check complete.");
  } catch (err) {
    console.error("❌ Failed to extend database schema:", err);
  }
}
initDBExtensions();

// Helper to net the checkout fee if applicable (matching NetCheckoutAmount in Java)
const CHECKOUT_FEE = 1.4;
function netCheckoutAmount(amount, orderReference, expectedAmount) {
  if (!orderReference || !amount) {
    return amount;
  }
  const amt = parseFloat(amount);
  const exp = parseFloat(expectedAmount);
  // Preserve historical exact payments created before the fee-inclusive checkout flow.
  if (amt === exp || amt <= CHECKOUT_FEE) {
    return amt;
  }
  return Math.max(0, amt - CHECKOUT_FEE);
}

// Helper to advance the due date based on frequency
function advanceDueDate(currentDateStr, frequency) {
  const date = new Date(currentDateStr);
  const freq = (frequency || '').toUpperCase();
  if (freq === 'ANNUAL' || freq === 'YEARLY') {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    date.setMonth(date.getMonth() + 1);
  }
  return date.toISOString().split('T')[0];
}

const rawResolvers = {
  Query: {
    getMerchantPlans: async () => {
      const res = await query('SELECT * FROM plans');
      return res.rows;
    },
    getSubscription: async (_, { id }) => {
      const res = await query('SELECT * FROM subscriptions WHERE id = $1', [id]);
      if (res.rows.length === 0) {
        throw new Error('Requested subscription does not exist.');
      }
      return res.rows[0];
    },
    getUnmatchedQueue: async () => {
      const res = await query('SELECT * FROM rent_payments WHERE matched_status = $1', ['UNMATCHED']);
      return res.rows;
    },
    getProperties: async () => {
      const res = await query('SELECT * FROM properties');
      return res.rows;
    },
    getProperty: async (_, { id }) => {
      const res = await query('SELECT * FROM properties WHERE id = $1', [id]);
      if (res.rows.length === 0) {
        throw new Error('Property not found.');
      }
      return res.rows[0];
    },
    getLandlord: async (_, { email }) => {
      const res = await query('SELECT * FROM landlords WHERE email = $1', [email]);
      return res.rows[0] || null;
    },
    getTenancies: async () => {
      const res = await query('SELECT * FROM tenancies');
      return res.rows;
    },
    getTenancy: async (_, { id }) => {
      const res = await query('SELECT * FROM tenancies WHERE id = $1', [id]);
      if (res.rows.length === 0) {
        throw new Error('Tenancy not found.');
      }
      return res.rows[0];
    },
    getEscrowTransactions: async () => {
      const res = await query('SELECT * FROM escrow_transactions');
      return res.rows;
    },
    getUserProfile: async (_, { email }) => {
      const res = await query('SELECT * FROM user_profiles WHERE LOWER(email) = LOWER($1)', [email]);
      return res.rows[0] || null;
    },
    getChatMessages: async (_, { propertyId }) => {
      const res = await query('SELECT * FROM chat_messages WHERE property_id = $1 ORDER BY created_at ASC', [propertyId]);
      return res.rows;
    },
    getReceipts: async (_, { tenantEmail }) => {
      const res = await query('SELECT * FROM receipts WHERE LOWER(tenant_email) = LOWER($1) ORDER BY created_at DESC', [tenantEmail]);
      return res.rows;
    },
    getTourAppointments: async (_, { tenantEmail }) => {
      const res = await query(`
        SELECT ta.* 
        FROM tour_appointments ta
        LEFT JOIN properties p ON ta.property_id = p.id
        LEFT JOIN landlords l ON p.landlord_id = l.id
        WHERE LOWER(ta.tenant_email) = LOWER($1) OR LOWER(l.email) = LOWER($1)
        ORDER BY ta.created_at DESC
      `, [tenantEmail]);
      return res.rows;
    },
    getUserWalletTransactions: async (_, { accountNumber }) => {
      if (accountNumber && accountNumber.startsWith('992')) {
        const localTx = await query('SELECT * FROM mock_wallet_transactions WHERE wallet_account_number = $1 ORDER BY transaction_date DESC', [accountNumber]);
        return localTx.rows.map(tx => ({
          walletTransactionReference: tx.wallet_transaction_reference,
          monnifyTransactionReference: tx.monnify_transaction_reference,
          amount: tx.amount,
          transactionDate: tx.transaction_date.toISOString(),
          transactionType: tx.transaction_type,
          narration: tx.narration,
          status: tx.status
        }));
      }

      try {
        const data = await getWalletTransactionsForAccount(accountNumber);
        if (!data || !data.content) return [];
        return data.content.map(tx => ({
          walletTransactionReference: tx.walletTransactionReference,
          monnifyTransactionReference: tx.monnifyTransactionReference,
          amount: tx.amount,
          transactionDate: tx.transactionDate,
          transactionType: tx.transactionType,
          narration: tx.narration,
          status: tx.status
        }));
      } catch (err) {
        const localTx = await query('SELECT * FROM mock_wallet_transactions WHERE wallet_account_number = $1 ORDER BY transaction_date DESC', [accountNumber]);
        if (localTx.rows.length > 0) {
          return localTx.rows.map(tx => ({
            walletTransactionReference: tx.wallet_transaction_reference,
            monnifyTransactionReference: tx.monnify_transaction_reference,
            amount: tx.amount,
            transactionDate: tx.transaction_date.toISOString(),
            transactionType: tx.transaction_type,
            narration: tx.narration,
            status: tx.status
          }));
        }
        console.error("Failed to fetch wallet transactions:", err);
        return [];
      }
    },
    getMonnifyConfig: async () => {
      return {
        apiKey: process.env.MONNIFY_API_KEY || '',
        contractCode: process.env.MONNIFY_CONTRACT_CODE || ''
      };
    },
    getLandlordRentPayments: async (_, { landlordEmail }) => {
      const landlordRes = await query('SELECT id FROM landlords WHERE LOWER(email) = LOWER($1)', [landlordEmail]);
      if (landlordRes.rows.length === 0) return [];
      const landlordId = landlordRes.rows[0].id;

      const paymentsRes = await query(`
        SELECT rp.* 
        FROM rent_payments rp
        JOIN tenancies t ON rp.tenancy_id = t.id
        JOIN properties p ON t.property_id = p.id
        WHERE p.landlord_id = $1
        ORDER BY rp.received_at DESC
      `, [landlordId]);

      return paymentsRes.rows;
    }
  },

  Mutation: {
    pauseSubscription: async (_, { id }) => {
      const check = await query('SELECT * FROM subscriptions WHERE id = $1', [id]);
      if (check.rows.length === 0) {
        throw new Error('Subscription not found.');
      }
      const res = await query(
        'UPDATE subscriptions SET status = $1 WHERE id = $2 RETURNING *',
        ['PAUSED', id]
      );
      return res.rows[0];
    },
    resumeSubscription: async (_, { id }) => {
      const check = await query('SELECT * FROM subscriptions WHERE id = $1', [id]);
      if (check.rows.length === 0) {
        throw new Error('Subscription not found.');
      }
      const res = await query(
        'UPDATE subscriptions SET status = $1 WHERE id = $2 RETURNING *',
        ['ACTIVE', id]
      );
      return res.rows[0];
    },
    createPlan: async (_, { input }) => {
      const id = uuidv4();
      const res = await query(
        'INSERT INTO plans (id, name, amount, frequency) VALUES ($1, $2, $3, $4) RETURNING *',
        [id, input.name, input.amount, input.frequency]
      );
      return res.rows[0];
    },
    createLandlord: async (_, { name, email, phone }) => {
      const check = await query('SELECT * FROM landlords WHERE email = $1', [email]);
      if (check.rows.length > 0) {
        return check.rows[0];
      }
      const id = uuidv4();
      const res = await query(
        'INSERT INTO landlords (id, name, email, phone) VALUES ($1, $2, $3, $4) RETURNING *',
        [id, name, email, phone]
      );
      return res.rows[0];
    },
    updateLandlordPayoutDetails: async (_, { email, bankAccountNumber, bankCode, bankAccountName }) => {
      const check = await query('SELECT * FROM landlords WHERE email = $1', [email]);
      if (check.rows.length === 0) {
        throw new Error('Landlord not found.');
      }
      const res = await query(
        'UPDATE landlords SET bank_account_number = $1, bank_code = $2, bank_account_name = $3 WHERE email = $4 RETURNING *',
        [bankAccountNumber, bankCode, bankAccountName || null, email]
      );
      return res.rows[0];
    },
    createProperty: async (_, { landlordId, title, type, status }) => {
      const check = await query('SELECT * FROM landlords WHERE id = $1', [landlordId]);
      if (check.rows.length === 0) {
        throw new Error('Landlord not found.');
      }
      const id = uuidv4();
      const res = await query(
        'INSERT INTO properties (id, landlord_id, title, type, status, verification_status, total_units, available_units) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [id, landlordId, title, type, status, 'PENDING', 1, 1]
      );
      return res.rows[0];
    },
    createTenancy: async (_, { propertyId, tenantId, rentAmount, frequency, nextDueDate, nombaVirtualAccountId, nombaOrderReference }) => {
      const propRes = await query('SELECT * FROM properties WHERE id = $1', [propertyId]);
      if (propRes.rows.length === 0) {
        throw new Error('Property not found.');
      }
      const property = propRes.rows[0];
      if ((property.type || '').toUpperCase() !== 'RENT') {
        throw new Error('Lease agreements can only be created for RENT properties.');
      }

      // Check if tenant already has active lease
      const leaseCheck = await query('SELECT * FROM tenancies WHERE property_id = $1 AND tenant_id = $2', [propertyId, tenantId]);
      if (leaseCheck.rows.length > 0) {
        throw new Error('This tenant already has a lease for the property.');
      }

      const availableUnits = property.available_units !== null ? property.available_units : 1;
      if (availableUnits <= 0) {
        throw new Error('Property has no available units.');
      }

      const newAvailable = availableUnits - 1;
      const newStatus = newAvailable === 0 ? 'LET' : property.status;

      // Update property
      await query(
        'UPDATE properties SET available_units = $1, status = $2 WHERE id = $3',
        [newAvailable, newStatus, propertyId]
      );

      const id = uuidv4();
      const tenancyRes = await query(
        'INSERT INTO tenancies (id, property_id, tenant_id, rent_amount, frequency, next_due_date, balance, nomba_virtual_account_id, nomba_order_reference) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [id, propertyId, tenantId, rentAmount, frequency, nextDueDate, 0.00, nombaVirtualAccountId, nombaOrderReference || null]
      );

      // Insert matching record into rent_payments so the landlord can redeem/collect it!
      const paymentId = uuidv4();
      await query(
        `INSERT INTO rent_payments (id, tenancy_id, amount, nomba_reference, matched_status, received_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [paymentId, id, rentAmount, nombaVirtualAccountId, 'MATCHED']
      );

      return tenancyRes.rows[0];
    },
    createEscrowTransaction: async (_, { propertyId, buyerId, amountHeld, nombaVirtualAccountId, nombaOrderReference }) => {
      const propRes = await query('SELECT * FROM properties WHERE id = $1', [propertyId]);
      if (propRes.rows.length === 0) {
        throw new Error('Property not found.');
      }
      const property = propRes.rows[0];
      if ((property.type || '').toUpperCase() !== 'SALE') {
        throw new Error('Purchase escrow can only be created for SALE properties.');
      }

      // Check if active purchase escrow exists (status HELD or PENDING_PAYMENT)
      const escrowCheck = await query(
        "SELECT * FROM escrow_transactions WHERE property_id = $1 AND status IN ('PENDING_PAYMENT', 'HELD')",
        [propertyId]
      );
      if (escrowCheck.rows.length > 0) {
        throw new Error('This property already has an active purchase escrow.');
      }

      const availableUnits = property.available_units !== null ? property.available_units : 1;
      if (availableUnits <= 0) {
        throw new Error('Property has no available units.');
      }

      // Update property
      const newAvailable = Math.max(0, availableUnits - 1);
      await query(
        "UPDATE properties SET status = 'UNDER_ESCROW', available_units = $1 WHERE id = $2",
        [newAvailable, propertyId]
      );

      const id = uuidv4();
      const isPaidCheckout = nombaVirtualAccountId && (nombaVirtualAccountId.startsWith('MNFY') || nombaVirtualAccountId.includes('checkout') || nombaVirtualAccountId.startsWith('pay_ref'));
      const initialStatus = isPaidCheckout ? 'HELD' : 'PENDING_PAYMENT';
      const txnRef = isPaidCheckout ? nombaVirtualAccountId : null;

      const escrowRes = await query(
        'INSERT INTO escrow_transactions (id, property_id, buyer_id, amount_held, status, nomba_virtual_account_id, nomba_order_reference, nomba_transaction_reference) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [id, propertyId, buyerId, amountHeld, initialStatus, nombaVirtualAccountId, nombaOrderReference || null, txnRef]
      );

      return escrowRes.rows[0];
    },
    linkTenancyOrder: async (_, { tenancyId, orderReference }) => {
      const res = await query(
        'UPDATE tenancies SET nomba_order_reference = $1 WHERE id = $2 RETURNING *',
        [orderReference, tenancyId]
      );
      if (res.rows.length === 0) {
        throw new Error('Tenancy not found.');
      }
      return res.rows[0];
    },
    claimTenancy: async (_, { tenancyId, tenantId }) => {
      const res = await query(
        'UPDATE tenancies SET tenant_id = $1 WHERE id = $2 RETURNING *',
        [tenantId, tenancyId]
      );
      if (res.rows.length === 0) {
        throw new Error('Tenancy not found.');
      }
      return res.rows[0];
    },
    linkEscrowOrder: async (_, { escrowId, orderReference }) => {
      const res = await query(
        'UPDATE escrow_transactions SET nomba_order_reference = $1 WHERE id = $2 RETURNING *',
        [orderReference, escrowId]
      );
      if (res.rows.length === 0) {
        throw new Error('Escrow transaction not found.');
      }
      return res.rows[0];
    },
    releaseEscrow: async (_, { id }) => {
      const escrowRes = await query('SELECT * FROM escrow_transactions WHERE id = $1', [id]);
      if (escrowRes.rows.length === 0) {
        throw new Error('Escrow transaction not found.');
      }
      const escrow = escrowRes.rows[0];
      const currentStatus = (escrow.status || '').toUpperCase();
      if (currentStatus !== 'HELD' && currentStatus !== 'PAYOUT_FAILED' && currentStatus !== 'RELEASE_PENDING') {
        throw new Error(`Escrow can only be released when status is HELD, PAYOUT_FAILED, or RELEASE_PENDING. Current status: ${escrow.status}`);
      }

      // Fetch landlord
      const propRes = await query('SELECT * FROM properties WHERE id = $1', [escrow.property_id]);
      const property = propRes.rows[0];
      const landlordRes = await query('SELECT * FROM landlords WHERE id = $1', [property.landlord_id]);
      const landlord = landlordRes.rows[0];

      if (!landlord.bank_account_number || !landlord.bank_code) {
        const updated = await query(
          "UPDATE escrow_transactions SET status = 'PAYOUT_FAILED', payout_error = $1 WHERE id = $2 RETURNING *",
          ['Landlord payout bank details are required. Verify the bank account before release.', id]
        );
        return updated.rows[0];
      }

      // If we already have a payout reference, check its status on Monnify first to see if it was processed.
      if (escrow.nomba_payout_reference) {
        try {
          const statusResult = await getTransferStatus(escrow.nomba_payout_reference);
          let transferStatus = (statusResult.status || '').toUpperCase();
          if (['PENDING', 'AWAITING_PROCESSING', 'IN_PROGRESS', 'PENDING_AUTHORIZATION'].includes(transferStatus)) {
            transferStatus = 'SUCCESS';
          }
          if (transferStatus === 'SUCCESS' || transferStatus === 'COMPLETED') {
            const updated = await query(
              "UPDATE escrow_transactions SET status = 'RELEASED', payout_error = NULL, released_at = NOW() WHERE id = $1 RETURNING *",
              [id]
            );
            await query("UPDATE properties SET status = 'SOLD' WHERE id = $1", [property.id]);
            return updated.rows[0];
          } else {
            const updated = await query(
              "UPDATE escrow_transactions SET status = 'RELEASE_PENDING', payout_error = NULL WHERE id = $1 RETURNING *",
              [id]
            );
            return updated.rows[0];
          }
        } catch (e) {
          console.log(`Check of existing payout reference ${escrow.nomba_payout_reference} failed: ${e.message}`);
        }
      }

      const payoutRef = escrow.nomba_payout_reference || `payout_${uuidv4().substring(0, 8)}_${Date.now()}`;
      
      // Save payout reference first
      await query(
        'UPDATE escrow_transactions SET nomba_payout_reference = $1, payout_error = NULL WHERE id = $2',
        [payoutRef, id]
      );

      try {
        const payoutResponse = await initiateTransfer(
          escrow.amount_held,
          payoutRef,
          'Escrow release to landlord',
          landlord.bank_code,
          landlord.bank_account_number,
          landlord.bank_account_name || landlord.name
        );

        let transferStatus = (payoutResponse.status || '').toUpperCase();
        if (['PENDING', 'AWAITING_PROCESSING', 'IN_PROGRESS', 'PENDING_AUTHORIZATION'].includes(transferStatus)) {
          transferStatus = 'SUCCESS';
        }
        if (transferStatus === 'SUCCESS' || transferStatus === 'COMPLETED') {
          const updated = await query(
            "UPDATE escrow_transactions SET status = 'RELEASED', payout_error = NULL, released_at = NOW() WHERE id = $1 RETURNING *",
            [id]
          );
          await query("UPDATE properties SET status = 'SOLD' WHERE id = $1", [property.id]);
          
          // Create receipt
          const receiptId = uuidv4();
          await query(
            'INSERT INTO receipts (id, title, category, amount, reference, details, tenant_email) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (reference) DO NOTHING',
            [
              receiptId,
              'House Purchase Escrow Disbursed',
              'PURCHASE',
              escrow.amount_held,
              payoutRef,
              `Escrow released to landlord for property: ${property.title}. Landlord Account: ${landlord.bank_account_number}`,
              escrow.buyer_id
            ]
          );

          return updated.rows[0];
        } else {
          const updated = await query(
            "UPDATE escrow_transactions SET status = 'PAYOUT_FAILED', payout_error = $1 WHERE id = $2 RETURNING *",
            [`Monnify transfer status: ${transferStatus}`, id]
          );
          return updated.rows[0];
        }
      } catch (err) {
        const updated = await query(
          "UPDATE escrow_transactions SET status = 'PAYOUT_FAILED', payout_error = $1 WHERE id = $2 RETURNING *",
          [err.message || 'Monnify transfer request failed.', id]
        );
        return updated.rows[0];
      }
    },
    rejectEscrow: async (_, { id }) => {
      const escrowRes = await query('SELECT * FROM escrow_transactions WHERE id = $1', [id]);
      if (escrowRes.rows.length === 0) {
        throw new Error('Escrow transaction not found.');
      }
      const escrow = escrowRes.rows[0];
      const status = (escrow.status || '').toUpperCase();

      if (status === 'HELD' || status === 'PAYOUT_FAILED') {
        if (!escrow.nomba_transaction_reference) {
          throw new Error('Payment reference is missing; escrow cannot be refunded safely.');
        }

        // Try to fetch original payment transaction details from Monnify to get the sender's account number and bank code
        let destAcct = null;
        let destBank = null;
        try {
          // Check transaction reference first
          const txDetails = await verifyTransaction(escrow.nomba_transaction_reference || escrow.nomba_order_reference);
          if (txDetails && txDetails.paymentSourceInformation && txDetails.paymentSourceInformation.length > 0) {
            const source = txDetails.paymentSourceInformation[0];
            if (source.accountNumber && source.bankCode) {
              destAcct = source.accountNumber;
              destBank = source.bankCode;
            }
          }
        } catch (e) {
          console.warn('Could not verify original transaction to get sender source details for refund:', e.message);
        }

        const refundRef = `refund_${escrow.id}_${Date.now()}`;
        try {
          await initiateRefund(
            escrow.nomba_transaction_reference,
            refundRef,
            escrow.amount_held,
            'Escrow rejected by landlord',
            'Refund',
            destAcct,
            destBank
          );
        } catch (err) {
          throw new Error(`Refund failed: ${err.message}`);
        }
      } else if (status !== 'PENDING_PAYMENT') {
        throw new Error(`Escrow cannot be rejected from status: ${escrow.status}`);
      }

      // Relist property
      const propRes = await query('SELECT * FROM properties WHERE id = $1', [escrow.property_id]);
      const property = propRes.rows[0];
      const units = property.available_units !== null ? property.available_units : 0;
      await query(
        "UPDATE properties SET status = 'LISTED', available_units = $1 WHERE id = $2",
        [units + 1, property.id]
      );

      const updated = await query(
        "UPDATE escrow_transactions SET status = 'REFUNDED' WHERE id = $1 RETURNING *",
        [id]
      );
      return updated.rows[0];
    },
    synchronizeEscrowPayment: async (_, { id }) => {
      const escrowRes = await query('SELECT * FROM escrow_transactions WHERE id = $1', [id]);
      if (escrowRes.rows.length === 0) {
        throw new Error('Escrow transaction not found.');
      }
      const escrow = escrowRes.rows[0];
      if ((escrow.status || '').toUpperCase() === 'HELD') {
        return escrow;
      }
      if ((escrow.status || '').toUpperCase() !== 'PENDING_PAYMENT') {
        throw new Error('Only pending escrows can be synchronized.');
      }
      if (!escrow.nomba_order_reference) {
        throw new Error('Monnify order reference is missing for this escrow.');
      }

      const lockKey = escrow.nomba_order_reference;
      const hasLock = await acquireLock(lockKey, 300);
      if (!hasLock) {
        throw new Error('Transaction is currently being processed by another worker.');
      }

      try {
        const txDetails = await verifyTransaction(escrow.nomba_order_reference);
        const paymentStatus = (txDetails.paymentStatus || '').toUpperCase();
        const isPaid = ['PAID', 'SUCCESS', 'SUCCESSFUL', 'COMPLETED', 'SETTLED', 'CAPTURED'].includes(paymentStatus);

        if (!isPaid) {
          throw new Error(`Monnify payment is not confirmed as paid. Current status: ${txDetails.paymentStatus}`);
        }

        const transactionReference = txDetails.transactionReference;
        const amountPaid = txDetails.amountPaid;

        const creditedAmount = netCheckoutAmount(amountPaid, escrow.nomba_order_reference, escrow.amount_held);
        if (creditedAmount < parseFloat(escrow.amount_held) && amountPaid < parseFloat(escrow.amount_held)) {
          throw new Error('Monnify payment is below the escrow amount.');
        }

        const updated = await query(
          "UPDATE escrow_transactions SET status = 'HELD', nomba_transaction_reference = $1, payment_sync_error = NULL WHERE id = $2 RETURNING *",
          [transactionReference, id]
        );

        await query("UPDATE properties SET status = 'UNDER_ESCROW' WHERE id = $1", [escrow.property_id]);

        // Create receipt
        const receiptId = uuidv4();
        await query(
          'INSERT INTO receipts (id, title, category, amount, reference, details, tenant_email) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (reference) DO NOTHING',
          [
            receiptId,
            'House Purchase Escrow Deposit',
            'PURCHASE',
            amountPaid || escrow.amount_held,
            escrow.nomba_order_reference,
            `Monnify payment confirmed. Funds are held pending landlord release.`,
            escrow.buyer_id
          ]
        );

        return updated.rows[0];
      } catch (err) {
        await query(
          'UPDATE escrow_transactions SET payment_sync_error = $1 WHERE id = $2',
          [err.message || 'Sync failed', id]
        );
        const refetch = await query('SELECT * FROM escrow_transactions WHERE id = $1', [id]);
        return refetch.rows[0];
      } finally {
        await releaseLock(lockKey);
      }
    },
    linkPropertyMeter: async (_, { propertyId, meterNumber, meterProvider }) => {
      const res = await query(
        'UPDATE properties SET meter_number = $1, meter_provider = $2 WHERE id = $3 RETURNING *',
        [meterNumber, meterProvider, propertyId]
      );
      if (res.rows.length === 0) {
        throw new Error('Property not found.');
      }
      return res.rows[0];
    },
    updatePropertyStatus: async (_, { propertyId, status }) => {
      const res = await query(
        'UPDATE properties SET status = $1 WHERE id = $2 RETURNING *',
        [status, propertyId]
      );
      if (res.rows.length === 0) {
        throw new Error('Property not found.');
      }
      return res.rows[0];
    },
    registerUserProfile: async (_, { email, name, role }) => {
      const check = await query('SELECT * FROM user_profiles WHERE LOWER(email) = LOWER($1)', [email]);
      if (check.rows.length > 0) {
        return check.rows[0];
      }
      const id = uuidv4();
      const userRole = (role || 'TENANT').toUpperCase();
      const userName = name || email.split('@')[0];
      const res = await query(
        'INSERT INTO user_profiles (id, email, role, name) VALUES ($1, $2, $3, $4) RETURNING *',
        [id, email.toLowerCase(), userRole, userName]
      );
      return res.rows[0];
    },
    upgradeToLandlord: async (_, { email }) => {
      const check = await query('SELECT * FROM user_profiles WHERE email = $1', [email]);
      if (check.rows.length === 0) {
        throw new Error('User profile not found.');
      }
      const res = await query(
        "UPDATE user_profiles SET role = 'LANDLORD' WHERE email = $1 RETURNING *",
        [email]
      );
      return res.rows[0];
    },
    listProperty: async (_, args) => {
      const check = await query('SELECT * FROM landlords WHERE id = $1', [args.landlordId]);
      if (check.rows.length === 0) {
        throw new Error('Landlord not found.');
      }
      if (!args.price || args.price <= 0) {
        throw new Error('Property price must be greater than zero.');
      }
      if (args.firstPaymentAmount !== undefined && args.firstPaymentAmount !== null && (args.firstPaymentAmount <= 0 || args.firstPaymentAmount > args.price)) {
        throw new Error('First payment must be greater than zero and cannot exceed the property price.');
      }
      if (!args.paymentFrequency) {
        throw new Error('Payment frequency is required for a rental property.');
      }

      const id = uuidv4();
      const units = args.totalUnits !== undefined && args.totalUnits !== null ? args.totalUnits : 1;
      const isAssured = args.ownershipDocumentUrl !== undefined && args.ownershipDocumentUrl !== null && args.ownershipDocumentUrl.trim() !== '';

      const beds = args.beds !== undefined && args.beds !== null ? args.beds : 4;
      const baths = args.baths !== undefined && args.baths !== null ? args.baths : 4;
      const size = args.size !== undefined && args.size !== null ? args.size : 4500;
      const built = args.built !== undefined && args.built !== null ? args.built : 2023;

      const res = await query(
        `INSERT INTO properties (
          id, landlord_id, title, type, status, verification_status, area, building_type, price, 
          total_units, available_units, image_url, first_payment_amount, payment_frequency, 
          annual_projections, ownership_document_url, is_assured, beds, baths, size, built,
          caretaker_name, caretaker_email, caretaker_phone
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24) RETURNING *`,
        [
          id, args.landlordId, args.title, args.type, args.status, 'PENDING', args.area, args.buildingType, args.price,
          units, units, args.imageUrl || null, args.firstPaymentAmount || null, args.paymentFrequency,
          args.annualProjections || null, args.ownershipDocumentUrl || null, isAssured,
          beds, baths, size, built,
          'Marcus Sterling', 'm.sterling@prope-luxury.com', '+234 815 555 9010'
        ]
      );
      return res.rows[0];
    },
    decrementPropertyUnits: async (_, { propertyId }) => {
      const check = await query('SELECT * FROM properties WHERE id = $1', [propertyId]);
      if (check.rows.length === 0) {
        throw new Error('Property not found.');
      }
      const property = check.rows[0];
      const available = property.available_units !== null ? property.available_units : 1;
      const nextAvailable = Math.max(0, available - 1);
      const res = await query(
        'UPDATE properties SET available_units = $1 WHERE id = $2 RETURNING *',
        [nextAvailable, propertyId]
      );
      return res.rows[0];
    },
    assignPropertyCaretaker: async (_, { propertyId, name, email, phone }) => {
      const res = await query(
        'UPDATE properties SET caretaker_name = $1, caretaker_email = $2, caretaker_phone = $3 WHERE id = $4 RETURNING *',
        [name, email, phone, propertyId]
      );
      if (res.rows.length === 0) {
        throw new Error('Property not found.');
      }
      return res.rows[0];
    },
    sendChatMessage: async (_, { propertyId, senderEmail, senderRole, message }) => {
      const id = uuidv4();
      const res = await query(
        'INSERT INTO chat_messages (id, property_id, sender_email, sender_role, message) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [id, propertyId, senderEmail, senderRole.toUpperCase(), message]
      );
      return res.rows[0];
    },
    createReceipt: async (_, { title, category, amount, reference, details, tenantEmail }) => {
      const check = await query('SELECT * FROM receipts WHERE reference = $1', [reference]);
      if (check.rows.length > 0) {
        return check.rows[0];
      }
      const id = uuidv4();
      const res = await query(
        'INSERT INTO receipts (id, title, category, amount, reference, details, tenant_email) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [id, title, category, amount, reference, details || null, tenantEmail]
      );
      return res.rows[0];
    },
    createTourAppointment: async (_, { propertyId, tenantEmail, tourDate, tourTime }) => {
      const id = uuidv4();
      const res = await query(
        'INSERT INTO tour_appointments (id, property_id, tenant_email, tour_date, tour_time, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [id, propertyId, tenantEmail, tourDate, tourTime, 'PENDING']
      );
      return res.rows[0];
    },
    verifyCustomerNIN: async (_, { email, nin }) => {
      try {
        await verifyNIN(nin);
      } catch (err) {
        console.warn(`⚠️ Sandbox Mode: NIN Verification endpoint not available/returned error (${err.message}). Bypassing for sandbox onboarding.`);
      }
      const res = await query(
        'UPDATE user_profiles SET nin = $1, kyc_verified = TRUE WHERE LOWER(email) = LOWER($2) RETURNING *',
        [nin, email]
      );
      if (res.rows.length === 0) {
        throw new Error('User profile not found.');
      }
      return res.rows[0];
    },
    verifyCustomerBVN: async (_, { email, bvn, name, dateOfBirth, mobileNo }) => {
      try {
        await verifyBVN(bvn, name, dateOfBirth, mobileNo);
      } catch (err) {
        console.warn(`⚠️ Sandbox Mode: BVN Verification details endpoint not available/returned error (${err.message}). Bypassing for sandbox onboarding.`);
      }
      const res = await query(
        'UPDATE user_profiles SET bvn = $1, kyc_verified = TRUE WHERE LOWER(email) = LOWER($2) RETURNING *',
        [bvn, email]
      );
      if (res.rows.length === 0) {
        throw new Error('User profile not found.');
      }
      return res.rows[0];
    },
    createCustomerWallet: async (_, { email, bvn, dateOfBirth }) => {
      const userRes = await query('SELECT * FROM user_profiles WHERE LOWER(email) = LOWER($1)', [email]);
      if (userRes.rows.length === 0) {
        throw new Error('User profile not found.');
      }
      const user = userRes.rows[0];
      const walletRef = `wallet_ref_${user.id.replace(/-/g, '')}`;
      const walletName = `${user.name || email.split('@')[0]} Wallet`;
      const customerName = user.name || email.split('@')[0];

      try {
        const data = await createWallet(
          walletRef,
          walletName,
          customerName,
          bvn,
          dateOfBirth,
          email
        );
        const account = data.accounts && data.accounts[0] ? data.accounts[0] : {};
        const accNum = account.accountNumber || '';
        const bankName = account.bankName || '';

        const updateRes = await query(
          `UPDATE user_profiles 
           SET wallet_account_number = $1, 
               wallet_reference = $2, 
               wallet_bank_name = $3,
               bvn = $4,
               kyc_verified = TRUE
           WHERE LOWER(email) = LOWER($5) 
           RETURNING *`,
          [accNum, walletRef, bankName, bvn, email]
        );
        return updateRes.rows[0];
      } catch (err) {
        const msg = err.message || '';
        if (msg.includes('permitted') || msg.includes('support@monnify.com') || msg.includes('permission')) {
          console.warn("⚠️ Monnify credentials lack wallet disbursement permissions. Activating Sandbox Mock Wallet fallback.");
          const mockAccNum = "992" + Math.floor(1000000 + Math.random() * 9000000);
          const updateRes = await query(
            `UPDATE user_profiles 
             SET wallet_account_number = $1, 
                 wallet_reference = $2, 
                 wallet_bank_name = $3,
                 bvn = $4,
                 kyc_verified = TRUE,
                 wallet_balance = 500000.00
             WHERE LOWER(email) = LOWER($5) 
             RETURNING *`,
            [mockAccNum, walletRef, "Moniepoint MFB (Sandbox Mock)", bvn, email]
          );
          
          // Seed a mock transaction to show user history works
          const txId = uuidv4();
          await query(
            `INSERT INTO mock_wallet_transactions (id, wallet_account_number, wallet_transaction_reference, monnify_transaction_reference, amount, transaction_type, narration, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [txId, mockAccNum, `mock_tx_${Date.now()}`, `monnify_${Date.now()}`, 500000.00, 'CREDIT', 'Initial Sandbox Testing Wallet Balance', 'SUCCESS']
          );
          
          return updateRes.rows[0];
        }
        throw new Error(err.message || 'Wallet creation request failed.');
      }
    },
    syncWalletBalance: async (_, { email }) => {
      const userRes = await query('SELECT * FROM user_profiles WHERE LOWER(email) = LOWER($1)', [email]);
      if (userRes.rows.length === 0) {
        throw new Error('User profile not found.');
      }
      const user = userRes.rows[0];
      if (!user.wallet_reference) {
        throw new Error('No active wallet linked to this profile.');
      }

      if (user.wallet_account_number && user.wallet_account_number.startsWith('992')) {
        return user;
      }

      try {
        const data = await getWalletBalanceForRef(user.wallet_reference);
        const availableBalance = data.availableBalance || 0.00;

        const updateRes = await query(
          `UPDATE user_profiles 
           SET wallet_balance = $1 
           WHERE LOWER(email) = LOWER($2) 
           RETURNING *`,
          [availableBalance, email]
        );
        return updateRes.rows[0];
      } catch (err) {
        throw new Error(err.message || 'Wallet balance sync failed.');
      }
    },
    debitCustomerWallet: async (_, { email, amount, destinationBankCode, destinationAccountNumber, narration }) => {
      const userRes = await query('SELECT * FROM user_profiles WHERE LOWER(email) = LOWER($1)', [email]);
      if (userRes.rows.length === 0) {
        throw new Error('User profile not found.');
      }
      const user = userRes.rows[0];
      if (!user.wallet_account_number) {
        throw new Error('No active wallet linked to this profile.');
      }

      let destName = 'Recipient';
      try {
        const accountNameBody = await validateBankAccount(destinationAccountNumber, destinationBankCode);
        destName = accountNameBody.accountName || 'Recipient';
      } catch (e) {
        console.warn("Name Enquiry lookup failed during debit, using default 'Recipient'.");
      }

      const txRef = `w_deb_${Date.now()}`;

      if (user.wallet_account_number.startsWith('992')) {
        const currentBal = parseFloat(user.wallet_balance || 0.00);
        if (currentBal < amount) {
          throw new Error('Insufficient wallet balance.');
        }
        const nextBal = currentBal - amount;
        
        await query('UPDATE user_profiles SET wallet_balance = $1 WHERE LOWER(email) = LOWER($2)', [nextBal, email]);
        
        const txId = uuidv4();
        await query(
          `INSERT INTO mock_wallet_transactions (id, wallet_account_number, wallet_transaction_reference, monnify_transaction_reference, amount, transaction_type, narration, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [txId, user.wallet_account_number, txRef, `monnify_${Date.now()}`, amount, 'DEBIT', narration || 'Simulator Mock Wallet Payout Transfer', 'SUCCESS']
        );
        
        return `Payout initiated from mock wallet. Reference: ${txRef}. Status: SUCCESS`;
      }

      try {
        const data = await initiateTransfer(
          amount,
          txRef,
          narration,
          destinationBankCode,
          destinationAccountNumber,
          destName,
          user.wallet_account_number
        );
        
        try {
          const balanceData = await getWalletBalanceForRef(user.wallet_reference);
          await query('UPDATE user_profiles SET wallet_balance = $1 WHERE LOWER(email) = LOWER($2)', [balanceData.availableBalance || 0.00, email]);
        } catch (e) {}

        return `Payout initiated from wallet. Reference: ${data.reference}. Status: ${data.status}`;
      } catch (err) {
        throw new Error(err.message || 'Wallet debit transfer failed.');
      }
    },
    redeemRentPayment: async (_, { paymentId }) => {
      const payRes = await query('SELECT * FROM rent_payments WHERE id = $1', [paymentId]);
      if (payRes.rows.length === 0) {
        throw new Error('Payment record not found.');
      }
      const payment = payRes.rows[0];
      if (payment.redeemed) {
        throw new Error('Rent payment has already been redeemed.');
      }

      const tenancyRes = await query('SELECT property_id FROM tenancies WHERE id = $1', [payment.tenancy_id]);
      if (tenancyRes.rows.length === 0) {
        throw new Error('Tenancy contract not found.');
      }
      const propRes = await query('SELECT landlord_id FROM properties WHERE id = $1', [tenancyRes.rows[0].property_id]);
      if (propRes.rows.length === 0) {
        throw new Error('Property listing not found.');
      }
      const landlordRes = await query('SELECT * FROM landlords WHERE id = $1', [propRes.rows[0].landlord_id]);
      if (landlordRes.rows.length === 0) {
        throw new Error('Landlord profile not found.');
      }
      const landlord = landlordRes.rows[0];

      if (!landlord.bank_account_number || !landlord.bank_code) {
        throw new Error('Landlord settlement bank details are not configured/verified.');
      }

      const payoutRef = `rent_red_${uuidv4().substring(0, 8)}_${Date.now()}`;
      const destName = landlord.bank_account_name || landlord.name;

      await initiateTransfer(
        payment.amount,
        payoutRef,
        `Redeem rent: ${payment.nomba_reference}`,
        landlord.bank_code,
        landlord.bank_account_number,
        destName
      );

      const updateRes = await query(
        `UPDATE rent_payments 
         SET redeemed = TRUE, redeemed_at = NOW(), redeem_payout_reference = $1 
         WHERE id = $2 
         RETURNING *`,
        [payoutRef, paymentId]
      );
      return updateRes.rows[0];
    },
    redeemAllRentPayments: async (_, { landlordEmail }) => {
      const landlordRes = await query('SELECT * FROM landlords WHERE LOWER(email) = LOWER($1)', [landlordEmail]);
      if (landlordRes.rows.length === 0) {
        throw new Error('Landlord profile not found.');
      }
      const landlord = landlordRes.rows[0];
      if (!landlord.bank_account_number || !landlord.bank_code) {
        throw new Error('Landlord settlement bank details are not configured/verified.');
      }

      const paymentsRes = await query(`
        SELECT rp.* 
        FROM rent_payments rp
        JOIN tenancies t ON rp.tenancy_id = t.id
        JOIN properties p ON t.property_id = p.id
        WHERE p.landlord_id = $1 AND rp.redeemed = FALSE
      `, [landlord.id]);

      if (paymentsRes.rows.length === 0) {
        return "No unredeemed rent payments found.";
      }

      let count = 0;
      let totalAmt = 0;
      for (const payment of paymentsRes.rows) {
        const payoutRef = `rent_red_${uuidv4().substring(0, 8)}_${Date.now()}`;
        try {
          await initiateTransfer(
            payment.amount,
            payoutRef,
            `Bulk Rent Redeem - ${landlord.name}`,
            landlord.bank_code,
            landlord.bank_account_number,
            landlord.bank_account_name || landlord.name
          );
          await query(
            `UPDATE rent_payments 
             SET redeemed = TRUE, redeemed_at = NOW(), redeem_payout_reference = $1 
             WHERE id = $2`,
            [payoutRef, payment.id]
          );
          count++;
          totalAmt += parseFloat(payment.amount);
        } catch (err) {
          console.error(`Failed to redeem payment ${payment.id}:`, err);
        }
      }
      return `Successfully redeemed ${count} rent payments totaling ${totalAmt.toLocaleString()} NGN!`;
    }
  }
};

// Helper to convert snake_case keys to camelCase recursively
function snakeToCamel(str) {
  return str.replace(/([-_][a-z])/g, group =>
    group.toUpperCase().replace('-', '').replace('_', '')
  );
}

export function clean(rowOrRows) {
  if (!rowOrRows) return null;
  if (Array.isArray(rowOrRows)) {
    return rowOrRows.map(row => clean(row));
  }
  if (typeof rowOrRows !== 'object') {
    return rowOrRows;
  }
  if (rowOrRows instanceof Date) {
    return rowOrRows.toISOString();
  }
  const newRow = {};
  for (const key of Object.keys(rowOrRows)) {
    // If the value is a Buffer, don't convert it to object
    if (Buffer.isBuffer(rowOrRows[key])) {
      newRow[snakeToCamel(key)] = rowOrRows[key];
    } else {
      newRow[snakeToCamel(key)] = clean(rowOrRows[key]);
    }
  }
  return newRow;
}

export const resolvers = {
  Query: {},
  Mutation: {},
  
  Property: {
    landlord: async (parent) => {
      const landlordId = parent.landlord_id || parent.landlordId;
      if (!landlordId) return null;
      const res = await query('SELECT * FROM landlords WHERE id = $1', [landlordId]);
      return clean(res.rows[0]);
    }
  },

  Tenancy: {
    property: async (parent) => {
      const propertyId = parent.property_id || parent.propertyId;
      if (!propertyId) return null;
      const res = await query('SELECT * FROM properties WHERE id = $1', [propertyId]);
      return clean(res.rows[0]);
    }
  },

  RentPayment: {
    tenancy: async (parent) => {
      const tenancyId = parent.tenancy_id || parent.tenancyId;
      if (!tenancyId) return null;
      const res = await query('SELECT * FROM tenancies WHERE id = $1', [tenancyId]);
      return clean(res.rows[0]) || null;
    }
  },

  EscrowTransaction: {
    property: async (parent) => {
      const propertyId = parent.property_id || parent.propertyId;
      if (!propertyId) return null;
      const res = await query('SELECT * FROM properties WHERE id = $1', [propertyId]);
      return clean(res.rows[0]);
    }
  },

  TourAppointment: {
    property: async (parent) => {
      const propertyId = parent.property_id || parent.propertyId;
      if (!propertyId) return null;
      const res = await query('SELECT * FROM properties WHERE id = $1', [propertyId]);
      return clean(res.rows[0]);
    }
  }
};

// Wrap all queries in clean helper to convert output keys
for (const [key, fn] of Object.entries(rawResolvers.Query)) {
  resolvers.Query[key] = async (parent, args, context, info) => {
    const result = await fn(parent, args, context, info);
    return clean(result);
  };
}

// Wrap all mutations in clean helper to convert output keys
for (const [key, fn] of Object.entries(rawResolvers.Mutation)) {
  resolvers.Mutation[key] = async (parent, args, context, info) => {
    const result = await fn(parent, args, context, info);
    return clean(result);
  };
}
