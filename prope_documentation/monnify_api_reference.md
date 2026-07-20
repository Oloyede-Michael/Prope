Monnify API Reference
Get Started
The Monnify API provides extensive access to the features available on our dashboard, enabling you to leverage them for your own application.

Create a Monnify account on https://www.monnify.com
Obtain the required API keys on the developers section of the dashboard
Please note that the Monnify API is secured through Basic Authentication or OAuth (Bearer Tokens).
Public Test Credentials
- APIKEY: MK_TEST_GC3B8XG2XX
- Secret Key: A663NRZA544DDPEM7KDN7Z8HRV6YXD8S
- Contract Code: 5867418298

Server
Server:
https://sandbox.monnify.com
Sandbox


Authentication
Selected Auth Type:BasicAuth
Username
:
Required
Password
:
********
Show Password
Client Libraries
Node.js undici
Authentication ​Copy link
This collection enables merchants to authenticate their keys for requests to the Monnify API

AuthenticationOperations
post
/api/v1/auth/login
Generate Access Token​Copy link

Auth Required
This endpoint generates an access token that would be used to authenticate all other endpoints.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
Basic authentication using apiKey and secretKey passed as a base64 string. 'Basic base64(apiKey:secretKey)'.

Responses

200 - OK
Successful response
application/json

401 - Invalid Token
Failed Response due to Invalid Token
application/json

401 - No header
Failed Response due to no header provided
application/json
Request Example forpost/api/v1/auth/login
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/auth/login', {
  method: 'POST',
  headers: {
    Authorization: 'Basic TUtfVEVTVF9HQzNCOFhHMlhYOkE2NjNOUlpBNTQ0RERQRU03S0RON1o4SFJWNllYRDhT'
  }
})


Test Request
(post /api/v1/auth/login)
Transactions ​Copy link
This collection enables merchants to initiate and confirm status of transactions on the Monnify

TransactionsOperations
post
/api/v1/merchant/transactions/init-transaction
post
/api/v1/merchant/bank-transfer/init-payment
post
/api/v1/merchant/cards/charge
post
/api/v1/merchant/cards/otp/authorize
post
/api/v1/sdk/cards/secure-3d/authorize
get
/api/v1/transactions/search
get
/api/v2/transactions/{transactionReference}
get
/api/v2/merchant/transactions/query
Initialize Transaction​Copy link

Auth Required
This endpoint initialises the transaction that would be used for card payments and dynamic transfers. In sandbox mode, You can use our Web Similator to complete this transaction via the Bank transfer option.

NOTE: It is important to confirm that the values returned by this endpoint (and the SDK) corresponds to the values you provided in the request payload, as bad actors can intercept the request and make alterations to values such as the transaction amount.
Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
·InitializeTransactionRequest
application/json
amountCopy link to amount
Type:number
Format:float
required
Example
The amount (in Naira) to be paid. Minimum is N20.

contractCodeCopy link to contractCode
Type:string
required
Example
The merchant contract code.

currencyCodeCopy link to currencyCode
Type:string
required
Example
The currency code. Defaults to NGN but USD available for enabled merchant.

customerEmailCopy link to customerEmail
Type:string
required
Example
The customer email.

paymentReferenceCopy link to paymentReference
Type:string
required
Example
A unique string of characters that identifies each transaction.

customerNameCopy link to customerName
Type:string
Example
The name of the customer.

incomeSplitConfigCopy link to incomeSplitConfig
Type:array object[]
A way to split payments among subAccounts.

Show Child Attributesfor incomeSplitConfig
metadataCopy link to metadata
Type:object
Example
Extra information from customers.

Show Child Attributesfor metadata
paymentDescriptionCopy link to paymentDescription
Type:string
Example
A description of the payment.

paymentMethodsCopy link to paymentMethods
Type:array string[]
enum
Example
The method of payment collection. Defaults to all available methods.

values
CARD
ACCOUNT_TRANSFER
USSD
PHONE_NUMBER
redirectUrlCopy link to redirectUrl
Type:string
Example
A URL to redirect to after payment completion.

Responses

200
Successful response
application/json

400
Bad request.
application/json

422
Unprocessable Entity.
application/json

500
Internal Server Error.
application/json
Request Example forpost/api/v1/merchant/transactions/init-transaction
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/merchant/transactions/init-transaction', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 100,
    customerEmail: 'stephen@ikhane.com',
    paymentReference: '123-03hjsj--1klsa--dkad',
    paymentDescription: 'Trial transaction',
    currencyCode: 'NGN',
    contractCode: '5867418298',
    redirectUrl: 'https://my-merchants-page.com/transaction/confirm',
    paymentMethods: ['CARD', 'ACCOUNT_TRANSFER', 'USSD', 'PHONE_NUMBER'],
    metadata: {
      name: 'John Doe',
      age: 45
    },
    incomeSplitConfig: [
      {
        subAccountCode: 'MFY_SUB_319452883228',
        feePercentage: 10.5,
        splitAmount: 20,
        feeBearer: true
      }
    ]
  })
})


Test Request
(post /api/v1/merchant/transactions/init-transaction)
Status:200
Status:400
Status:422
Status:500
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
    "checkoutUrl": "https://sandbox.sdk.monnify.com/checkout/MNFY|20190915200044|000090",
    "incomeSplitConfig": [
      {
        "subAccountCode": "MFY_SUB_319452883968",
        "splitAmount": 20,
        "feePercentage": 10.5,
        "feeBearer": true,
        "splitPercentage": 0
      }
    ]
  }
}

Successful response

Pay With Bank Transfer​Copy link

Auth Required
This endpoint generates a dynamic account number and its associated bank for one time payment.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
·InitBankTransferPaymentRequest
application/json
transactionReferenceCopy link to transactionReference
Type:string
required
Example
A unique Monnify reference from the initialize transaction endpoint.

bankCodeCopy link to bankCode
Type:string
Example
A valid bank code for USSD string generation (optional).

Responses

200
Successful response
application/json

400
Bad request.
application/json

422
Unprocessable Entity.
application/json

500
Internal Server Error.
application/json
Request Example forpost/api/v1/merchant/bank-transfer/init-payment
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/merchant/bank-transfer/init-payment', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    transactionReference: 'MNFY|20190915200044|000090',
    bankCode: '50515'
  })
})


Test Request
(post /api/v1/merchant/bank-transfer/init-payment)
Status:200
Status:400
Status:422
Status:500
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "accountNumber": "6795542937",
    "accountName": "jiggyjiggy-Trial transaction",
    "bankName": "Moniepoint Microfinance Bank",
    "bankCode": "50515",
    "accountDurationSeconds": 2400,
    "ussdPayment": "*901*100.00*6795542937#",
    "requestTime": "2026-06-30T09:31:46.814667464",
    "expiresOn": "2026-06-30T10:11:46",
    "transactionReference": "MNFY|20190915200044|000090",
    "paymentReference": "9070fdf1-e28f-4836-82e6-c9a5b042e4d1",
    "amount": 100,
    "fee": 0,
    "totalPayable": 100,
    "collectionChannel": "API_NOTIFICATION",
    "productInformation": null
  }
}

Successful response

Charge a Card​Copy link

Auth Required
Initiate a charge on a card.

Test Card Info:
Card Without OTP: 4111111111111111 10/2025 1234 123
Card With OTP: 5060995994247093 12/2025 1234 123
Card With 3DS: 4000000000000002 12/2025 1234 123
Failed Card: 4111111111111110 10/2025 1234 123
Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
·ChargeRequest
required
application/json
cardCopy link to card
Type:object · CardInfo
required
Show Child Attributesfor card
deviceInformationCopy link to deviceInformation
Type:object · DeviceInformation
required
Show Child Attributesfor deviceInformation
transactionReferenceCopy link to transactionReference
Type:string
required
Example
The transaction reference.

collectionChannelCopy link to collectionChannel
Type:string
Example
The collection channel (optional, defaults to API_NOTIFICATION).

Responses

200
Successful charge
application/json

400
Bad Request (e.g., invalid card number)
application/json
Request Example forpost/api/v1/merchant/cards/charge
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/merchant/cards/charge', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    transactionReference: 'MNFY|99|20220725125351|000271',
    collectionChannel: 'API_NOTIFICATION',
    card: {
      number: '4111111111111111',
      expiryMonth: '12',
      expiryYear: '2025',
      pin: '1234',
      cvv: '123'
    },
    deviceInformation: {
      httpBrowserLanguage: 'en-US',
      httpBrowserJavaEnabled: false,
      httpBrowserJavaScriptEnabled: true,
      httpBrowserColorDepth: 24,
      httpBrowserScreenHeight: 1203,
      httpBrowserScreenWidth: 2138,
      httpBrowserTimeDifference: '',
      userAgentBrowserValue: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'
    }
  })
})


Test Request
(post /api/v1/merchant/cards/charge)
Status:200
Status:400
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "status": "SUCCESS",
    "message": "Transaction Successful",
    "transactionReference": "MNFY|99|20220725110839|000256",
    "paymentReference": "1234567890-abcdef",
    "authorizedAmount": 100
  }
}


Successful
Successful charge

Authorize OTP​Copy link

Auth Required
The endpoint authorizes an OTP to complete a charge on a card.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
·AuthorizeOTPRequest
application/json
tokenCopy link to token
Type:string
required
Example
The OTP sent to the user's device.

tokenIdCopy link to tokenId
Type:string
required
Example
The token ID from the charge card endpoint response.

transactionReferenceCopy link to transactionReference
Type:string
required
Example
The transaction reference from the initialize transaction endpoint.

collectionChannelCopy link to collectionChannel
Type:string
Example
The channel of collection (defaults to "API_NOTIFICATION").

Responses

200
Successful response
application/json

400
Bad request.
application/json

422
Unprocessable Entity.
application/json

500
Internal Server Error.
application/json
Request Example forpost/api/v1/merchant/cards/otp/authorize
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/merchant/cards/otp/authorize', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    transactionReference: 'MNFY|67|20220725114827|000285',
    collectionChannel: 'API_NOTIFICATION',
    tokenId: '100.00-b66bef0aa8e660863c4e1177a08fefba',
    token: '123456'
  })
})


Test Request
(post /api/v1/merchant/cards/otp/authorize)
Status:200
Status:400
Status:422
Status:500
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "paymentStatus": "SUCCESSFUL",
    "paymentDescription": "Payment Successful",
    "transactionReference": "MNFY|67|20220725114827|000285",
    "paymentReference": "1568577644707",
    "amountPaid": 100,
    "currencyPaid": "NGN"
  }
}

Successful response

Authorize 3DS Card​Copy link

Auth Required
This endpoint authorizes charge on a card that uses 3DS Secure Authentication.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
·Authorize3DSCardRequest
application/json
apiKeyCopy link to apiKey
Type:string
required
Example
The merchant API key.

cardCopy link to card
Type:object
required
Show Child Attributesfor card
transactionReferenceCopy link to transactionReference
Type:string
required
Example
The transaction reference.

collectionChannelCopy link to collectionChannel
Type:string
Example
The collection channel.

Responses

200
Successful response
application/json

400
Bad request.
application/json

422
Unprocessable Entity.
application/json

500
Internal Server Error.
application/json
Request Example forpost/api/v1/sdk/cards/secure-3d/authorize
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/sdk/cards/secure-3d/authorize', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    transactionReference: 'MNFY|99|20220725125351|000271',
    apiKey: 'MK_TEST_JRQAZRFD2W',
    collectionChannel: 'API_NOTIFICATION',
    card: {
      number: '4000000000000',
      expiryMonth: 12,
      expiryYear: 2025,
      cvv: 123,
      pin: 1234
    }
  })
})


Test Request
(post /api/v1/sdk/cards/secure-3d/authorize)
Status:200
Status:400
Status:422
Status:500
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "paymentStatus": "SUCCESSFUL",
    "paymentDescription": "Payment Successful",
    "transactionReference": "MNFY|99|20220725125351|000271",
    "paymentReference": "1568577644707",
    "amountPaid": 100,
    "currencyPaid": "NGN"
  }
}

Successful response

Get All Transactions​Copy link
This endpoint returns a list of transactions carried out on your integration.

Query Parameters
pageCopy link to page
Type:string
Example
The number of page of to be retrieved. It starts from 0.

sizeCopy link to size
Type:string
Example
The Size of transactions to be returned per page.

paymentReferenceCopy link to paymentReference
Type:string
Example
Unique reference generated by merchant for each transaction.

transactionReferenceCopy link to transactionReference
Type:string
Example
Unique transaction reference generated by Monnify for each transaction

fromAmountCopy link to fromAmount
Type:string
Example
A number indicating minimum amount for the transactions to be returned

toAmountCopy link to toAmount
Type:string
Example
A number indicating maximum amount for the transactions to be returned

amountCopy link to amount
Type:string
Example
A number indicating exact amount for the transactions to be returned

customerNameCopy link to customerName
Type:string
Example
Name of customer for the transactions to be returned

customerEmailCopy link to customerEmail
Type:string
Example
Email of customer for the transactions be returned.

paymentStatusCopy link to paymentStatus
Type:string
Example
Transaction status for transactions to be returned

fromCopy link to from
Type:integer
Format:int64
Example
Start time for transactions to be retrieved, as a Unix timestamp in milliseconds.

toCopy link to to
Type:integer
Format:int64
Example
End time for transactions to be retrieved, as a Unix timestamp in milliseconds.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful response
application/json

400
Bad request.
application/json

500
Internal Server Error.
application/json
Request Example forget/api/v1/transactions/search
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/transactions/search', {
  headers: {
    Authorization: 'Bearer <token>'
  }
})


