Retry & Failure Handling
Payment failures are normal in recurring billing. This guide shows you how to detect failures, communicate with customers, and implement a retry strategy that recovers revenue without creating a poor customer experience.

Types of Failures
Insufficient funds: the customer's account does not have enough balance at the time of the debit.
Card expired: the tokenized card has expired and the token is no longer valid.
Mandate debit failure: a direct debit mandate debit was rejected by the customer's bank (e.g. account restricted, mandate limit exceeded).
Bank downtime: temporary unavailability on the customer's bank side.
Transaction timeout: the payment session expired before the customer completed it.
Step 1 – Detect Failures
Monnify only sends a webhook notification when a transaction is successful. The event type is SUCCESSFUL_TRANSACTION. There is no webhook for failed or pending transactions.

To detect a failure, your server must actively check the transaction status after the expected payment window:

Listen for the SUCCESSFUL_TRANSACTION webhook on your configured webhook URL.
If the webhook does not arrive within a reasonable window (e.g. 2–5 minutes after initiating the charge), call the Get Transaction Status endpoint with the payment reference.
Inspect the paymentStatus field in the response. A status of PAID means the payment succeeded. Any other status (including PENDING or FAILED) means the transaction did not complete.
cURL
JavaScript
Python
PHP
Copy
const response = await fetch("https://sandbox.monnify.com/api/v2/merchant/transactions/query?paymentReference=RENEWAL_REF_005"", {
  method: "GET",
  headers: {
    "Authorization": "Bearer <accessToken>"
  }
});

const data = await response.json();
console.log(data);
status-response.json
Copy
{
"requestSuccessful": true,
"responseMessage": "success",
"responseCode": "0",
"responseBody": {
  "transactionReference": "MNFY|67|20240701|000005",
  "paymentReference": "RENEWAL_REF_005",
  "paymentStatus": "FAILED",
  "amountPaid": "0.00",
  "totalPayable": "5000.00",
  "paymentMethod": "CARD",
  "customer": {
    "email": "ngozi@example.com",
    "name": "Ngozi Adeyemi"
  }
}
}
Show more
alert image
Always verify server-side:
Never rely solely on client-side callbacks to determine payment outcome. Always confirm the status via the server-side transaction status API before granting or revoking access.

Step 2 – Classify the Failure
Not every failure should trigger an immediate retry. Classify failures before acting:

Failure Reason	Retryable?	Recommended Action
Insufficient funds	Yes	Retry after 4–8 hours; notify customer to fund account.
Bank downtime / timeout	Yes	Retry after 1–6 hours.
Card expired	No	Do not retry. Prompt customer to add a new card.
Mandate limit exceeded	No	A new mandate is needed with the right amount.
Account restricted	No	Customer must resolve with their bank before retrying.
Step 3 – Notify the Customer
Send a notification as soon as you confirm the failure via the transaction status check. Timely communication significantly improves recovery rates.

Tell the customer exactly what happened (e.g. "Your payment of ₦5,000 was not completed").
Give them a clear action: fund their account, update their card, or pay manually via a payment link.
Include a direct payment link so they can resolve it in one click. See Payment Links.
alert image
Dunning best practice:
Space out retry notifications so customers do not feel harassed. A common pattern: notify immediately, then at 24h, then at 72h, then a final notice before service suspension.

Step 4 – Implement Retry Logic
For retryable failures (e.g. insufficient funds, bank downtime), implement a retry schedule on your server. The handler below covers both card token charges and direct debit mandate debits:

retry-scheduler.js
Copy
const RETRY_DELAYS_HOURS = [24, 48, 72]; // retry up to 3 times

/**
* paymentType: 'card' | 'mandate'
* paymentRef:  paymentReference (card) or mandateReference (mandate)
*/
async function handleFailedPayment(paymentType, paymentRef, customerId, attemptCount) {
if (attemptCount >= RETRY_DELAYS_HOURS.length) {
  // Max retries reached: escalate (suspend service, final email, etc.)
  await suspendCustomerAccess(customerId);
  await sendFinalDunningEmail(customerId);
  return;
}

const delayMs = RETRY_DELAYS_HOURS[attemptCount] * 60 * 60 * 1000;

setTimeout(async () => {
  const newRef = `${paymentRef}_retry_${attemptCount + 1}`;

  try {
    let succeeded = false;

    if (paymentType === 'card') {
      const cardToken = await getCustomerCardToken(customerId);
      // Initialize new transaction then charge via stored token
      const txn = await initializeMonnifyTransaction({ ref: newRef });
      await chargeMonnifyToken(txn.transactionReference, cardToken);

      // No failure webhook: poll transaction status directly
      const status = await getMonnifyTransactionStatus(newRef);
      succeeded = status.paymentStatus === 'PAID';

    } else if (paymentType === 'mandate') {
      // Debit the existing mandate with a new debit reference
      const debit = await debitMonnifyMandate({
        mandateReference: paymentRef,
        paymentReference: newRef,
      });

      // Poll debit status using the reference returned above
      const status = await getMonnifyDebitStatus(debit.paymentReference);
      succeeded = status.transactionStatus === 'SUCCESSFUL';
    }

    if (succeeded) {
      await restoreCustomerAccess(customerId);
    } else {
      await handleFailedPayment(paymentType, newRef, customerId, attemptCount + 1);
    }
  } catch (err) {
    await handleFailedPayment(paymentType, newRef, customerId, attemptCount + 1);
  }
}, delayMs);
}
Show more
alert image
Use a job queue for production:
setTimeout is for illustration only. In production, use a durable job queue (Bull, Agenda, AWS SQS, etc.) so retries survive server restarts and can be monitored.

Step 5 – Verify Every Retry
After each retry attempt (whether from your scheduler or a customer paying manually), always verify the transaction status server-side before restoring access.

cURL
JavaScript
Python
PHP
Copy
const response = await fetch("https://sandbox.monnify.com/api/v2/merchant/transactions/query?paymentReference=RENEWAL_REF_005_retry_1"", {
  method: "GET",
  headers: {
    "Authorization": "Bearer <accessToken>"
  }
});

const data = await response.json();
console.log(data);
Only restore access when paymentStatus === "PAID" and amountPaid matches the expected amount. See Verify Transactions for the full response reference.

Direct Debit Retry Flow
For Direct Debit / Mandates, Monnify sends a MANDATE_UPDATE webhook whenever the mandate's status changes (e.g. activated, suspended, cancelled). A failed debit attempt will not always trigger a webhook. To confirm whether a debit succeeded, poll the Get Debit Status endpoint using the debit reference returned when you initiated the debit.

If the debit did not succeed:

Schedule another debit attempt against the same mandate (for retryable failures such as insufficient funds or bank downtime).
Fall back to a payment link or new mandate if the mandate itself is no longer valid (expired, cancelled, or suspended).
alert image
NIP mandate retry rules:
Banks may have restrictions on how frequently a mandate can be debited, Monnify currently sets limit to 2 per day. Check the specific terms of the mandate type to avoid unnecessary bank-side rejections.
