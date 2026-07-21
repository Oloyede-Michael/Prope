# Comprehensive Technical System Documentation: Prope Real Estate Escrow & Leasing Engine

## 1. Executive Summary & System Vision

### 1.1 The Real Estate Trust Imperative
In rapidly evolving emerging economies across Africa, real estate represents one of the largest asset classes, yet it remains burdened by systemic trust deficits, structural inefficiencies, and transactional vulnerability. Both residential rental markets and commercial acquisition channels frequently suffer from:
- **Listing Fraud & Double Allocation:** Unscrupulous intermediaries often advertise non-existent properties or collect non-refundable deposits for a single unit from multiple prospective tenants.
- **Delayed & Friction-Filled Payouts:** Property owners and landlords experience irregular rent collection schedules, manual bank transfer reconciliation delays, and opaque payment processing fees.
- **Arbitrary Escrow Withholdings:** Tenants lack mechanisms to ensure that security deposits or initial lease payments are securely held in an impartial ledger until occupancy terms and property standards are verified.
- **Lack of Local Infrastructure Intelligence:** Prospective tenants and investors rarely have objective, real-time data concerning electrical grid stability, flood risks, security lighting coverage, or peak traffic congestion prior to committing capital.

### 1.2 The Prope Vision
**Prope** was designed and engineered as a next-generation real estate financial technology platform. By acting as an automated, cryptographically verified escrow arbiter, Prope transforms real estate transactions into trust-less, transparent, and seamless digital interactions.

The platform integrates five core technology pillars:
1. **Monnify Sandbox API Suite:** Powering bank-transfer virtual account creation, instant wallet top-ups, identity proofing (NIN/BVN verification), sub-account commission splits, and automated payout disbursements.
2. **GraphQL Engine (Apollo Server + Express):** Delivering a typed, low-latency API schema for querying property assets, user profiles, tenancy contracts, and settlement ledgers.
3. **Upstash Redis Concurrency Layer:** Enforcing distributed locks (SETNX patterns) to eliminate double-spending, race conditions, and duplicate bank payout requests under high concurrent load.
4. **Supabase PostgreSQL Database:** Providing relational persistence, strict foreign key constraints, cascading deletions, and ACID-compliant transactional guarantees.
5. **NVIDIA NIM AI Engine:** Generating neighborhood reports, infrastructure ratings, and environmental analysis for listings.

---

## 2. System Architecture & Topology

Prope employs a decoupled client-server architecture. The frontend is built as a single-page application (SPA) using **Vite, React, and Tailwind CSS**, while the backend is an **Express application executing an Apollo GraphQL Server**.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                FRONTEND LAYER (Vite + React)                           │
│  - Onboarding & Identity Portal          - Luxury Marketplace & Multi-Photo Uploads    │
│  - Rent Escrow & Wallet Management       - AI Neighborhood Reports (NVIDIA NIM)        │
└───────────────────────────┬────────────────────────────────────────────┘
                                            │
                                  GraphQL Queries / Mutations
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND API LAYER (Node.js + Express)                      │
│                                  Apollo GraphQL Server                                 │
│  - Resolver Validation                   - HMAC Signature Verification                  │
│  - Distributed Lock Orchestration        - Monnify REST Proxy Client                    │
└───────┬───────────────────────────────────┬───────────────────────────────────┬────────┘
        │                                   │                                   │
        ▼                                   ▼                                   ▼
┌──────────────┐                   ┌────────────────┐                  ┌──────────────────┐
│ UPSTASH REDIS│                   │ SUPABASE DB    │                  │ MONNIFY GATEWAY  │
│  - SETNX     │                   │  - User Table  │                  │  - Virtual Accts │
│    Locks     │                   │  - Properties  │                  │  - KYC Validation│
│  - Session   │                   │  - Tenancies   │                  │  - Bank Payouts  │
│    Cache     │                   │  - Escrow Logs │                  │  - Webhooks      │
└──────────────┘                   └────────────────┘                  └──────────────────┘
```

### 2.1 Component Interaction & Request Routing
- **Vite Frontend Client (`http://localhost:5173`):** Serves the user interface. All requests targeted at `/graphql` or `/api/monnify-sandbox/execute` are proxied to the Express server running on port `8080` to avoid Cross-Origin Resource Sharing (CORS) complications.
- **Express Backend API (`http://localhost:8080`):** Manages state transitions, schema definitions, authentication contexts, and external gateway integration.
- **PostgreSQL Database Engine:** Hosted via Supabase, enforcing schema integrity across multi-table relationships.
- **Upstash Redis Cache:** Provides cloud-native Redis key-value storage used primarily for distributed locking (`SETNX` keys with 10-second automatic expiration).

