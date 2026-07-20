import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:8080';
const SECRET_KEY = process.env.MONNIFY_SECRET_KEY;

// Utility to sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
  console.log('=== STARTING ACREWISE/PROPE BACKEND INTEGRATION TESTS ===\n');

  try {
    // 1. Test Health Check
    console.log('[Test 1] Querying health check...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    console.log('Health check response:', health);
    if (health.status !== 'UP') throw new Error('Health check status is not UP');
    console.log('✅ Health Check Passed!\n');

    // 2. Test GraphQL Queries
    console.log('[Test 2] Querying GraphQL getProperties...');
    const gqlQuery = {
      query: `
        query {
          getProperties {
            id
            title
            type
            status
            price
          }
        }
      `
    };
    const gqlRes = await fetch(`${BASE_URL}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gqlQuery)
    });
    const gqlData = await gqlRes.json();
    console.log('getProperties response:', JSON.stringify(gqlData, null, 2));
    if (gqlData.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(gqlData.errors)}`);
    }
    console.log('✅ GraphQL getProperties Query Passed!\n');

    // 3. Test Register User Profile via GraphQL Mutation
    console.log('[Test 3] Mutation: registerUserProfile...');
    const registerMutation = {
      query: `
        mutation {
          registerUserProfile(
            email: "test_tenant@prope.com",
            name: "Prope Tester",
            role: "TENANT"
          ) {
            id
            email
            role
            name
          }
        }
      `
    };
    const regRes = await fetch(`${BASE_URL}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerMutation)
    });
    const regData = await regRes.json();
    console.log('registerUserProfile response:', JSON.stringify(regData, null, 2));
    const tenantProfile = regData.data?.registerUserProfile;
    if (!tenantProfile || tenantProfile.email !== 'test_tenant@prope.com') {
      throw new Error('User profile registration failed');
    }
    console.log('✅ registerUserProfile Mutation Passed!\n');

    // 4. Test Sandbox Proxy: Fetch Banks List
    console.log('[Test 4] Proxy: Fetching supported banks...');
    const banksRes = await fetch(`${BASE_URL}/api/nomba-sandbox/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Fetch bank codes and names',
        method: 'GET',
        url: '/v1/transfers/banks'
      })
    });
    const banksData = await banksRes.json();
    console.log(`Fetched ${banksData.data?.length || 0} banks from Monnify Sandbox.`);
    if (banksData.code !== '00' || !Array.isArray(banksData.data)) {
      throw new Error(`Failed to fetch banks: ${JSON.stringify(banksData)}`);
    }
    const sampleBank = banksData.data[0];
    console.log('Sample bank fetched:', sampleBank);
    console.log('✅ Sandbox Proxy Fetch Banks Passed!\n');

    // 5. Test Sandbox Proxy: Perform Account Lookup (Name Enquiry)
    console.log('[Test 5] Proxy: Performing bank account lookup (Name Enquiry)...');
    // Using Moniepoint code (50515) or Sterling code (232) and sandbox account number
    const lookupRes = await fetch(`${BASE_URL}/api/nomba-sandbox/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Perform bank account lookup',
        method: 'POST',
        url: '/v1/transfers/bank/lookup',
        body: {
          accountNumber: '5772529181', // Monnify wallet account number from api.env
          bankCode: '50515' // Moniepoint code
        }
      })
    });
    const lookupData = await lookupRes.json();
    console.log('Account lookup response:', lookupData);
    // In sandbox it might return name error or succeed. We check code '00' or error details
    if (lookupData.code !== '00') {
      console.warn('⚠️ Account lookup returned code:', lookupData.code, '-', lookupData.description);
    } else {
      console.log('✅ Sandbox Proxy Account Lookup Passed!\n');
    }

    // 6. Test Sandbox Proxy: Create Reserved Account
    console.log('[Test 6] Proxy: Provisioning customer reserved account...');
    const accountRef = `test_ref_${Date.now()}`;
    const vaRes = await fetch(`${BASE_URL}/api/nomba-sandbox/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Create production virtual account',
        method: 'POST',
        url: '/v1/accounts/virtual',
        body: {
          accountRef: accountRef,
          accountName: 'Prope Test Virtual Account'
        }
      })
    });
    const vaData = await vaRes.json();
    console.log('Reserved account provisioned:', vaData);
    if (vaData.code !== '00' || !vaData.data?.bankAccountNumber) {
      throw new Error(`Failed to provision virtual account: ${JSON.stringify(vaData)}`);
    }
    const bankAccountNumber = vaData.data.bankAccountNumber;
    console.log('✅ Sandbox Proxy Create Reserved Account Passed!\n');

    // 7. Test Sandbox Proxy: Wallet Balance
    console.log('[Test 7] Proxy: Querying wallet balance...');
    const balRes = await fetch(`${BASE_URL}/api/nomba-sandbox/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Fetch live Nomba wallet balance',
        method: 'GET',
        url: '/v1/accounts/balance'
      })
    });
    const balData = await balRes.json();
    console.log('Wallet balance response:', balData);
    if (balData.code !== '00') {
      throw new Error(`Failed to query wallet balance: ${JSON.stringify(balData)}`);
    }
    console.log('✅ Sandbox Proxy Wallet Balance Query Passed!\n');

    // 8. Test Webhook Validation and Reconciliation Engine
    console.log('[Test 8] Webhook: Simulating rent collection webhook notification...');
    
    // First, let's create a Landlord, Property, and Tenancy in our database via GraphQL
    console.log('Registering landlord profile...');
    const landlordGql = await fetch(`${BASE_URL}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          mutation {
            createLandlord(name: "AcreWise Landlord", email: "landlord@test.com", phone: "08012345678") {
              id
              email
            }
          }
        `
      })
    });
    const landlordData = await landlordGql.json();
    const landlordId = landlordData.data?.createLandlord?.id;
    console.log('Landlord ID:', landlordId);

    console.log('Creating rental property...');
    const propertyGql = await fetch(`${BASE_URL}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          mutation {
            createProperty(landlordId: "${landlordId}", title: "Unit 3B Ocean View", type: "RENT", status: "LISTED") {
              id
              status
            }
          }
        `
      })
    });
    const propertyData = await propertyGql.json();
    const propertyId = propertyData.data?.createProperty?.id;
    console.log('Property ID:', propertyId);

    console.log('Creating lease tenancy with reserved account number...');
    const tenancyGql = await fetch(`${BASE_URL}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          mutation {
            createTenancy(
              propertyId: "${propertyId}",
              tenantId: "test_tenant@prope.com",
              rentAmount: 150000.00,
              frequency: "MONTHLY",
              nextDueDate: "2026-08-01",
              nombaVirtualAccountId: "${bankAccountNumber}",
              nombaOrderReference: "order_ref_${accountRef}"
            ) {
              id
              nombaVirtualAccountId
              rentAmount
              nextDueDate
            }
          }
        `
      })
    });
    const tenancyData = await tenancyGql.json();
    const tenancy = tenancyData.data?.createTenancy;
    console.log('Tenancy created:', tenancy);

    // Verify it was created successfully
    if (!tenancy) {
      throw new Error(`Failed to create test tenancy: ${JSON.stringify(tenancyData)}`);
    }

    // Now, build mock webhook payload
    const webhookPayload = {
      eventType: 'SUCCESSFUL_TRANSACTION',
      eventData: {
        product: {
          reference: accountRef,
          type: 'RESERVED_ACCOUNT'
        },
        transactionReference: `tx_ref_${Date.now()}`,
        paymentReference: `pay_ref_${Date.now()}`,
        paidOn: new Date().toISOString(),
        paymentDescription: 'Rent payment',
        destinationAccountInformation: {
          bankCode: '50515',
          bankName: 'Moniepoint Microfinance Bank',
          accountNumber: bankAccountNumber
        },
        amountPaid: 150000.00,
        totalPayable: 150000.00,
        paymentMethod: 'ACCOUNT_TRANSFER',
        currency: 'NGN',
        paymentStatus: 'PAID',
        customer: {
          name: 'Prope Tester',
          email: 'test_tenant@prope.com'
        }
      }
    };

    const stringifiedPayload = JSON.stringify(webhookPayload);
    const signature = crypto
      .createHmac('sha512', SECRET_KEY)
      .update(stringifiedPayload)
      .digest('hex');

    console.log('Sending mock transaction webhook with signature...');
    const webhookRes = await fetch(`${BASE_URL}/api/webhooks/monnify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'monnify-signature': signature
      },
      body: stringifiedPayload
    });

    const webhookResultText = await webhookRes.text();
    console.log('Webhook server response:', webhookResultText);
    if (!webhookRes.ok || !webhookResultText.includes('Reconciliation completed')) {
      throw new Error(`Webhook reconciliation failed: ${webhookResultText}`);
    }
    console.log('✅ Webhook Signature & Matching Reconciliation Passed!\n');

    // 9. Query Tenancy after webhook matching to verify due date advanced
    console.log('[Test 9] GQL: Verifying lease agreement status update post-webhook...');
    const verifyTenancyGql = await fetch(`${BASE_URL}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query {
            getTenancy(id: "${tenancy.id}") {
              id
              balance
              nextDueDate
            }
          }
        `
      })
    });
    const verifyTenancyData = await verifyTenancyGql.json();
    const updatedTenancy = verifyTenancyData.data?.getTenancy;
    console.log('Updated Tenancy ledger details:', updatedTenancy);
    
    // Original due date was "2026-08-01", since it was matching exact rentAmount of 150000,
    // due date should advance to "2026-09-01" and balance should be 0.
    if (updatedTenancy.nextDueDate !== '2026-09-01' || parseFloat(updatedTenancy.balance) !== 0) {
      throw new Error('Reconciliation did not advance due date or reset balance correctly');
    }
    console.log('✅ Tenancy ledger successfully updated and advanced!\n');

    console.log('🎉 ALL INTEGRATION TESTS COMPLETED SUCCESSFULLY! 🎉');

  } catch (err) {
    console.error('\n❌ TEST RUN FAILED:', err);
    process.exit(1);
  }
}

runTests();
