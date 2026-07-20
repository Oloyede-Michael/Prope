import express from 'express';
import crypto from 'crypto';
import { executeReconciliation } from './reconciliation.js';
import { query } from './db.js';

const router = express.Router();

/**
 * Middleware to verify Monnify signatures using HMAC-SHA512.
 */
function verifyMonnifySignature(req, res, next) {
  const signature = req.headers['monnify-signature'];
  if (!signature) {
    console.warn('Security Alert: Webhook request missing monnify-signature header.');
    return res.status(401).send('Missing signature header');
  }

  const rawBody = req.rawBody;
  if (!rawBody) {
    console.warn('Security Alert: Raw body not available for signature verification.');
    return res.status(500).send('Internal server error: raw body missing');
  }

  const secret = process.env.MONNIFY_SECRET_KEY;
  if (!secret) {
    console.error('CRITICAL: MONNIFY_SECRET_KEY is not defined in environment variables.');
    return res.status(500).send('Server configuration error');
  }

  const computedHash = crypto
    .createHmac('sha512', secret)
    .update(rawBody)
    .digest('hex');

  if (computedHash !== signature) {
    console.warn('Security Alert: Webhook signature mismatch!', { computed: computedHash, inbound: signature });
    return res.status(401).send('Invalid signature');
  }

  next();
}

/**
 * POST /api/webhooks/monnify
 * Cryptographically verifies and processes incoming webhook notifications from Monnify.
 */
router.post('/monnify', verifyMonnifySignature, async (req, res) => {
  const payload = req.body;
  const eventType = payload.eventType;

  console.log(`Received Monnify Webhook: ${eventType}`);

  try {
    if (eventType === 'SUCCESSFUL_TRANSACTION') {
      const eventData = payload.eventData;
      
      const virtualAccountId = eventData.destinationAccountInformation?.accountNumber || null;
      const orderReference = eventData.paymentReference || eventData.product?.reference || null;
      const amount = parseFloat(eventData.amountPaid);
      const reference = eventData.transactionReference;
      const receivedAt = eventData.paidOn ? new Date(eventData.paidOn) : new Date();

      const result = await executeReconciliation(virtualAccountId, orderReference, amount, reference, receivedAt);
      return res.status(200).send(`Reconciliation completed: ${result}`);
    } 
    
    else if (eventType === 'SUCCESSFUL_DISBURSEMENT') {
      const eventData = payload.eventData;
      const payoutRef = eventData.reference;
      
      console.log(`Webhook: Successful payout for Reference: ${payoutRef}`);
      
      // Update escrow transaction
      const escrowCheck = await query('SELECT * FROM escrow_transactions WHERE nomba_payout_reference = $1', [payoutRef]);
      if (escrowCheck.rows.length > 0) {
        const escrow = escrowCheck.rows[0];
        
        await query(
          "UPDATE escrow_transactions SET status = 'RELEASED', payout_error = NULL, released_at = NOW() WHERE id = $1",
          [escrow.id]
        );
        await query("UPDATE properties SET status = 'SOLD' WHERE id = $1", [escrow.property_id]);
        
        console.log(`Webhook: Escrow ${escrow.id} successfully released.`);
      }
      return res.status(200).send('Payout status updated: RELEASED');
    } 
    
    else if (eventType === 'FAILED_DISBURSEMENT') {
      const eventData = payload.eventData;
      const payoutRef = eventData.reference;
      const description = eventData.transactionDescription || 'Disbursement failed';
      
      console.log(`Webhook: Failed payout for Reference: ${payoutRef}. Reason: ${description}`);
      
      // Update escrow transaction
      const escrowCheck = await query('SELECT * FROM escrow_transactions WHERE nomba_payout_reference = $1', [payoutRef]);
      if (escrowCheck.rows.length > 0) {
        const escrow = escrowCheck.rows[0];
        await query(
          "UPDATE escrow_transactions SET status = 'PAYOUT_FAILED', payout_error = $1 WHERE id = $2",
          [description, escrow.id]
        );
        console.log(`Webhook: Escrow ${escrow.id} marked as PAYOUT_FAILED.`);
      }
      return res.status(200).send('Payout status updated: FAILED');
    }

    else if (eventType === 'REVERSED_DISBURSEMENT') {
      const eventData = payload.eventData;
      const payoutRef = eventData.reference;
      
      console.log(`Webhook: Reversed payout for Reference: ${payoutRef}`);
      const escrowCheck = await query('SELECT * FROM escrow_transactions WHERE nomba_payout_reference = $1', [payoutRef]);
      if (escrowCheck.rows.length > 0) {
        const escrow = escrowCheck.rows[0];
        await query(
          "UPDATE escrow_transactions SET status = 'PAYOUT_FAILED', payout_error = 'Disbursement reversed by partner bank' WHERE id = $2",
          [escrow.id]
        );
      }
      return res.status(200).send('Payout status updated: REVERSED');
    }

    // Default response for unhandled event types
    console.log(`Unhandled webhook event type: ${eventType}`);
    return res.status(200).send('Received unhandled webhook event type');

  } catch (err) {
    console.error(`Error processing webhook payload for ${eventType}:`, err);
    return res.status(500).send('Processing fault');
  }
});

export default router;