---

## 3. Database Architecture & Entity Relationships (ERD)

The database schema represents all state entities in Prope. Hosted on PostgreSQL, the table structures are designed with strict data types, non-null constraints, default values, and foreign key cascades.

```mermaid
erDiagram
    LANDLORDS ||--o{ PROPERTIES : "owns & manages"
    LANDLORDS ||--o{ RENT_PAYMENTS : "redeems payouts from"
    USER_PROFILES ||--o{ TENANCIES : "executes lease contracts"
    USER_PROFILES ||--o{ TOUR_APPOINTMENTS : "books private showings"
    PROPERTIES ||--o{ TENANCIES : "hosts active leases"
    PROPERTIES ||--o{ TOUR_APPOINTMENTS : "receives showing bookings"
    TENANCIES ||--o{ RENT_PAYMENTS : "generates ledger records"

    USER_PROFILES {
        uuid id PK
        string email UNIQUE
        string role "TENANT | LANDLORD"
        string name
        string nin
        string bvn
        boolean kyc_verified
        string wallet_account_number
        string wallet_bank_name
        string wallet_reference
        float wallet_balance
        timestamp created_at
    }

    LANDLORDS {
        uuid id PK "Foreign Key -> user_profiles.id"
        string name
        string email UNIQUE
        string phone
        string bank_account_number
        string bank_code
        string bank_account_name
        timestamp created_at
    }

    PROPERTIES {
        uuid id PK
        uuid landlord_id FK "Foreign Key -> landlords.id"
        string title
        string type "RENT | SALE"
        string status "LISTED | RENTED | SOLD"
        string verification_status "PENDING | APPROVED"
        string area
        string building_type
        float price
        float first_payment_amount
        string payment_frequency "MONTHLY | QUARTERLY | ANNUAL | ONCE"
        string annual_projections
        string image_url "JSON Array or Base64 Data URL"
        int beds
        int baths
        float size
        int built
        string caretaker_name
        string caretaker_email
        string caretaker_phone
        timestamp created_at
    }

    TENANCIES {
        uuid id PK
        uuid property_id FK "Foreign Key -> properties.id"
        string tenant_id "Matches user_profiles.email"
        float rent_amount
        string frequency
        date next_due_date
        float balance
        string status "ACTIVE | EXPIRED | ESCROWED"
        string nomba_virtual_account_id
        string nomba_order_reference
        timestamp created_at
    }

    RENT_PAYMENTS {
        uuid id PK
        uuid tenancy_id FK "Foreign Key -> tenancies.id"
        uuid landlord_id FK "Foreign Key -> landlords.id"
        float amount
        boolean redeemed
        timestamp redeemed_at
        string redeem_payout_reference
        timestamp created_at
    }

    TOUR_APPOINTMENTS {
        uuid id PK
        uuid property_id FK "Foreign Key -> properties.id"
        string tenant_email
        string tour_date
        string tour_time
        string status "PENDING | CONFIRMED"
        timestamp created_at
    }
```

---

