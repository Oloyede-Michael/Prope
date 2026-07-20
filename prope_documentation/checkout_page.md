Checkout Page
The Monnify Checkout Page is a pre-built payment UI that opens as a modal on your website or inside your mobile app. It handles all payment methods (bank transfer, card, USSD, and phone number) so your customers can pay without leaving your platform.

Monnify Web Checkout
Add the Monnify JS SDK to your website to open the checkout modal. Customers can pay via:

Pay with Bank Transfer: A dynamically generated account number is displayed for the transaction. The customer transfers the exact amount from any bank app.
Pay with USSD: A bank-specific USSD code is generated. The customer dials it to authorize the payment with no internet connection required.
Pay with Card: The customer enters their debit card details directly in the Monnify modal.
Pay with Phone Number: The customer enters their phone number to initiate a payment session from their mobile wallet.



Adding Monnify Checkout to your Website
Add the Monnify JS snippet to your page and call MonnifySDK.initialize() when the customer is ready to pay:

Option A – Script tag (no bundler)

Drop the Monnify script into your HTML and call MonnifySDK.initialize() directly. No installation needed.

index.html
Copy
<html>
<head>
  <script
    type="text/javascript"
    src="https://sdk.monnify.com/plugin/monnify.js"
  ></script>
  <script>
    function payWithMonnify() {
      MonnifySDK.initialize({
        amount: 100,
        currency: "NGN", // or USD for enabled merchants.
        reference: "REF2019112132378347273",
        customerFullName: "Damilare Ogunnaike",
        customerEmail: "ogunnaike.damilare@gmail.com",
        apiKey: "MK_PROD_FLX4P92EDF",
        contractCode: "626609763141",
        paymentDescription: "Lahray World",
        metadata: {
          name: "Damilare",
          age: 45,
        },
        incomeSplitConfig: [
          {
            subAccountCode: "MFY_SUB_342113621921",
            feePercentage: 50,
            splitAmount: 1900,
            feeBearer: true,
          },
          {
            subAccountCode: "MFY_SUB_342113621922",
            feePercentage: 50,
            splitAmount: 2100,
            feeBearer: true,
          },
        ],
        onLoadStart: () => {
          console.log("loading has started");
        },
        onLoadComplete: () => {
          console.log("SDK is UP");
        },
        onComplete: function (response) {
          //Implement what happens when the transaction is completed.
          console.log(response);
        },
        onClose: function (data) {
          //Implement what should happen when the modal is closed here
          console.log(data);
        },
      });
    }
  </script>
</head>
<body>
  <div>
    <button type="button" onclick="payWithMonnify()">Pay With Monnify</button>
  </div>
</body>
</html>
Collapse
Option B – npm Package (React, Vue, Angular)

If you're using a framework with a bundler, install the package that matches your project:

terminal
Copy
# JavaScript
npm install monnify-js

# TypeScript
npm install monnify-ts
Both packages expose the same class-based API. Instantiate with your credentials and call initializePayment(). Here's a React example:

PayButton.jsx
Copy
// swap 'monnify-js' for 'monnify-ts' in TypeScript projects
import Monnify from 'monnify-js';

export function PayButton() {
function pay() {
  const monnify = new Monnify('MK_PROD_FLX4P92EDF', '626609763141');
  monnify.initializePayment({
    amount: 100,
    currency: 'NGN', // or USD for enabled merchants.
    reference: 'REF2019112132378347273',
    customerFullName: 'Damilare Ogunnaike',
    customerEmail: 'ogunnaike.damilare@gmail.com',
    paymentDescription: 'Lahray World',
    onComplete: (response) => {
      // Send response.paymentReference to your server to verify
      console.log(response);
    },
    onClose: (data) => {
      console.log('Modal closed', data);
    },
  });
}

return <button onClick={pay}>Pay With Monnify</button>;
}
Show more
The same pattern works in Vue and Angular. Instantiate Monnify and call initializePayment() inside your component's pay handler.

alert image
Currency Support:
The currency field defaults to NGN. Merchants enabled for USD collection can pass USD to accept card payments in US Dollars. You can request access to International Payment from Settings > Contract Setup on your Monnify Dashboard.

Response Object
When the transaction is completed, Monnify will return a response object to your onComplete function.

response.json
Copy
{
"amount": 100,
"amountPaid": 100,
"completed": true,
"completedOn": "2022-03-31T10:53:50.000+0000",
"createdOn": "2022-03-31T10:52:09.000+0000",
"currencyCode": "NGN",
"customerEmail": "ogunnaike.damilare@gmail.com",
"customerName": "Damilare Ogunnaike",
"fee": 10.75,
"metaData": {
  "deviceType": "mobile",
  "ipAddress": "127.0.0.1"
},
"payableAmount": 100,
"paymentMethod": "CARD",
"paymentReference": "MNFY|PAYREF|GENERATED|1648723909057299503",
"paymentStatus": "PAID",
"transactionReference": "MNFY|67|20220331115209|000063"
}
Show more
Always verify the transaction server-side using the Verify Transactions API before fulfilling an order. Monnify will also notify you via webhook for every completed transaction.


