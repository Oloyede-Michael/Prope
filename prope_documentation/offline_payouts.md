Offline Pay-outs (Paycode)
Offline disbursements are cash payments made by the merchant to their customers through a Paycode generated on the Monnify platform. This feature allows customers to withdraw cash from a Moniepoint Business Owner.

alert image
Info:
FEE: For offline disbursements done using paycodes, a flat fee of N 100 will be charged.
Paycode Definition and Features
A Paycode is a short form for a payment code. It is a 10-digit number that a merchant generates and provides to a customer to withdraw cash at a Moniepoint Agent.


Merchants generate this paycode and provide it to customers who then take this paycode to any Moniepoint business owners close by. Once the paycode is shown to the agent, the paycode is verified and the amount tied to the paycode is given to the customer in cash while the merchant account is debited of the amount.


Key features of a paycode include:

The Generated code: A 10-digit number.
Beneficiary Name: Beneficiary of a paycode.
Status:The status of the paycode could be Pending, Success, Expired, or Cancelled.
Created Date: This is the date that the paycode was created.
Expiry Date: This is a date in the future when the paycode will expire.
Reference: Unique reference per merchant for each paycode.
Workflow and How It Works
Offline Disbursement - Monnify Dashboard
Merchant generates paycode on the Monnify platform.
Merchant shares paycode with their customer.
Customer visits Moniepoint business owners.
Customer provides paycode.
Moniepoint verifies the paycode by calling the Monnify validation endpoint.
Monnify debits merchants and returns responses to Moniepoint.
Moniepoint business owners gives cash to the customer.
Paycode Generation
Merchants can generate paycode for their customers from their dashboard by using the create new paycode button.

Upon clicking the Create New Paycode button, you are redirected to a page to provide details that should be linked with the paycode which is what the Moniepoint business owners will use to verify the transaction before releasing funds to the your customers. Details to be provided include beneficiary name (name of customer for funds to be disbursed to), amount to be disbursed, reference, and also expiry date (If expiry date for paycode is not defined, it will expire by default after 24 hours) as shown;

Paycode Generation - Monnify Dashboard
And after filling in the required details, he can click on the make transfer button to complete the transfer process.

Paycode API
Paycodes can also be generated using the Paycode generation APIs. Below is a list of endpoints required for paycode management.

Create Paycode: This endpoint helps generate a paycode for a transaction, check Create Paycode API for more information.
Cancel Paycode: This endpoint helps to cancel a paycode after it has been created, check Cancel Paycode API for more information.
Get Paycode: This endpoint is called to get details of a paycode that has been created. The paycode returned is always masked as a layer of security. check Get Paycode API for more information.
Get Clear Paycode: This endpoint provides a clear view of the paycode once authorization is provided, check Get Clear Paycode API for more information.
Fetch Paycodes: This endpoint provides all paycodes that have been created within a specific period, check Fetch Paycode API for more information.

When a Paycode is created or used, it’s list of possible status are outlined as follows;


PENDING - Ready to be used but not used.
SUCCESS - Has been utilized successfully.
EXPIRED - Has been automatically expired having exhausted the configured lifespan.
CANCELLED - Was canceled by the user.

In general, all offline products can easily be tested from the Simulator tab on the developer section of the monnify dashboard.