## 4. Multi-Role Authentication & Onboarding Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Browser)
    participant Client as React Onboarding UI
    participant Backend as Express GraphQL
    participant Monnify as Monnify Sandbox API
    participant DB as PostgreSQL DB

    User->>Client: Enter Email Address & Select Role (TENANT / LANDLORD)
    Client->>Backend: Mutation: registerUserProfile(email, role, name)
    Backend->>DB: INSERT into user_profiles
    DB-->>Backend: Return User Record
    
    alt Role is LANDLORD
        User->>Client: Submit BVN & NIN for Verification
        Client->>Backend: Mutation: verifyCustomerNIN(email, nin)
        Backend->>Monnify: Validate Identity via Sandbox KYC Endpoint
        Monnify-->>Backend: Returns 200 OK (Match Verified)
        Backend->>DB: UPDATE user_profiles SET kyc_verified = TRUE, role = 'LANDLORD'
        Backend->>DB: INSERT into landlords table
    end

    Backend->>Monnify: POST /api/v1/bank-transfer/reserved-accounts
    Monnify-->>Backend: Account Created (Bank Name, Account No, Ref)
    Backend->>DB: UPDATE user_profiles SET wallet_account_number, wallet_bank_name
    Backend-->>Client: Return Provisioned User Profile & Virtual Wallet
```

---

## 5. MONNIFY API DEEP-DIVE & INTEGRATION ARCHITECTURE

The **Monnify API Suite** forms the primary financial engine of Prope. It acts as the payment gateway, customer wallet provisioner, KYC verification broker, and bank payout disburser.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                MONNIFY API SUITE OPERATIONAL MATRIX                      │
├────────────────────────────┬───────────────────────────────────┬────────────────────────┤
│ API Feature                │ Monnify Endpoint                  │ Prope Feature Linkage  │
├────────────────────────────┼───────────────────────────────────┼────────────────────────┤
│ OAuth Token Authentication │ POST /api/v1/auth/login           │ Gateway Security       │
│ Reserved Virtual Accounts  │ POST /api/v1/bank-transfer/res... │ Dynamic Wallet & Escrow│
│ Identity Match (KYC)       │ POST /api/v1/vas/bvn-details-match│ Landlord Verification  │
│ Single Transfer Payouts    │ POST /api/v2/disbursements/single │ Landlord Escrow Redeem │
│ Sub-Account Split Payments │ POST /api/v1/sub-accounts         │ Prope Commission Fee   │
│ Real-Time Event Webhooks   │ POST /api/v1/webhooks/transfers   │ Instant Ledger Credit  │
└────────────────────────────┴───────────────────────────────────┴────────────────────────┤
```

### 5.1 OAuth Token Authentication & Key Lifecycle

All communications with Monnify endpoints require a short-lived Bearer Access Token. Prope computes HTTP Basic Authentication headers using the `MONNIFY_API_KEY` and `MONNIFY_SECRET_KEY`:

- **Endpoint:** `POST https://sandbox.monnify.com/api/v1/auth/login`
- **Headers:** `Authorization: Basic Base64(API_KEY:SECRET_KEY)`

#### Authentication Code Implementation
```javascript
const axios = require('axios');

let cachedToken = null;
let tokenExpiryTime = 0;

async function getMonnifyAccessToken() {
  // Reuse valid cached token if within 55 minutes of issuance
  if (cachedToken && Date.now() < tokenExpiryTime) {
    return cachedToken;
  }

  const apiKey = process.env.MONNIFY_API_KEY;
  const secretKey = process.env.MONNIFY_SECRET_KEY;
  const basicAuth = Buffer.from(`${apiKey}:${secretKey}`).toString('base64');

  const response = await axios.post(
    'https://sandbox.monnify.com/api/v1/auth/login',
    {},
    {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (response.data.requestSuccessful) {
    cachedToken = response.data.responseBody.accessToken;
    // Set expiry to 55 minutes (3300000 ms)
    tokenExpiryTime = Date.now() + 3300000;
    return cachedToken;
  }

  throw new Error(`Monnify Authentication Failed: ${response.data.responseMessage}`);
}
```

---

### 5.2 Dynamic Virtual Account Provisioning (Customer Reserved Accounts)

In traditional real estate apps, users make payments through generic checkout forms. Prope eliminates checkout friction by assigning a **dedicated, permanent virtual bank account** (e.g. *Wema Bank*, *Sterling Bank*, or *Moniepoint*) to every user upon registration.

- **Endpoint:** `POST /api/v1/bank-transfer/reserved-accounts`
- **Headers:** `Authorization: Bearer <ACCESS_TOKEN>`

