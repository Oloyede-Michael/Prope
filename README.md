# Prope Luxury: Escrow-Backed Real Estate Leasing & Fractional Purchase Engine

Prope is a next-generation real estate trust and financial transaction platform built to solve the systemic trust deficit in African real estate markets. Historically, tenants and buyers in developing markets have faced persistent risks of property listing fraud, double-allocation of rental units, and arbitrary rent hikes. Conversely, landlords suffer from irregular rent collection, lack of visibility into tenant credit history, and complex payment collection channels.

Prope bridges this gap by acting as an automated, cryptographically secure escrow arbiter. Integrating the **Monnify API Suite** (sandbox for bank-transfers and KYC verification), **Upstash Redis** (for distributed lock concurrency), and **NVIDIA NIM API** (for advanced LLM-based neighborhood intelligence), Prope provides a seamless marketplace, trust-less payment processing, and comprehensive neighborhood reporting.

---

## Table of Contents
1. [System Architecture & Data Flows](#system-architecture--data-flows)
2. [Database Design & Entity Relationships (ERD)](#database-design--entity-relationships-erd)
3. [Key Modules & Technical Workflows](#key-modules--technical-workflows)
4. [Monnify API Sandbox Integration Guide](#monnify-api-sandbox-integration-guide)
5. [GraphQL API Specifications](#graphql-api-specifications)
6. [Distributed Concurrency Control with Upstash Redis](#distributed-concurrency-control-with-upstash-redis)
7. [NVIDIA NIM AI Integration (Neighborhood Analysis)](#nvidia-nim-ai-integration-neighborhood-analysis)
8. [Local Installation & Development Blueprint](#local-installation--development-blueprint)
9. [Glossary of System Terms & Financial Paradigms](#glossary-of-system-terms--financial-paradigms)

---

## System Architecture & Data Flows

Prope relies on a hybrid microservices/monolithic architecture consisting of an **Express + Apollo GraphQL Backend API** and a **Vite + React + Tailwind CSS Frontend SPA**. The architecture prioritizes data integrity, low latency caching, and secure API gateways.

### High-Level Architecture Diagram
```mermaid
graph TD
    %% Frontend Client
    Client[React Client - Vite Dev Server:5173] -->|GraphQL Queries / Mutations| Backend[Express Backend - Node Server:8080]
    Client -->|Direct Completion Queries| AIProxy[NVIDIA NIM AI Completions]
    
    %% Middleware & Cache
    Backend -->|Distributed Locks & Cash cache| Redis[Upstash Redis Cache]
    
    %% Core Stores
    Backend -->|Relational Queries / Triggers| Postgres[Supabase PostgreSQL DB]
    
    %% External Gateways
    Backend -->|Virtual Accounts / Payouts / KYC| Monnify[Monnify Sandbox Gateway]
    Monnify -->|Incoming Payment Webhooks| Backend
```

### Escrow Payment & Rent Release Lifecycle
The following sequence diagram outlines how a tenant provisions a lease, makes a payment into a secure escrow account, and how funds are safely released to the landlord.

```mermaid
sequenceDiagram
    autonumber
    actor Tenant
    actor Landlord
    participant PropeEngine as Prope Server (Express)
    participant Redis as Upstash Redis (Lock)
    participant DB as Supabase PostgreSQL
    participant Gateway as Monnify Gateway

    Tenant->>PropeEngine: Initiate Rent Escrow (Lease Contract)
    PropeEngine->>Redis: Acquire Lock (Prevent double-initiation)
    PropeEngine->>Gateway: Create Virtual Account Invoice
    Gateway-->>PropeEngine: Return Virtual Account Bank Details
    PropeEngine->>DB: Record Pending Tenancy (ESCROWED state)
    PropeEngine-->>Tenant: Show payment account details
    Tenant->>Gateway: Pay via Bank Transfer (Sandbox)
    Gateway-->>PropeEngine: Webhook notification (Payment Successful)
    PropeEngine->>DB: Update Tenancy to PAID, lock funds in Escrow
    PropeEngine-->>Tenant: Provision tenancy key access
    Note over Tenant,Landlord: Monthly / Quarterly Rent Release
    Landlord->>PropeEngine: Initiate Escrow Payout (Redeem)
    PropeEngine->>Redis: Acquire Payout Lock
    PropeEngine->>Gateway: Trigger Sandbox Bank Disbursement
    Gateway-->>PropeEngine: Settlement complete
    PropeEngine->>DB: Mark RentPayment as REDEEMED
    PropeEngine->>DB: Credit Landlord Virtual Balance
    PropeEngine->>Redis: Release Payout Lock
    PropeEngine-->>Landlord: Transfer settled funds to private bank
```

---

## Database Design & Entity Relationships (ERD)

The database schema is hosted on **Supabase PostgreSQL**. It represents all core state changes (User roles, listings, dynamic virtual wallets, active tenancy contracts, escrow ledger payments, and calendar bookings).

### Entity Relationship Diagram
```mermaid
erDiagram
    LANDLORDS ||--o{ PROPERTIES : "owns"
    LANDLORDS ||--o{ RENT_PAYMENTS : "redeems"
    PROPERTIES ||--o{ TENANCIES : "hosts"
    PROPERTIES ||--o{ TOUR_APPOINTMENTS : "schedules"
    TENANCIES ||--o{ RENT_PAYMENTS : "generates"
    USER_PROFILES ||--o{ TOUR_APPOINTMENTS : "books"
    
    USER_PROFILES {
        uuid id PK
        string email UNIQUE
        string role "TENANT | LANDLORD"
        string name
        string nin
        string bvn
        boolean kycVerified
        string walletAccountNumber
        string walletBankName
        string walletReference
        float walletBalance
    }

    LANDLORDS {
        uuid id PK "Matches user_profiles.id"
        string name
        string email UNIQUE
        string phone
        string bankAccountNumber
        string bankCode
        string bankAccountName
        timestamp createdAt
    }

    PROPERTIES {
        uuid id PK
        uuid landlordId FK
        string title
        string type "RENT | SALE"
        string status "LISTED | RENTED | SOLD"
        string verificationStatus "PENDING | APPROVED"
        string area
        string buildingType
        float price
        float firstPaymentAmount
        string paymentFrequency "MONTHLY | QUARTERLY | ANNUAL"
        string imageUrl "JSON Array String"
        int beds
        int baths
        float size
        int built
    }

    TENANCIES {
        uuid id PK
        uuid propertyId FK
        uuid tenantId FK
        float rentAmount
        string frequency
        date nextDueDate
        float balance
        string status "ACTIVE | EXPIRED | ESCROWED"
        string nombaVirtualAccountId
        string nombaOrderReference
    }

    RENT_PAYMENTS {
        uuid id PK
        uuid tenancyId FK
        uuid landlordId FK
        float amount
        string status "PENDING | CONFIRMED | REDEEMED"
        date paymentDate
        string monnifyReference
    }

    TOUR_APPOINTMENTS {
        uuid id PK
        uuid propertyId FK
        string tenantEmail
        date appointmentDate
        string appointmentTime
        string status "PENDING | CONFIRMED"
    }
```

---

## Key Modules & Technical Workflows

### 1. Multi-role Authentication & Onboarding
Users sign in using their email address. Upon first-time entry, the onboarding portal prompts the user to select their profile role:
- **Tenant:** Gains access to the luxury property marketplace, wallet funding, rent escrow execution, utility payments, and AI neighborhood report generation.
- **Landlord:** Can verify their bank accounts via BVN, list property assets, request caretaker alignments, and initiate payouts (redeem escrow transactions).

### 2. Identity Verification & KYC Integration
To prevent fraud, a landlord must verify their **BVN** (Bank Verification Number) and **NIN** (National Identity Number). The KYC verification flow maps directly to the Monnify Sandbox verification endpoints:
- Under **Sandbox simulations**, submitting the verification requests executes a lookup to the sandbox directory to match identity registers.
- Once matched, the database status `kycVerified` flag flips to `true`, and the user's role is upgraded to `LANDLORD` in the relational tables.

### 3. Dynamic Wallet Provisioning (Virtual Accounts)
During onboarding, every verified user is provisioned a secure, dedicated **Monnify Sandbox Virtual Account**.
- This virtual account consists of a real test account number, bank name, and reference string.
- Users can simulate bank transfers to fund their virtual wallet balances using the sandbox transfer interface.
- These balances are cached in memory and updated in PostgreSQL upon confirmation from incoming bank webhook triggers.

### 4. Property Listing Engine & Multi-Photo Uploads
Verified landlords can register listings by selecting building configurations (beds, baths, size, build year) and uploading photos:
- The UI offers a dual image input channel:
  - **Upload Local Files:** Landlords can select 1 to 5 local images directly from their machine. The application reads these files via a browser-native `FileReader` and serializes them into Base64-encoded Data URLs, saving them directly as a JSON array in the database.
  - **Preset Luxury Style Pickers:** Landlords can alternatively choose from curated architectural design presets loaded from high-resolution URLs.
- The property details page dynamically parses this JSON structure, adapting the media gallery size dynamically (e.g. "Image 1 of 1" or "Image 1 of 5") without hardcoded fallbacks.

### 5. AI-powered Neighborhood Reports
Leveraging NVIDIA NIM completion models, the neighborhood analyzer generates deep physical, electrical, and infrastructural profiles of listings. The engine translates raw Markdown headers and bolding syntaxes into full-width clean tables and bullet grids while stripping rogue asterisk formatting for sleek readability.

---

## Monnify API Sandbox Integration Guide

The financial engine communicates with the Monnify Sandbox API gateway. It operates on a double-authentication scheme (Bearer JWT token combined with API request signing keys).

### 1. Generating Access Tokens
To authenticate with the Monnify Sandbox, the backend first requests an access token by encoding the API Key and Secret Key in Base64:

```javascript
const axios = require('axios');

async function getAccessToken() {
  const secretKey = process.env.MONNIFY_SECRET_KEY;
  const apiKey = process.env.MONNIFY_API_KEY;
  const base64Credentials = Buffer.from(`${apiKey}:${secretKey}`).toString('base64');

  const response = await axios.post(
    'https://sandbox.monnify.com/api/v1/auth/login', 
    {}, 
    {
      headers: {
        Authorization: `Basic ${base64Credentials}`
      }
    }
  );
  return response.data.responseBody.accessToken;
}
```

### 2. Reserving Customer Virtual Accounts
When a tenant registers a lease or wallet, we reserve an account using the reserved accounts endpoint:

```json
POST /api/v1/bank-transfer/reserved-accounts
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "accountReference": "ref_user_99218274",
  "accountName": "Babatunde Alao Wallet",
  "currencyCode": "NGN",
  "contractCode": "8472910384",
  "customerEmail": "b.alao@domain.com",
  "customerName": "Babatunde Alao",
  "getAllAvailableBanks": true
}
```

### 3. Webhook Signature Verification
Incoming bank transfer notifications are received by the webhook listener. To prevent forgery, we compute a SHA-512 digest of the request payload using the Monnify Secret Key and compare it with the `monnify-signature` header:

```javascript
const crypto = require('crypto');

function verifyMonnifySignature(reqBody, signatureHeader) {
  const secretKey = process.env.MONNIFY_SECRET_KEY;
  const computedHash = crypto
    .createHmac('sha512', secretKey)
    .update(JSON.stringify(reqBody))
    .digest('hex');

  return computedHash === signatureHeader;
}
```

---

## GraphQL API Specifications

The GraphQL API sits at the boundary of our server logic. The database transactions and business workflows are exposed through a structured Type system.

### Type Schema Walkthrough (Extract)
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

type Property {
  id: ID!
  landlord: Landlord!
  title: String!
  type: String!
  status: String!
  price: Float!
  imageUrl: String
  beds: Int
  baths: Int
  size: Float
  built: Int
}

type Query {
  getProperties: [Property!]!
  getUserProfile(email: String!): UserProfile
  getTenancies: [Tenancy!]!
}

type Mutation {
  listProperty(
    landlordId: ID!
    title: String!
    type: String!
    status: String!
    area: String!
    buildingType: String!
    price: Float!
    imageUrl: String
    beds: Int
    baths: Int
    size: Float
    built: Int
  ): Property!
  
  createTourAppointment(
    propertyId: ID!
    tenantEmail: String!
    date: String!
    time: String!
  ): TourAppointment!
}
```

---

## Distributed Concurrency Control with Upstash Redis

In high-volume marketplaces, there is a risk of **race conditions** where multiple buyers trigger payment processing or lease checkout simultaneously. This can result in double-leasing units or processing double-disbursements on bank payouts.

Prope prevents this by using **Upstash Redis** to implement a distributed locking pattern.

```
                  Client Request (Payout Release)
                                 │
                                 ▼
                     Backend API: Acquire Lock?
                     SETNX key "lock_payout_981"
                                 │
                 ┌───────────────┴───────────────┐
                 ▼ YES                           ▼ NO
        [Execute Transaction]            [Return HTTP 429]
        Query current balance             "Transaction pending"
        Execute Monnify Transfer          "Please wait..."
        Deduct local DB ledger
                 │
                 ▼
          Release Redis Lock
         DEL key "lock_payout_981"
```

### Lock Implementation Code Example
```javascript
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

async function executeSecurePayout(landlordId, amount) {
  const lockKey = `lock:payout:${landlordId}`;
  
  // Set lock with 10-second automatic expiration to prevent deadlocks
  const acquired = await redis.set(lockKey, 'locked', 'NX', 'EX', 10);
  
  if (!acquired) {
    throw new Error('Another settlement payout transaction is already in progress. Try again.');
  }

  try {
    // 1. Fetch current escrow balances from PostgreSQL
    const currentBalance = await db.getBalance(landlordId);
    if (currentBalance < amount) throw new Error('Insufficient escrow funds.');

    // 2. Perform payout through Monnify API
    await monnify.disburseFunds(landlordId, amount);

    // 3. Update database registers
    await db.deductBalance(landlordId, amount);
  } finally {
    // 4. Release lock safely
    await redis.del(lockKey);
  }
}
```

---

## NVIDIA NIM AI Integration (Neighborhood Analysis)

When users click the **"Neighborhood AI Intelligence"** tab, the frontend requests analysis from the NVIDIA NIM engine.
The server receives a structured prompt containing the location context (e.g. *Banana Island, Lagos* or *Ikeja GRA*), and routes the completed completions back to the client.

### Markdown Stripping & Table Parsing
The raw response is formatted through our markdown pipeline:
- Double asterisks (`**bold**`) are compiled into HTML `<strong>` nodes.
- Rogue bullet stars (`*Header`) are cleaned of their asterisks to show beautiful clean header subtexts.
- Pipe tables (`| Infrastructure | Status |`) are parsed line-by-line and converted into full-width frosted glass HTML tables.

---

## Local Installation & Development Blueprint

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **NPM** or **Yarn**
- A **Supabase PostgreSQL** instance
- An **Upstash Redis** URL
- A **Monnify Sandbox Developer Account** keys

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd prope_backend
   ```
2. Install the node packages:
   ```bash
   npm install
   ```
3. Create a `.env` configuration file containing key variables:
   ```env
   PORT=8080
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
   REDIS_URL=rediss://default:[TOKEN]@useful-emu-29241.upstash.io:6379
   MONNIFY_API_KEY=MK_TEST_XXXXXXXXXX
   MONNIFY_SECRET_KEY=XXXXXXXXXX
   MONNIFY_CONTRACT_CODE=XXXXXXXXXX
   ```
4. Seed the PostgreSQL tables:
   ```bash
   npm run seed
   ```
5. Launch the backend API process:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../prope_frontend
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```
3. Run the development bundle server:
   ```bash
   npm run dev
   ```
4. Access the portal UI at `http://localhost:5173`.


