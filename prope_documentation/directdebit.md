Direct Debits
Monnify Account Direct Debit is a simple, secure and convenient ‘pull’ payment method that allows merchants to automatically collect recurring payments from a payer directly from their Account.

Key Processes
Monnify Direct Debit enables merchants to set up recurring payments by creating and activating mandates for customers. The process involves mandate creation, customer authorization, and mandate activation/debiting.

Direct debit process flow
Mandate Management Workflow
A mandate is the agreement between a customer and a merchant that authorizes recurring debits.

Mandate workflow
Below are all possible mandate statuses:

Mandate Status	Description
PENDING	
Mandate creation is in progress.

PENDING AUTHORIZATION	
Mandate is awaiting customer authorization.

PENDING ACTIVATION	
Mandate has been authorized by the customer and is awaiting activation by the customer’s financial institution.

ACTIVATED	
Mandate has been activated and can now be debited.

AUTHORIZATION EXPIRED	
Mandate authorization expired because the customer didn’t authorize it within the available timeframe.

EXPIRED	
Mandate has reached its expiration time.

CANCELLED	
Mandate was canceled by the merchant.

SUSPENDED	
Mandate was suspended by the customer’s financial institution.

Ways To Use
Depending on your business needs, mandates can be configured in four ways:

Open Flexible: Varying amounts, no end date. Example: utility company debiting based on usage.

Open Fixed: Fixed amount, no end date. Example: streaming subscription until cancelled.

Closed Flexible: Varying amounts with an end date. Example: car instalment plan over 12 months.

Closed Fixed: Fixed amount with an end date. Example: insurance premiums of ₦10,000 monthly for 12 months.

Mandate Creation & Activation Flow
Monnify routes mandates to the right provider depending on bank configuration:

TeamApt: Used if the customer’s bank is enabled for the merchant on TeamApt. Mandates require customer authorization via the provided URL.

NIBSS: Used if the bank is not enabled on TeamApt. NIBSS mandates are also authorized via URL for better experience. For testing, static instructions can be mocked.

The process has three steps: (1) create mandate, (2) customer authorizes mandate via authorization link, and (3) once activated, merchant can debit the account.

API Integration Workflow
Setting up a direct debit with Monnify follows a 5-step workflow. Each step corresponds to an API call or customer action in the mandate lifecycle.

Initiate Mandate Creation: Merchants send a request to the Create Mandate API with customer and mandate details.

Mandate Routing: Monnify automatically routes the mandate to the appropriate provider:

TeamApt → if the customer’s bank is enabled for the merchant on TeamApt.

NIBSS → if the bank is not enabled on TeamApt.

Mandate Creation: A unique mandateReference and authorization link are generated. The mandate status is set to PENDING_AUTHORIZATION. This link is valid for 30 days.

Customer Authorization: Merchants must share the authorization link with customers (via app, email, or SMS). The customer uses the link to provide consent and authorize the mandate.

Mandate Activation:
TeamApt mandates → Activated once the customer completes authorization via the URL.

TeamApt mandate activation
NIBSS mandates → Preferably activated via the authorization URL for a smoother experience. Static instructions can be mocked for testing.