Test Request
(get /api/v1/transactions/search)
Status:200
Status:400
Status:500
{
  "content": [
    {
      "transactionReference": "MNFY|123|20231027|000001",
      "paymentReference": "merchant-ref-123",
      "amount": 50,
      "customerName": "John Doe",
      "customerEmail": "john.doe@example.com",
      "paymentStatus": "SUCCESSFUL",
      "transactionDate": "2023-10-27T10:00:00Z"
    }
  ],
  "pageable": {
    "sort": {
      "empty": true,
      "sorted": false,
      "unsorted": true
    },
    "offset": 0,
    "pageSize": 10,
    "pageNumber": 0,
    "unpaged": false,
    "paged": true
  },
  "last": true,
  "totalPages": 1,
  "totalElements": 1,
  "size": 10,
  "number": 0,
  "sort": {
    "empty": true,
    "sorted": false,
    "unsorted": true
  },
  "first": true,
  "numberOfElements": 1,
  "empty": true
}

Successful response

Get Transaction Status​Copy link
This endpoint returns the status of a transaction

Path Parameters
transactionReferenceCopy link to transactionReference
Type:string
required
Example
URL encoding of the transaction reference.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful response
application/json

404
Transaction not found.
application/json

500
Internal Server Error.
application/json
Request Example forget/api/v2/transactions/{transactionReference}
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v2/transactions/MNFY%7C67%7C20220725111957%7C000283', {
  headers: {
    Authorization: 'Bearer <token>'
  }
})


Test Request
(get /api/v2/transactions/{transactionReference})
Status:200
Status:404
Status:500
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "transactionReference": "MNFY|67|20220725111957|000283",
    "paymentReference": "12-3---03--1kls0a--dkad",
    "amountPaid": "100.00",
    "totalPayable": "100.00",
    "settlementAmount": "90.00",
    "paidOn": "25/07/2022 11:20:20 AM",
    "paymentStatus": "PAID",
    "paymentDescription": "Trial transaction",
    "currency": "NGN",
    "paymentMethod": "CARD",
    "product": {
      "type": "WEB_SDK",
      "reference": "12-3---03--1kls0a--dkad"
    },
    "cardDetails": {
      "cardType": "Sandbox Card Scheme",
      "last4": "1111",
      "expMonth": "10",
      "expYear": "22",
      "bin": "411111",
      "bankCode": null,
      "bankName": null,
      "reusable": false,
      "countryCode": null,
      "cardToken": null,
      "supportsTokenization": false,
      "maskedPan": "411111******1111"
    },
    "accountDetails": null,
    "accountPayments": [],
    "customer": {
      "email": "stephen@ikhane.com",
      "name": "Stephen Ikhane"
    },
    "metaData": {}
  }
}

Successful response

Get Transaction Status By Reference​Copy link

Auth Required
This endpoint returns the status of a transaction using either the Monnify transaction reference or the merchant's payment reference as query parameters.

Query Parameters
transactionReferenceCopy link to transactionReference
Type:string
Example
The Monnify generated reference URL encoded.

paymentReferenceCopy link to paymentReference
Type:string
Example
The merchant generated reference URL encoded.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful response
application/json

404
Transaction not found.
application/json

500
Internal Server Error.
application/json
Request Example forget/api/v2/merchant/transactions/query
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v2/merchant/transactions/query', {
  headers: {
    Authorization: 'Bearer <token>'
  }
})


Test Request
(get /api/v2/merchant/transactions/query)
Status:200
Status:404
Status:500
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "transactionReference": "MNFY|67|20220725111957|000283",
    "paymentReference": "12-3---03--1kls0a--dkad",
    "amountPaid": "100.00",
    "totalPayable": "100.00",
    "settlementAmount": "90.00",
    "paidOn": "25/07/2022 11:20:20 AM",
    "paymentStatus": "PAID",
    "paymentDescription": "Trial transaction",
    "currency": "NGN",
    "paymentMethod": "CARD",
    "product": {
      "type": "WEB_SDK",
      "reference": "12-3---03--1kls0a--dkad"
    },
    "cardDetails": {
      "cardType": "Sandbox Card Scheme",
      "last4": "1111",
      "expMonth": "10",
      "expYear": "22",
      "bin": "411111",
      "bankCode": null,
      "bankName": null,
      "reusable": false,
      "countryCode": null,
      "cardToken": null,
      "supportsTokenization": false,
      "maskedPan": "411111******1111"
    },
    "accountDetails": null,
    "accountPayments": [],
    "customer": {
      "email": "stephen@ikhane.com",
      "name": "Stephen Ikhane"
    },
    "metaData": {}
  }
}

Successful response

Transfers (Disbursement) ​Copy link
This collection enables merchants to perform all disbursement operations on the Monnify API

Please note that the usage of the TRANSFER API is only available for merchants who meet the regulatory requirements for it. Kindly contact sales@monnify.com to get access to this feature.
Transfers (Disbursement)Operations
post
/api/v2/disbursements/single
post
/api/v2/disbursements/batch
post
/api/v2/disbursements/single/validate-otp
post
/api/v2/disbursements/batch/validate-otp
post
/api/v2/disbursements/single/resend-otp
post
/api/v2/disbursements/batch/resend-otp
get
/api/v2/disbursements/single/summary
get
/api/v2/disbursements/single/transactions
get
/api/v2/disbursements/bulk/transactions
get
/api/v2/disbursements/bulk/batchreference--12934/transactions
get
/api/v2/disbursements/batch/summary
get
/api/v2/disbursements/search-transactions
get
/api/v2/disbursements/wallet-balance
Initiate Transfer (Single)​Copy link

Auth Required
This endpoint initiats a transfer to specified bank account.

Please note that the usage of the Transfer feature is only available for merchants who meet the regulatory requirements for it. Kindly contact sales@monnify.com to get access to this feature.
Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
·InitiateTransferRequest
required
application/json
amountCopy link to amount
Type:number
Format:float
required
Example
Amount to disburse.

currencyCopy link to currency
Type:string
required
Example
The currency of the transaction being initialized - "NGN".

destinationAccountNameCopy link to destinationAccountName
Type:string
required
Example
The beneficiary account name.

destinationAccountNumberCopy link to destinationAccountNumber
Type:string
required
Example
The beneficiary account number.

destinationBankCodeCopy link to destinationBankCode
Type:string
required
Example
The destination bank code representing the destination bank.

narrationCopy link to narration
Type:string
required
Example
The Narration for the transactions being processed.

referenceCopy link to reference
Type:string
required
Example
The unique reference for the transaction.

sourceAccountNumberCopy link to sourceAccountNumber
Type:string
required
Example
Your Wallet Account Number.

asyncCopy link to async
Type:boolean
Example
Indicates if the transfer should be asynchronous.

senderInfoCopy link to senderInfo
Type:object
Show Child Attributesfor senderInfo
Responses

400
Bad request.
application/json

500
Internal Server Error.
application/json

200 (With OTP)
Successful response for merchants with OTP requirement (default)
application/json

200 (Without OTP)
Successful response for merchants who have disabled their OTP.
application/json
Request Example forpost/api/v2/disbursements/single
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v2/disbursements/single', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 200,
    reference: 'reference---1290034',
    narration: '911 Transaction',
    destinationBankCode: '50515',
    destinationAccountNumber: '2085886393',
    destinationAccountName: 'Ciroma Chukwuka Adekunle',
    currency: 'NGN',
    sourceAccountNumber: '3934178936',
    senderInfo: {
      sourceAccountNumber: '3934178936',
      sourceAccountName: 'Marvelous Benji',
      sourceAccountBvn: '1234567890',
      senderBankCode: '50515'
    },
    async: false
  })
})


Test Request
(post /api/v2/disbursements/single)
Status:400
Status:500
{
  "requestSuccessful": false,
  "responseCode": 99,
  "responseMessage": "I failed because of this reason"
}

Bad request.

Initiate Transfer (Bulk)​Copy link

Auth Required
This endpoint allows merchant to initiate Bulk Transfer transactions.

Please note that the usage of the Transfer feature is only available for merchants who meet the regulatory requirements for it. Kindly contact sales@monnify.com to get access to this feature.
Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
·InitiateBulkTransferRequest
required
application/json
batchReferenceCopy link to batchReference
Type:string
required
Example
A unique reference identifying the batch disbursement.

narrationCopy link to narration
Type:string
required
Example
A narration for the disbursement.

notificationIntervalCopy link to notificationInterval
Type:integer
required
Example
This determines how often Monnify should notify the merchant of its progress when processing a batch transfer.

onValidationFailureCopy link to onValidationFailure
Type:string
enum
required
Example
Decision to be taken if any of the disbursement batches fail. Either BREAK or CONTINUE.

values
CONTINUE
BREAK
sourceAccountNumberCopy link to sourceAccountNumber
Type:string
required
Example
The merchant WALLET ACCOUNT NUMBER.

titleCopy link to title
Type:string
required
Example
The title of the batch disbursement.

transactionListCopy link to transactionList
Type:array object[]
required
A list of transactions to be processed.

Show Child Attributesfor transactionList
senderInfoCopy link to senderInfo
Type:object
Show Child Attributesfor senderInfo
Responses

200
Successful response
application/json

400
Bad request.
application/json

500
Internal Server Error.
application/json
Request Example forpost/api/v2/disbursements/batch
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v2/disbursements/batch', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Game of Batches',
    batchReference: 'batchreference--12934',
    narration: '911 Transaction',
    sourceAccountNumber: '9624937372',
    onValidationFailure: 'CONTINUE',
    notificationInterval: 10,
    transactionList: [
      {
        amount: 1300,
        reference: 'Final-Refere-nce-1a',
        narration: '911 Transaction',
        destinationBankCode: '50515',
        destinationAccountNumber: '0111946768',
        destinationAccountName: 'Ciroma Chukwuka Adekunle',
        currency: 'NGN'
      }
    ],
    senderInfo: {
      sourceAccountNumber: '3934178936',
      sourceAccountName: 'Marvelous Benji',
      sourceAccountBvn: '1234567890',
      senderBankCode: '50515'
    }
  })
})


Test Request
(post /api/v2/disbursements/batch)
Status:200
Status:400
Status:500
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "totalAmount": 2100,
    "totalFee": 105,
    "batchReference": "batchreference--12934",
    "batchStatus": "AWAITING_PROCESSING",
    "totalTransactionsCount": 3,
    "dateCreated": "2022-07-31T14:41:19.588+0000"
  }
}

Successful response

Authorize Single Transfers​Copy link

Auth Required
This endpoint authorizes single transfers on your integration.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
·AuthorizeTransferRequest
required
application/json
authorizationCodeCopy link to authorizationCode
Type:string
required
Example
The OTP sent to merchant's email.

referenceCopy link to reference
Type:string
required
Example
The unique reference for the transfer.

Responses

200
Successful response
application/json

400
Bad request.
application/json

500
Internal Server Error.
application/json
Request Example forpost/api/v2/disbursements/single/validate-otp
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v2/disbursements/single/validate-otp', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    reference: 'refere--n00ce---1290034',
    authorizationCode: '491763'
  })
})


Test Request
(post /api/v2/disbursements/single/validate-otp)
Status:200
Status:400
Status:500
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "amount": 200,
    "reference": "referen00ce---1290034",
    "status": "SUCCESS",
    "dateCreated": "2022-07-31T14:31:33.759+0000",
    "totalFee": 35,
    "destinationAccountName": "Ciroma Chukwuka Adekunle",
    "destinationBankName": "Moniepoint Microfinance bank",
    "destinationAccountNumber": "2085886393",
    "destinationBankCode": "50515",
    "senderInfo": {
      "sourceAccountNumber": "3934178936",
      "sourceAccountName": "Marvelous Benji",
      "senderBankCode": "50515"
    }
  }
}

Successful response

Authorize Bulk Transfers​Copy link

Auth Required
This endpoint authorizes bulk transfers on your integration.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
·AuthorizeTransferRequest
required
application/json
authorizationCodeCopy link to authorizationCode
Type:string
required
Example
The OTP sent to merchant's email.

referenceCopy link to reference
Type:string
required
Example
The unique reference for the transfer.

Responses

200
Successful response
application/json

400
Bad request.
application/json

500
Internal Server Error.
application/json
Request Example forpost/api/v2/disbursements/batch/validate-otp
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v2/disbursements/batch/validate-otp', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    reference: 'refere--n00ce---1290034',
    authorizationCode: '491763'
  })
})


Test Request
(post /api/v2/disbursements/batch/validate-otp)
Status:200
Status:400
Status:500
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "totalAmount": 2100,
    "totalFee": 105,
    "batchReference": "batchreference--12934",
    "batchStatus": "AWAITING_PROCESSING",
    "totalTransactionsCount": 3,
    "dateCreated": "2022-07-31T14:41:19.588+0000"
  }
}

Successful response

Resend OTP (Single)​Copy link

Auth Required
This endpoint generates a new OTP in the event that there were challenges with the former OTP sent.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
·ResendOTPRequest
required
application/json
referenceCopy link to reference
Type:string
required
Example
The reference used for the transfer.

Responses

200
Successful response
application/json

400
Bad request.
application/json

500
Internal Server Error.
application/json
Request Example forpost/api/v2/disbursements/single/resend-otp
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v2/disbursements/single/resend-otp', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    reference: 'refere--n00ce---1290--034'
  })
})


