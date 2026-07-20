Single Transfers
The Monnify Single Transfer API allows you to send money directly to a bank account or mobile wallet in real time. This guide walks you through the prerequisites and the full integration flow.


Before You Begin
Before integrating the Single Transfer API, make sure you have completed the following steps:


Enable Disbursements on your account
Disbursements is not enabled by default on Monnify. You must request activation for the feature to enabled on their account for either Sandbox and/or Live environment by contacting integration-support@monnify.com to get this enabled before you can make any transfer requests.

Whitelist your server IP address
For security on Live environment, Monnify only processes disbursement requests from whitelisted IP addresses. You must provide the static IP address(es) of your server(s) to Monnify before going live. If your IP is not whitelisted, all disbursement requests will be rejected with a D06 error. Send your IP address(es) to integration-support@monnify.com to get them added.

Understand how MFA (OTP) works
Multi-Factor Authentication (MFA) via OTP is enabled by default for all disbursement accounts in both Sandbox and Live instances. When MFA is active, each transfer request will return a PENDING_AUTHORIZATION status and require you to submit an OTP before the transfer is processed. The OTP is sent to the registered email address on your Monnify account.

If your integration handles transfers programmatically and you do not need OTP authorization, you can request for MFA to be disabled by contacting integration-support@monnify.com.

alert image
Note
You can send merge and send the three requests above as a single email. As part of the email, you will be expected to idemnify Monnify for potential use and misuse of the feature on your platfrom.

Integration Flow
Once your account is set up, here is the typical flow for a single transfer:


Initiate the transfer: your server sends a transfer request to Monnify.
If MFA is enabled, authorize the transfer by submitting the OTP received via email.
Poll or receive a webhook notification for the final transfer status.

Initiating a Transfer
Make a POST request to the Initiate Transfer (Single) API with your transfer details. The response will differ depending on whether MFA is enabled on your account.

alert image
Use the right account details
Before initiating a transfer, use the Name Enquiry API to look up and verify the recipient's account. The name returned should be passed as the destinationAccountName in your request. Submitting a mismatched name will cause the transfer to fail. To get the correct destinationBankCode, use the Get Banks API to retrieve the full list of supported banks and their codes.

cURL
JavaScript
Python
PHP
Copy
const response = await fetch("https://sandbox.monnify.com/api/v2/disbursements/single", {
  method: "GET",
  body: JSON.stringify({
    "amount": 500,
    "reference": "unique-ref-001",
    "narration": "Payment for services rendered",
    "destinationBankCode": "058",
    "destinationAccountNumber": "0123456789",
    "destinationAccountName": "John Doe",
    "currency": "NGN",
    "sourceAccountNumber": "9999999999"
})
});

const data = await response.json();
console.log(data);
Show more
Response (MFA enabled, OTP required):

Response (MFA enabled)
Copy
{
"requestSuccessful": true,
"responseMessage": "success",
"responseCode": "0",
"responseBody": {
  "amount": 500.00,
  "reference": "unique-ref-001",
  "status": "PENDING_AUTHORIZATION",
  "dateCreated": "2024-01-15T10:30:00.000+0000",
  "totalFee": 10.75,
  "destinationAccountName": "John Doe",
  "destinationAccountNumber": "0123456789",
  "destinationBankCode": "058",
  "destinationBankName": "GTBank"
}
}
Show more
Response (MFA disabled, transfer proceeds immediately):

Response (MFA disabled)
Copy
{
"requestSuccessful": true,
"responseMessage": "success",
"responseCode": "0",
"responseBody": {
  "amount": 500.00,
  "reference": "unique-ref-001",
  "status": "SUCCESS",
  "dateCreated": "2024-01-15T10:30:00.000+0000",
  "totalFee": 10.75,
  "destinationAccountName": "John Doe",
  "destinationAccountNumber": "0123456789",
  "destinationBankCode": "058",
  "destinationBankName": "GTBank"
}
}
Show more

Authorizing a Transfer (MFA / OTP)
If your account has MFA enabled and you received a PENDING_AUTHORIZATION status, you must authorize the transfer by submitting the OTP sent to your registered email. Make a POST request to the Authorize Transfer (Single) API.


cURL
JavaScript
Python
PHP
Copy
const response = await fetch("https://sandbox.monnify.com/api/v2/disbursements/single/validate-otp", {
  method: "GET",
  body: JSON.stringify({
    "reference": "unique-ref-001",
    "authorizationCode": "123456"
})
});

