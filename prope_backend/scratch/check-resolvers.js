import { resolvers } from '../src/resolvers.js';

console.log('Queries implemented:', Object.keys(resolvers.Query));
console.log('Mutations implemented:', Object.keys(resolvers.Mutation));

// Check if all Mutations from schema are present
const schemaMutations = [
  'pauseSubscription', 'resumeSubscription', 'createPlan', 'createLandlord',
  'updateLandlordPayoutDetails', 'createProperty', 'createTenancy', 'createEscrowTransaction',
  'linkTenancyOrder', 'claimTenancy', 'linkEscrowOrder', 'releaseEscrow', 'rejectEscrow',
  'synchronizeEscrowPayment', 'linkPropertyMeter', 'updatePropertyStatus',
  'registerUserProfile', 'upgradeToLandlord', 'listProperty', 'decrementPropertyUnits',
  'assignPropertyCaretaker', 'sendChatMessage', 'createReceipt'
];

console.log('\nMissing Mutations:');
schemaMutations.forEach(m => {
  if (!resolvers.Mutation[m]) {
    console.log(`- ${m} is missing!`);
  } else {
    console.log(`+ ${m} is present.`);
  }
});