Test Request
(post /api/v2/disbursements/single/resend-otp)
Status:200
Status:400
Status:500
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "message": "Authorization code will be processed and sent to predefined email addresses(s)"
  }
}

Successful response

Resend OTP (Bulk)​Copy link

Auth Required
This endpoint generates a new OTP in the event that there were challenges with the former OTP sent.

Headers
AuthorizationCopy link to Authorization
Type:string
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
·ResendOTPRequestBulk
required
application/json
batchReferenceCopy link to batchReference
Type:string
required
Example
The batch reference used for the transfer.

Responses

200
Successful response
application/json

400
Bad request.
application/json

500
Internal Server Error.
application/json
Request Example forpost/api/v2/disbursements/batch/resend-otp
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v2/disbursements/batch/resend-otp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    batchReference: 'batch-refere--n00ce---1290--034'
  })
})


Test Request
(post /api/v2/disbursements/batch/resend-otp)
Status:200
Status:400
Status:500
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "message": "Authorization code will be processed and sent to predefined email addresses(s)"
  }
}

Successful response

Single Transfer Status​Copy link
This endpoint verifies the status of a single transfer on your integration.
Transaction States:

PENDING
SUCCESS
FAILED
REVERSED
PENDING_AUTHORIZATION
OTP_EMAIL_DISPATCH_FAILED
Query Parameters
referenceCopy link to reference
Type:string
required
Example
The reference used for the transfer

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful response
application/json

400
Bad request.
application/json

404
Transfer not found.
application/json

500
Internal Server Error.
application/json
Request Example forget/api/v2/disbursements/single/summary
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v2/disbursements/single/summary?reference=String', {
  headers: {
    Authorization: 'Bearer <token>'
  }
})


Test Request
(get /api/v2/disbursements/single/summary)
Status:200
Status:400
Status:404
Status:500
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "amount": 200,
    "reference": "referen00ce---1290034",
    "narration": "911 Transaction",
    "currency": "NGN",
    "fee": 35,
    "twoFaEnabled": "false",
    "status": "SUCCESS",
    "transactionDescription": "Transaction successful",
    "transactionReference": "MFDS20220731033133AABQGN",
    "createdOn": "2022-07-31T14:31:34.000+0000",
    "sourceAccountNumber": "3934178936",
    "destinationAccountNumber": "2085886393",
    "destinationAccountName": "Marvelous Benji",
    "destinationBankCode": "50515",
    "destinationBankName": "Moniepoint Microfinance bank"
  }
}

Successful response

List All Single Transfers​Copy link
This endpoint returns the list of all single transfers made on your integration.

Query Parameters
pageSizeCopy link to pageSize
Type:integer
Example
The number of transfer records to return

pageNoCopy link to pageNo
Type:integer
Example
A number specifying what page of transfers to be retrieved

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful response
application/json

400
Bad request.
application/json

500
Internal Server Error.
application/json
Request Example forget/api/v2/disbursements/single/transactions
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v2/disbursements/single/transactions', {
  headers: {
    Authorization: 'Bearer <token>'
  }
})


Test Request
(get /api/v2/disbursements/single/transactions)
Status:200
Status:400
Status:500
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "content": [
      {
        "amount": 10,
        "reference": "hjkdd0odood0pl",
        "narration": "911 Transaction",
        "currency": "NGN",
        "fee": 35,
        "twoFaEnabled": false,
        "status": "SUCCESS",
        "transactionDescription": "Transaction successful",
        "transactionReference": "MFDS20220516012053AAAYYN",
        "createdOn": "2022-05-16T12:20:54.000+0000",
        "sourceAccountNumber": "3934178936",
        "destinationAccountNumber": "0111946768",
        "destinationAccountName": "MEKILIUWA SMART CHINONSO",
        "destinationBankCode": "50515",
        "destinationBankName": "Moniepoint  Microfinance Bank"
      }
    ],
    "pageable": {
      "sort": {
        "sorted": true,
        "unsorted": false,
        "empty": false
      },
      "pageSize": 20,
      "pageNumber": 1,
      "offset": 20,
      "paged": true,
      "unpaged": false
    },
    "last": false,
    "totalPages": 3,
    "totalElements": 54,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    },
    "first": false,
    "numberOfElements": 20,
    "size": 20,
    "number": 1,
    "empty": false
  }
}

Successful response

List All Bulk Transfers​Copy link
This endpoint returns the list of all bulk transfers made on your integration.

Query Parameters
pageSizeCopy link to pageSize
Type:integer
Example
The number of transfer records to return

pageNoCopy link to pageNo
Type:integer
Example
A number specifying what page of transfers to be retrieved

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful response
application/json
Request Example forget/api/v2/disbursements/bulk/transactions
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v2/disbursements/bulk/transactions', {
  headers: {
    Authorization: 'Bearer <token>'
  }
})


Test Request
(get /api/v2/disbursements/bulk/transactions)
Status:200
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "content": [
      {
        "totalAmount": 45,
        "totalFee": 80,
        "batchReference": "Batch-1596666798811",
        "batchStatus": "COMPLETED",
        "totalTransactionsCount": 4,
        "dateCreated": "2020-08-05T22:33:21.000+0000"
      }
    ],
    "pageable": {
      "sort": {
        "sorted": true,
        "unsorted": false,
        "empty": false
      },
      "pageSize": 3,
      "pageNumber": 0,
      "offset": 0,
      "unpaged": false,
      "paged": true
    },
    "totalPages": 3,
    "last": false,
    "totalElements": 7,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    },
    "first": true,
    "numberOfElements": 3,
    "size": 3,
    "number": 0,
    "empty": false
  }
}

Successful response

Bulk Transfer Status​Copy link
This endpoint verifies the status of a bulk transfer on your integration.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful response
application/json

400
Bad request.
application/json

404
Batch not found.
application/json

500
Internal Server Error.
application/json
Request Example forget/api/v2/disbursements/bulk/batchreference--12934/transactions
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v2/disbursements/bulk/batchreference--12934/transactions', {
  headers: {
    Authorization: 'Bearer <token>'
  }
})


Test Request
(get /api/v2/disbursements/bulk/batchreference--12934/transactions)
Status:200
Status:400
Status:404
Status:500
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "content": [
      {
        "amount": 230,
        "reference": "Final-Refer-ence-3a",
        "narration": "911 Transaction",
        "currency": "NGN",
        "fee": 35,
        "twoFaEnabled": false,
        "status": "SUCCESS",
        "transactionDescription": "Transaction successful",
        "transactionReference": "MFDS20220731034121AABQGQ",
        "createdOn": "2022-07-31T14:41:21.000+0000",
        "sourceAccountNumber": "3934178936",
        "destinationAccountNumber": "0111946768",
        "destinationAccountName": "MEKILIUWA SMART CHINONSO",
        "destinationBankCode": "50515",
        "destinationBankName": "Moniepoint  Microfinance Bank"
      }
    ],
    "pageable": {
      "sort": {
        "sorted": true,
        "unsorted": false,
        "empty": false
      },
      "pageSize": 10,
      "pageNumber": 0,
      "offset": 0,
      "paged": true,
      "unpaged": false
    },
    "last": true,
    "totalPages": 1,
    "totalElements": 3,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    },
    "first": true,
    "numberOfElements": 3,
    "size": 10,
    "number": 0,
    "empty": false
  }
}

Successful response

Bulk Batch Summary​Copy link

Auth Required
This endpoint provides the summary of a completed batch transaction.

Query Parameters
referenceCopy link to reference
Type:string
required
Example
A unique reference identifying the batch disbursement.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful response
application/json

400
Bad request.
application/json

404
Batch not found.
application/json

500
Internal Server Error.
application/json
Request Example forget/api/v2/disbursements/batch/summary
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v2/disbursements/batch/summary?reference=batchreference--12934', {
  headers: {
    Authorization: 'Bearer <token>'
  }
})


Test Request
(get /api/v2/disbursements/batch/summary)
Status:200
Status:400
Status:404
Status:500
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "title": "Game of Batches",
    "totalAmount": 210000,
    "totalFee": 105,
    "batchReference": "batchreference--12934",
    "totalTransactionsCount": 30,
    "initiator": "Monnify",
    "failedCount": 10,
    "successfulCount": 20,
    "pendingCount": 0,
    "pendingAmount": 0,
    "failedAmount": 47600,
    "successfulAmount": 162400,
    "batchStatus": "COMPLETED",
    "dateCreated": "2026-07-19T14:52:48.283Z"
  }
}

Successful response

Search Disbursement Transactions​Copy link
This endpoint returns the list of all disbursement transactions.

Query Parameters
sourceAccountNumberCopy link to sourceAccountNumber
Type:string
required
Example
The merchant's WALLET ACCOUNT NUMBER, this parameter is mandatory.

pageSizeCopy link to pageSize
Type:integer
Example
The number of records to return.

pageNoCopy link to pageNo
Type:integer
Example
The current page from the total.

startDateCopy link to startDate
Type:string
Format:unix-timestamp
Example
A timestamp value specifying the date to start filtering disbursement transactions by the createdAt field.

endDateCopy link to endDate
Type:string
Format:unix-timestamp
Example
A timestamp value specifying the date to stop filtering disbursement transactions by the createdAt field.

amountFromCopy link to amountFrom
Type:string
Example
A number specifying the lower bound for filtering the transactions by the amount field.

amountToCopy link to amountTo
Type:string
Example
A number specifying the upper bound for filtering the transactions by the amount field.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful response
application/json

400
Bad request.
application/json

500
Internal Server Error.
application/json
Request Example forget/api/v2/disbursements/search-transactions
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v2/disbursements/search-transactions?sourceAccountNumber=3934178936', {
  headers: {
    Authorization: 'Bearer <token>'
  }
})


Test Request
(get /api/v2/disbursements/search-transactions)
Status:200
Status:400
Status:500
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "content": [
      {
        "amount": 200,
        "reference": "refere--n00ce---1290--034",
        "narration": "911 Transaction",
        "currency": "NGN",
        "fee": 35,
        "twoFaEnabled": true,
        "status": "EXPIRED",
        "transactionDescription": "Transaction has expired",
        "transactionReference": "MFDS20220731044951AABQGV",
        "createdOn": "2022-07-31T15:49:51.000+0000",
        "sourceAccountNumber": "3934178936",
        "destinationAccountNumber": "2085886393",
        "destinationAccountName": "Marvelous Benji",
        "destinationBankCode": "50515",
        "destinationBankName": "Moniepoint Microfinance bank"
      }
    ],
    "pageable": {
      "sort": {
        "sorted": true,
        "unsorted": false,
        "empty": false
      },
      "pageSize": 10,
      "pageNumber": 0,
      "offset": 0,
      "paged": true,
      "unpaged": false
    },
    "last": false,
    "totalPages": 6,
    "totalElements": 54,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    },
    "first": true,
    "numberOfElements": 10,
    "size": 10,
    "number": 0,
    "empty": false
  }
}

Successful response

Get Wallet Balance​Copy link
This endpoint returns the available balance in your monnify wallet.

Query Parameters
accountNumberCopy link to accountNumber
Type:string
required
Example
The merchant's WALLET ACCOUNT NUMBER, this parameter is mandatory.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful response
application/json

400
Bad request.
application/json

500
Internal Server Error
schema
Request Example forget/api/v2/disbursements/wallet-balance
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v2/disbursements/wallet-balance?accountNumber=3934178936', {
  headers: {
    Authorization: 'Bearer <token>'
  }
})


Test Request
(get /api/v2/disbursements/wallet-balance)
Status:200
Status:400
Status:500
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "availableBalance": "4919798101.36",
    "ledgerBalance": "4919798101.36"
  }
}

Successful response

Customer Reserved Account ​Copy link
This collection enables merchants to create and manage reserved accounts for their customers

Customer Reserved AccountOperations
post
/api/v2/bank-transfer/reserved-accounts
post
/api/v1/bank-transfer/reserved-accounts
get
/api/v2/bank-transfer/reserved-accounts/{accountReference}
put
/api/v1/bank-transfer/reserved-accounts/add-linked-accounts/{accountReference}
put
/api/v1/bank-transfer/reserved-accounts/update-customer-bvn/{reservedAccountReference}
put
/api/v1/bank-transfer/reserved-accounts/update-payment-source-filter/{accountReference}
put
/api/v1/bank-transfer/reserved-accounts/update-income-split-config/{accountReference}
delete
/api/v1/bank-transfer/reserved-accounts/reference/{accountReference}
get
/api/v1/bank-transfer/reserved-accounts/transactions
put
/api/v1/bank-transfer/reserved-accounts/{accountReference}/kyc-info
Create Reserved Account(General)​Copy link

Auth Required
This endpoint allows the creation of dedicated virtual accounts for your customers.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
·CreateReservedAccountRequest
required
application/json
accountNameCopy link to accountName
Type:string
required
Example
The name to be displayed during name enquiry

accountReferenceCopy link to accountReference
Type:string
required
Example
A unique reference generated by the merchant

bvnCopy link to bvn
Type:string
required
Example
The customer's BVN to be associated with the account

contractCodeCopy link to contractCode
Type:string
required
Example
The merchant contract code

currencyCodeCopy link to currencyCode
Type:string
required
Example
The currency code of the account

customerEmailCopy link to customerEmail
Type:string
required
Example
The email of the customer

customerNameCopy link to customerName
Type:string
required
Example
The name of the customer

getAllAvailableBanksCopy link to getAllAvailableBanks
Type:boolean
required
Example
Indicates if all available banks should be returned

