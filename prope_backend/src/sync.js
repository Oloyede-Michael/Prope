import { query } from './db.js';
import { acquireLock, releaseLock } from './redis.js';
import { getTransferStatus, verifyTransaction } from './monnify.js';
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

/**
 * Periodically synchronizes payment status for pending escrows and disbursements.
 */
export async function synchronizePendingEscrowsAutomatically() {
  try {
    const escrowsRes = await query(`
      SELECT * FROM escrow_transactions 
      WHERE (status = 'PENDING_PAYMENT' AND nomba_order_reference IS NOT NULL AND nomba_order_reference != '')
         OR (status = 'RELEASE_PENDING')
         OR (status = 'PAYOUT_FAILED' AND nomba_payout_reference IS NOT NULL AND nomba_payout_reference != '')
    `);

    const escrows = escrowsRes.rows;
    if (escrows.length === 0) return;

    console.log(`Automatic Sync: Running check for ${escrows.length} pending escrow transactions...`);

    for (const escrow of escrows) {
      try {
        const status = (escrow.status || '').toUpperCase();

        if (status === 'RELEASE_PENDING' || status === 'PAYOUT_FAILED') {
          if (!escrow.nomba_payout_reference) continue;

          console.log(`Automatic Sync: Verifying payout status for Escrow [${escrow.id}] - Ref: ${escrow.nomba_payout_reference}`);
          const statusResult = await getTransferStatus(escrow.nomba_payout_reference);
          const transferStatus = (statusResult.status || '').toUpperCase();

          if (transferStatus === 'SUCCESS' || transferStatus === 'COMPLETED') {
            await query(
              "UPDATE escrow_transactions SET status = 'RELEASED', payout_error = NULL, released_at = NOW() WHERE id = $1",
              [escrow.id]
            );
            await query("UPDATE properties SET status = 'SOLD' WHERE id = $1", [escrow.property_id]);
            
            console.log(`Automatic Sync: Escrow [${escrow.id}] successfully released (released_at: NOW).`);
          } else if (transferStatus === 'FAILED' || transferStatus === 'REVERSED') {
            await query(
              "UPDATE escrow_transactions SET status = 'PAYOUT_FAILED', payout_error = $1 WHERE id = $2",
              [`Monnify transfer status check: ${transferStatus} - ${statusResult.transactionDescription || ''}`, escrow.id]
            );
            console.log(`Automatic Sync: Escrow [${escrow.id}] payout failed.`);
          }
        } 
        
        else if (status === 'PENDING_PAYMENT') {
          if (!escrow.nomba_order_reference) continue;

          console.log(`Automatic Sync: Verifying escrow deposit payment for Escrow [${escrow.id}] - Order Ref: ${escrow.nomba_order_reference}`);
          
          const lockKey = escrow.nomba_order_reference;
          const hasLock = await acquireLock(lockKey, 300);
          if (!hasLock) continue;

          try {
            const txDetails = await verifyTransaction(escrow.nomba_order_reference);
            const paymentStatus = (txDetails.paymentStatus || '').toUpperCase();
            const isPaid = ['PAID', 'SUCCESS', 'SUCCESSFUL', 'COMPLETED', 'SETTLED', 'CAPTURED'].includes(paymentStatus);

            if (isPaid) {
              const amountPaid = txDetails.amountPaid;
              const transactionReference = txDetails.transactionReference;

              const creditedAmount = netCheckoutAmount(amountPaid, escrow.nomba_order_reference, escrow.amount_held);
              if (creditedAmount >= parseFloat(escrow.amount_held) || amountPaid >= parseFloat(escrow.amount_held)) {
                await query(
                  "UPDATE escrow_transactions SET status = 'HELD', nomba_transaction_reference = $1, payment_sync_error = NULL WHERE id = $2",
                  [transactionReference, escrow.id]
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

                console.log(`Automatic Sync: Escrow [${escrow.id}] marked HELD successfully.`);
              }
            }
          } catch (err) {
            console.error(`Automatic Sync error querying deposit for Escrow [${escrow.id}]:`, err.message);
          } finally {
            await releaseLock(lockKey);
          }
        }
      } catch (escrowErr) {
        console.error(`Automatic Sync error on Escrow [${escrow.id}]:`, escrowErr.message);
      }
    }
  } catch (err) {
    console.error('Automatic Sync error: failed to retrieve pending escrows:', err);
  }
}
