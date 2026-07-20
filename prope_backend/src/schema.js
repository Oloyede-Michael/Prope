export const typeDefs = `#graphql
  type Landlord {
      id: ID!
      name: String!
      email: String!
      phone: String!
      bankAccountNumber: String
      bankCode: String
      bankAccountName: String
      createdAt: String
  }

  type Property {
      id: ID!
      landlord: Landlord!
      title: String!
      type: String!
      status: String!
      verificationStatus: String!
      meterNumber: String
      meterProvider: String
      area: String
      buildingType: String
      price: Float
      caretakerName: String
      caretakerEmail: String
      caretakerPhone: String
      totalUnits: Int
      availableUnits: Int
      createdAt: String
      # New marketplace fields
      imageUrl: String
      firstPaymentAmount: Float
      paymentFrequency: String
      annualProjections: String
      isAssured: Boolean
  }

  type Tenancy {
      id: ID!
      property: Property!
      tenantId: ID!
      rentAmount: Float!
      frequency: String!
      nextDueDate: String!
      balance: Float!
      nombaVirtualAccountId: String!
      nombaOrderReference: String
      createdAt: String
  }

  type RentPayment {
      id: ID!
      tenancy: Tenancy
      amount: Float!
      nombaReference: String!
      matchedStatus: String!
      receivedAt: String!
      createdAt: String
      redeemed: Boolean
      redeemedAt: String
      redeemPayoutReference: String
  }

  type EscrowTransaction {
      id: ID!
      property: Property!
      buyerId: ID!
      amountHeld: Float!
      status: String!
      nombaVirtualAccountId: String!
      nombaOrderReference: String
      nombaTransactionReference: String
      nombaPayoutReference: String
      payoutError: String
      paymentSyncError: String
      releasedAt: String
      createdAt: String
  }

  type Plan {
      id: ID!
      name: String!
      amount: Float!
      frequency: String!
  }

  type Subscription {
      id: ID!
      status: String!
  }

  type UserProfile {
      id: ID!
      email: String!
      role: String!
      name: String
      nin: String
      bvn: String
      kycVerified: Boolean
      walletAccountNumber: String
      walletReference: String
      walletBankName: String
      walletBalance: Float
  }

  type ChatMessage {
      id: ID!
      propertyId: ID!
      senderEmail: String!
      senderRole: String!
      message: String!
      createdAt: String
  }

  type Receipt {
      id: ID!
      title: String!
      category: String!
      amount: Float!
      reference: String!
      details: String
      tenantEmail: String!
      createdAt: String
  }

  type WalletTransaction {
      walletTransactionReference: String!
      monnifyTransactionReference: String!
      amount: Float!
      transactionDate: String!
      transactionType: String!
      narration: String
      status: String!
  }

  type MonnifyConfig {
      apiKey: String!
      contractCode: String!
  }

  type Query {
      # Component D requirements
      getMerchantPlans: [Plan!]!
      getSubscription(id: ID!): Subscription
      getUnmatchedQueue: [RentPayment!]!

      # AcreWise Specific Queries
      getProperties: [Property!]!
      getProperty(id: ID!): Property
      getLandlord(email: String!): Landlord
      getTenancies: [Tenancy!]!
      getTenancy(id: ID!): Tenancy
      getEscrowTransactions: [EscrowTransaction!]!

      # User Profile Queries
      getUserProfile(email: String!): UserProfile
      
      # Chat Messages
      getChatMessages(propertyId: ID!): [ChatMessage!]!
      
      # Receipts
      getReceipts(tenantEmail: String!): [Receipt!]!

      # Wallet statement & transactions
      getUserWalletTransactions(accountNumber: String!): [WalletTransaction!]!
      
      # Monnify Config retrieval
      getMonnifyConfig: MonnifyConfig!

      # Landlord Rent Collection desk
      getLandlordRentPayments(landlordEmail: String!): [RentPayment!]!
  }

  input CreatePlanInput {
      name: String!
      amount: Float!
      frequency: String!
  }

  type Mutation {
      # Component D requirements
      pauseSubscription(id: ID!): Subscription!
      resumeSubscription(id: ID!): Subscription!
      createPlan(input: CreatePlanInput!): Plan!

      # AcreWise Specific Mutations
      createLandlord(name: String!, email: String!, phone: String!): Landlord!
      updateLandlordPayoutDetails(email: String!, bankAccountNumber: String!, bankCode: String!, bankAccountName: String): Landlord!
      createProperty(landlordId: ID!, title: String!, type: String!, status: String!): Property!
      createTenancy(propertyId: ID!, tenantId: ID!, rentAmount: Float!, frequency: String!, nextDueDate: String!, nombaVirtualAccountId: String!, nombaOrderReference: String): Tenancy!
      createEscrowTransaction(propertyId: ID!, buyerId: ID!, amountHeld: Float!, nombaVirtualAccountId: String!, nombaOrderReference: String): EscrowTransaction!
      linkTenancyOrder(tenancyId: ID!, orderReference: String!): Tenancy!
      claimTenancy(tenancyId: ID!, tenantId: ID!): Tenancy!
      linkEscrowOrder(escrowId: ID!, orderReference: String!): EscrowTransaction!
      releaseEscrow(id: ID!): EscrowTransaction!
      rejectEscrow(id: ID!): EscrowTransaction!
      synchronizeEscrowPayment(id: ID!): EscrowTransaction!
      linkPropertyMeter(propertyId: ID!, meterNumber: String!, meterProvider: String!): Property!
      updatePropertyStatus(propertyId: ID!, status: String!): Property!

      # User Profile Mutations
      registerUserProfile(email: String!, name: String, role: String): UserProfile!
      upgradeToLandlord(email: String!): UserProfile!
      
      # Property listing extension mutation
      listProperty(landlordId: ID!, title: String!, type: String!, status: String!, area: String!, buildingType: String!, price: Float!, totalUnits: Int, imageUrl: String, firstPaymentAmount: Float, paymentFrequency: String, annualProjections: String, ownershipDocumentUrl: String): Property!
      decrementPropertyUnits(propertyId: ID!): Property!
      
      # Caretaker mapping
      assignPropertyCaretaker(propertyId: ID!, name: String!, email: String!, phone: String!): Property!

      # Chat Messages
      sendChatMessage(propertyId: ID!, senderEmail: String!, senderRole: String!, message: String!): ChatMessage!

      # Receipts creation
      createReceipt(title: String!, category: String!, amount: Float!, reference: String!, details: String, tenantEmail: String!): Receipt!

      # Monnify KYC & Wallet Mutations
      verifyCustomerNIN(email: String!, nin: String!): UserProfile!
      verifyCustomerBVN(email: String!, bvn: String!, name: String!, dateOfBirth: String!, mobileNo: String!): UserProfile!
      createCustomerWallet(email: String!, bvn: String!, dateOfBirth: String!): UserProfile!
      syncWalletBalance(email: String!): UserProfile!
      debitCustomerWallet(email: String!, amount: Float!, destinationBankCode: String!, destinationAccountNumber: String!, narration: String!): String!

      # Rent Collections Redemption
      redeemRentPayment(paymentId: ID!): RentPayment!
      redeemAllRentPayments(landlordEmail: String!): String!
  }
`;