NIBSS mandate activation
Create Mandate
cURL
JavaScript
Python
PHP
Copy
curl -X POST https://sandbox.monnify.com/api/v1/direct-debit/mandate/create \
-H "Authorization: Bearer <accessToken>" \
-H "Content-Type: application/json" \
-d '{
  "mandateReference": "unique_mandate_ref_001",
  "mandateDescription": "Monthly subscription fee",
  "mandateAmount": 5000,
  "startDate": "2024-07-01T00:00:00",
  "endDate": "2025-06-30T23:59:59",
  "autoRenew": false,
  "customerName": "John Doe",
  "customerEmailAddress": "john@example.com",
  "customerPhoneNumber": "2348012345678",
  "customerAddress": "12 Example Street, Lagos",
  "customerAccountNumber": "0012345678",
  "customerAccountBankCode": "044"
}'
Show more
Sample Response
response.json
Copy
{
"requestSuccessful": true,
"responseMessage": "success",
"responseCode": "0",
"responseBody": [
  {
    "mandateCode": "MTDD|01K4PV33AMJ9GT1EF7XATZTWJB",
    "mandateReference": "test_oogunboyejo_prod_32",
    "startDate": "2025-09-09T01:46:30.000+00:00",
    "endDate": "2025-11-25T09:15:30.000+00:00",
    "mandateStatus": "PENDING_AUTHORIZATION",
    "mandateAmount": 1000.00,
    "autoRenew": true,
    "customerPhoneNumber": "2348161116307",
    "customerEmailAddress": "ahsan.saleem@teamapt.com",
    "customerAddress": "12 Wole Ariyo",
    "customerName": "123-_iop",
    "customerAccountName": "OPEYEMI LUKMON ANIMASHAUN",
    "customerAccountNumber": "0707206840",
    "customerAccountBankCode": "044",
    "mandateDescription": "Subscription Fee",
    "debitAmount": null,
    "authorizationMessage": "Please use activation link to authenticate the mandate.",
    "authorizationLink": "https://mandate-verification.teamapt.com?sessionId=cdbc8961209b49f39d7eb2d4ae7170e3",
    "responseMessage": "Mandate is awaiting customer authorization - https://mandate-verification.teamapt.com?sessionId=cdbc8961209b49f39d7eb2d4ae7170e3"
  }
]
}
Show more
Key Notes for Merchants
Bank Availability: Each merchant account is configured with specific banks enabled on either TeamApt or NIBSS. Confirm your setup.

Authorization Links: Always share links with customers promptly so mandates are not delayed or expired.

Testing with NIBSS: You can mock NIBSS mandates since the instructions are static.

Essential APIs: Use the Create Mandate and Get Mandate Status APIs for integration.

Mandate APIs
Create Mandate:

Create a mandate on the customer's bank account.

Get Mandate Status:

Check the status of an existing mandate.

Debit Mandate:

Debit the account linked to an activated mandate.

Get Debit Status:

Check the debit status on a mandate.

Update Mandate:

Cancel or update a mandate.

Get Mandates:

Retrieve a paginated list of mandates you have created.

Get Mandate Status
cURL
JavaScript
Python
PHP
Copy
const response = await fetch("https://sandbox.monnify.com/api/v1/direct-debit/mandate/?mandateReferences=unique_mandate_ref_001"", {
  method: "GET",
  headers: {
    "Authorization": "Bearer <accessToken>"
  }
});

const data = await response.json();
console.log(data);
Debit Mandate
cURL
JavaScript
Python
PHP
Copy
const response = await fetch("https://sandbox.monnify.com/api/v1/direct-debit/mandate/debit", {
  method: "POST",
  headers: {
    "Authorization": "Bearer <accessToken>",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    "mandateReference": "unique_mandate_ref_001",
    "paymentReference": "DEBIT_REF_001",
    "amount": 5000,
    "narration": "Monthly subscription - July 2024"
})
});

const data = await response.json();
console.log(data);
Show more
Get Debit Status
cURL
JavaScript
Python
PHP
Copy
curl -X GET "https://sandbox.monnify.com/api/v1/direct-debit/mandate/debit-status?paymentReference=DEBIT_REF_001" \
-H "Authorization: Bearer <accessToken>"
Get Mandates
The Get Mandates endpoint lets you query all mandates created under your merchant account. You can filter results by date range, customer email, scheme code, or mandate status, making it easy to reconcile mandates and track their lifecycle at scale.

Parameter	Required	Description
startDate	Yes	Start of the date range. Format: YYYY-MM-DDTHH:MM:SS. The range must not exceed 90 days.
endDate	Yes	End of the date range. Format: YYYY-MM-DDTHH:MM:SS. The range must not exceed 90 days.
customerEmail	No	Filter results to mandates belonging to a specific customer email.
schemeCode	No	Filter by direct debit scheme code (e.g. ADD).
mandateStatus	No	Filter by mandate status. Accepted values: PENDING, ACTIVE, FAILED, CANCELLED, EXPIRED.
page	No	Zero-based page number. Defaults to 0.
limit	No	Number of records per page. Defaults to 20.
cURL
JavaScript
Python
PHP
Copy
const response = await fetch("https://sandbox.monnify.com/api/v1/direct-debit/mandate/mandates?startDate=2026-01-01T00:00:00&endDate=2026-03-31T23:59:59&page=0&limit=20"", {
  method: "GET",
  headers: {
    "Authorization": "Bearer <accessToken>"
  }
});

