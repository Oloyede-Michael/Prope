Reconciliation
Reconciliation is the process of matching your internal payment records against the authoritative data from Monnify. A good reconciliation workflow catches discrepancies early, such as missed payments, duplicate records, or settlement shortfalls, before they become accounting problems.

What You Are Reconciling
There are two layers of reconciliation for most merchants:

Transaction-level: Every payment your customers made. Does your database record match what Monnify recorded?
Settlement-level: The net amount credited to your wallet or bank account. Does it match the sum of your transaction fees and settlement amounts?
Step 1 – Pull Your Transactions from Monnify
Use the transaction search API to fetch all transactions for a given period. Paginate through the results to ensure you capture everything.

cURL
JavaScript
Python
PHP
Copy
const response = await fetch("https://sandbox.monnify.com/api/v1/merchant/transactions/search?page=0&size=100&paymentStatus=PAID&from=1717200000000&to=1719791999000"", {
  method: "GET",
  headers: {
    "Authorization": "Bearer <accessToken>"
  }
});

const data = await response.json();
console.log(data);
cURL
JavaScript
Python
PHP
Copy
const response = await fetch("https://sandbox.monnify.com/api/v1/merchant/transactions/search?page=$PAGE&size=100&paymentStatus=PAID&from=1717200000000&to=1719791999000"", {
  method: "GET",
  headers: {
    "Authorization": "Bearer <accessToken>"
  }
});

const data = await response.json();
console.log(data);
alert image
Include all statuses:
For a complete reconciliation, also fetch PARTIALLY_PAID, OVERPAID, and REVERSED transactions separately, not just PAID. Each status may require a different accounting treatment.

Step 2 – Compare Against Your Internal Records
For each Monnify transaction, look up the corresponding record in your own database using the paymentReference (your own order/reference ID).

reconcile.js
Copy
async function reconcile(monnifyTransactions) {
const discrepancies = [];

for (const txn of monnifyTransactions) {
  const internalOrder = await db.orders.findByReference(txn.paymentReference);

  if (!internalOrder) {
    discrepancies.push({ type: 'MISSING_IN_DB', txn });
    continue;
  }

  if (internalOrder.amount !== txn.amountPaid) {
    discrepancies.push({ type: 'AMOUNT_MISMATCH', txn, internal: internalOrder });
    continue;
  }

  if (internalOrder.status !== 'PAID') {
    discrepancies.push({ type: 'STATUS_MISMATCH', txn, internal: internalOrder });
  }
}

return discrepancies;
}
Show more
Discrepancy Type	Meaning	Action
MISSING_IN_DB	Monnify recorded a payment but your DB has no matching order.	Investigate: the webhook may have been missed. Fulfill or refund as appropriate.
AMOUNT_MISMATCH	Payment amount differs from your expected order amount.	Check for overpayment or partial payment. Refund the excess or chase the balance.
STATUS_MISMATCH	Monnify shows PAID but your DB shows PENDING (webhook missed or duplicate).	Update your DB and fulfill the order.
Step 3 – Reconcile Settlement Amounts
To verify that the amount credited to your Monnify wallet matches what you expect, sum the settlementAmount field across all paid transactions for a settlement period and compare it against your wallet credit.

settlement-recon.js
Copy
function calculateExpectedSettlement(transactions) {
return transactions
  .filter(txn => txn.paymentStatus === 'PAID')
  .reduce((sum, txn) => sum + txn.settlementAmount, 0);
}

const monnifyTransactions = await fetchAllTransactions(1717200000000, 1717286399000);
const expectedSettlement = calculateExpectedSettlement(monnifyTransactions);

// Compare against the credit posted to your wallet at 10 PM
console.log('Expected settlement:', expectedSettlement);
// Cross-reference with your bank statement or wallet API
alert image
Remember transaction fees:
amountPaid is the gross amount. settlementAmount is after Monnify's fee. Always use settlementAmount when reconciling against your wallet credit.

Step 4 – Handle Split Payment Reconciliation
If you use Transaction Splitting, each sub-account receives its portion at settlement. Reconcile each sub-account independently by querying its settlement separately or by tracking the incomeSplitConfig you sent when initializing the transaction.

split-recon-example.json
Copy
{
"amountPaid": 10000,
"incomeSplitConfig": [
  { "subAccountCode": "MFY_SUB_001", "splitAmount": 4000 },
  { "subAccountCode": "MFY_SUB_002", "splitAmount": 6000 }
],
"settlementAmount": 9825
}
Automating Reconciliation
Run reconciliation as a scheduled job. Daily is the most common cadence, aligned with the 10 PM settlement cycle. A typical setup:

Schedule a job at 11 PM daily (after settlement).
Fetch all Monnify transactions for the day.
Compare against your internal database.
Log or alert on any discrepancies for manual review.
Auto-resolve clear cases (e.g. status mismatches from missed webhooks).
alert image
Keep a recon audit log:
Store every reconciliation run and its results. This gives you an audit trail for finance reviews and makes it much easier to spot patterns in discrepancies over time.

Key API Endpoints for Reconciliation
Search Transactions: GET /api/v1/merchant/transactions/search. Filter by status, date range, or payment method. The from and to parameters accept Unix timestamps in milliseconds.
Verify Single Transaction: GET /api/v2/merchant/transactions/query. Look up a specific transaction by reference.
See the full API Reference for query parameters and response schemas.
