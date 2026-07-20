Verifying your Customers
The Monnify Verification APIs allow you to confirm the accuracy of your customers' identity and account details before performing any financial transaction. This helps you reduce failed transfers, prevent fraud, and meet KYC compliance requirements. This guide covers all four verification services and how to use each one.


alert image
Environment and billing
The Name Enquiry API is free and available on both the Sandbox and Live environments. All other verification APIs (BVN and Account Name Validation, BVN Information Verification, and NIN Verification) are available on the Live environment only. Requests to these APIs will fail if your Monnify wallet balance is below the cost of the service being requested.

Name Enquiry
The Name Enquiry service lets you look up and confirm the name tied to a bank account number before initiating a transfer. Make a GET request to the Validate Bank Account API with the account number and bank code.


cURL
JavaScript
Python
PHP
Copy
const response = await fetch("https://sandbox.monnify.com/api/v2/disbursements/account/validate?accountNumber=0123456789&bankCode=058'", {
  method: "GET"
});

const data = await response.json();
console.log(data);
Name Enquiry Response
Copy
{
"requestSuccessful": true,
"responseMessage": "success",
"responseCode": "0",
"responseBody": {
  "accountNumber": "0123456789",
  "accountName": "John Doe",
  "bankCode": "058",
  "bankName": "GTBank"
}
}

BVN and Account Name Validation
This service lets you verify that the BVN information supplied by your customers matches what is registered on their BVN record. Make a POST request to the BVN and Account Name Match API with the customer's BVN, bank code, and account number.


cURL
JavaScript
Python
PHP
Copy
const response = await fetch("https://sandbox.monnify.com/api/v1/vas/bvn-account-match", {
  method: "GET",
  body: JSON.stringify({
    "bvn": "12345678901",
    "bankCode": "058",
    "accountNumber": "0123456789",
    "name": "John Doe"
})
});

const data = await response.json();
console.log(data);
BVN and Account Name Validation Response
Copy
{
"requestSuccessful": true,
"responseMessage": "success",
"responseCode": "0",
"responseBody": {
  "bvn": "12345678901",
  "accountNumber": "0123456789",
  "bankCode": "058",
  "accountName": "John Doe",
  "bvnAccountNameMatch": true
}
}

BVN Information Verification
This service allows you to verify that the Bank Verification Number (BVN) and account number provided by your customers match the BVN and account number linked to the account. Make a POST request to the BVN Details Match API with the customer's BVN and account details.

alert image
Pricing
This service costs ₦10 per successful request. Ensure you account for this in your integration design, particularly if you are running high-volume verifications.

cURL
JavaScript
Python
PHP
Copy
const response = await fetch("https://sandbox.monnify.com/api/v1/vas/bvn-details-match", {
  method: "GET",
  body: JSON.stringify({
    "bvn": "12345678901",
    "name": "John Doe",
    "dateOfBirth": "01-Jan-1990",
    "mobileNo": "08012345678"
})
});

const data = await response.json();
console.log(data);
BVN Information Verification Response
Copy
{
"requestSuccessful": true,
"responseMessage": "success",
"responseCode": "0",
"responseBody": {
  "bvn": "12345678901",
  "name": "John Doe",
  "dateOfBirth": "01-Jan-1990",
  "mobileNo": "08012345678",
  "bvnInformationMatch": true
}
}

NIN Verification
This service allows you to verify the National Identification Number (NIN) supplied by your customers. Make a POST request to the NIN Verification API with the customer's NIN.

alert image
Pricing
This service costs ₦60 per successful request. Ensure you account for this in your integration design, particularly if you are running high-volume verifications.

cURL
JavaScript
Python
PHP
Copy
const response = await fetch("https://sandbox.monnify.com/api/v1/vas/nin-verification", {
  method: "GET",
  body: `{
  "nin": "98765432101",
}`
});

const data = await response.json();
console.log(data);
NIN Verification Response
Copy
{
"requestSuccessful": true,
"responseMessage": "success",
"responseCode": "0",
"responseBody": {
  "nin": "98765432101",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "01-Jan-1990",
  "gender": "Male",
  "phoneNumber": "08012345678",
  "ninInformationMatch": true
}
}

Response Reference
Field	Type	Description
requestSuccessful	Boolean	Indicates whether the API request was received and processed successfully.
responseCode	String	0 means success. Any other value indicates a failure; check responseMessage for details.
bvnAccountNameMatch	Boolean	Returned by the BVN and Account Name Validation service. true means the name matches the BVN record; false means it does not.
bvnInformationMatch	Boolean	Returned by the BVN Information Verification service. true means the supplied details match the BVN record.
ninInformationMatch	Boolean	Returned by the NIN Verification service. true means the supplied details match the NIN record.

Error Reference
Error	Meaning	Recommended Action
Invalid account number	The account number supplied could not be found at the specified bank.	Ask the customer to confirm their account number and bank.
Invalid bank code	The bank code is not recognized on Monnify.	Use the Get Banks API to confirm the correct bank code.
Account number could not be validated	Name enquiry failed. The destination bank may be temporarily unavailable.	Retry after a short delay. If the issue persists, contact integration-support@monnify.com.
Invalid BVN	The BVN supplied is not a valid 11-digit BVN.	Ask the customer to confirm their BVN.
Invalid NIN	The NIN supplied is not a valid 11-digit NIN.	Ask the customer to confirm their NIN.
Service unavailable	The verification service or the upstream identity provider is temporarily unavailable.	Retry after a short delay. Contact integration-support@monnify.com if the issue persists.
