Payment Methods
Monnify supports a range of payment methods so your customers can pay the way that suits them best. You can choose to offer all methods or restrict to specific ones per transaction.

Account Transfer (Bank Transfer)
The most popular payment method in Nigeria. When a customer selects this option, Monnify generates a dynamic virtual account number for that specific transaction. The customer transfers the exact amount to that account from any bank app or USSD code, and Monnify confirms the payment instantly.

Dynamic accounts: Each transaction gets a fresh virtual account, preventing mismatches.
Expiry: Accounts are valid for 40 minutes (2400 seconds). Notify your customer of this window.
Supported banks: Customers can pay from any Nigerian bank. See Supported Banks.
USSD code included: If you pass a bankCode when retrieving account details, Monnify also returns a USSD string the customer can dial.
SDK key: "ACCOUNT_TRANSFER"

Debit Card
Customers can pay using their Mastercard, Visa, or Verve debit card. Monnify handles the card collection flow within the checkout modal, including 3D Secure authentication where required.

Tokenization: Cards can be tokenized after a successful payment for future charges without the customer re-entering their details. See Card Tokenization.
USD support: Merchants enabled for international collection can accept card payments in USD.
PCI-DSS: If you want to build your own card collection UI using the raw Charge Card API, PCI-DSS certification is required. Contact integration-support@monnify.com.
SDK key: "CARD"

USSD
Customers dial a bank-specific USSD code to authorize the payment directly from their phone, with no internet connection required. This is ideal for customers without smartphones or in low-connectivity areas.

Monnify generates the USSD string as part of the bank transfer response when a bankCode is provided.
The same dynamic virtual account is used, and payment is confirmed the moment the USSD session completes.
SDK key: "USSD"

Phone Number
Customers enter their phone number to initialize a payment session. They then receive a prompt on their feature phone or smartphone to authorize the debit from their mobile money wallet.

SDK key: "PHONE_NUMBER"

Customer Reserved Account (Virtual Account)
A persistent virtual account number dedicated to a specific customer. Unlike the dynamic account used for one-time payments, a reserved account stays the same, and every transfer to it is automatically reconciled to that customer.

Best for:

Wallet top-ups (fintechs, betting platforms, investment apps)
Subscription billing via bank transfer
Utility payment collection (electricity, internet)
See Reserved / Virtual Accounts for full integration details.

Direct Debit / Mandate
A "pull" payment method. The merchant creates a mandate and the customer authorizes it once. After that, Monnify can automatically debit the customer's bank account on a schedule without them needing to initiate each payment.

Best for:

Loan repayments
Insurance premiums
SaaS subscription billing in Nigeria
See Direct Debit / Mandates for full integration details.

Controlling Which Methods Are Shown
By default, all available payment methods appear on the checkout. You can restrict them per transaction using the paymentMethods array in either the SDK initialization or the Initialize Transaction API payload.

JS/Web SDK (script tag) or npm packages (monnify-js for JavaScript, monnify-ts for TypeScript): pass paymentMethods: ["CARD", "ACCOUNT_TRANSFER"]
Initialize Transaction API: pass "paymentMethods": ["ACCOUNT_TRANSFER", "USSD", "PHONE_NUMBER"]
Flutter SDK: pass paymentMethods: [PaymentMethod.CARD, PaymentMethod.ACCOUNT_TRANSFER]
alert image
Note:
Omitting paymentMethods shows all available methods. Passing an empty array will cause an error, so always include at least one method.

Method Availability by Integration Type
Method	Checkout (SDK)	Checkout API	Reserved Account
Bank Transfer	✓	✓	✓
Debit Card	✓	✓ (PCI-DSS)	—
USSD	✓	✓	✓
Phone Number	✓	—	—