const data = await response.json();
console.log(data);
response.json
Copy
{
"requestSuccessful": true,
"responseMessage": "success",
"responseCode": "0",
"responseBody": {
  "content": [
    {
      "mandateCode": "MTDD|01HY8WMN8JYKDRJC67QPQVS1N0",
      "externalMandateReference": "unique_ref_001",
      "startDate": "2026-01-15T09:00:00.000+0000",
      "endDate": "2026-12-31T23:59:59.000+0000",
      "mandateStatus": "ACTIVATED",
      "mandateAmount": 50000,
      "autoRenew": false,
      "customerPhoneNumber": "2348012345678",
      "customerEmailAddress": "customer@example.com",
      "customerAddress": "12 Example Street, Lagos",
      "customerName": "Jane Doe",
      "customerAccountName": "JANE DOE",
      "customerAccountNumber": "0012345678",
      "customerAccountBankCode": "044",
      "mandateDescription": "Monthly Subscription",
      "debitAmount": null,
      "authorizationMessage": null,
      "authorizationLink": null
    }
  ],
  "totalElements": 42,
  "totalPages": 3,
  "pageNumber": 0,
  "pageSize": 20,
  "first": true,
  "last": false,
  "numberOfElements": 20,
  "empty": false
}
}
Show more
Supported Banks
The table below lists all banks supported for direct debit mandates and their default activation mode. Use the filter to view banks by activation type.

Search by bank name or code...
All26
Auth Link6
Bank Transfer20
26 banks found

Bank Name	Bank Code	Default Activation Mode
Access Bank Plc	044	
Auth Link
Citibank Nigeria Ltd	023	
Bank Transfer
Ecobank Nigeria Plc	050	
Bank Transfer
Fidelity Bank Plc	070	
Auth Link
First Bank Nigeria Ltd	011	
Bank Transfer
First City Monument Bank Plc	214	
Bank Transfer
Globus Bank Ltd	00103	
Bank Transfer
Guaranty Trust Bank Plc	058	
Auth Link
Keystone Bank Ltd	082	
Auth Link
Moniepoint Microfinance Bank	50515	
Auth Link
Optimus Bank	107	
Bank Transfer
Parallex Bank Ltd	104	
Bank Transfer
Polaris Bank Plc	076	
Auth Link
Premium Trust Bank	105	
Bank Transfer
Providus Bank Ltd	101	
Bank Transfer
Signature Bank Ltd	106	
Bank Transfer
Stanbic IBTC Bank Plc	221	
Bank Transfer
Standard Chartered Bank Nigeria Ltd	068	
Bank Transfer
Sterling Bank Plc	232	
Bank Transfer
SunTrust Bank Nigeria Ltd	100	
Bank Transfer
Titan Trust Bank Ltd	102	
Bank Transfer
Union Bank of Nigeria Plc	032	
Bank Transfer
United Bank For Africa Plc	033	
Bank Transfer
Unity Bank Plc	215	
Bank Transfer
Wema Bank Plc	035	
Bank Transfer
Zenith Bank Plc	057	
Bank Transfer
Error Messages
Error Message	Meaning	Action
Mandate start date cannot be in the past

The mandate start date was set earlier than the current time.

Adjust the date to a future time.

Unable to validate account information

Account name validation failed for the supplied account number and bank code.

Confirm that the account number and bank code are correct.

Unable to find bank against customerAccountBankCode

The bank code supplied does not exist on Monnify.

Reconfirm that the bank code is for a CBN-approved bank.

Mandate with provided mandate reference already exists.

The mandateReference has been previously used.

Retry with a unique mandateReference.