const data = await response.json();
console.log(data);
Authorization Response
Copy
{
"requestSuccessful": true,
"responseMessage": "success",
"responseCode": "0",
"responseBody": {
  "amount": 500.00,
  "reference": "unique-ref-001",
  "status": "SUCCESS",
  "dateCreated": "2024-01-15T10:30:00.000+0000",
  "totalFee": 10.75,
  "destinationAccountName": "John Doe",
  "destinationAccountNumber": "0123456789",
  "destinationBankCode": "058",
  "destinationBankName": "GTBank"
}
}
Collapse

Resending an OTP
If the OTP was not received or has expired, you can request a new one via the Resend OTP API.


cURL
JavaScript
Python
PHP
Copy
const response = await fetch("https://sandbox.monnify.com/api/v2/disbursements/single/resend-otp", {
  method: "GET",
  body: JSON.stringify({
    "reference": "unique-ref-001"
})
});

const data = await response.json();
console.log(data);

Asynchronous Transfers
By default, Monnify processes transfers synchronously and your server waits for a final status. If you prefer not to block your server, you can process transfers asynchronously by setting async to true in your request. Monnify will send the final status to your webhook URL once the transfer is processed.


cURL
JavaScript
Python
PHP
Copy
const response = await fetch("https://sandbox.monnify.com/api/v2/disbursements/single", {
  method: "GET",
  body: JSON.stringify({
    "amount": 500,
    "reference": "unique-ref-async-001",
    "narration": "Async payment for services",
    "destinationBankCode": "058",
    "destinationAccountNumber": "0123456789",
    "destinationAccountName": "John Doe",
    "currency": "NGN",
    "sourceAccountNumber": "9999999999",
    "async": true
})
});

const data = await response.json();
console.log(data);
Show more

Transfer with Sender Details
You can specify the actual sender's details on a transfer so that the recipient's bank statement shows the real sender rather than your business name. This is particularly useful for platforms that process transfers on behalf of other parties. Include a senderInfo object in your request payload.


cURL
JavaScript
Python
PHP
Copy
const response = await fetch("https://sandbox.monnify.com/api/v2/disbursements/single", {
  method: "GET",
  body: JSON.stringify({
    "amount": 500,
    "reference": "unique-ref-002",
    "narration": "Payment from Acme Ltd",
    "destinationBankCode": "058",
    "destinationAccountNumber": "0123456789",
    "destinationAccountName": "John Doe",
    "currency": "NGN",
    "sourceAccountNumber": "9999999999",
    "senderInfo": {
        "sourceAccountName": "Acme Ltd",
        "sourceAccountNumber": "1234567890",
        "senderBankCode": "057"
    }
})
});

const data = await response.json();
console.log(data);
Show more

Getting Transfer Status
To check the status of a transfer, make a GET request to the Single Transfer Status API with the transaction reference.


cURL
JavaScript
Python
PHP
Copy
const response = await fetch("https://sandbox.monnify.com/api/v2/disbursements/single/summary?reference=unique-ref-001'", {
  method: "GET"
});

const data = await response.json();
console.log(data);
Transfer Status Response
Copy
{
"requestSuccessful": true,
"responseMessage": "success",
"responseCode": "0",
"responseBody": {
  "amount": 500.00,
  "reference": "unique-ref-001",
  "narration": "Payment for services rendered",
  "currency": "NGN",
  "fee": 10.75,
  "twoFaEnabled": false,
  "status": "SUCCESS",
  "transactionDescription": "Transfer Successful",
  "transactionReference": "MONNIFY_TRX_REF_001",
  "createdOn": "2024-01-15T10:30:00.000+0000",
  "destinationAccountNumber": "0123456789",
  "destinationAccountName": "John Doe",
  "destinationBankCode": "058",
  "destinationBankName": "GTBank"
}
}
Show more

Getting All Transfers
You can retrieve a paginated list of all single transfers from your account by making a GET request to the Get All Single Transactions API. Provide pageNo (starts at 0) and pageSize as query parameters.


cURL
JavaScript
Python
PHP
Copy
const response = await fetch("https://sandbox.monnify.com/api/v2/disbursements/single/list?pageNo=0&pageSize=20'", {
  method: "GET"
});

const data = await response.json();
console.log(data);

Searching Disbursement Transactions
To search across all your disbursement transactions, make a GET request to the Search Disbursement Transactions API. You can filter by reference, status, date range, and more.


Getting Your Wallet Balance
You can check the available balance in your Monnify disbursement wallet at any time by making a GET request to the Wallet Balance API.


cURL
JavaScript
Python
PHP
Copy
const response = await fetch("https://sandbox.monnify.com/api/v2/disbursements/wallet-balance?accountNumber=9999999999'", {
  method: "GET"
});