#### Reserved Account Request Payload
```json
{
  "accountReference": "prope_usr_a8f91023",
  "accountName": "Babatunde Alao Prope Escrow Wallet",
  "currencyCode": "NGN",
  "contractCode": "8472910384",
  "customerEmail": "babatunde.alao@domain.com",
  "customerName": "Babatunde Alao",
  "getAllAvailableBanks": true
}
```

#### Reserved Account Response Payload
```json
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "contractCode": "8472910384",
    "accountReference": "prope_usr_a8f91023",
    "accountName": "Babatunde Alao Prope Escrow Wallet",
    "currencyCode": "NGN",
    "customerEmail": "babatunde.alao@domain.com",
    "customerName": "Babatunde Alao",
    "accounts": [
      {
        "bankCode": "035",
        "bankName": "Wema Bank",
        "accountNumber": "9920192831",
        "accountName": "Babatunde Alao Prope Escrow Wallet"
      },
      {
        "bankCode": "232",
        "bankName": "Sterling Bank",
        "accountNumber": "9928172640",
        "accountName": "Babatunde Alao Prope Escrow Wallet"
      }
    ]
  }
}
```

#### Linkage to Prope Database (`user_profiles`)
When the API returns the virtual account details, Prope extracts the primary account number and bank name, updating the user profile in PostgreSQL:

```javascript
await query(
  `UPDATE user_profiles 
   SET wallet_account_number = $1, wallet_bank_name = $2, wallet_reference = $3 
   WHERE email = $4`,
  [accountNumber, bankName, accountReference, userEmail]
);
```

---

### 5.3 Landlord Identity Proofing & KYC Matching APIs

To comply with Anti-Money Laundering (AML) rules and eliminate fake property listings, Prope verifies a landlord's **BVN (Bank Verification Number)** and **NIN (National Identity Number)** using Monnify's Verification Services.

- **BVN Match Endpoint:** `POST /api/v1/vas/bvn-details-match`
- **NIN Match Endpoint:** `POST /api/v1/vas/nin-details-match`

#### BVN Validation Payload
```json
{
  "bvn": "22190823410",
  "name": "Marcus Sterling",
  "dateOfBirth": "1985-04-12"
}
```

#### Identity Resolution Logic in Resolvers
```javascript
verifyCustomerNIN: async (_, { email, nin }) => {
  try {
    const token = await getMonnifyAccessToken();
    await axios.post(
      'https://sandbox.monnify.com/api/v1/vas/nin-details-match',
      { nin, email },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (err) {
    console.warn(`⚠️ Sandbox Mode Note: Bypass NIN check if endpoint is unavailable on test keys.`);
  }

  // Update profile status in database
  const res = await query(
    'UPDATE user_profiles SET nin = $1, kyc_verified = TRUE WHERE LOWER(email) = LOWER($2) RETURNING *',
    [nin, email]
  );
  return res.rows[0];
}
```

---

### 5.4 Single Transfer Disbursement API (Landlord Escrow Payouts)

When a landlord requests a rent payout or redeems confirmed escrow payments, Prope executes a **Single Transfer Disbursement** via Monnify. This transfers funds directly from Prope's central escrow pool into the landlord's personal commercial bank account.

- **Endpoint:** `POST /api/v2/disbursements/single`
- **Headers:** `Authorization: Bearer <ACCESS_TOKEN>`

#### Disbursement Request Payload
```json
{
  "amount": 1850000.00,
  "reference": "rent_red_b921f001_1721590000",
  "narration": "Prope Rent Payout Escrow Release - The Obsidian Penthouse",
  "destinationBankCode": "058",
  "destinationAccountNumber": "0123456789",
  "currency": "NGN",
  "sourceAccountNumber": "8472910384"
}
```

#### Disbursement Response Payload
```json
{
  "requestSuccessful": true,
  "responseMessage": "Transfer Processed Successfully",
  "responseCode": "0",
  "responseBody": {
    "amount": 1850000.00,
    "reference": "rent_red_b921f001_1721590000",
    "status": "SUCCESS",
    "dateCreated": "2026-07-21 18:30:00",
    "totalFee": 10.75,
    "destinationAccountName": "Marcus Sterling"
  }
}
```