preferredBanksCopy link to preferredBanks
Type:array string[]
required
Example
The preferred banks for the customer. Currently defaults to 50515 (Moniepoint Microfinance Bank)

allowedPaymentSourcesCopy link to allowedPaymentSources
Type:object · AllowedPaymentSources
The allowed payment sources for the account

Show Child Attributesfor allowedPaymentSources
incomeSplitConfigCopy link to incomeSplitConfig
Type:array object[] · IncomeSplitConfig[]
The income split configuration for the account

Show Child Attributesfor incomeSplitConfig
ninCopy link to nin
Type:string
Example
The customer's NIN to be associated with the account

Show additional propertiesfor Request Body
Responses

200
Successful response
application/json

400
Bad request
application/json

422
Unprocessable Entity
application/json

500
Internal Server Error
application/json
Request Example forpost/api/v2/bank-transfer/reserved-accounts
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v2/bank-transfer/reserved-accounts', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    accountReference: 'abc1niui23',
    accountName: 'Test Reserved Account',
    currencyCode: 'NGN',
    contractCode: '5867418298',
    customerEmail: 'test@tester.com',
    customerName: 'John Doe',
    bvn: '21212121212',
    getAllAvailableBanks: 'true',
    preferredBanks: ['50515'],
    incomeSplitConfig: [
      {
        subAccountCode: 'MFY_SUB_319452883228',
        feePercentage: 10.5,
        splitPercentage: 20,
        feeBearer: true,
        splitAmount: 100
      }
    ],
    restrictPaymentSource: true,
    allowedPaymentSources: {
      bvns: ['21212121212', '20202020202'],
      bankAccounts: [
        {
          accountNumber: '0068687503',
          bankCode: '232'
        }
      ],
      accountNames: ['SAMUEL DAMILARE OGUNNAIKE']
    },
    nin: '12345678901'
  })
})


Test Request
(post /api/v2/bank-transfer/reserved-accounts)
Status:200
Status:400
Status:422
Status:500
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "contractCode": "5867418298",
    "accountReference": "abc1niui23",
    "accountName": "MARVELOUS BENJI",
    "currencyCode": "NGN",
    "customerEmail": "test@tester.com",
    "customerName": "John Doe",
    "accounts": [
      {
        "bankCode": "50515",
        "bankName": "Moniepoint Microfinance Bank",
        "accountNumber": "6839490147",
        "accountName": "MARVELOUS BENJI"
      }
    ],
    "collectionChannel": "RESERVED_ACCOUNT",
    "reservationReference": "96ZPXECUD84UQTB00931",
    "reservedAccountType": "GENERAL",
    "status": "ACTIVE",
    "createdOn": "2024-11-25 07:35:17.566",
    "incomeSplitConfig": [
      {
        "subAccountCode": "MFY_SUB_399360552679",
        "feePercentage": 10.5,
        "feeBearer": true,
        "splitPercentage": 20,
        "reservedAccountConfigCode": "N3NT809NUK"
      }
    ],
    "bvn": "21212121212",
    "restrictPaymentSource": false,
    "allowedPaymentSources": {
      "bvns": [
        "21212121212",
        "20202020202"
      ],
      "bankAccounts": [
        {
          "accountNumber": "0068687503",
          "bankCode": "232"
        }
      ],
      "accountNames": [
        "SAMUEL DAMILARE OGUNNAIKE"
      ]
    }
  }
}

Successful response

Create Reserved Account(Invoice)​Copy link

Auth Required
This endpoint allows the creation of an invoiced reserved account.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
·CreateInvoiceReservedAccountRequest
required
application/json
accountNameCopy link to accountName
Type:string
required
Example
The name to be displayed during name enquiry.

accountReferenceCopy link to accountReference
Type:string
required
Example
A unique reference generated by the merchant.

bvnCopy link to bvn
Type:string
required
Example
The customer's BVN.

contractCodeCopy link to contractCode
Type:string
required
Example
The merchant's contract code.

currencyCodeCopy link to currencyCode
Type:string
required
Example
The currency allowed, 'NGN'.

customerEmailCopy link to customerEmail
Type:string
required
Example
Email address of the customer.

customerNameCopy link to customerName
Type:string
required
Example
Full name of the customer.

reservedAccountTypeCopy link to reservedAccountType
Type:string
required
Example
This should be 'INVOICE'.

ninCopy link to nin
Type:string
Example
The customer's NIN.

Responses

200
Successful response
application/json

400
Bad request
application/json

422
Unprocessable Entity
application/json
Request Example forpost/api/v1/bank-transfer/reserved-accounts
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/bank-transfer/reserved-accounts', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    contractCode: '5867418298',
    accountName: 'Jane Doe',
    currencyCode: 'NGN',
    accountReference: 'javnedoe12233',
    customerEmail: 'janedoe@gmail.com',
    customerName: 'Jane Doe',
    bvn: '21212121212',
    nin: '11212121212',
    reservedAccountType: 'INVOICE'
  })
})


Test Request
(post /api/v1/bank-transfer/reserved-accounts)
Status:200
Status:400
Status:422
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "contractCode": "5867418298",
    "accountReference": "javnedoe12233",
    "accountName": "MARVELOUS BENJI",
    "currencyCode": "NGN",
    "customerEmail": "janedoe@gmail.com",
    "customerName": "Jane Doe",
    "accountNumber": "6842287969",
    "bankName": "Moniepoint Microfinance Bank",
    "bankCode": "50515",
    "collectionChannel": "RESERVED_ACCOUNT",
    "reservationReference": "LE7ZT2NR510PAM0WTYTK",
    "reservedAccountType": "INVOICE",
    "status": "INACTIVE",
    "createdOn": "2024-11-27T04:35:50.054Z",
    "incomeSplitConfig": [],
    "bvn": "21212121212",
    "restrictPaymentSource": false
  }
}

Successful response

Get Reserved Account Details​Copy link
This endpoint returns details of an account reserved for a customer

Path Parameters
accountReferenceCopy link to accountReference
Type:string
required
The unique reference used in creating the reserved account.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful response
application/json

404
Reserved account not found
application/json
Request Example forget/api/v2/bank-transfer/reserved-accounts/{accountReference}
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v2/bank-transfer/reserved-accounts/{accountReference}', {
  headers: {
    Authorization: 'Bearer <token>'
  }
})


Test Request
(get /api/v2/bank-transfer/reserved-accounts/{accountReference})
Status:200
Status:404
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "contractCode": "5867418298",
    "accountReference": "abc1niui23",
    "accountName": "MARVELOUS BENJI",
    "currencyCode": "NGN",
    "customerEmail": "test@tester.com",
    "customerName": "John Doe",
    "accounts": [
      {
        "bankCode": "50515",
        "bankName": "Moniepoint Microfinance Bank",
        "accountNumber": "6839490147",
        "accountName": "MARVELOUS BENJI"
      }
    ],
    "collectionChannel": "RESERVED_ACCOUNT",
    "reservationReference": "96ZPXECUD84UQTB00931",
    "reservedAccountType": "GENERAL",
    "status": "ACTIVE",
    "createdOn": "2024-11-25 07:35:17.566",
    "incomeSplitConfig": [
      {
        "subAccountCode": "MFY_SUB_399360552679",
        "feePercentage": 10.5,
        "feeBearer": true,
        "splitPercentage": 20,
        "reservedAccountConfigCode": "N3NT809NUK"
      }
    ],
    "bvn": "21212121212",
    "restrictPaymentSource": false,
    "allowedPaymentSources": {
      "bvns": [
        "21212121212",
        "20202020202"
      ],
      "bankAccounts": [
        {
          "accountNumber": "0068687503",
          "bankCode": "232"
        }
      ],
      "accountNames": [
        "SAMUEL DAMILARE OGUNNAIKE"
      ]
    }
  }
}

Successful response

Add Linked Accounts​Copy link
This endpoint links accounts with another partner bank to an existing customer.

Path Parameters
accountReferenceCopy link to accountReference
Type:string
required
The unique reference used in creating the reserved account.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
·AddLinkedAccountsRequest
required
application/json
getAllAvailableBanksCopy link to getAllAvailableBanks
Type:boolean
required
Example
Determine if all necessary banks should be used.

preferredBanksCopy link to preferredBanks
Type:array string[]
Example
Contains bank codes of desired banks.

Responses

200
Successful response
application/json

404
Reserved account not found
application/json
Request Example forput/api/v1/bank-transfer/reserved-accounts/add-linked-accounts/{accountReference}
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/bank-transfer/reserved-accounts/add-linked-accounts/{accountReference}', {
  method: 'PUT',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    getAllAvailableBanks: false,
    preferredBanks: ['50515']
  })
})


Test Request
(put /api/v1/bank-transfer/reserved-accounts/add-linked-accounts/{accountReference})
Status:200
Status:404
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "contractCode": "5867418298",
    "accountReference": "abc1niui23",
    "accountName": "MARVELOUS BENJI",
    "currencyCode": "NGN",
    "customerEmail": "test@tester.com",
    "customerName": "John Doe",
    "accounts": [
      {
        "bankCode": "50515",
        "bankName": "Moniepoint Microfinance Bank",
        "accountNumber": "6839490147",
        "accountName": "MARVELOUS BENJI"
      }
    ],
    "collectionChannel": "RESERVED_ACCOUNT",
    "reservationReference": "96ZPXECUD84UQTB00931",
    "reservedAccountType": "GENERAL",
    "status": "ACTIVE",
    "createdOn": "2024-11-25T07:35:18.000Z",
    "bvn": "21212121212",
    "restrictPaymentSource": false
  }
}

Successful response

Update BVN for a Reserve Account​Copy link
This endpoint updates BVN of customers reserved account

Path Parameters
reservedAccountReferenceCopy link to reservedAccountReference
Type:string
required
The unique reference used in creating the reserved account.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
·UpdateBvnRequest
required
application/json
bvnCopy link to bvn
Type:string
required
Example
The BVN used in creating the reserved account.

Responses

200
Successful response
application/json

400
Invalid BVN provided
application/json
Request Example forput/api/v1/bank-transfer/reserved-accounts/update-customer-bvn/{reservedAccountReference}
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/bank-transfer/reserved-accounts/update-customer-bvn/{reservedAccountReference}', {
  method: 'PUT',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    bvn: '21212121212'
  })
})


Test Request
(put /api/v1/bank-transfer/reserved-accounts/update-customer-bvn/{reservedAccountReference})
Status:200
Status:400
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "contractCode": "5867418298",
    "accountReference": "abc1023",
    "currencyCode": "NGN",
    "customerEmail": "test@tester.com",
    "customerName": "John Doe",
    "accountNumber": "6842287615",
    "bankName": "Moniepoint Microfinance Bank",
    "bankCode": "50515",
    "collectionChannel": "RESERVED_ACCOUNT",
    "reservationReference": "06MCYE1991Q1X9102093",
    "reservedAccountType": "GENERAL",
    "status": "ACTIVE",
    "createdOn": "2024-11-27T04:32:08.000Z",
    "incomeSplitConfig": [
      {
        "subAccountCode": "MFY_SUB_319452883228",
        "feePercentage": 10.5,
        "splitPercentage": 20,
        "feeBearer": true,
        "splitAmount": 100
      }
    ],
    "bvn": "21212121212",
    "restrictPaymentSource": true
  }
}

Successful response

Allowed Payment Source(s)​Copy link

Auth Required
This endpoint manages accounts that can fund a reserved account using either BVNs, Account Name or Account Number.

Path Parameters
accountReferenceCopy link to accountReference
Type:string
required
The unique reference used in creating the reserved account.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
·AllowedPaymentSourcesRequest
required
application/json
allowedPaymentSourcesCopy link to allowedPaymentSources
Type:object
required
Show Child Attributesfor allowedPaymentSources
restrictPaymentSourceCopy link to restrictPaymentSource
Type:boolean
required
Example
This field activates or deactivates restricting of payment sources for a reserved account.

Responses

200
Successful response
application/json

400
Invalid request
application/json
Request Example forput/api/v1/bank-transfer/reserved-accounts/update-payment-source-filter/{accountReference}
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/bank-transfer/reserved-accounts/update-payment-source-filter/{accountReference}', {
  method: 'PUT',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    restrictPaymentSource: true,
    allowedPaymentSources: {
      bvns: ['21212121212', '20202020202'],
      bankAccounts: [
        {
          accountNumber: '0068687503',
          bankCode: '232'
        }
      ],
      accountNames: ['DAMILARE OGUNNAIKE SAMUEL']
    }
  })
})


Test Request
(put /api/v1/bank-transfer/reserved-accounts/update-payment-source-filter/{accountReference})
Status:200
Status:400
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "restrictPaymentSource": true,
    "allowedPaymentSources": {
      "bvns": [
        "21212121212",
        "20202020202"
      ],
      "bankAccounts": [
        {
          "accountNumber": "0068687503",
          "bankCode": "232"
        }
      ],
      "accountNames": "DAMILARE OGUNNAIKE SAMUEL"
    }
  }
}

Successful response

Updating Split Config for Reserved Account​Copy link
This endpoint updates the split config of a customer reserved account.

Path Parameters
accountReferenceCopy link to accountReference
Type:string
required
Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
required
application/json
Type:array object[] · UpdateSplitConfigRequestItem[]
Show Child Attributes
Responses

200
Successful response
application/json

400
Bad request
application/json
Request Example forput/api/v1/bank-transfer/reserved-accounts/update-income-split-config/{accountReference}
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/bank-transfer/reserved-accounts/update-income-split-config/{accountReference}', {
  method: 'PUT',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    '0': {
      subAccountCode: 'MFY_SUB_762212281785',
      feeBearer: false,
      feePercentage: 10.5,
      splitPercentage: 30
    }
  })
})