const data = await response.json();
console.log(data);
Wallet Balance Response
Copy
{
"requestSuccessful": true,
"responseMessage": "success",
"responseCode": "0",
"responseBody": {
  "availableBalance": 24500.00,
  "ledgerBalance": 25000.00,
  "accountNumber": "9999999999",
  "currency": "NGN"
}
}

Transaction Status Reference
Status	Description
PENDING, AWAITING_PROCESSING and IN_PROGRESS

The transaction is still being processed. Re-query to get the final status.

PENDING_AUTHORIZATION	
MFA is enabled and the transfer is waiting for OTP authorization before it can be processed.

OTP_EMAIL_DISPATCH_FAILED	
Monnify could not send the OTP email. Use the Resend OTP API to request a new one.

SUCCESS and COMPLETED	
The disbursement was processed successfully and the recipient has been credited.

REVERSED	
The disbursement was reversed. The funds have been returned to your wallet.

FAILED	
The disbursement was not successful. Check the error message for the reason.

EXPIRED	
The transaction was not authorized within its validity period. Initiate a new transfer.


Error Reference
Error Code	Meaning	Recommended Action
99	
An unexpected error occurred while processing the transaction.

Re-query to confirm the transaction status before retrying.

D01	
Something went wrong and the transaction could not be processed. The actual error will be in the responseMessage field.

Treat as Failed.
D02	Transaction does not exist.	Treat as Failed.
D03	Invalid account details supplied.	Treat as Failed.
D04	Insufficient wallet balance.	Top up your Monnify wallet and retry.
D05	
The reference supplied has already been used for a previous transaction.

Retry with a new unique reference.
D06	
Unauthorized request. The request originated from an IP address that is not whitelisted.

Send your server IP address to integration-support@monnify.com for whitelisting.

D07	
Duplicate request. A transfer to the same account for the same amount was made within a 2-minute window.

Retry after 2 minutes, or contact integration-support@monnify.com to disable duplicate detection.

Invalid destination account number	
The account number did not pass name enquiry validation.

Ask the customer to provide a valid account number.

Dormant beneficiary account	The recipient's account is dormant.	The customer should contact their bank.
Beneficiary account name mismatch	The account name does not match the account number.	
Ask the customer to reconfirm their account details.

Unknown destination bank code	
The bank code supplied is not recognized on Monnify.

Confirm the correct destinationBankCode from the list of supported banks.

Transaction timed out while waiting for destination bank

The recipient's bank did not respond in time.	Re-query the transaction status.
Invalid amount	The transaction amount is invalid.	
Confirm the transaction amount and retry.

Delayed processing from NIP	Delay from the NIP (interbank network).	Re-query the transaction status.
Post No Credit restriction on beneficiary account

The recipient's account has a Post No Debit (PND) restriction and cannot be credited.

The customer should contact their bank.
Beneficiary bank not available	The recipient's bank is currently unavailable.	Re-query the transaction status.
Invalid session ID	The session ID for the transaction is invalid.	Re-query the transaction status.
Rejected by destination institution

The credit was rejected by the recipient's bank.

The customer should contact their bank to find out the reason.

Suspected fraud	
The recipient's account is under investigation for fraud.

The customer should contact their bank.
Invalid response code from beneficiary institution

An unrecognized response code was received from the recipient's bank.

Re-query the transaction status.
System malfunction by destination institution

The recipient's bank is experiencing a system issue.

Re-query the transaction status.
Beneficiary account limit exceeded	
The recipient's account is a low-KYC account and cannot receive the transfer amount.

The customer should contact their bank to upgrade their account tier.

Sender not permitted to credit beneficiary

The recipient's account has a restriction that prevents it from being credited.

The customer should contact their bank to identify and resolve the restriction.

Unable to complete the transaction at this time

The recipient's bank or payment provider is currently unavailable.

Re-query the transaction status.
Transaction could not be processed at this time. Please try again

The payment provider is currently unavailable.

Re-query the transaction status.
Transaction processing in progress	The transaction is still being processed.	Re-query the transaction status.
Account number could not be validated

Name enquiry failed: the account number may be invalid or the destination bank is unavailable.

Reconfirm the destination account details and check bank availability.

Transaction Failed	
The transaction failed due to a system or provider error.

Contact Monnify support.
System Malfunction - Internal service failure

The transaction failed due to an internal Monnify error.

Contact Monnify support.
System Malfunction - Transaction transmission unsuccessful

The transaction failed due to a system malfunction during transmission.

Contact Monnify support.
Processor Malfunction - Transaction transmission failed

An error occurred during transaction processing with NIBBS.

Re-query the transaction status.