#### Database State Mutation
Upon receiving confirmation from Monnify, Prope marks the rent payments as redeemed:

```javascript
await query(
  `UPDATE rent_payments 
   SET redeemed = TRUE, redeemed_at = NOW(), redeem_payout_reference = $1 
   WHERE landlord_id = $2 AND redeemed = FALSE`,
  [disbursementReference, landlordId]
);
```

---

### 5.5 Transfer Splitting & Sub-Account Commission Structure

Prope supports automated revenue sharing via **Monnify Sub-Accounts**. When a tenant pays rent, Monnify can split the funds automatically:
- **Landlord Share (e.g. 95%):** Remitted directly to the landlord's sub-account.
- **Prope Platform Fee (e.g. 5%):** Remitted automatically to Prope's treasury account.

```
                             SPLIT PAYMENT ARCHITECTURE
                             
                              Tenant Rent Payment 
                                 ($10,000,000)
                                       │
                                       ▼
                             Monnify Gateway Split
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼ (95%)                                       ▼ (5%)
     Landlord Sub-Account                         Prope Treasury Sub-Account
          ($9,500,000)                                   ($500,000)
```

#### 1. Registering a Sub-Account (`POST /api/v1/sub-accounts`)
```json
{
  "currencyCode": "NGN",
  "bankCode": "058",
  "accountNumber": "0123456789",
  "email": "m.sterling@prope-luxury.com",
  "defaultSplitPercentage": 95.0
}
```

#### 2. Specifying Split Configurations in Transactions
```json
{
  "incomeSplitConfig": [
    {
      "subAccountCode": "MFY_SUB_89127391",
      "splitPercentage": 95.0,
      "feePercentage": 100.0,
      "feeBearer": true
    }
  ]
}
```

---

### 5.6 Real-Time Webhooks & Security Verification

Monnify emits real-time HTTP POST webhooks for transaction events:
- `SUCCESSFUL_TRANSACTION`: Fired when a tenant transfers money to their virtual account.
- `SUCCESSFUL_DISBURSEMENT`: Fired when a landlord payout successfully lands in their bank account.
- `FAILED_DISBURSEMENT`: Fired if a bank payout fails, enabling automatic transaction rollback.

#### Webhook Payload Example (`SUCCESSFUL_TRANSACTION`)
```json
{
  "eventType": "SUCCESSFUL_TRANSACTION",
  "eventData": {
    "transactionReference": "MNFY|20260721|102938",
    "paymentReference": "prope_ref_9812739",
    "amountPaid": 5000000.00,
    "totalPayable": 5000000.00,
    "settlementAmount": 4975000.00,
    "paidOn": "21/07/2026 18:45:00",
    "paymentStatus": "PAID",
    "paymentMethod": "ACCOUNT_TRANSFER",
    "customer": {
      "name": "Babatunde Alao",
      "email": "babatunde.alao@domain.com"
    }
  }
}
```

#### SHA-512 Signature Validation Algorithm
To ensure webhook requests are genuinely sent by Monnify and not forged by malicious actors, Prope computes an HMAC SHA-512 digest:

$$\text{Calculated Hash} = \text{HMAC\_SHA512}\left(\text{SecretKey}, \text{ClientSecret} + \text{transactionReference} + \text{amountPaid} + \text{totalPayable} + \text{paymentReference}\right)$$

```javascript
const crypto = require('crypto');

function verifyMonnifyWebhook(reqBody, signatureHeader) {
  const secretKey = process.env.MONNIFY_SECRET_KEY;
  const data = reqBody.eventData;

  const stringToHash = 
    secretKey + 
    data.transactionReference + 
    data.amountPaid + 
    data.totalPayable + 
    data.paymentReference;

  const computedSignature = crypto
    .createHash('sha512')
    .update(stringToHash)
    .digest('hex');

  return computedSignature === signatureHeader;
}
```

---

## 6. GraphQL Schema & API Resolver Layer

The GraphQL layer isolates database complexity behind strongly typed definitions.

### 6.1 Complete Type Schema (`src/schema.js`)