Test Request
(put /api/v1/bank-transfer/reserved-accounts/update-income-split-config/{accountReference})
Status:200
Status:400
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "code": "HRCNXDSAYX",
    "reservedAccountCode": "HRCNXDSAYX",
    "feeBearer": "MERCHANT_ONLY",
    "configDetails": [
      {
        "subAccountCode": "MFY_SUB_762212281785",
        "feePercentage": 10.5,
        "feeBearer": false,
        "splitPercentage": 0,
        "reservedAccountConfigCode": "HRCNXDSAYX"
      }
    ]
  }
}

Successful response

Deallocating a reserved account​Copy link
This endpoint allows you to deallocate/delete already created a reserved account.

Path Parameters
accountReferenceCopy link to accountReference
Type:string
required
Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful response
application/json

400
Bad request
application/json
Request Example fordelete/api/v1/bank-transfer/reserved-accounts/reference/{accountReference}
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/bank-transfer/reserved-accounts/reference/{accountReference}', {
  method: 'DELETE',
  headers: {
    Authorization: 'Bearer <token>'
  }
})


Test Request
(delete /api/v1/bank-transfer/reserved-accounts/reference/{accountReference})
Status:200
Status:400
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "contractCode": "5867418298",
    "accountReference": "abc1niui23",
    "accountName": "MARVELOUS BENJI",
    "currencyCode": "NGN",
    "customerEmail": "test@tester.com",
    "customerName": "John Doe",
    "accountNumber": "6839490147",
    "bankName": "Moniepoint Microfinance Bank",
    "bankCode": "50515",
    "collectionChannel": "RESERVED_ACCOUNT",
    "reservationReference": "96ZPXECUD84UQTB00931",
    "reservedAccountType": "GENERAL",
    "status": "ACTIVE",
    "createdOn": "2024-11-25T07:35:18.000Z",
    "bvn": "21212121212",
    "restrictPaymentSource": false
  }
}

Successful response

Get Reserved Account Transactions​Copy link
This endpoint returns the list of all transactions done on a reserved account.

Query Parameters
accountReferenceCopy link to accountReference
Type:string
required
The unique reference used in creating the reserved account.

pageCopy link to page
Type:integer
The page of data you want returned by Monnify (Starts from 0).

sizeCopy link to size
Type:integer
The number of records you want returned in a page.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful response
application/json

400
Bad request
application/json
Request Example forget/api/v1/bank-transfer/reserved-accounts/transactions
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/bank-transfer/reserved-accounts/transactions?accountReference=', {
  headers: {
    Authorization: 'Bearer <token>'
  }
})


Test Request
(get /api/v1/bank-transfer/reserved-accounts/transactions)
Status:200
Status:400
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "content": [
      {
        "customerDTO": {
          "email": "test@tester.com",
          "name": "Test Reserved Account",
          "merchantCode": "ALJKHDALASD"
        },
        "providerAmount": 0.21,
        "paymentMethod": "ACCOUNT_TRANSFER",
        "createdOn": "2019-07-24T14:12:27.000+0000",
        "amount": 100,
        "flagged": false,
        "providerCode": "98271",
        "fee": 0.79,
        "currencyCode": "NGN",
        "completedOn": "2019-07-24T14:12:28.000+0000",
        "paymentDescription": "Test Reserved Account",
        "paymentStatus": "PAID",
        "transactionReference": "MNFY|20190724141227|003374",
        "paymentReference": "MNFY|20190724141227|003374",
        "merchantCode": "ALJKHDALASD",
        "merchantName": "Test Limited",
        "payableAmount": 100,
        "amountPaid": 100,
        "completed": true,
        "settleInstantly": true
      }
    ],
    "pageable": {
      "sort": {
        "sorted": true,
        "unsorted": false,
        "empty": false
      },
      "pageSize": 10,
      "pageNumber": 0,
      "offset": 0,
      "unpaged": false,
      "paged": true
    },
    "totalElements": 2,
    "totalPages": 1,
    "last": true,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    },
    "first": true,
    "numberOfElements": 2,
    "size": 10,
    "number": 0,
    "empty": false
  }
}

Successful response

Update KYC Info​Copy link

Auth Required
This endpoint links customers' BVN/NIN to their respective reserved accounts.

Path Parameters
accountReferenceCopy link to accountReference
Type:string
required
The account reference linked to the reserved account being updated.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
·UpdateKycInfoRequest
required
application/json
bvnCopy link to bvn
Type:string
required
Example
The customer's BVN.

ninCopy link to nin
Type:string
required
Example
The customer's NIN.

Responses

200
Successful response
application/json

400
Bad request
application/json
Request Example forput/api/v1/bank-transfer/reserved-accounts/{accountReference}/kyc-info
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/bank-transfer/reserved-accounts/{accountReference}/kyc-info', {
  method: 'PUT',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    bvn: '22222222222',
    nin: '121212121212'
  })
})


Test Request
(put /api/v1/bank-transfer/reserved-accounts/{accountReference}/kyc-info)
Status:200
Status:400
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "accountReference": "a1fe1c73c6f985eb43e8ef35ec0d6a398698cdea",
    "accountName": "MARVELOUS BENJI",
    "customerEmail": "test@tester.com",
    "customerName": "mao  Zhang",
    "bvn": "21212121212"
  }
}

Successful response

Direct Debit ​Copy link
This collection enables merchants to create and manage direct debit mandates for their customers

Direct DebitOperations
post
/api/v1/direct-debit/mandate/create
get
/api/v1/direct-debit/mandate/
post
/api/v1/direct-debit/mandate/debit
get
/api/v1/direct-debit/mandate/debit-status
patch
/api/v1/direct-debit/mandate/cancel-mandate/{mandateCode}
get
/api/v1/direct-debit/mandates
Create Mandate​Copy link
This endpoint initiates the creation of a mandate.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
·CreateMandateRequest
required
application/json
contractCodeCopy link to contractCode
Type:string
required
Example
The merchant’s Monnify contract code

customerAccountBankCodeCopy link to customerAccountBankCode
Type:string
required
Example
The bank code of the customer’s bank account

customerAccountNumberCopy link to customerAccountNumber
Type:string
required
Example
The customer's bank account number

customerAddressCopy link to customerAddress
Type:string
required
Example
The customer's home address

customerEmailAddressCopy link to customerEmailAddress
Type:string
Format:email
required
Example
The customer's email address

customerNameCopy link to customerName
Type:string
required
Example
The customer's name

customerPhoneNumberCopy link to customerPhoneNumber
Type:string
required
Example
The customer's phone number

mandateDescriptionCopy link to mandateDescription
Type:string
required
Example
The description of the payment the mandate is associated to

mandateEndDateCopy link to mandateEndDate
Type:string
Format:date-time
required
Example
The end date for the mandate. The date format is: YYYY-MM-DDTHH:MM:SS

mandateReferenceCopy link to mandateReference
Type:string
required
Example
Merchants generated reference to identify a mandate

mandateStartDateCopy link to mandateStartDate
Type:string
Format:date-time
required
Example
The start date for the mandate. The date format is: YYYY-MM-DDTHH:MM:SS

autoRenewCopy link to autoRenew
Type:boolean
Example
This informs Monnify wether the mandate will be renewed once it reaches end date.

Show additional propertiesfor Request Body
Responses

200
Successful mandate creation
application/json

404
Not Found
application/json
Request Example forpost/api/v1/direct-debit/mandate/create
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/direct-debit/mandate/create', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    contractCode: '4934121686',
    mandateReference: 'unique_ref3_02s600972',
    mandateAmount: 50000,
    autoRenew: false,
    customerCancellation: true,
    customerName: 'Ankit Kushwaha',
    customerPhoneNumber: '1234567890',
    customerEmailAddress: 'test@moniepoint.com',
    customerAddress: '123 Example Street, City, Country',
    customerAccountNumber: '0051762787',
    customerAccountBankCode: '044',
    mandateDescription: 'Subscription Fee',
    mandateStartDate: '2024-12-19T10:15:30',
    mandateEndDate: '2025-12-19T10:15:30',
    redirectUrl: 'https://my-merchants-page.com/direct-debit/success',
    debitAmount: null
  })
})


Test Request
(post /api/v1/direct-debit/mandate/create)
Status:200
Status:404
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "responseMessage": "Your request for creating a mandate is submitted. An authorization instruction will be sent to the customer email.",
    "mandateReference": "unique_ref3_02s600972",
    "mandateCode": "MTDD|01HY8W3FBKHTFBZP9DQ9KNHR1G",
    "mandateStatus": "INITIATED",
    "redirectUrl": "https://my-merchants-page.com/transaction/confirm"
  }
}

Successful mandate creation

Get Mandate Status​Copy link
This endpoint retrieves the details of a created mandate.

Query Parameters
mandateReferencesCopy link to mandateReferences
Type:string
required
Merchants generated reference to identify a mandate.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful mandate retrieval
application/json

404
Not Found
application/json
Request Example forget/api/v1/direct-debit/mandate/
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/direct-debit/mandate/?mandateReferences=', {
  headers: {
    Authorization: 'Bearer <token>'
  }
})


Test Request
(get /api/v1/direct-debit/mandate/)
Status:200
Status:404
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": [
    {
      "mandateCode": "MTDD|01HY8WMN8JYKDRJC67QPQVS1N0",
      "mandateReference": "unique_ref3_02gs600s972",
      "startDate": "2024-05-19T09:15:30.000+0000",
      "endDate": "2024-09-22T09:15:30.000+0000",
      "mandateStatus": "ACTIVE",
      "mandateAmount": 50000,
      "contractCode": "4934121686",
      "autoRenew": false,
      "customerPhoneNumber": "1234567890",
      "customerEmailAddress": "test@moniepoint.com",
      "customerAddress": "123 Example Street, City, Country",
      "customerName": "Ankit Kushwaha",
      "customerAccountName": "Ankit Kushwaha",
      "customerAccountNumber": "0051762787",
      "customerAccountBankCode": "998",
      "mandateDescription": "Subscription Fee",
      "debitAmount": null,
      "authorizationMessage": "Request Ankit Kushwaha to kindly proceed with a token payment of N50.00 into account number 9020025928 with Fidelity Bank. This transfer must be initiated from the account in the mandate request. This payment will trigger the authentication of customer and will authorize this  mandate.",
      "authorizationLink": "https://paylink.monnify.com/mandate-auth/MTDD%7C01K7M2Y6BN6QZ9KF0WEEG7YPVP?accountNumber=9020025928&bankName=Fidelity+Bank&customerAccountName=ANKIT++KUSHWAHA&amount=50.00"
    }
  ]
}

Successful mandate retrieval

Debit Mandate​Copy link
This endpoint debits an active mandate.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
·DebitMandateRequest
required
application/json
customerEmailCopy link to customerEmail
Type:string
Format:email
required
Example
The customer's email address

debitAmountCopy link to debitAmount
Type:number
Format:float
required
Example
Payment amount to be debited from a single debit transaction

mandateCodeCopy link to mandateCode
Type:string
required
Example
Monnify generated mandate identifier

narrationCopy link to narration
Type:string
required
Example
Description of the single debit

paymentReferenceCopy link to paymentReference
Type:string
required
Example
Merchants unique reference to identify a single direct debit payment

incomeSplitConfigCopy link to incomeSplitConfig
Type:array object[]
A way to split payments among subAccounts.

Show Child Attributesfor incomeSplitConfig
Responses

200
Successful mandate debit
application/json

404
Not Found
application/json
Request Example forpost/api/v1/direct-debit/mandate/debit
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/direct-debit/mandate/debit', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    paymentReference: 'PR1234567991002',
    mandateCode: 'MTDD|01HY8WMN8JYKDRJC67QPQVS1N0',
    debitAmount: 1000,
    narration: 'Payment for Services',
    customerEmail: 'ahsan.saleem@gmail.com',
    incomeSplitConfig: [
      {
        subAccountCode: 'MFY_SUB_319452883228',
        feePercentage: 10.5,
        splitAmount: 20,
        splitPercentage: 20,
        feeBearer: true
      }
    ]
  })
})


Test Request
(post /api/v1/direct-debit/mandate/debit)
Status:200
Status:404
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "transactionStatus": "PENDING",
    "responseMessage": "Debit mandate request accepted for processing",
    "transactionReference": "MNFY|20240519180055|000001",
    "paymentReference": "PR1234567991002",
    "debitAmount": 1000,
    "narration": "Payment for Services",
    "mandateCode": "MTDD|01HY8WMN8JYKDRJC67QPQVS1N0"
  }
}

Successful mandate debit

Get Debit Status​Copy link

Auth Required
This endpoint gets the status of a debited mandate.

Query Parameters
paymentReferenceCopy link to paymentReference
Type:string
required
The payment reference used in debiting a mandate.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful debit status retrieval
application/json

404
Not Found
application/json
Request Example forget/api/v1/direct-debit/mandate/debit-status
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/direct-debit/mandate/debit-status?paymentReference=', {
  headers: {
    Authorization: 'Bearer <token>'
  }
})


Test Request
(get /api/v1/direct-debit/mandate/debit-status)
Status:200
Status:404
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "transactionStatus": "PAID",
    "responseMessage": {},
    "transactionReference": "MNFY|20240519180055|000001",
    "paymentReference": "PR1234567991002",
    "debitAmount": 1000,
    "narration": "Payment for Services",
    "mandateCode": "MTDD|01HY8WMN8JYKDRJC67QPQVS1N0"
  }
}

