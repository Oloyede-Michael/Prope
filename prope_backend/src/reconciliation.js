import { query } from './db.js';
import { acquireLock, releaseLock } from './redis.js';
import { v4 as uuidv4 } from 'uuid';

const CHECKOUT_FEE = 1.4;
function netCheckoutAmount(amount, orderReference, expectedAmount) {
  if (!orderReference || !amount) {
    return amount;
  }
  const amt = parseFloat(amount);
  const exp = parseFloat(expectedAmount);
  if (amt === exp || amt <= CHECKOUT_FEE) {
    return amt;
  }
  return Math.max(0, amt - CHECKOUT_FEE);
}

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

/**
 * Core reconciliation engine function to process incoming transaction webhook or sync.
 */
export async function executeReconciliation(virtualAccountId, orderReference, amount, reference, receivedAt) {
  console.log(`Reconciliation Engine: Starting payment matching for Ref [${reference}], Account [${virtualAccountId}], Amount [${amount}]`);

  // 1. Acquire Distributed Redis Lock
  const hasLock = await acquireLock(reference, 300);
  if (!hasLock) {
    console.warn(`Reconciliation Engine: Duplicate request blocked. Transaction [${reference}] is currently being processed.`);
    return 'DUPLICATE_PROCESSING';
  }

  try {
    // 2. Idempotency Check: check if reference already exists in database
    const paymentCheck = await query('SELECT 1 FROM rent_payments WHERE nomba_reference = $1', [reference]);
    if (paymentCheck.rows.length > 0) {
      console.log(`Reconciliation Engine: Transaction [${reference}] already reconciled in rent payments.`);
      return 'ALREADY_PROCESSED';
    }

    const payDate = receivedAt ? new Date(receivedAt) : new Date();

    // 3. Match against Tenancies first (Rent Collection Flow)
    let tenancy = null;
    if (virtualAccountId) {
      const tenRes = await query('SELECT * FROM tenancies WHERE nomba_virtual_account_id = $1', [virtualAccountId]);
      if (tenRes.rows.length > 0) {
        tenancy = tenRes.rows[0];
      }
    }
    if (!tenancy && orderReference) {
      const tenRes = await query('SELECT * FROM tenancies WHERE nomba_order_reference = $1', [orderReference]);
      if (tenRes.rows.length > 0) {
        tenancy = tenRes.rows[0];
      }
    }

    if (tenancy) {
      const rentAmount = parseFloat(tenancy.rent_amount);
      const creditedAmount = netCheckoutAmount(amount, orderReference, rentAmount);
      let matchedStatus;

      const diff = creditedAmount - rentAmount;
      if (Math.abs(diff) < 0.01) {
        // Exact Payment
        matchedStatus = 'MATCHED';
        const nextDueDate = advanceDueDate(tenancy.next_due_date, tenancy.frequency);
        await query(
          'UPDATE tenancies SET balance = 0.00, next_due_date = $1 WHERE id = $2',
          [nextDueDate, tenancy.id]
        );
        console.log(`Reconciliation Engine: Match SUCCESS for tenancy [${tenancy.id}]. Due date advanced.`);
      } else if (diff < 0) {
        // Partial Payment (Underpaid)
        matchedStatus = 'UNDERPAID';
        await query(
          'UPDATE tenancies SET balance = $1 WHERE id = $2',
          [diff, tenancy.id]
        );
        console.warn(`Reconciliation Engine: UNDERPAYMENT detected for tenancy [${tenancy.id}]. Arrears: ${diff}`);
      } else {
        // Excess Payment (Overpaid)
        matchedStatus = 'OVERPAID';
        await query(
          'UPDATE tenancies SET balance = $1 WHERE id = $2',
          [diff, tenancy.id]
        );
        console.log(`Reconciliation Engine: OVERPAYMENT detected for tenancy [${tenancy.id}]. Credit: ${diff}`);
      }

      // Save payment
      const paymentId = uuidv4();
      await query(
        'INSERT INTO rent_payments (id, tenancy_id, amount, nomba_reference, matched_status, received_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [paymentId, tenancy.id, amount, reference, matchedStatus, payDate]
      );

      // Fetch property details for receipt
      const propRes = await query('SELECT * FROM properties WHERE id = $1', [tenancy.property_id]);
      const property = propRes.rows[0];

      // Create receipt
      const receiptId = uuidv4();
      await query(
        'INSERT INTO receipts (id, title, category, amount, reference, details, tenant_email) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (reference) DO NOTHING',
        [
          receiptId,
          'Rent Payment',
          'RENT',
          amount,
          reference,
          `Monnify payment reconciled for ${property.title}`,
          tenancy.tenant_id
        ]
      );

      return matchedStatus;
    }

    // 4. Match against Escrow Transactions (Purchase Escrow Flow)
    let escrow = null;
    if (virtualAccountId) {
      const escRes = await query('SELECT * FROM escrow_transactions WHERE nomba_virtual_account_id = $1', [virtualAccountId]);
      if (escRes.rows.length > 0) {
        escrow = escRes.rows[0];
      }
    }
    if (!escrow && orderReference) {
      const escRes = await query('SELECT * FROM escrow_transactions WHERE nomba_order_reference = $1', [orderReference]);
      if (escRes.rows.length > 0) {
        escrow = escRes.rows[0];
      }
    }

    if (escrow) {
      const amountHeld = parseFloat(escrow.amount_held);
      const creditedAmount = netCheckoutAmount(amount, orderReference, amountHeld);
      const isMatched = creditedAmount >= amountHeld;
      const matchedStatus = isMatched ? 'MATCHED' : 'UNDERPAID';

      if (isMatched) {
        await query(
          "UPDATE escrow_transactions SET status = 'HELD', nomba_transaction_reference = $1, payment_sync_error = NULL WHERE id = $2",
          [reference, escrow.id]
        );
        await query("UPDATE properties SET status = 'UNDER_ESCROW' WHERE id = $1", [escrow.property_id]);
      }

      // Save payment
      const paymentId = uuidv4();
      await query(
        'INSERT INTO rent_payments (id, tenancy_id, amount, nomba_reference, matched_status, received_at) VALUES ($1, NULL, $2, $3, $4, $5)',
        [paymentId, amount, reference, matchedStatus, payDate]
      );

      if (isMatched) {
        // Fetch property details for receipt
        const propRes = await query('SELECT * FROM properties WHERE id = $1', [escrow.property_id]);
        const property = propRes.rows[0];

        // Create receipt
        const receiptId = uuidv4();
        await query(
          'INSERT INTO receipts (id, title, category, amount, reference, details, tenant_email) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (reference) DO NOTHING',
          [
            receiptId,
            'House Purchase Escrow Deposit',
            'PURCHASE',
            amount,
            reference,
            `Monnify payment held for ${property.title}. Funds are pending landlord release.`,
            escrow.buyer_id
          ]
        );
      }

      console.log(`Reconciliation Engine: Escrow payment [${reference}] processed as ${matchedStatus} for transaction [${escrow.id}]`);
      return isMatched ? 'ESCROW_HELD' : 'ESCROW_UNDERPAID';
    }

    // 5. Unmatched Reference Flow
    console.warn(`Reconciliation Engine: Virtual Account [${virtualAccountId}] not matching any active tenancy or escrow. Routing to UNMATCHED queue.`);
    
    const paymentId = uuidv4();
    await query(
      'INSERT INTO rent_payments (id, tenancy_id, amount, nomba_reference, matched_status, received_at) VALUES ($1, NULL, $2, $3, $4, $5)',
      [paymentId, amount, reference, 'UNMATCHED', payDate]
    );
    return 'UNMATCHED';

  } finally {
    await releaseLock(reference);
  }
}