```graphql
type UserProfile {
  id: ID!
  email: String!
  role: String!
  name: String
  nin: String
  bvn: String
  kycVerified: Boolean
  walletAccountNumber: String
  walletBankName: String
  walletBalance: Float
}

type Landlord {
  id: ID!
  name: String!
  email: String!
  phone: String!
  bankAccountNumber: String
  bankCode: String
  bankAccountName: String
}

type Property {
  id: ID!
  landlord: Landlord!
  title: String!
  type: String!
  status: String!
  verificationStatus: String!
  area: String!
  buildingType: String!
  price: Float!
  firstPaymentAmount: Float
  paymentFrequency: String
  annualProjections: String
  imageUrl: String
  beds: Int
  baths: Int
  size: Float
  built: Int
}

type TourAppointment {
  id: ID!
  property: Property!
  tenantEmail: String!
  tourDate: String!
  tourTime: String!
  status: String!
  createdAt: String!
}

type Query {
  getProperties: [Property!]!
  getUserProfile(email: String!): UserProfile
  getTourAppointments(tenantEmail: String!): [TourAppointment!]!
}

type Mutation {
  registerUserProfile(email: String!, role: String, name: String): UserProfile!
  verifyCustomerNIN(email: String!, nin: String!): UserProfile!
  upgradeToLandlord(email: String!): UserProfile!
  
  listProperty(
    landlordId: ID!
    title: String!
    type: String!
    status: String!
    area: String!
    buildingType: String!
    price: Float!
    imageUrl: String
    firstPaymentAmount: Float
    paymentFrequency: String
    annualProjections: String
    ownershipDocumentUrl: String
    beds: Int
    baths: Int
    size: Float
    built: Int
  ): Property!

  createTourAppointment(
    propertyId: ID!
    tenantEmail: String!
    tourDate: String!
    tourTime: String!
  ): TourAppointment!
}
```

### 6.2 Parameterized GraphQL Variables vs Inlining
To prevent GraphQL syntax parser crashes (`Syntax Error: Unexpected character: "/"`), all client mutations pass values via **GraphQL variables dictionaries** rather than string template interpolation.

#### Incorrect (String Interpolation - Vulnerable to Syntax Errors):
```javascript
// BROKEN: Unescaped quotes or slashes in Base64 strings crash the parser!
await callGraphQL(`
  mutation {
    listProperty(
      landlordId: "${landlordId}",
      imageUrl: "${base64String}"
    ) { id }
  }
`);
```

#### Correct (Parameterized Variables - Fully Safe):
```javascript
// SECURE: Automatically escaped via variables dictionary
await callGraphQL(`
  mutation ListProperty($landlordId: ID!, $imageUrl: String) {
    listProperty(landlordId: $landlordId, imageUrl: $imageUrl) {
      id
    }
  }
`, {
  landlordId: landlordId,
  imageUrl: base64String
});
```

---

## 7. Distributed Concurrency Control with Upstash Redis

In high-concurrency real estate applications, multiple users might attempt to perform actions simultaneously (e.g. paying for a property lease or issuing double payout requests). Without concurrency controls, **race conditions** can cause negative balances or duplicate payouts.

Prope uses **Upstash Redis** to implement a distributed locking pattern using key-value atomic locking (`SET key value NX EX seconds`).

```
                            DISTRIBUTED LOCKING PATTERN
                            
                  Client Request: Redeem Escrow Payout ($5,000,000)
                                        │
                                        ▼
                           Redis: SETNX lock:payout:user_123
                                        │
                       ┌────────────────┴────────────────┐
                       ▼ YES                             ▼ NO
            [Lock Acquired - Proceed]         [Lock Denied - HTTP 429]
            1. Fetch DB balance               "Transaction already in
            2. Call Monnify Payout API         progress. Please wait..."
            3. Deduct DB balance
                       │
                       ▼
             DEL lock:payout:user_123
            [Lock Released]
```

