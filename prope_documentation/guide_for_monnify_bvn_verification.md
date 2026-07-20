ntegration Guide for Monnify BVN Verification
The purpose of this document is to provide a comprehensive and clear set of instructions for developers or businesses integrating Monnify services in accordance with the Central Bank of Nigeria's circular on virtual accounts. This guide will specifically cover BVN verification endpoints, account creation, and updating existing accounts.


alert image
Monnify Update
This feature is only available Live Mode
Table of Content
Introduction
About BVN
About NIN
Capturing BVN or NIN for new customers
Capturing BVN or NIN for old customers
Fees


Introduction
The Central Bank of Nigeria, released a circular recently, regarding virtual accounts issued to customers, as follows:

Every virtual account must be linked with either a Bank Verification Number (BVN) or National Identification Number (NIN).

For accounts that wish to enjoy the maximum transaction limit, both BVN and NIN must be linked to the Account Number.


Following this update, we would be sharing with you below how to;



Verify BVN using Monnify BVN Verification endpoints
How to add BVN during Account Creation / when reserving an Account
How to Update Existing Account with BVN/NIN
A Sample Flow / Implementation


About BVN

What is BVN
The Bank Verification Number (BVN) is a unique 11-digit identification number that uniquely identifies an account holder across all banks in Nigeria.


How to get BVN
An account holder can enrol for BVN by visiting any commercial bank branch in Nigeria. For customers who need to remember their BVN info, they can dial the USSD Code 5650# on your number registered with BVN. There is a N20 service charge for checking BVN with USSD


Verification process for BVN
The objective of this step is to verify that the BVN supplied by a customer is correct and that the customer owns this BVN. This process often entails capturing the customer’s BVN and other bank account information, then sharing with a service which confirms the accuracy of this information. There are several services available for this and you can check out Monnify’s BVN verification API

here



About NIN

What is NIN
The National Identification Number (NIN) is your unique 11-digit identifier issued by the National Identification Management Commision (NIMC).


How to get BVN
To get a NIN Number you would be required to provide Original Birth Certificate and Valid Proof of Identity. You can find list of NIMC registration centers and designated enrollment agents on the NIMC website

https://nimc.gov.ng/nimc-enrolment-centres


Verification process for BVN
The objective of this step is to verify that the customer owns this NIN. This step entails capturing the customer’s NIN and other important information and sharing with a service which confirms the accuracy of this information. There are several services available for this and you can check out Monnify’s NIN verification in the Documentation section



Capturing BVN or NIN for new customers

On your onboarding flow, implement a section to capture BVN or NIN from customers.

Verify the BVN or NIN information provided using your preferred verification service (as indicated in the description sections above)

Once this information is verified, complete the user sign up process on your application.

Send request to Monnify for account creation via this

here

, supplying the BVN and/or NIN captured.

Monnify would verify the information provided and generate virtual accounts as applicable

Save the accounts generated on your system and display them to the customer.



Capturing BVN or NIN for existing customers

On a visible screen within your website or app, implement a notification bar to prompt users to update their KYC information.

On click of this notification bar, display a screen to capture BVN and/or NIN information for the user.

Verify the BVN or NIN information provided using your preferred verification service (as indicated in the description sections above)Once this information is verified by you, send a request to Monnify for account details update via this

https://teamapt.atlassian.net/wiki/spaces/MON/pages/289046549/Reserve+An+Account+V2

, supplying the BVN and/or NIN captured.

Monnify would verify the information provided and save this information with the customer’s information.

On successful response from Monnify, display a message to the user accordingly.



Applicable Fees

Monnify would NOT charge merchants for creating accounts or updating account details with BVN or NIN. Those actions are completely free of charge as usual.



However, to verify BVN / or NIN on a merchant's application, the verification method of choice may attract fees depending on the service being used. This is solely at the discretion of the merchant and not imposed nor charged by Monnify.


To reserve an account on Monnify, you’ll need to call the reserve account endpoint, see specifications below(remember to also add the authentication header).

This endpoint is protected with OAuth 2.0 Bearer token. To find out more about authorization for Monnify endpoints, check Here

Endpoint URL: {{base_url}}/api/v2/bank-transfer/reserved-accounts

HTTP Method: POST

The {{base_url}} for test is https://sandbox.monnify.com but when you go live, it changes to the live url.

Here is a sample request and response to help get you started:

Get a reserve account reserved with each of partner banks available
If you want to reserve accounts across all partner banks for your customers, you will need to pass "true" for "getAllAvailableBanks". Note that Moniepoint bank accounts are the default virtual account.

Reserve Account Request (Get an account each for all available partner banks)



Request Headers
Content-Type:"application/json"
Authorization:"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
Request Body
{
	"accountReference": "abc123",
	"accountName": "Test Reserved Account",
	"currencyCode": "NGN",
	"contractCode": "8389328412",
	"customerEmail": "test@tester.com",
	"bvn": "21212121212",
	"customerName": "John Doe",
	"getAllAvailableBanks": true
}
 

Specify the partner banks you wish to reserve accounts with.
If you want to reserve accounts for only preferred partner banks for your customers, you will need to pass "False" for "getAllAvailableBanks" and supply the bank codes of the preferred banks in an array.

Reserve Account Request (Get an account for preferred partner banks)



