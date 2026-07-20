Checkout API
The Checkout API gives you full control over the payment flow without requiring a Monnify SDK. Use it to redirect customers to the Monnify-hosted checkout URL, or build your own payment UI by calling the bank transfer and card charge endpoints directly.

alert image
Prefer a library over raw API calls?
Monnify has official server-side libraries for Node.js, Python, Go, Java, PHP (Laravel), and more, so you can skip the boilerplate and integrate in minutes. See Libraries and Plugins.

Option A – Hosted Checkout (Redirect to checkoutUrl)
The fastest way to go live. Your server initializes a transaction via the API, receives a checkoutUrl, and redirects the customer to it. Monnify handles the entire payment UI and redirects the customer back to your site when done.

Step 1 – Authenticate
Base64-encode your apiKey:secretKey and call the login endpoint to get a Bearer token (valid for 1 hour).

cURL
JavaScript
Python
PHP
Copy
const response = await fetch("https://sandbox.monnify.com/api/v1/auth/login", {
  method: "POST",
  headers: {
    "Authorization": "Basic $CREDENTIALS"
  }
});

const data = await response.json();
console.log(data);
Step 2 – Initialize the Transaction
cURL
JavaScript
Python
PHP
Copy
const response = await fetch("https://sandbox.monnify.com/api/v1/merchant/transactions/init-transaction", {
  method: "POST",
  headers: {
    "Authorization": "Bearer <accessToken>",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    "amount": 20,
    "customerEmail": "email@example.com",
    "paymentReference": "123-03hjsj--1klsa--dkad",
    "paymentDescription": "Trial transaction",
    "currencyCode": "NGN",
    "contractCode": "5867418298",
    "redirectUrl": "https://my-merchants-page.com/transaction/confirm",
    "paymentMethods": [
        "CARD",
        "ACCOUNT_TRANSFER",
        "USSD",
        "PHONE_NUMBER"
    ],
    "metadata": {
        "name": "John Doe",
        "age": 45
    }
})
});

const data = await response.json();
console.log(data);
Show more
response.json
Copy
{
"requestSuccessful": true,
"responseMessage": "success",
"responseCode": "0",
"responseBody": {
  "transactionReference": "MNFY|20190915200044|000090",
  "paymentReference": "123-03hjsj--1klsa--dkad",
  "merchantName": "Test Limited",
  "apiKey": "MK_TEST_VR7J3UAACH",
  "enabledPaymentMethod": [
    "ACCOUNT_TRANSFER",
    "CARD"
  ],
  "checkoutUrl": "https://sandbox.sdk.monnify.com/checkout/MNFY|20190915200044|000090"
}
}
Show more
alert image
Important:
Always confirm that the values returned by this endpoint match what you sent in the request payload. Bad actors can intercept requests and alter values such as the transaction amount.

Step 3 – Redirect the Customer
Take the checkoutUrl from Step 2's response and redirect the customer to it. Monnify handles the full payment UI from here.

server.js
Copy
// After Step 2, redirect the customer to the checkoutUrl
res.redirect(data.responseBody.checkoutUrl);
alert image
Checkout expiry:
The checkoutUrl is valid for 40 minutes. If the customer does not complete payment within this window, the transaction expires and they must start again.

Step 4 – Handle the Redirect Callback
After payment, Monnify redirects the customer to your redirectUrl with the result as query parameters:

Copy
https://yoursite.com/payment/callback?paymentReference=ORD-20240601-0023&transactionReference=MNFY|67|20240601|000023&paymentStatus=PAID
alert image
Always verify server-side:
Never fulfill an order based on the redirect URL parameters alone. Always call the Verify Transactions API from your server before delivering value.

Option B – Build Your Own Payment UI (Raw Endpoints)
If you want to build a fully custom payment flow with your own bank transfer screen and card form, use the raw API endpoints below instead of the hosted checkout URL.

Pay with Bank Transfer
Call the Pay with Bank Transfer endpoint with the transactionReference of an initialized transaction. Monnify returns a dynamic virtual account number your customer transfers to.

You can call this endpoint multiple times; each call returns how many seconds the account remains valid (maximum 2400 seconds / 40 minutes).
Pass a bankCode to also receive a USSD code for that bank.
Inform your customers of the account expiry to prevent failed or erroneous transfers.
alert image
Note:
The virtual account is valid for 40 minutes. Always display this expiry clearly to your customers.

Charge Card
Call the Charge Card endpoint with the customer's card details and the transactionReference of an initialized transaction.

alert image
PCI-DSS required:
Access to the direct card charge endpoint requires PCI-DSS certification. Contact integration-support@monnify.com to apply.

Request Field Reference
Field	Required	Description
amount	Yes	Payment amount in NGN (or USD for enabled merchants).
paymentReference	Yes	Your unique order reference. Must be unique per transaction.
contractCode	Yes	Your contract code from the Monnify dashboard.
redirectUrl	Yes (Option A)	Where Monnify redirects the customer after payment. Not required when building your own UI.
currencyCode	No	Defaults to NGN. Use USD if enabled for international card collection.
paymentMethods	No	Restrict available payment methods. Omit to show all.
incomeSplitConfig	No	Split the payment across multiple sub-accounts. See Transaction Splitting.
Common Error Messages
Error Message	Meaning	Action
Unknown currency code supplied	The currencyCode is not supported on your account. NGN is default; USD is only available for merchants specifically enabled for international card collection.	Use NGN or USD (if enabled).
Could not find specified contract	The contractCode is invalid or does not belong to the authenticated merchant.	Verify your contract code in the dashboard and ensure it matches the environment (test vs. live).
Duplicate payment reference	The paymentReference has already been used by this merchant in this environment.	Generate a unique reference for every new transaction.
Invalid Card Number	The card PAN supplied is incorrect.	Verify the card number and retry.
Merchant has not been configured for bin	The first six digits of the card PAN are not among Monnify's supported card bins.	Customer should confirm the card is a Nigerian-issued card, or contact Monnify support.
Could not find transaction with the specified transaction reference	The transaction reference does not exist for this merchant.	Confirm the reference and retry.