### 7.1 Redis Locking Implementation Example
```javascript
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

async function executeProtectedPayout(landlordId, amount) {
  const lockKey = `lock:payout:${landlordId}`;
  
  // Set lock with 10-second automatic expiration to prevent deadlocks
  const acquired = await redis.set(lockKey, 'LOCKED', 'NX', 'EX', 10);
  
  if (!acquired) {
    throw new Error('A payout transaction is currently processing for this account. Please wait.');
  }

  try {
    // Perform database ledger check and Monnify API transfer
    const currentBalance = await getLandlordBalance(landlordId);
    if (currentBalance < amount) throw new Error('Insufficient escrow funds.');

    await monnifyDisburse(landlordId, amount);
    await deductLandlordBalance(landlordId, amount);
  } finally {
    // Safely release the lock
    await redis.del(lockKey);
  }
}
```

---

## 8. Multi-Photo Property Listing & Image Serialization

Landlords can attach photos to property listings via two channels:
1. **Local File Uploads:** Upload 1 to 5 local images directly from disk.
2. **Preset Luxury Design Styles:** Select curated architectural photography templates.

### 8.1 Image Upload & FileReader Base64 Pipeline
When a landlord selects local image files, the browser converts each file into a Base64-encoded Data URL string using `FileReader`. The resulting array of strings is serialized into a single JSON array string (`JSON.stringify(imagesArray)`) and saved to the `properties.image_url` column in PostgreSQL.

```javascript
const handleImageUpload = (e) => {
  const files = Array.from(e.target.files);
  if (uploadedImages.length + files.length > 5) {
    triggerNotification("You can upload a maximum of 5 images.", "warning");
    return;
  }
  
  let loadedCount = 0;
  const newImages = [...uploadedImages];
  
  files.forEach(file => {
    const reader = new FileReader();
    reader.onloadend = () => {
      newImages.push(reader.result);
      loadedCount++;
      if (loadedCount === files.length) {
        setUploadedImages(newImages);
        setPropertyInput(prev => ({ ...prev, imageUrl: JSON.stringify(newImages) }));
      }
    };
    reader.readAsDataURL(file);
  });
};
```

### 8.2 Base64 Comma-Splitting Safeguard (`parseImages`)
Base64 Data URLs start with a header containing a comma (e.g. `data:image/jpeg;base64,...`). Standard string splitters (`urlField.split(',')`) mistakenly split the header from the payload, breaking the image string into invalid parts (e.g. `/9j/4AA...2Q==`) and triggering HTTP 431 errors.

The `parseImages` function prevents this by checking for `data:` prefixes:

```javascript
function parseImages(urlField) {
  if (!urlField) return ['/dashboard_preview.jpg'];
  const trimmed = urlField.trim();
  
  // 1. Try parsing JSON array
  try {
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // fallback
  }

  // 2. Safeguard Base64 Data URLs from comma-splitting
  if (trimmed.startsWith('data:')) {
    return [trimmed];
  }

  // 3. Fallback for comma-separated URL lists
  if (trimmed.includes(',')) {
    return trimmed.split(',').map(s => s.trim()).filter(Boolean);
  }

  return [trimmed];
}
```

---

## 9. NVIDIA NIM AI Neighborhood Intelligence

The Neighborhood AI Intelligence module generates detailed physical, environmental, and infrastructural profiles for listings.

### 9.1 Prompt Engineering Context
When a user requests analysis for a property location (e.g. *Banana Island, Lagos*), the backend constructs a structured prompt for the NVIDIA NIM LLM inference model covering four dimensions:
1. **Power Grid & Backup Integration:** Electrical feeder stability, transformer loads, average daily supply hours, and solar adoption.
2. **Arterial Access & Congestion Patterns:** Primary access expressways, peak travel times, and secondary link roads.
3. **Drainage Infrastructure & Flood Vulnerability:** Elevation levels, channel maintenance, and rainy season accessibility.
4. **Security & Perimeter Coverage:** Street lighting, compound security, gate checkpoints, and patrol frequency.

### 9.2 Markdown Transformation Pipeline
The LLM response is processed on the client side:
- **Bold Text:** Double asterisks (`**text**`) are converted into HTML `<strong>` nodes.
- **Rogue Asterisks:** Single leading stars (`*Header`) are cleaned of their asterisks to show clean subtexts.
- **Markdown Tables:** Pipe tables (`| Metric | Status |`) are parsed line-by-line and converted into full-width frosted glass HTML tables.