Successful debit status retrieval

Update Mandate (Cancel Mandate)​Copy link
This endpoint cancels/deactivates a mandate.

Path Parameters
mandateCodeCopy link to mandateCode
Type:string
required
Monnify generated mandate identifier.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful mandate cancellation
application/json

404
Not Found
application/json
Request Example forpatch/api/v1/direct-debit/mandate/cancel-mandate/{mandateCode}
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/direct-debit/mandate/cancel-mandate/{mandateCode}', {
  method: 'PATCH',
  headers: {
    Authorization: 'Bearer <token>'
  }
})


Test Request
(patch /api/v1/direct-debit/mandate/cancel-mandate/{mandateCode})
Status:200
Status:404
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "responseMessage": "Mandate has been requested to be cancelled.",
    "mandateReference": "unique_ref3_02s600972",
    "mandateCode": "MTDD|01HY8W3FBKHTFBZP9DQ9KNHR1G",
    "mandateStatus": "ACTIVE"
  }
}

Successful mandate cancellation

Get Mandates​Copy link
This endpoint retrieves a paginated list of mandates created or initiated by the merchant. startDate and endDate are required and the date range must not exceed 90 days. Use the optional filters to narrow results by customer email, scheme code, or mandate status.

Query Parameters
startDateCopy link to startDate
Type:string
Format:date-time
required
Example
Start of the date range (inclusive). Format: YYYY-MM-DDTHH:MM:SS. The range between startDate and endDate must not exceed 90 days.

endDateCopy link to endDate
Type:string
Format:date-time
required
Example
End of the date range (inclusive). Format: YYYY-MM-DDTHH:MM:SS. The range between startDate and endDate must not exceed 90 days.

customerEmailCopy link to customerEmail
Type:string
Format:email
Example
Filter results to mandates belonging to this customer email.

schemeCodeCopy link to schemeCode
Type:string
Example
Filter results by direct debit scheme code (e.g. ADD).

mandateStatusCopy link to mandateStatus
Type:string
enum
Example
Filter results by the current status of the mandate.

values
PENDING
ACTIVE
FAILED
CANCELLED
EXPIRED
pageCopy link to page
Type:integer
Default
Example
Zero-based page number.

limitCopy link to limit
Type:integer
Default
Example
Number of records to return per page.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful mandate list retrieval
application/json

400
Bad Request
application/json

401
Unauthorized
application/json
Request Example forget/api/v1/direct-debit/mandates
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/direct-debit/mandates?startDate=2026-01-01T00%3A00%3A00&endDate=2026-03-31T23%3A59%3A59', {
  headers: {
    Authorization: 'Bearer <token>'
  }
})


Test Request
(get /api/v1/direct-debit/mandates)
Status:200
Status:400
Status:401
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "content": [
      {
        "mandateCode": "MTDD|01HY8WMN8JYKDRJC67QPQVS1N0",
        "mandateReference": "unique_ref3_02gs600s972",
        "startDate": "2024-05-19T09:15:30.000+0000",
        "endDate": "2024-09-22T09:15:30.000+0000",
        "mandateStatus": "ACTIVE",
        "mandateAmount": 50000,
        "contractCode": "4934121686",
        "autoRenew": false,
        "customerPhoneNumber": "1234567890",
        "customerEmailAddress": "test@moniepoint.com",
        "customerAddress": "123 Example Street, City, Country",
        "customerName": "Ankit Kushwaha",
        "customerAccountName": "Ankit Kushwaha",
        "customerAccountNumber": "0051762787",
        "customerAccountBankCode": "998",
        "mandateDescription": "Subscription Fee",
        "debitAmount": null,
        "authorizationMessage": "Request Ankit Kushwaha to kindly proceed with a token payment of N50.00 into account number 9020025928 with Fidelity Bank. This transfer must be initiated from the account in the mandate request. This payment will trigger the authentication of customer and will authorize this  mandate.",
        "authorizationLink": "https://paylink.monnify.com/mandate-auth/MTDD%7C01K7M2Y6BN6QZ9KF0WEEG7YPVP?accountNumber=9020025928&bankName=Fidelity+Bank&customerAccountName=ANKIT++KUSHWAHA&amount=50.00"
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

Successful mandate list retrieval

Invoice ​Copy link
This collection enables merchants to create and manage invoices for their customers

InvoiceOperations
post
/api/v1/invoice/create
get
/api/v1/invoice/{invoiceReference}/details
get
/api/v1/invoice/all
delete
/api/v1/invoice/{invoiceReference}/cancel
Create an Invoice​Copy link
This endpoint enables merchant to create an invoice.

NOTE: When creating a Static Invoice, the accountReference key is compulsory. Excluding it would create a Dynamic Invoice.
Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
·CreateInvoiceRequest
required
application/json
amountCopy link to amount
Type:number
Format:float
required
Example
The amount to be paid by the customer

contractCodeCopy link to contractCode
Type:string
required
Example
Merchant's contract code

currencyCodeCopy link to currencyCode
Type:string
required
Example
The currency of the transaction being initialized. "NGN"

customerEmailCopy link to customerEmail
Type:string
required
Example
Email of the customer

customerNameCopy link to customerName
Type:string
required
Example
Full name of the customer

descriptionCopy link to description
Type:string
required
Example
Description of the transaction. Will be used as the account name for bank transfer payments

expiryDateCopy link to expiryDate
Type:string
Format:date-time
required
Example
The expiry date for the invoice. The format is: YYYY-MM-DD HH:MM:SS

invoiceReferenceCopy link to invoiceReference
Type:string
required
Example
Merchant's Unique reference for the invoice

accountReferenceCopy link to accountReference
Type:string
Your unique reference used to identify this reserved account. Required if a reserved account is to be attached

incomeSplitConfigCopy link to incomeSplitConfig
Type:array object[] · IncomeSplitConfig[]
This field contains specifications on how payments to this reserve account should be split.

Show Child Attributesfor incomeSplitConfig
paymentMethodsCopy link to paymentMethods
Type:array string[]
Example
redirectUrlCopy link to redirectUrl
Type:string
Example
A URL which customer will be redirected to when payment is successfully completed

Responses

200
Successful response
application/json

422
Unprocessable Entity
application/json
Request Example forpost/api/v1/invoice/create
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/invoice/create', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 999,
    currencyCode: 'NGN',
    invoiceReference: '183891300182',
    customerName: 'John Snow',
    customerEmail: 'johnsnow@gmail.com',
    contractCode: '7059707855',
    description: 'test invoice',
    expiryDate: '2022-10-30 12:00:00',
    paymentMethods: null,
    incomeSplitConfig: [
      {
        subAccountCode: 'MFY_SUB_319452883228',
        feePercentage: 10.5,
        splitPercentage: 20,
        feeBearer: true,
        splitAmount: 100
      }
    ],
    redirectUrl: 'http://app.monnify.com',
    accountReference: ''
  })
})


Test Request
(post /api/v1/invoice/create)
Status:200
Status:422
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "amount": 999,
    "invoiceReference": "183891300182",
    "invoiceStatus": "PENDING",
    "description": "test invoice",
    "contractCode": "7059707855",
    "customerEmail": "johnsnow@gmail.com",
    "customerName": "John Snow",
    "expiryDate": "2022-10-30 12:00:00",
    "createdBy": "MK_TEST_JRQAZRFD2W",
    "createdOn": "2022-07-31 12:14:14",
    "checkoutUrl": "https://sandbox.sdk.monnify.com/checkout/MNFY|99|20220731121414|000867",
    "accountNumber": "5000588061",
    "accountName": "tes",
    "bankName": "Moniepoint Microfinance bank",
    "bankCode": "50515",
    "redirectUrl": "http://app.monnify.com",
    "transactionReference": "MNFY|99|20220731121414|000867",
    "incomeSplitConfig": [
      {
        "subAccountCode": "MFY_SUB_322165393053",
        "splitAmount": 20,
        "feePercentage": 10.5,
        "feeBearer": true,
        "splitPercentage": null
      }
    ]
  }
}

Successful response

View Invoice Details​Copy link
This endpoint returns details of an invoice on your integration.

Path Parameters
invoiceReferenceCopy link to invoiceReference
Type:string
required
The unique reference used in creating the invoice.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful response
application/json

404
Not Found
application/json
Request Example forget/api/v1/invoice/{invoiceReference}/details
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/invoice/{invoiceReference}/details', {
  headers: {
    Authorization: 'Bearer <token>'
  }
})


Test Request
(get /api/v1/invoice/{invoiceReference}/details)
Status:200
Status:404
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "amount": 999,
    "invoiceReference": "183891300182",
    "invoiceStatus": "PENDING",
    "description": "test invoice",
    "contractCode": "7059707855",
    "customerEmail": "johnsnow@gmail.com",
    "customerName": "John Snow",
    "expiryDate": "2022-10-30 12:00:00",
    "createdBy": "MK_TEST_JRQAZRFD2W",
    "createdOn": "2022-07-31 12:14:14",
    "checkoutUrl": "https://sandbox.sdk.monnify.com/checkout/MNFY|99|20220731121414|000867",
    "accountNumber": "5000588061",
    "accountName": "tes",
    "bankName": "Moniepoint Microfinance bank",
    "bankCode": "50515",
    "redirectUrl": "http://app.monnify.com",
    "transactionReference": "MNFY|99|20220731121414|000867",
    "incomeSplitConfig": [
      {
        "subAccountCode": "MFY_SUB_322165393053",
        "splitAmount": 20,
        "feePercentage": 10.5,
        "feeBearer": true,
        "splitPercentage": null
      }
    ]
  }
}

Successful response

Get All Invoices​Copy link
This endpoint returns the list of all the invoice available on your integration.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful response
application/json

404
Not Found
application/json
Request Example forget/api/v1/invoice/all
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/invoice/all', {
  headers: {
    Authorization: 'Bearer <token>'
  }
})


Test Request
(get /api/v1/invoice/all)
Status:200
Status:404
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "content": [
      {
        "amount": 999,
        "invoiceReference": "18389130010082",
        "invoiceStatus": "PENDING",
        "description": "test invoice",
        "contractCode": "7059707855",
        "customerEmail": "johnsnow@gmail.com",
        "customerName": "John Snow",
        "expiryDate": "2022-10-30 12:00:00",
        "createdBy": "MK_TEST_JRQAZRFD2W",
        "createdOn": "2022-07-31 12:29:26",
        "accountNumber": "5000588060",
        "bankName": "Moniepoint Microfinance bank",
        "bankCode": "50515"
      }
    ],
    "pageable": {
      "sort": {
        "sorted": true,
        "unsorted": false,
        "empty": false
      },
      "pageSize": 10,
      "pageNumber": 0,
      "offset": 0,
      "unpaged": false,
      "paged": true
    },
    "last": true,
    "totalElements": 6,
    "totalPages": 1,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    },
    "first": true,
    "numberOfElements": 6,
    "size": 10,
    "number": 0,
    "empty": false
  }
}

Successful response

Cancel an Invoice​Copy link
This endpoint cancels an Invoice on your integration.

Path Parameters
invoiceReferenceCopy link to invoiceReference
Type:string
required
Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful response
application/json

404
Not Found
application/json
Request Example fordelete/api/v1/invoice/{invoiceReference}/cancel
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/invoice/{invoiceReference}/cancel', {
  method: 'DELETE',
  headers: {
    Authorization: 'Bearer <token>'
  }
})


Test Request
(delete /api/v1/invoice/{invoiceReference}/cancel)
Status:200
Status:404
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "amount": 999,
    "invoiceReference": "18389130010082",
    "invoiceStatus": "CANCELLED",
    "description": "test invoice",
    "contractCode": "7059707855",
    "customerEmail": "johnsnow@gmail.com",
    "customerName": "John Snow",
    "expiryDate": "2022-10-30 12:00:00",
    "createdBy": "MK_TEST_JRQAZRFD2W",
    "createdOn": "2022-07-31 12:29:26",
    "accountNumber": "5000588060",
    "bankName": "Moniepoint Microfinance bank",
    "bankCode": "50515"
  }
}

Successful response

Recurring Payment ​Copy link
This collection enables merchants to create and manage recurring payments for their customers

Recurring PaymentOperations
post
/api/v1/merchant/cards/charge-card-token
Charge Card Token​Copy link
This endpoint allows you to charge an already tokenized card with it’s card token.

NOTE: The customer email address used in the first successful charge should be stored along with the card token.
Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
·ChargeCardTokenRequest
required
application/json
amountCopy link to amount
Type:number
Format:float
required
Example
The amount(in Naira) to be paid, minimum is N20

apiKeyCopy link to apiKey
Type:string
required
Example
The merchant API key

cardTokenCopy link to cardToken
Type:string
required
Example
Card token gotten by performing a re-query on a card transaction using the Get Transaction Status API.

contractCodeCopy link to contractCode
Type:string
required
Example
The merchant contract code

customerEmailCopy link to customerEmail
Type:string
Format:email
required
Example
Email of the customer. The customer email used in the first charge

paymentReferenceCopy link to paymentReference
Type:string
required
Example
A unique string of characters that identifies each transaction

currencyCodeCopy link to currencyCode
Type:string
Default
Example
The currency code

customerNameCopy link to customerName
Type:string
Example
Full name of the customer

incomeSplitConfigCopy link to incomeSplitConfig
Type:array object[] · IncomeSplitConfig[]
A way to split payments among subAccounts.