User Cancelled Response
If the customer closes the modal, Monnify returns the following to your onClose function:

response.json
Copy
{
"authorizedAmount": 30,
"paymentStatus": "USER_CANCELLED",
"redirectUrl": null,
"responseCode": "USER_CANCELLED",
"responseMessage": "User cancelled Transaction"
}

Controlling which payment methods appear: By default all methods are shown. Pass a paymentMethods array to restrict them:

payment methods
Copy
paymentMethods: ["CARD", "ACCOUNT_TRANSFER", "USSD", "PHONE_NUMBER"]


Monnify Android SDK
Accept payments inside your Android app via card, bank transfer, USSD, and phone number.

Card Payment
Bank Transfer
USSD Payment
Payment by Phone Number


Steps to Implementation
1. Add the dependency for the Monnify SDK
To your root build.gradle file add:

Copy
allprojects {
  repositories {
      google()
      mavenCentral()
  }
}
To your app-level build.gradle file add:


2. Create an instance of the Monnify SDK
Copy
dependencies {
  // ...
  implementation "com.monnify.android-sdk:monnify-android-sdk:1.1.7"
}
Monnify Flutter SDK
Accept payments inside your Flutter app via card, bank transfer, USSD, and phone number.

Card Payment
Bank Transfer
USSD Payment
Payment by Phone Number


Steps to Implementation
1. Add the dependency for the Monnify SDK
Add monnify_payment_sdk as a dependency in your pubspec.yaml file.


2. Initialize the plugin
Initialize once, preferably in the initState of your widget.

Copy
import 'package:monnify_payment_sdk/monnify_payment_sdk.dart';

class _MyAppState extends State<MyApp> {

@override
void initState() {
  super.initState();
  MonnifyPaymentSdk.initialize(
            'YOUR_API_KEY',
            'CONTRACTCODE',
            ApplicationMode.TEST
  );
}
}

3. Initialize payment
Create a Transaction object and pass it to initializePayment.

Copy
Future<void> initPayment() async {
  TransactionResponse transactionResponse =
        await MonnifyPaymentSdk.initializePayment(Transaction(
            2000,
            "NGN", // or USD for enabled merchants.
            "Customer Name",
            "mail.cus@tome.er",
            "PAYMENT_REF",
            "Description of payment",
            metaData: {
              "ip": "196.168.45.22",
              "device": "mobile_flutter"
            },
            paymentMethods: [PaymentMethod.CARD, PaymentMethod.ACCOUNT_TRANSFER],
            incomeSplitConfig: [
              SubAccountDetails("MFY_SUB_319452883968", 10.5, 500, true),
              SubAccountDetails("MFY_SUB_259811283666", 10.5, 1000, false)]
        )
  );
}
Show more
Monnify iOS SDK
Accept payments inside your iOS app via card, bank transfer, USSD, and phone number.


Card Payment
Bank Transfer
USSD Payment
Payment by Phone Number

Steps to Implementation
Add the SDK via CocoaPods. Add the following line to your Podfile:
Copy
pod 'MonnifyiOSSDK'
Access the shared SDK instance.
Copy
let monnify = Monnify.shared
Set your API key and contract code in AppDelegate.swift. Do this once at app startup. Switch to ApplicationMode.live for production builds.

AppDelegate.swift
Copy
let apiKey = "MK_PROD_XXXXXXXX"
let contractCode = "1234567890"
let mode = ApplicationMode.test

monnify.setApplicationMode(applicationMode: mode)
monnify.setApiKey(apiKey: apiKey)
monnify.setContractCode(contractCode: contractCode)
Specify the transaction parameters:
Copy
let parameter = TransactionParameters(
amount: Decimal(100),
currencyCode: "NGN",
paymentReference: "ASDF123454321",
customerEmail: "johndoe@example.com",
customerName: "John Doe",
customerMobileNumber: "08000000000",
paymentDescription: "Payment Description.",
incomeSplitConfig: [],
metaData: ["deviceType": "ios", "userId": "user314285714"],
paymentMethods: [PaymentMethod.card, PaymentMethod.accountTransfer],
tokeniseCard: false
)
Launch the payment modal when the customer taps Pay.
Copy
monnify.initializePayment(transactionParameters: parameter,
                        presentingViewController: self) { response in
// Handle response
}