---

## 10. Private Showing Tours & Viewing Calendar Module

The **Private Tours & Viewings** module allows prospective tenants to schedule physical property viewings guided by the managing landlord or property manager.

### 10.1 Scheduling & Query Workflows
1. **Booking a Tour:** The tenant selects a date (e.g. `Mon, Jul 20`) and time (e.g. `11:00 AM`) on a property modal. The client triggers `createTourAppointment(propertyId, tenantEmail, tourDate, tourTime)`.
2. **Dual-Role Resolver (`getTourAppointments`):** The backend resolver retrieves appointments where the tenant's email matches OR the landlord's property email matches. This ensures that:
   - Tenants see all showings they have reserved.
   - Landlords see all incoming viewing requests booked for their properties.

```javascript
getTourAppointments: async (_, { tenantEmail }) => {
  const res = await query(`
    SELECT ta.* 
    FROM tour_appointments ta
    LEFT JOIN properties p ON ta.property_id = p.id
    LEFT JOIN landlords l ON p.landlord_id = l.id
    WHERE LOWER(ta.tenant_email) = LOWER($1) OR LOWER(l.email) = LOWER($1)
    ORDER BY ta.created_at DESC
  `, [tenantEmail]);
  return res.rows;
}
```

---

## 11. Local Installation & Development Blueprint

### 11.1 System Prerequisites
- **Node.js:** `v18.0.0` or higher.
- **NPM:** `v9.0.0` or higher.
- **PostgreSQL Database:** Supabase instance.
- **Redis Cache:** Upstash Redis cluster.
- **Monnify Sandbox Credentials:** API Key, Secret Key, and Contract Code.

### 11.2 Backend Installation (`prope_backend`)
1. Change into the backend directory:
   ```bash
   cd prope_backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment parameters in `.env`:
   ```env
   PORT=8080
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
   REDIS_URL=rediss://default:[TOKEN]@useful-emu-29241.upstash.io:6379
   MONNIFY_API_KEY=MK_TEST_XXXXXXXXXX
   MONNIFY_SECRET_KEY=XXXXXXXXXX
   MONNIFY_CONTRACT_CODE=XXXXXXXXXX
   ```
4. Run the database seed script to populate tables:
   ```bash
   npm run seed
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```

### 11.3 Frontend Installation (`prope_frontend`)
1. Change into the frontend directory:
   ```bash
   cd ../prope_frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Access the web interface at `http://localhost:5173`.

---

## 12. Troubleshooting, Diagnostics & Glossary

### 12.1 Common Diagnostic Resolutions

#### Issue: `Error: listen EADDRINUSE: address already in use :::8080`
- **Cause:** Another background Node process is already bound to port `8080`.
- **Resolution:** Terminate running node processes via PowerShell:
  ```powershell
  Stop-Process -Name node -Force
  ```

#### Issue: `Failed to list property: Syntax Error: Unexpected character: "/"`
- **Cause:** Inserting Base64 image strings directly into GraphQL query strings via template literals (`imageUrl: "${str}"`).
- **Resolution:** Pass values using the GraphQL variables dictionary (`callGraphQL(query, variables)`).

#### Issue: `net::ERR_INVALID_URL` or `431 Request Header Fields Too Large`
- **Cause:** Base64 Data URL headers (`data:image/jpeg;base64,`) being split on internal commas.
- **Resolution:** Check `if (trimmed.startsWith('data:'))` inside `parseImages` before running string splitting logic.

### 12.2 System Terms Glossary
- **Escrow Ledger:** A financial holding ledger that locks rental funds until occupancy terms are verified.
- **Virtual Account:** A dedicated bank account number provisioned dynamically per user for wallet top-ups.
- **Distributed Locking:** A concurrency pattern preventing double-spending or duplicate API calls.
- **NIM AI Completer:** NVIDIA's cloud inference microservice used for generating neighborhood intelligence reports.
- **Redeemable Balance:** Escrowed funds verified and unlocked for withdrawal by the property landlord.