Show Child Attributesfor incomeSplitConfig
metaDataCopy link to metaData
Type:object · MetaData
Show Child Attributesfor metaData
paymentDescriptionCopy link to paymentDescription
Type:string
Example
A description of the payment

Responses

200
Successful card charge
application/json

404
Not Found (e.g., Invalid card token)
application/json
Request Example forpost/api/v1/merchant/cards/charge-card-token
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/merchant/cards/charge-card-token', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    cardToken: 'MNFY_0CD0138B45F7478E941C3EC6D3698969',
    amount: 20,
    customerName: 'Marvelous Benji',
    customerEmail: 'benjikali29@gmail.com',
    paymentReference: '1642776mml0068n2937',
    paymentDescription: 'Paying for Product A',
    currencyCode: 'NGN',
    contractCode: '5867418298',
    apiKey: 'MK_PROD_WTZLS10MX6',
    metaData: {
      ipAddress: '127.0.0.1',
      deviceType: 'mobile'
    },
    incomeSplitConfig: [
      {
        subAccountCode: 'MFY_SUB_319452883228',
        feePercentage: 10.5,
        splitPercentage: 20,
        feeBearer: true,
        splitAmount: 100
      }
    ]
  })
})


Test Request
(post /api/v1/merchant/cards/charge-card-token)
Status:200
Status:404
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "transactionReference": "MNFY|87|20230602223418|007039",
    "paymentReference": "1642776mml0068n2937",
    "amountPaid": "20.00",
    "totalPayable": "20.00",
    "settlementAmount": "19.68",
    "paidOn": "02/06/2023 10:34:26 PM",
    "paymentStatus": "PAID",
    "paymentDescription": "Paying for Product A",
    "currency": "NGN",
    "paymentMethod": "CARD",
    "product": {
      "type": "API_NOTIFICATION",
      "reference": "1642776mml0068n2937"
    },
    "cardDetails": {
      "cardType": "MasterCard",
      "last4": "9098",
      "expMonth": "07",
      "expYear": "23",
      "bin": "539941",
      "bankCode": "057",
      "bankName": "Zenith bank",
      "reusable": true,
      "countryCode": "string",
      "cardToken": "MNFY_0CD0138B45F7478E941C3EC6D3698969",
      "supportsTokenization": false,
      "maskedPan": "539941******9098"
    },
    "accountDetails": {},
    "accountPayments": [
      {}
    ],
    "customer": {
      "email": "benjikali29@gmail.com",
      "name": "Marvelous Benji"
    },
    "metaData": {
      "ipAddress": "127.0.0.1",
      "deviceType": "mobile"
    }
  }
}

Successful card charge

Sub Accounts ​Copy link
This collection enables merchants to create and manage sub accounts on an integration.

Please note that usage of this API category in live environment requires approval from your relationship manager, kindly reach out to them or contact sales@monnify.com to get approval for this feature.
Sub AccountsOperations
post
/api/v1/sub-accounts
get
/api/v1/sub-accounts
put
/api/v1/sub-accounts
delete
/api/v1/sub-accounts/{subAccountCode}
Create Sub Account(s)​Copy link
This endpoint allows you to create a sub account to enable the spliting of payments between different accounts.

Please note that usage of this API in live environment requires approval from your relationship manager, kindly reach out to them or contact sales@monnify.com to get approval for this feature.
Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
required
application/json
Type:array object[] · CreateSubAccountRequest[]
Show Child Attributes
Responses

200
Successful sub account creation
application/json

404
Not Found
application/json
Request Example forpost/api/v1/sub-accounts
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/sub-accounts', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    '0': {
      currencyCode: 'NGN',
      accountNumber: '0211319282',
      bankCode: '058',
      email: 'tamira1@gmail.com',
      defaultSplitPercentage: 20.87
    }
  })
})


Test Request
(post /api/v1/sub-accounts)
Status:200
Status:404
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": [
    {
      "subAccountCode": "MFY_SUB_811397375865",
      "accountNumber": "0211319282",
      "accountName": "ALEMOH DANIEL MOSES",
      "currencyCode": "NGN",
      "email": "tamira1@gmail.com",
      "bankCode": "058",
      "bankName": "GTBank",
      "defaultSplitPercentage": 20.87,
      "settlementProfileCode": "8717495899",
      "settlementReportEmails": [
        "string"
      ]
    }
  ]
}

Successful sub account creation

Get Sub Accounts​Copy link
This endpoint returns the list of sub accounts that have been created on your integration.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful response
application/json
Request Example forget/api/v1/sub-accounts
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/sub-accounts', {
  headers: {
    Authorization: 'Bearer <token>'
  }
})


Test Request
(get /api/v1/sub-accounts)
Status:200
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": [
    {
      "subAccountCode": "MFY_SUB_811397375865",
      "accountNumber": "0211319282",
      "accountName": "ALEMOH DANIEL MOSES",
      "currencyCode": "NGN",
      "email": "tamira1@gmail.com",
      "bankCode": "058",
      "bankName": "GTBank",
      "defaultSplitPercentage": 20.87,
      "settlementProfileCode": "8717495899",
      "settlementReportEmails": [
        "string"
      ]
    }
  ]
}

Successful response

Update Sub Account​Copy link
This endpoint updates the details of an existing sub account.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
·UpdateSubAccountRequest
required
application/json
accountNumberCopy link to accountNumber
Type:string
required
Example
The account number that should be created as a sub account.

bankCodeCopy link to bankCode
Type:string
required
Example
The 3 digit bank code of the bank where the account number is domiciled

currencyCodeCopy link to currencyCode
Type:string
required
Example
Settlement currency. "NGN"

defaultSplitPercentageCopy link to defaultSplitPercentage
Type:number
Format:float
required
Example
The default percentage to be split into the sub account on any transaction.

emailCopy link to email
Type:string
Format:email
required
Example
The email tied to the sub account

subAccountCodeCopy link to subAccountCode
Type:string
required
Example
The sub account code of the account to be updated.

Responses

200
Successful sub account update
application/json

404
Not Found
application/json
Request Example forput/api/v1/sub-accounts
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/sub-accounts', {
  method: 'PUT',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    subAccountCode: 'MFY_SUB_811397375865',
    currencyCode: 'NGN',
    accountNumber: '0211319282',
    bankCode: '058',
    email: 'kali@gmail.com',
    defaultSplitPercentage: 25
  })
})


Test Request
(put /api/v1/sub-accounts)
Status:200
Status:404
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "subAccountCode": "MFY_SUB_811397375865",
    "accountNumber": "0211319282",
    "accountName": "ALEMOH DANIEL MOSES",
    "currencyCode": "NGN",
    "email": "tamira1@gmail.com",
    "bankCode": "058",
    "bankName": "GTBank",
    "defaultSplitPercentage": 20.87,
    "settlementProfileCode": "8717495899",
    "settlementReportEmails": [
      "string"
    ]
  }
}

Successful sub account update

Delete Sub Account​Copy link
This endpoint deletes a sub account on your integration.

Path Parameters
subAccountCodeCopy link to subAccountCode
Type:string
required
Query Parameters
subAccountCodeCopy link to subAccountCode
Type:string
Example
The subAccountCode of the sub account you want to delete.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful response
application/json

404
Not Found
application/json
Request Example fordelete/api/v1/sub-accounts/{subAccountCode}
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/sub-accounts/{subAccountCode}', {
  method: 'DELETE',
  headers: {
    Authorization: 'Bearer <token>'
  }
})


Test Request
(delete /api/v1/sub-accounts/{subAccountCode})
Status:200
Status:404
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0"
}

Successful response

Limit Profile ​Copy link
This collection enables merchants to create and manage limit profiles for their customers

Limit ProfileOperations
post
/api/v1/limit-profile/
get
/api/v1/limit-profile/
put
/api/v1/limit-profile/FSYVVWU8UPBD
post
/api/v1/bank-transfer/reserved-accounts/limit
put
/api/v1/bank-transfer/reserved-accounts/limit
Create Limit Profile(s)​Copy link
This endpoint creates limit profiles on a customer's account.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
·CreateLimitProfileRequest
required
application/json
dailyTransactionValueCopy link to dailyTransactionValue
Type:number
Format:float
required
Example
The maximum amount per day in all transactions that can be allowed on the reserved accounts

dailyTransactionVolumeCopy link to dailyTransactionVolume
Type:integer
required
Example
The maximum number of transaction count per day allowed on the reserved accounts

limitProfileNameCopy link to limitProfileName
Type:string
required
Example
The name of the Limit Profile

singleTransactionValueCopy link to singleTransactionValue
Type:number
Format:float
required
Example
The maximum amount that can be allowed per transaction on the reserved accounts.

Responses

200
Successful limit profile creation
application/json

404
Not Found
application/json
Request Example forpost/api/v1/limit-profile/
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/limit-profile/', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    limitProfileName: 'Profile0001',
    singleTransactionValue: 2000,
    dailyTransactionValue: 150000,
    dailyTransactionVolume: 500
  })
})


Test Request
(post /api/v1/limit-profile/)
Status:200
Status:404
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "limitProfileCode": "FSYVVWU8UPBD",
    "limitProfileName": "Profile0001",
    "singleTransactionValue": 2000,
    "dailyTransactionVolume": 500,
    "dailyTransactionValue": 150000,
    "dateCreated": "02/08/2022 02:27:43 AM",
    "lastModified": "02/08/2022 02:27:43 AM"
  }
}

Successful limit profile creation

Get Limit Profiles​Copy link
This endpoint returns the list of all Limit Profiles that have been created for your customers.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful limit profiles retrieval
application/json

404
Not Found
application/json
Request Example forget/api/v1/limit-profile/
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/limit-profile/', {
  headers: {
    Authorization: 'Bearer <token>'
  }
})


Test Request
(get /api/v1/limit-profile/)
Status:200
Status:404
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "content": [
      {
        "limitProfileCode": "FSYVVWU8UPBD",
        "limitProfileName": "Profile0001",
        "singleTransactionValue": 2000,
        "dailyTransactionVolume": 500,
        "dailyTransactionValue": 150000,
        "dateCreated": "02/08/2022 02:27:43 AM",
        "lastModified": "02/08/2022 02:27:43 AM"
      }
    ],
    "pageable": null,
    "last": true,
    "totalElements": 3,
    "totalPages": 1,
    "sort": null,
    "first": true,
    "numberOfElements": 3,
    "size": 10,
    "number": 0,
    "empty": false
  }
}

Successful limit profiles retrieval

Update Limit Profile​Copy link
This endpoint updates the information on an existing Limit Profile.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
·UpdateLimitProfileRequest
required
application/json
dailyTransactionValueCopy link to dailyTransactionValue
Type:number
Format:float
required
Example
The maximum amount per day in all transactions that can be allowed on the reserved accounts

dailyTransactionVolumeCopy link to dailyTransactionVolume
Type:integer
required
Example
The maximum number of transaction count per day allowed on the reserved accounts

limitProfileNameCopy link to limitProfileName
Type:string
required
Example
The name of the Limit Profile

singleTransactionValueCopy link to singleTransactionValue
Type:number
Format:float
required
Example
The maximum amount that can be allowed per transaction on the reserved accounts.

Responses

200
Successful limit profile update
application/json

404
Not Found
application/json
Request Example forput/api/v1/limit-profile/FSYVVWU8UPBD
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/limit-profile/FSYVVWU8UPBD', {
  method: 'PUT',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    limitProfileName: 'prof991',
    singleTransactionValue: 70000,
    dailyTransactionValue: 100000000,
    dailyTransactionVolume: 4000
  })
})


Test Request
(put /api/v1/limit-profile/FSYVVWU8UPBD)
Status:200
Status:404
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "limitProfileCode": "FSYVVWU8UPBD",
    "limitProfileName": "Profile0001",
    "singleTransactionValue": 2000,
    "dailyTransactionVolume": 500,
    "dailyTransactionValue": 150000,
    "dateCreated": "02/08/2022 02:27:43 AM",
    "lastModified": "02/08/2022 02:27:43 AM"
  }
}

Successful limit profile update

Reserve Account with Limit​Copy link
This endpoint reserves an account for your customers with a transaction limit profile on it.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
·ReserveAccountWithLimitRequest
required
application/json
accountNameCopy link to accountName
Type:string
required
Example
The name to be displayed during name enquiry

accountReferenceCopy link to accountReference
Type:string
required
Example
A unique reference generated by merchants.

contractCodeCopy link to contractCode
Type:string
required
Example
The merchant contract code

limitProfileCodeCopy link to limitProfileCode
Type:string
required
Example
The unique identifier that references the limit profile to associate with the reserved accounts.

currencyCodeCopy link to currencyCode
Type:string
Example
The currency payments will be received with

customerEmailCopy link to customerEmail
Type:string
Format:email
Example
The customer's email

customerNameCopy link to customerName
Type:string
Example
customer name

getAllAvailableBanksCopy link to getAllAvailableBanks
Type:boolean
Example
if you want to get all available banks

preferredBanksCopy link to preferredBanks
Type:array string[]
Example
list of preferred banks

Responses

200
Successful reserved account creation with limit
application/json

404
Not Found
application/json
Request Example forpost/api/v1/bank-transfer/reserved-accounts/limit
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/bank-transfer/reserved-accounts/limit', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    contractCode: '7059707855',
    accountName: 'Kan Yo' Reserved with Limit',
    currencyCode: 'NGN',
    accountReference: 'ref-00--7',
    customerEmail: 'KanYo@monnify.com',
    customerName: 'Kan Yo',
    getAllAvailableBanks: false,
    preferredBanks: ['50515'],
    limitProfileCode: 'FSYVVWU8UPBD'
  })
})


