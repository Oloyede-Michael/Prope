-- Schema definition for AcreWise/Prope backend

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'TENANT',
    name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS landlords (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    bank_account_number VARCHAR(50),
    bank_code VARCHAR(50),
    bank_account_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY,
    landlord_id UUID NOT NULL REFERENCES landlords(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- RENT, SALE
    status VARCHAR(50) NOT NULL, -- LISTED, UNDER_ESCROW, SOLD, LET
    verification_status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, VERIFIED, FLAGGED
    meter_number VARCHAR(100),
    meter_provider VARCHAR(100),
    area VARCHAR(255),
    building_type VARCHAR(100),
    price NUMERIC(15, 2),
    caretaker_name VARCHAR(255),
    caretaker_email VARCHAR(255),
    caretaker_phone VARCHAR(50),
    total_units INTEGER DEFAULT 1,
    available_units INTEGER DEFAULT 1,
    image_url TEXT,
    first_payment_amount NUMERIC(15, 2),
    payment_frequency VARCHAR(50),
    annual_projections VARCHAR(512),
    ownership_document_url VARCHAR(1024),
    is_assured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenancies (
    id UUID PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id VARCHAR(255) NOT NULL,
    rent_amount NUMERIC(15, 2) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    next_due_date DATE NOT NULL,
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    nomba_virtual_account_id VARCHAR(255) UNIQUE NOT NULL, -- Monnify virtual account
    nomba_order_reference VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rent_payments (
    id UUID PRIMARY KEY,
    tenancy_id UUID REFERENCES tenancies(id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL,
    nomba_reference VARCHAR(255) UNIQUE NOT NULL,
    matched_status VARCHAR(50) NOT NULL, -- MATCHED, UNDERPAID, OVERPAID, UNMATCHED
    received_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS escrow_transactions (
    id UUID PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    buyer_id VARCHAR(255) NOT NULL,
    amount_held NUMERIC(15, 2) NOT NULL,
    status VARCHAR(50) NOT NULL, -- HELD, RELEASED, REFUNDED, PENDING_PAYMENT, PAYOUT_FAILED, RELEASE_PENDING
    nomba_virtual_account_id VARCHAR(255) NOT NULL,
    nomba_order_reference VARCHAR(255) UNIQUE,
    nomba_transaction_reference VARCHAR(255),
    nomba_payout_reference VARCHAR(255),
    payout_error VARCHAR(2000),
    payment_sync_error VARCHAR(2000),
    released_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    frequency VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY,
    property_id UUID NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    sender_role VARCHAR(50) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS receipts (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    reference VARCHAR(255) UNIQUE NOT NULL,
    details VARCHAR(2000),
    tenant_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
