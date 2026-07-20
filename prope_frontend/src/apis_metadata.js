export const APIS_METADATA = [
  {
    name: "Obtain access token",
    method: "POST",
    url: "/api/v1/auth/login",
    tag: "Authenticate",
    description: "Issue an OAuth2 access token using your client credentials.",
    requestBody: {
      apiKey: "MK_TEST_ZHLW36C6V7",
      clientSecret: "WGB2M748U0N7KVHP3DL8EMT8SRWGA86P"
    },
    responseBody: {
      requestSuccessful: true,
      responseMessage: "success",
      responseCode: "0",
      responseBody: {
        accessToken: "eyJhbGciOi...",
        expiresIn: 86400
      }
    }
  },
  {
    name: "Fetch supported banks",
    method: "GET",
    url: "/api/v1/banks",
    tag: "Banks",
    description: "Fetch a list of all supported commercial banks and financial institutions.",
    requestBody: {},
    responseBody: {
      requestSuccessful: true,
      responseMessage: "success",
      responseCode: "0",
      responseBody: [
        { name: "Access Bank", code: "044" },
        { name: "Wema Bank", code: "035" },
        { name: "Sterling Bank", code: "232" }
      ]
    }
  },
  {
    name: "Account Name Enquiry",
    method: "GET",
    url: "/api/v1/disbursements/account/lookup",
    tag: "Validation",
    description: "Validate a destination bank account number and bank code to fetch the registered name.",
    requestBody: {
      accountNumber: "5772529181",
      bankCode: "232"
    },
    responseBody: {
      requestSuccessful: true,
      responseMessage: "success",
      responseCode: "0",
      responseBody: {
        accountName: "ACREWISE MONNIFY WALLET",
        accountNumber: "5772529181",
        bankCode: "232"
      }
    }
  },
  {
    name: "Check wallet balance",
    method: "GET",
    url: "/api/v1/disbursements/wallet-balance",
    tag: "Disbursements",
    description: "Check the available ledger balance on your active disbursement wallet.",
    requestBody: {},
    responseBody: {
      requestSuccessful: true,
      responseMessage: "success",
      responseCode: "0",
      responseBody: {
        availableBalance: 5000000.00,
        ledgerBalance: 5000000.00
      }
    }
  },
  {
    name: "Provision Reserved Account",
    method: "POST",
    url: "/api/v1/bank-transfer/reserved-accounts",
    tag: "Reserved Accounts",
    description: "Create a persistent dedicated bank account number for a customer/tenant to receive bank transfers.",
    requestBody: {
      accountReference: "tenant_ref_101",
      accountName: "John Doe Rent Account",
      customerEmail: "john@tenant.com",
      customerName: "John Doe"
    },
    responseBody: {
      requestSuccessful: true,
      responseMessage: "success",
      responseCode: "0",
      responseBody: {
        accountReference: "tenant_ref_101",
        accountName: "John Doe Rent Account",
        accounts: [
          {
            bankCode: "232",
            bankName: "Sterling bank",
            accountNumber: "6000140770"
          }
        ]
      }
    }
  },
  {
    name: "Initiate Single Payout",
    method: "POST",
    url: "/api/v1/disbursements/single",
    tag: "Disbursements",
    description: "Transfer funds from your wallet balance to a commercial bank account.",
    requestBody: {
      amount: 150000.00,
      reference: "payout_ref_30129",
      destinationBankCode: "035",
      destinationAccountNumber: "0068687503",
      narration: "Acrewise Landlord Settlement Payout"
    },
    responseBody: {
      requestSuccessful: true,
      responseMessage: "success",
      responseCode: "0",
      responseBody: {
        amount: 150000.00,
        reference: "payout_ref_30129",
        status: "PENDING",
        transactionReference: "MNFY|DISB|20261117..."
      }
    }
  },
  {
    name: "Check Payout Status",
    method: "GET",
    url: "/api/v1/disbursements/single/summary",
    tag: "Disbursements",
    description: "Query the status of an initiated payout transfer by its reference code.",
    requestBody: {
      reference: "payout_ref_30129"
    },
    responseBody: {
      requestSuccessful: true,
      responseMessage: "success",
      responseCode: "0",
      responseBody: {
        amount: 150000.00,
        reference: "payout_ref_30129",
        status: "SUCCESS",
        transactionDescription: "Transfer completed successfully."
      }
    }
  },
  {
    name: "Query Deposit Payment",
    method: "GET",
    url: "/api/v1/transactions/query",
    tag: "Transactions",
    description: "Verify the payment status of a virtual account checkout or reference payment.",
    requestBody: {
      transactionReference: "pay_ref_8829"
    },
    responseBody: {
      requestSuccessful: true,
      responseMessage: "success",
      responseCode: "0",
      responseBody: {
        paymentStatus: "PAID",
        amountPaid: 150000.00,
        transactionReference: "pay_ref_8829",
        paymentReference: "MNFY|04|20261117..."
      }
    }
  },
  {
    name: "Bill Payments Categories",
    method: "GET",
    url: "/api/v1/bill-payments/categories",
    tag: "Utilities",
    description: "Fetch all active utility categories (e.g. ELECTRICITY, AIRTIME, DATA, CABLE_TV).",
    requestBody: {},
    responseBody: {
      requestSuccessful: true,
      responseMessage: "success",
      responseCode: "0",
      responseBody: [
        { name: "Airtime Top-up", code: "AIRTIME" },
        { name: "Electricity", code: "ELECTRICITY" }
      ]
    }
  },
  {
    name: "Validate Bill Customer",
    method: "GET",
    url: "/api/v1/bill-payments/validation",
    tag: "Utilities",
    description: "Validate a customer meter number or smartcard ID before vending a utility bill.",
    requestBody: {
      productCode: "IKEDC_PREPAID",
      customerId: "04098273921"
    },
    responseBody: {
      requestSuccessful: true,
      responseMessage: "success",
      responseCode: "0",
      responseBody: {
        customerName: "Jane Tenant prepaid account",
        validationReference: "VAL_REF_01ae882"
      }
    }
  },
  {
    name: "Vend Utility Bill",
    method: "POST",
    url: "/api/v1/bill-payments/bills",
    tag: "Utilities",
    description: "Vend utility bills (Electricity token, Airtime, or Betting credits) on Monnify Sandbox.",
    requestBody: {
      productCode: "IKEDC_PREPAID",
      customerId: "04098273921",
      amount: 5000.00,
      reference: "meter_vend_382",
      validationReference: "VAL_REF_01ae882"
    },
    responseBody: {
      requestSuccessful: true,
      responseMessage: "success",
      responseCode: "0",
      responseBody: {
        vendStatus: "SUCCESS",
        amount: 5000.00,
        transactionReference: "MNFY|BILL|38291..."
      }
    }
  }
];