Test Request
(post /api/v1/bank-transfer/reserved-accounts/limit)
Status:200
Status:404
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "contractCode": "7059707855",
    "accountReference": "ref-00--7",
    "accountName": "Kan",
    "currencyCode": "NGN",
    "customerEmail": "KanYo@monnify.com",
    "customerName": "Kan Yo",
    "accountNumber": "5000578928",
    "bankName": "Moniepoint Microfinance bank",
    "bankCode": "50515",
    "collectionChannel": "RESERVED_ACCOUNT",
    "reservationReference": "0B70FP4CNC61U334XFG1",
    "reservedAccountType": "GENERAL",
    "status": "ACTIVE",
    "createdOn": "2022-08-02T02:53:25.617Z",
    "incomeSplitConfig": [
      {}
    ],
    "restrictPaymentSource": false,
    "limitProfileConfig": null
  }
}

JSONCopy
JSONCopy
Successful reserved account creation with limit

Get Wallets​Copy link

Auth Required
This endpoint returns all the wallets created by a merchant

Query Parameters
walletReferenceCopy link to walletReference
Type:string
Example
The unique identifier of the wallet

pageSizeCopy link to pageSize
Type:integer
The number of wallet records to return

pageNoCopy link to pageNo
Type:integer
A number specifying what page of wallets to be retrieved

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful response
application/json

401
Unauthorized Request
application/json
Request Example forget/api/v1/disbursements/wallet
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/disbursements/wallet', {
  headers: {
    Authorization: 'Bearer <token>'
  }
})


Test Request
(get /api/v1/disbursements/wallet)
Status:200
Status:401
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "string",
  "responseBody": {
    "content": [
      {
        "walletName": "Staging Wallet - ref1684248425966",
        "walletReference": "ref1684248425966",
        "customerName": "John Doe",
        "customerEmail": "johndoe@example.com",
        "feeBearer": "SELF",
        "bvnDetails": {
          "bvn": "22222222226",
          "bvnDateOfBirth": "1994-09-07"
        },
        "accountNumber": "1234567890",
        "accountName": "John Doe",
        "topUpAccountDetails": {
          "accountNumber": "1234567890",
          "accountName": "John Doe",
          "bankCode": "50515",
          "bankName": "Moniepoint MFB"
        },
        "createdOn": "2025-11-12T11:40:25.344+00:00"
      }
    ],
    "pageable": {
      "sort": {
        "empty": true,
        "sorted": true,
        "unsorted": true
      },
      "offset": 1,
      "pageNumber": 1,
      "pageSize": 1,
      "paged": true,
      "unpaged": true
    },
    "last": true,
    "totalElements": 1,
    "totalPages": 1,
    "size": 1,
    "number": 1,
    "sort": {
      "empty": true,
      "sorted": true,
      "unsorted": true
    },
    "first": true,
    "numberOfElements": 1,
    "empty": true
  }
}

Successful response

Wallet Balance​Copy link
This endpoint returns the balance associated with a wallet

Query Parameters
accountNumberCopy link to accountNumber
Type:string
Example
The unique identifier of the wallet

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful response
application/json

401
Unauthorized Request
application/json
Request Example forget/api/v1/disbursements/wallet/balance
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/disbursements/wallet/balance', {
  headers: {
    Authorization: 'Bearer <token>'
  }
})


Test Request
(get /api/v1/disbursements/wallet/balance)
Status:200
Status:401
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "availableBalance": 5000000000,
    "ledgerBalance": 5000000000
  }
}

Successful response

Wallet Transactions​Copy link
This endpoint returns all the transactions performed by a wallet

Query Parameters
accountNumberCopy link to accountNumber
Type:string
Example
The walletAccountNumber

pageSizeCopy link to pageSize
Type:string
Example
The number of wallet records to return

pageNoCopy link to pageNo
Type:string
Example
A number specifying what page of wallets to be retrieved

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful response
application/json

401
Unauthorized Request
application/json
Request Example forget/api/v1/disbursements/wallet/transactions
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/disbursements/wallet/transactions', {
  headers: {
    Authorization: 'Bearer <token>'
  }
})


Test Request
(get /api/v1/disbursements/wallet/transactions)
Status:200
Status:401
{
  "requestSuccessful": true,
  "responseMessage": "string",
  "responseCode": "string",
  "responseBody": {
    "content": [
      {
        "walletTransactionReference": "MFDS60520251111091433348001YWN0D9_DEBIT_0",
        "monnifyTransactionReference": "MFDS60520251111091433348001YWN0D9_DEBIT_0",
        "availableBalanceBefore": 5000000000,
        "availableBalanceAfter": 4900000000,
        "amount": 1000000000,
        "transactionDate": "2025-11-11T08:14:33.000+00:00",
        "transactionType": "DEBIT",
        "message": null,
        "narration": "MFDS60520251111091433348001YWN0D9/#/reference---12d9d0034fr/#/911 Transactionn/#/Moniepoint Micr/#/0000001723",
        "status": "COMPLETED"
      }
    ],
    "pageable": {
      "sort": {
        "empty": true,
        "sorted": true,
        "unsorted": true
      },
      "offset": 1,
      "pageNumber": 1,
      "pageSize": 1,
      "paged": true,
      "unpaged": true
    },
    "last": true,
    "totalElements": 1,
    "totalPages": 1,
    "size": 1,
    "number": 1,
    "sort": {
      "empty": true,
      "sorted": true,
      "unsorted": true
    },
    "first": true,
    "numberOfElements": 1,
    "empty": true
  }
}

Successful response

Paycode API ​Copy link
This collection enables merchants to create and manage PayCodes for their customers

Paycode APIOperations
post
/api/v1/paycode
get
/api/v1/paycode
get
/api/v1/paycode/{paycodeReference}
delete
/api/v1/paycode/{paycodeReference}
get
/api/v1/paycode/{paycodeReference}/authorize
Create Paycode​Copy link
The endpoint allows merchant create paycodes via API.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
·CreatePaycodeRequest
required
application/json
amountCopy link to amount
Type:number
Format:float
required
Example
The amount to be withdrawn

beneficiaryNameCopy link to beneficiaryName
Type:string
required
Example
The customer's name

clientIdCopy link to clientId
Type:string
required
Example
The merchant's APIKey

expiryDateCopy link to expiryDate
Type:string
required
Example
The expiry date for the paycode. The format is:YYYY-MM-DD HH:MM:SS

paycodeReferenceCopy link to paycodeReference
Type:string
required
Example
A unique reference generated by the merchant

Responses

200
Successful paycode creation
application/json

400
Bad Request
application/json
Request Example forpost/api/v1/paycode
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/paycode', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    beneficiaryName: 'Marvelous Benji',
    amount: 30,
    paycodeReference: 'ur749o04jhke993u93o',
    expiryDate: '2023-10-18 19:00:26',
    clientId: 'MK_PROD_GFVLE0PZTQ'
  })
})


Test Request
(post /api/v1/paycode)
Status:200
Status:400
{
  "responseMessage": "success",
  "responseCode": "M00",
  "responseBody": {
    "paycode": "11467409",
    "transactionReference": "MFY-39A78F78E6C341759ACA344297A8CF70",
    "paycodeReference": "ghehdekdkefkefjekjfejj",
    "beneficiaryName": "Marvelous Benji",
    "amount": 50,
    "fee": 100,
    "transactionStatus": "PENDING",
    "expiryDate": "2023-02-19 11:00:26",
    "createdOn": "2023-02-16T12:32:01.591+0000",
    "createdBy": "MK_PROD_WTZLS10MX6",
    "modifiedBy": "MK_PROD_WTZLS10MX6"
  }
}

Successful paycode creation

Fetch Paycodes​Copy link

Auth Required
This endpoint returns a history of generated Paycodes over a period of time using some search criteria.

Query Parameters
transactionReferenceCopy link to transactionReference
Type:string
The Monnify transactionReference.

beneficiaryNameCopy link to beneficiaryName
Type:string
The customer name.

transactionStatusCopy link to transactionStatus
Type:string
The status of the paycode.

fromCopy link to from
Type:integer
A unix timestamp for the start date being considered.

toCopy link to to
Type:integer
A unix timestamp for the end date being considered.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful paycode history retrieval
application/json
Request Example forget/api/v1/paycode
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/paycode', {
  headers: {
    Authorization: 'Bearer <token>7'
  }
})


Test Request
(get /api/v1/paycode)
Status:200
{
  "responseMessage": "success",
  "responseCode": "M00",
  "responseBody": {
    "content": [
      {
        "paycode": "11467409",
        "transactionReference": "MFY-39A78F78E6C341759ACA344297A8CF70",
        "paycodeReference": "ghehdekdkefkefjekjfejj",
        "beneficiaryName": "Marvelous Benji",
        "amount": 50,
        "fee": 100,
        "transactionStatus": "PENDING",
        "expiryDate": "2023-02-19 11:00:26",
        "createdOn": "2023-02-16T12:32:01.591+0000",
        "createdBy": "MK_PROD_WTZLS10MX6",
        "modifiedBy": "MK_PROD_WTZLS10MX6"
      }
    ],
    "pageable": {
      "sort": {
        "sorted": true,
        "unsorted": false,
        "empty": false
      },
      "pageSize": 10,
      "pageNumber": 0,
      "offset": 0,
      "unpaged": false,
      "paged": true
    },
    "last": true,
    "totalPages": 1,
    "totalElements": 1,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    },
    "first": true,
    "numberOfElements": 1,
    "size": 50,
    "number": 0,
    "empty": false
  }
}

Successful paycode history retrieval

Get Paycode​Copy link

Auth Required
This endpoint returns paycode information for a given paycode reference.

Path Parameters
paycodeReferenceCopy link to paycodeReference
Type:string
required
The unique reference for the paycode.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful paycode retrieval
application/json

404
Not Found
application/json
Request Example forget/api/v1/paycode/{paycodeReference}
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/paycode/{paycodeReference}', {
  headers: {
    Authorization: 'Bearer <token>7'
  }
})


Test Request
(get /api/v1/paycode/{paycodeReference})
Status:200
Status:404
{
  "responseMessage": "success",
  "responseCode": "M00",
  "responseBody": {
    "paycode": "11467409",
    "transactionReference": "MFY-39A78F78E6C341759ACA344297A8CF70",
    "paycodeReference": "ghehdekdkefkefjekjfejj",
    "beneficiaryName": "Marvelous Benji",
    "amount": 50,
    "fee": 100,
    "transactionStatus": "PENDING",
    "expiryDate": "2023-02-19 11:00:26",
    "createdOn": "2023-02-16T12:32:01.591+0000",
    "createdBy": "MK_PROD_WTZLS10MX6",
    "modifiedBy": "MK_PROD_WTZLS10MX6"
  }
}

Successful paycode retrieval

Delete Paycode​Copy link

Auth Required
This endpoint cancels or invalidates a generated Paycode.

Path Parameters
paycodeReferenceCopy link to paycodeReference
Type:string
required
The unique reference for the paycode.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful paycode deletion/cancellation
application/json

404
Not Found
application/json
Request Example fordelete/api/v1/paycode/{paycodeReference}
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/paycode/{paycodeReference}', {
  method: 'DELETE',
  headers: {
    Authorization: 'Bearer <token>7'
  }
})


Test Request
(delete /api/v1/paycode/{paycodeReference})
Status:200
Status:404
{
  "responseMessage": "success",
  "responseCode": "M00",
  "responseBody": {
    "paycode": "11467409",
    "transactionReference": "MFY-39A78F78E6C341759ACA344297A8CF70",
    "paycodeReference": "ghehdekdkefkefjekjfejj",
    "beneficiaryName": "Marvelous Benji",
    "amount": 50,
    "fee": 100,
    "transactionStatus": "PENDING",
    "expiryDate": "2023-02-19 11:00:26",
    "createdOn": "2023-02-16T12:32:01.591+0000",
    "createdBy": "MK_PROD_WTZLS10MX6",
    "modifiedBy": "MK_PROD_WTZLS10MX6"
  }
}

Successful paycode deletion/cancellation

Get Clear Paycode​Copy link

Auth Required
This endpoint is used to get an unmasked paycode information.

Path Parameters
paycodeReferenceCopy link to paycodeReference
Type:string
required
The unique reference for the paycode.

Headers
AuthorizationCopy link to Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful clear paycode retrieval
application/json

404
Not Found
application/json
Request Example forget/api/v1/paycode/{paycodeReference}/authorize
Node.js undici
import { request } from 'undici'

const { statusCode, body } = await request('https://sandbox.monnify.com/api/v1/paycode/{paycodeReference}/authorize', {
  headers: {
    Authorization: 'Bearer <token>7'
  }
})


Test Request
(get /api/v1/paycode/{paycodeReference}/authorize)
Status:200
Status:404
{
  "responseMessage": "success",
  "responseCode": "M00",
  "responseBody": {
    "paycode": "11467409",
    "transactionReference": "MFY-39A78F78E6C341759ACA344297A8CF70",
    "paycodeReference": "ghehdekdkefkefjekjfejj",
    "beneficiaryName": "Marvelous Benji",
    "amount": 50,
    "fee": 100,
    "transactionStatus": "PENDING",
    "expiryDate": "2023-02-19 11:00:26",
    "createdOn": "2023-02-16T12:32:01.591+0000",
    "createdBy": "MK_PROD_WTZLS10MX6",
    "modifiedBy": "MK_PROD_WTZLS10MX6"
  }
}
