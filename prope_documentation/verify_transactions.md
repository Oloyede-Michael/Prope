Verify Transactions
Never trust a client-side callback or redirect alone. Always verify a transaction on your server using the Monnify API before delivering goods, granting access, or crediting a wallet.

alert image
Why server-side verification matters:
Client-side callbacks (SDK onComplete, redirect URL parameters) can be intercepted or manipulated by a bad actor. A server-to-server verification call ensures the payment status you act on is authoritative and tamper-proof.

Verification by Payment Reference
Use this endpoint when you know your own paymentReference (the reference you generated and passed when initializing the transaction).

cURL
JavaScript
Python
PHP
Copy
const response = await fetch("https://sandbox.monnify.com/api/v2/merchant/transactions/query?paymentReference=ORDER_20240601_0023"", {
  method: "GET",
  headers: {
    "Authorization": "Bearer <accessToken>"
  }
});

const data = await response.json();
console.log(data);
Verification by Transaction Reference
Use this when you have the transactionReference returned by Monnify (e.g. from a webhook payload).

cURL
JavaScript
Python
PHP
Copy
const response = await fetch("https://sandbox.monnify.com/api/v2/merchant/transactions/query?transactionReference=MNFY%7C67%7C20240601%7C000023"", {
  method: "GET",
  headers: {
    "Authorization": "Bearer <accessToken>"
  }
});

const data = await response.json();
console.log(data);
Response Reference
verify-response.json
Copy
{
"requestSuccessful": true,
"responseMessage": "success",
"responseCode": "0",
"responseBody": {
  "transactionReference": "MNFY|67|20240601|000023",
  "paymentReference": "ORDER_20240601_0023",
  "amountPaid": 10000,
  "totalPayable": 10000,
  "settlementAmount": 9825,
  "paidOn": "2024-06-01T10:45:00.000+0000",
  "createdOn": "2024-06-01T10:30:00.000+0000",
  "completedOn": "2024-06-01T10:45:00.000+0000",
  "paymentStatus": "PAID",
  "paymentMethod": "ACCOUNT_TRANSFER",
  "currencyCode": "NGN",
  "fee": 175,
  "customerDTO": {
    "email": "amina@example.com",
    "name": "Amina Bello",
    "mobileNumber": "08012345678"
  },
  "metaData": {
    "deviceType": "web"
  },
  "paymentSourceInformation": [
    {
      "bankCode": "058",
      "amountPaid": 10000,
      "sessionId": "090405240601104500000012345",
      "accountName": "AMINA BELLO",
      "accountNumber": "0123456789"
    }
  ]
}
}
Collapse
Field	Description
paymentStatus	The authoritative payment status. See statuses below.
amountPaid	Actual amount received. Always verify this equals your expected amount.
totalPayable	The amount the customer was charged (may include fees if fee bearer is customer).
settlementAmount	Amount that will be settled to your account after Monnify fees.
paymentMethod	Method used: ACCOUNT_TRANSFER, CARD, USSD, PHONE_NUMBER.
paymentSourceInformation	For bank transfers: the customer's actual account name and number. Useful for reconciliation and fraud checks.
Payment Status Values
Status	Meaning	Action
PAID	Full payment received.	Fulfill the order / grant access.
PARTIALLY_PAID	Customer paid less than the required amount.	Do not fulfill. Request the balance or issue a refund.
PENDING	Payment initiated but not yet confirmed.	Wait for a webhook or re-poll after a short delay.
OVERPAID	Customer paid more than the required amount.	Fulfill the order. Refund the excess or credit the customer's wallet.
FAILED	Payment attempt failed.	Do not fulfill. Notify the customer and offer a retry path.
REVERSED	Payment was reversed after confirmation.	Suspend access / hold order if not already fulfilled.
EXPIRED	The checkout session expired before payment.	Ask the customer to start a new payment session.
alert image
Overpayment and underpayment configuration:
By default, Monnify rejects over and under payments. The funds are returned to the sender and you receive a REJECTED_PAYMENT webhook instead. The OVERPAID and PARTIALLY_PAID statuses only appear if your Monnify contract has been configured to accept them. You can update this setting in Settings > Contracts Setup > Edit Contract on the Monnify dashboard.

Recommended Verification Flow
cURL
JavaScript
Python
PHP
Copy
const response = await fetch("https://sandbox.monnify.com/api/v2/merchant/transactions/query?paymentReference=ORD-20240601-0023"", {
  method: "GET",
  headers: {
    "Authorization": "Bearer <accessToken>"
  }
});

const data = await response.json();
console.log(data);
alert image
Check both status AND amount:
Always verify that amountPaid is at least the amount you expected. A successful status with an incorrect amount should be treated as a partial or fraudulent payment.

Using Webhooks Instead of Polling
Rather than only verifying on the redirect callback, configure your webhook URL to receive real-time payment notifications. This is especially important for:

Customers who close the browser before the redirect completes.
Reserved account payments that happen asynchronously.
Direct debit charges triggered server-to-server.
See Webhooks & Event Types for details on how to validate the webhook signature and handle each event type.
