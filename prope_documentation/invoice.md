Invoice
Monnify Invoicing allows you to generate invoices for your customers using our Create Invoice API. When you create an invoice, Monnify either generates a unique virtual account number tied to that invoice or provides a checkout URL so customers can make payments directly with their debit cards.

Types of Invoices
Monnify supports two types of invoices: Static Invoices and Dynamic Invoices. Both are created using the same Create Invoice API but differ in how virtual accounts are generated and used.

Feature	Static Invoice	Dynamic Invoice
Virtual Account Number	Same account reused for a specific customer	New account generated for every invoice
Account Availability	Dormant until attached to an active invoice	Active only for the duration of that invoice
Use Case	Recurring billing, subscriptions, repeat customers	One-time payments, single-use invoices
Post-Payment Behavior	Account becomes dormant until next invoice	Account expires and cannot be reused
KYC Requirement	Requires customer BVN or NIN to reserve the account	No BVN/NIN required
1. Static Invoicing (Invoice Reserved Accounts)
Static invoicing is ideal when you bill the same customer repeatedly, for example, subscriptions, recurring services, or regular payments. Instead of generating a new virtual account number each time, Monnify lets you reserve a dedicated account number for that customer. This account number stays the same across all future invoices you send them, but it can only accept payments when attached to an active invoice.

alert image
Info:
Important: Reserving a virtual account requires the customer's BVN or NIN to comply with regulatory KYC requirements. Once the account is reserved, you can generate as many invoices as needed without repeating the KYC step.

Steps to Implement Static Invoicing
Follow these steps to set up and use static invoicing in your integration:


Reserve a Virtual Account: Use the Create Invoice Reserved Account API to reserve a dedicated account for a customer. You will need to provide the customer’s BVN or NIN as part of this process. The response will include a accountReference that uniquely identifies the reserved account.

Attach an Invoice to the Reserved Account: Once the account is reserved, use the Create Invoice API to generate an invoice linked to that reserved account. You must pass the accountReference you obtained earlier in the request payload. The invoice will use the same virtual account number every time.

Send Invoice to Customer: Share the generated invoice details with your customer. They can pay by transferring funds into the reserved account or through the provided checkout URL.

Handle Post-Payment Behavior: Once the invoice is paid, it expires immediately and the reserved account goes dormant. It remains inactive until a new invoice is generated for that customer.


Key characteristics:
A single virtual account number is reserved for a customer and reused for every invoice you send them.

Customers cannot make payments into this account unless it’s attached to an active invoice.

After payment, the invoice closes, and the account becomes dormant until the next invoice is generated.

Requires customer BVN or NIN during the initial reservation step.

Ideal for recurring billing, subscription-based services, or repeat customers.

Sample Request – Static Invoice
cURL
JavaScript
Python
PHP
Copy
curl -X POST https://sandbox.monnify.com/api/v1/invoice/create \
-H "Authorization: Bearer <accessToken>" \
-H "Content-Type: application/json" \
-d ‘{
  "invoiceReference": "INV-2024-001",
  "amount": 5000,
  "accountReference": "abc123",
  "invoiceDescription": "Monthly subscription invoice",
  "contractCode": "8389328412",
  "customerEmail": "john@example.com",
  "customerName": "John Doe",
  "expiryDate": "2024-07-31 23:59:59",
  "currencyCode": "NGN"
}’
2. Dynamic Invoicing
Dynamic invoicing is the simplest and most flexible way to bill customers. Each time you create an invoice, Monnify automatically generates a unique virtual account number tied to that specific invoice. Once the invoice is paid, it expires immediately, and the account number is no longer valid.


This approach is ideal when you do not bill the same customer repeatedly or when you want a fresh virtual account for every transaction. It requires no prior account reservation or KYC step.



Steps to Implement Dynamic Invoicing
Follow these steps to set up and use dynamic invoicing in your integration:


Create an Invoice: Call the Create Invoice API endpoint to generate a new invoice. A virtual account number will be automatically created and linked to that invoice.

Send Invoice to Customer: Share the invoice details with your customer. They can pay by transferring funds into the generated virtual account number or by using the provided checkout URL.

Handle Post-Payment Behavior: Once payment is made, the invoice expires immediately. Since a new virtual account is generated for each invoice, subsequent invoices will each have their own dedicated account numbers.


Key characteristics:
A new virtual account number is generated for every invoice created.

No prior account reservation or BVN/NIN is required.

Once paid, the invoice expires immediately, and the virtual account is no longer active.

Ideal for one-time payments, unique transactions, or scenarios where customers vary frequently.

Sample Request – Dynamic Invoice
cURL
JavaScript
Python
PHP
Copy
curl -X POST https://sandbox.monnify.com/api/v1/invoice/create \
-H "Authorization: Bearer <accessToken>" \
-H "Content-Type: application/json" \
-d '{
  "invoiceReference": "INV-2024-002",
  "amount": 10000,
  "invoiceDescription": "One-time service payment",
  "contractCode": "8389328412",
  "customerEmail": "jane@example.com",
  "customerName": "Jane Smith",
  "expiryDate": "2024-07-15 23:59:59",
  "currencyCode": "NGN"
}'

Additional Notes:
For static invoices, once an invoice expires or is paid, the reserved account simply goes dormant until a new invoice is created.

For dynamic invoices, a new virtual account is generated for every new invoice, and previous account numbers cannot be reused.



Sample Error Messages
Error Message	Meaning	Action
Invoice with this reference already exists.

This implies that the invoiceReference in the request payload has already been used by you.

Retry with a unique invoiceReference

Unknown Contract Code provided.

The contractCode in the request parameter is not correct or it doesn’t belong to the merchant.

Navigate to the "Settings > Contract Setup", section of your Monnify dashboard to get your contact code

Amount must be greater than 20.

This implies that the amount field in the request payload must be at least 20 Naira

Increase the amount above N20
Unknown currency code supplied.

The currency code supplied is not valid or not enabled on your account. NGN is the default supported currency; USD is only available for merchants specifically enabled for card-based USD collection.

Reconfirm that NGN is the currency code provided.

Invalid invoice expiry date.	
This implies that the expiryDate in the request payload is before the current date.

Invoice expiry date should be beyond current time.

Invalid invoice expiry date format

This implies that the expiryDate in the request payload is not in the correct format.

Change invoice expiry date format to match yyyy-MM-dd HH:mm:ss.
