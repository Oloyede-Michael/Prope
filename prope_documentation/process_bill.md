Process a Bill
The Monnify Bills Payment feature allows all Monnify merchants to Vend and Process Bills using their existing Monnify account. This includes services like Utility Bills, Airtime Topup, and other essential bills.

alert image
Info:
Activation: The Bills Payment service is not active for all Monnify Merchants by default. To enable it for your account, you must send an activation request via email to: integration-support@monnify.com.
Authentication
Access to the Bills Payment product is secured using Bearer Token authentication.


To use the service, first obtain an Access Token by authenticating with your API Key and Client Secret, which you can find on your Monnify dashboard. Include this token in the Authorization: Bearer `token` header of all requests.

Bill Payment Workflow
Integrating the Bill Payment product involves a high-level sequence of steps to ensure customers select the correct service and that their details are validated before any funds are debited.

Step	Action	Description	Key Requirement
1	Get Categories	Display a list of general bill types (e.g., ELECTRICITY, CABLE_TV) for the user to select from.	None
2	List Billers	Show all available service providers (e.g., specific electricity companies) that fall under the selected category.	Category Code
3	List Products	Fetch the specific products offered by the selected biller (e.g., Prepaid Meter, Postpaid Meter, various Data Bundles).	Biller Code
4	Validate Customer	Required Step. The customer enters their unique identifier (e.g., meter number, phone number). The system validates these details before payment can proceed.	Product Code & Customer ID
5	Vend Bill (Process Payment)	Once validation is successful, initiate the actual payment transaction by sending the amount and the unique validation reference.	Validation Reference
6	Check Transaction Status (Requery)	Check the current status of a vend request (e.g., if it is still IN_PROGRESS, SUCCESS, or FAILED). Note: This is not used to initiate a new payment. It is only for status verification.	Transaction Reference
How it works
Consuming the Monnify Bills Payment service generally involves three primary phases: Discovery, Validation, and Vending.

Discovery (Finding Billers and Products)
Before a payment can be processed, you must identify the relevant biller and product using the following endpoints:
Retrieve Biller Categories: Use the GET Biller Categories endpoint to list all available categories (e.g., ELECTRICITY, DATA, CABLE_TV).
Retrieve List of Billers: Use the GET Billers endpoint to retrieve all active billers available for payment. This list can be filtered using the categoryCode.
Retrieve Available Products: Use the GET Billers product endpoint to fetch a list of available products offered by different billers. This list must be filtered using the specific billerCode.
Validation (Verifying Customer Details)
Validation is an important step performed before attempting a final payment. It confirms customer information (e.g., meter number, phone number) and tells you whether a validationReference is required for the product.
Endpoint: Perform customer validation using the POST method on validate customer.
Request Payload: Requires productCode and customerId.
Successful Response:
The response includes a vendInstruction object.
This object indicates whether the product requires a validation reference:
requireValidationRef: true → a validationReference will be included and must be used in the vend request.
requireValidationRef: false → no validation reference is required, and you should not send one during the vend request.
Vending (Executing Payment)
This step executes the actual bill payment and charges the customer.
Endpoint: Process payments using the POST method on vend.
Required Inputs:
productCode
customerId
vendAmount
A merchant-supplied vendReference (could be random but should be unique for you per transaction)
If required: include validationReference only when requireValidationRef was true in the validation response.
Validation Reference Requirement:
Include the validationReference when the product requires it.
Exclude the validationReference when requireValidationRef is false.
Successful Vend: A successful response returns:
Monnify-generated transactionReference
Your (merchant) supplied vendReference
vendStatus (which will be SUCCESS when the payment is completed)
Status Check/Requery: If a vend initially returns "IN_PROGRESS" or its final status is uncertain:
Use the GET Bills payment requery endpoint to check the updated status. This endpoint does not re-charge or re-initiate payment. It only confirms the final status (SUCCESS, FAILED, or still IN_PROGRESS).
Key Concept: Pre-Validation
The Validation step (Step 4) is critical. Before you can process a bill (Step 5), you must successfully validate the customer's ID against the chosen product. A successful validation generates a unique Validation Reference, which acts as a secure key required to successfully complete the final Vend request. This ensures that the payment is directed to the correct customer account.

Error Handling / Validation Failure
If the validation step fails (e.g. invalid customerId), the API will return an error response, and you should handle this by showing an appropriate error message to the user and not calling the vend endpoint. In case the vend call returns an IN_PROGRESS status, you should poll the “Check Transaction Status” endpoint until you receive a terminal status (SUCCESS or FAILED) or until a timeout / retry limit is reached.

Next Steps
For detailed information on URLs, HTTP methods, and data fields for each step above, see the Bill Payment API Reference