Request Headers
Content-Type:"application/json"
Authorization:"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
Request Body
{
	"accountReference": "abc123",
	"accountName": "Test Reserved Account",
	"currencyCode": "NGN",
	"contractCode": "8389328412",
	"customerEmail": "test@tester.com",
	"nin": "12034875601",
	"customerName": "John Doe", 
    "getAllAvailableBanks": false,
    "preferredBanks": ["50515"]
}
Once an account number has been reserved for a customer, the customer can make payment by initiating a transfer to that account number at any time. Once the transfer hits the partner bank, you will be notified with the transfer details along with the account reference you specified when reserving the account. 


Split payments on Reserved Accounts
incomeSplitConfig allows you to use split payments with your reserved accounts by specifying one or more sub-account(s) and a specific percentage of each payment to be credited into each sub-account. IncomeSplitConfig is an array of objects so you can split into multiple sub-accounts per transaction.

Reserve Account Request with SubAccount



Request Headers
Content-Type:"application/json"
Authorization:"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
Request Body
{
	"accountReference": "abc123",
	"accountName": "Test Reserved Account",
	"currencyCode": "NGN",
	"contractCode": "8389328412",
	"customerEmail": "test@tester.com",
	"customerName": "John Doe",
	"bvn": "21212121212",
	"nin": "12034875601",
	"getAllAvailableBanks": true
	"incomeSplitConfig": [
    	{
    		"subAccountCode": "MFY_SUB_319452883228",
    		"feePercentage": 10.5,
    		"splitPercentage": 20,
    		"feeBearer": true
    	}
    ]
}
 

Restriction of Payment Sources on Reserved Accounts
The restrict payment source parameter enables you to restrict accounts that can fund a reserved account. 

For merchants in the regulated business category, where only the authorized user(s) of a reserved account should fund the reserved account, 
to allow more payment sources, only BVNs can be used to allow a payment source other than the default bvn already on a reserve account.

See here for more info on payment source restriction 


Reserve Account Request with Allowed Payment Sources



Request Headers
Content-Type:"application/json"
Authorization:"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
Request Body
{
	"accountReference": "abc123",
	"accountName": "Test Reserved Account",
	"currencyCode": "NGN",
	"contractCode": "8389328412",
	"customerEmail": "test@tester.com",
	"customerName": "John Doe",     
    "bvn": "21212121212",
	"incomeSplitConfig": [
    	{
    		"subAccountCode": "MFY_SUB_319452883228",
    		"feePercentage": 10.5,
    		"splitPercentage": 20,
    		"feeBearer": true
    	}
    ],
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
    	   "accountNames": [
    			"SAMUEL DAMILARE OGUNNAIKE"
    			]
    }
}
Reserve Account Response



{
    "requestSuccessful": true,
    "responseMessage": "success",
    "responseCode": "0",
    "responseBody": {
        "contractCode": "222001311614",
        "accountReference": "abc1234",
        "accountName": "Tes",
        "currencyCode": "NGN",
        "customerEmail": "test@tester.com",
        "customerName": "John Doe",
        "accounts": [
            {
                "bankCode": "50515",
                "bankName": "Moniepoint Microfinance Bank",
                "accountNumber": "6254727989",
                "accountName": "Tes"
            }
        ],
        "collectionChannel": "RESERVED_ACCOUNT",
        "reservationReference": "NWA7DMJ0W2UDK1KN5SLF",
        "reservedAccountType": "GENERAL",
        "status": "ACTIVE",
        "createdOn": "2023-04-14 12:04:39.034",
        "incomeSplitConfig": [],
        "bvn": "21212121212",
        "nin": "12034875601",
        "restrictPaymentSource": false
    }
}
Field Reference
(M) indicates fields that are mandatory in the request body. (m) Indicates fields that are mandatory only if the parent object is not empty.

Field

Description

accountReference (M)

Your unique reference used to identify this reserved account

accountName (M)

The name you want to be attached to the reserved account. This will be displayed during name enquiry

currencyCode (M)

Currency for transactions to this reserved account. Should be “NGN”

contractCode (M)

Contract Code (See your Monnify dashboard)

customerEmail (M)

Email address of the customer who the account is being reserved for. This is the unique identifier for each customer.

customerName

Full name of the customer linked to its BVN or NIN

bvn

BVN of the customer the account is being reserved for. This field is not mandated when NIN is supplied, merchants are expected to provide either BVN or NIN or both depending on the account tier.

nin

NIN of the customer the account is being reserved for. This field is not mandated when BVN is supplied, merchants are expected to provide either BVN or NIN or both depending on the account tier.

getAllAvailableBanks

Set to true if you want to reserve accounts with all partner banks. Set to false if you want to specify preferred banks to reserve accounts with.




Object containing specifications on how payments to this reserve account should be split.

restrictPaymentSource

A boolean value to activate or de-activate restricting payment sources for a reserved account. If set to true, at least one of bvns or accountNames or bankAccounts in allowedPaymentSources object must be supplied. Click here to learn more about source account restriction.

allowedPaymentSources

Object capturing bvns or account numbers or account names that are permitted to fund a reserved account. This is mandatory if restrictPaymentSource is set to true. Click here to learn more about source account restriction.  

For merchants in the regulated business category, only the bvn and allowed payment source BVNS (if any) can fund a reserve account. 

subAccountCode (m)

The unique reference for the sub account that should receive the split.

feeBearer

Boolean to determine if the sub account should bear transaction fees or not

feePercentage

The percentage of the transaction fee to be borne by the sub account

splitPercentage

The percentage of the amount paid to be split into the sub account.

bankName

Name of the bank where the virtual account was created

bankCode

Bank code of the bank where the virtual account was created

accountNumber

virtual account number generated for the accountReference (Reserved account number)

status

Status of the reserved account number ("ACTIVE" means the account can be used)

createdOn

Date reserved account was created
