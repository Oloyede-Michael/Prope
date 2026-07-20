import express from 'express';
import {
  getBanks,
  validateBankAccount,
  createReservedAccount,
  getWalletBalance,
  initiateTransfer,
  getTransferStatus,
  getBillers,
  getBillerProducts,
  validateBillCustomer,
  vendBill
} from './monnify.js';

const router = express.Router();

// In-memory cache for bill validation references
const validationCache = new Map();

/**
 * Dynamically resolves a Monnify biller and product based on category and provider name.
 */
async function resolveBillerProduct(categoryCode, providerSearchTerm, productSearchTerm = null) {
  const billers = await getBillers(categoryCode);
  const searchTerm = (providerSearchTerm || '').toLowerCase();
  
  // Find closest matching biller by name or code
  const biller = billers.find(b => 
    b.name.toLowerCase().includes(searchTerm) || 
    b.code.toLowerCase().includes(searchTerm)
  ) || billers[0];

  if (!biller) {
    throw new Error(`No active billers found in Monnify for category: ${categoryCode}`);
  }

  const products = await getBillerProducts(biller.code);
  if (!products || products.length === 0) {
    throw new Error(`No products found for Monnify biller: ${biller.name}`);
  }

  let product = null;
  if (productSearchTerm) {
    const pTerm = productSearchTerm.toLowerCase();
    product = products.find(p => p.name.toLowerCase().includes(pTerm));
  }

  return { biller, product: product || products[0] };
}

/**
 * Maps Nomba Sandbox request payloads to real Monnify Sandbox API calls.
 */
async function handleSandboxExecution(req, res) {
  const { name, method, url, body } = req.body;
  console.log(`Sandbox Proxy Request: [${name}] - ${method} ${url}`);

  try {
    // 1. Fetch Banks List
    if (url === '/v1/transfers/banks' && method === 'GET') {
      const banks = await getBanks();
      const mapped = banks.map(b => ({
        bankCode: b.code,
        bankName: b.name
      }));
      return res.json({
        code: '00',
        description: 'success',
        data: mapped
      });
    }

    // 2. Provision Virtual Account
    if ((url === '/v1/accounts/virtual' || url.startsWith('/v1/accounts/virtual/')) && method === 'POST') {
      const accountRef = body.accountRef || `ref_${Date.now()}`;
      const accountName = body.accountName || 'Prope Virtual Account';
      
      const monnifyVa = await createReservedAccount(accountRef, accountName);
      
      // Extract the first bank account returned
      const account = monnifyVa.accounts?.[0] || {};
      return res.json({
        code: '00',
        description: 'success',
        data: {
          bankAccountNumber: account.accountNumber || '',
          bankName: account.bankName || 'Monnify partner bank',
          accountName: monnifyVa.accountName || accountName
        }
      });
    }

    // 3. Fetch Wallet Balance
    if ((url === '/v1/accounts/balance' || url.match(/\/v1\/accounts\/[^\/]+\/balance/)) && method === 'GET') {
      const balanceData = await getWalletBalance();
      return res.json({
        code: '00',
        description: 'success',
        data: {
          balance: balanceData.availableBalance || 0
        }
      });
    }

    // 4. Bank Account Name Lookup
    if (url === '/v1/transfers/bank/lookup' && method === 'POST') {
      const { accountNumber, bankCode } = body;
      const lookup = await validateBankAccount(accountNumber, bankCode);
      return res.json({
        code: '00',
        description: 'success',
        data: {
          accountName: lookup.accountName
        }
      });
    }

    // 5. Bill Payment: Electricity Customer Lookup
    if (url.startsWith('/v1/bill/electricity/lookup') && method === 'GET') {
      const { customerId, disco } = req.query;
      const { product } = await resolveBillerProduct('ELECTRICITY', disco);
      
      const valRes = await validateBillCustomer(product.code, customerId);
      if (valRes.requestSuccessful && valRes.responseBody) {
        const ref = valRes.responseBody.validationReference;
        validationCache.set(`electricity:${customerId}`, { productCode: product.code, validationReference: ref });
        
        return res.json({
          code: '00',
          description: 'success',
          data: {
            customerName: valRes.responseBody.customerName || 'Validated Electricity Customer',
            validationReference: ref
          }
        });
      } else {
        return res.json({
          code: '99',
          description: valRes.responseMessage || 'Electricity customer verification failed.'
        });
      }
    }

    // 6. Bill Payment: Vend Electricity
    if (url === '/v1/bill/electricity' && method === 'POST') {
      const { disco, customerId, amount, merchantTxRef } = body;
      
      // Get cached validation reference or fetch dynamically
      let valData = validationCache.get(`electricity:${customerId}`);
      if (!valData) {
        const { product } = await resolveBillerProduct('ELECTRICITY', disco);
        const valRes = await validateBillCustomer(product.code, customerId);
        if (valRes.requestSuccessful && valRes.responseBody) {
          valData = { productCode: product.code, validationReference: valRes.responseBody.validationReference };
        }
      }

      if (!valData) {
        return res.json({ code: '99', description: 'Could not obtain customer validation reference.' });
      }

      const vend = await vendBill(valData.productCode, customerId, amount, merchantTxRef || `electricity_${Date.now()}`, valData.validationReference);
      if (vend.requestSuccessful && vend.responseBody?.vendStatus === 'SUCCESS') {
        return res.json({
          code: '00',
          description: 'success',
          data: {
            status: 'SUCCESS',
            transactionReference: vend.responseBody.transactionReference
          }
        });
      } else {
        return res.json({
          code: '99',
          description: vend.responseMessage || 'Electricity vending failed.'
        });
      }
    }

    // 7. Bill Payment: Vend Airtime / Data
    if ((url === '/v1/bill/topup' || url === '/v1/bill/data') && method === 'POST') {
      const { network, phoneNumber, amount, merchantTxRef } = body;
      const isData = url === '/v1/bill/data';
      
      const category = isData ? 'DATA' : 'AIRTIME';
      const { product } = await resolveBillerProduct(category, network);

      // Perform validation (some airtime/data products do not require validation, but we check anyway)
      const valRes = await validateBillCustomer(product.code, phoneNumber);
      const validationReference = valRes.requestSuccessful ? valRes.responseBody?.validationReference : null;

      const vend = await vendBill(product.code, phoneNumber, amount, merchantTxRef || `airtime_data_${Date.now()}`, validationReference);
      if (vend.requestSuccessful && vend.responseBody?.vendStatus === 'SUCCESS') {
        return res.json({
          code: '00',
          description: 'success',
          data: {
            status: 'SUCCESS',
            transactionReference: vend.responseBody.transactionReference
          }
        });
      } else {
        return res.json({
          code: '99',
          description: vend.responseMessage || 'Vending failed.'
        });
      }
    }

    // 8. Bill Payment: Cable TV Customer Lookup
    if (url.startsWith('/v1/bill/cabletv/lookup') && method === 'GET') {
      const { customerId, cableTvType } = req.query;
      const { product } = await resolveBillerProduct('CABLE_TV', cableTvType);

      const valRes = await validateBillCustomer(product.code, customerId);
      if (valRes.requestSuccessful && valRes.responseBody) {
        const ref = valRes.responseBody.validationReference;
        validationCache.set(`cabletv:${customerId}`, { productCode: product.code, validationReference: ref });
        
        return res.json({
          code: '00',
          description: 'success',
          data: {
            customerName: valRes.responseBody.customerName || 'Validated Cable TV Customer',
            validationReference: ref
          }
        });
      } else {
        return res.json({
          code: '99',
          description: valRes.responseMessage || 'Cable TV customer verification failed.'
        });
      }
    }

    // 9. Bill Payment: Vend Cable TV
    if (url === '/v1/bill/cabletv' && method === 'POST') {
      const { cableTvType, customerId, amount, merchantTxRef } = body;

      let valData = validationCache.get(`cabletv:${customerId}`);
      if (!valData) {
        const { product } = await resolveBillerProduct('CABLE_TV', cableTvType);
        const valRes = await validateBillCustomer(product.code, customerId);
        if (valRes.requestSuccessful && valRes.responseBody) {
          valData = { productCode: product.code, validationReference: valRes.responseBody.validationReference };
        }
      }

      if (!valData) {
        return res.json({ code: '99', description: 'Could not obtain customer validation reference.' });
      }

      const vend = await vendBill(valData.productCode, customerId, amount, merchantTxRef || `cabletv_${Date.now()}`, valData.validationReference);
      if (vend.requestSuccessful && vend.responseBody?.vendStatus === 'SUCCESS') {
        return res.json({
          code: '00',
          description: 'success',
          data: {
            status: 'SUCCESS',
            transactionReference: vend.responseBody.transactionReference
          }
        });
      } else {
        return res.json({
          code: '99',
          description: vend.responseMessage || 'Cable TV vending failed.'
        });
      }
    }

    // 10. Bill Payment: Betting Customer Lookup
    if (url.startsWith('/v1/bill/betting/lookup') && method === 'GET') {
      const { customerId, providerId } = req.query;
      const { product } = await resolveBillerProduct('BETTING', providerId);

      const valRes = await validateBillCustomer(product.code, customerId);
      if (valRes.requestSuccessful && valRes.responseBody) {
        const ref = valRes.responseBody.validationReference;
        validationCache.set(`betting:${customerId}`, { productCode: product.code, validationReference: ref });
        
        return res.json({
          code: '00',
          description: 'success',
          data: {
            customerName: valRes.responseBody.customerName || 'Validated Betting Customer',
            validationReference: ref
          }
        });
      } else {
        return res.json({
          code: '99',
          description: valRes.responseMessage || 'Betting customer verification failed.'
        });
      }
    }

    // 11. Bill Payment: Vend Betting Top-up
    if (url === '/v1/bill/betting' && method === 'POST') {
      const { bettingProvider, customerId, amount, merchantTxRef } = body;

      let valData = validationCache.get(`betting:${customerId}`);
      if (!valData) {
        const { product } = await resolveBillerProduct('BETTING', bettingProvider);
        const valRes = await validateBillCustomer(product.code, customerId);
        if (valRes.requestSuccessful && valRes.responseBody) {
          valData = { productCode: product.code, validationReference: valRes.responseBody.validationReference };
        }
      }

      if (!valData) {
        return res.json({ code: '99', description: 'Could not obtain customer validation reference.' });
      }

      const vend = await vendBill(valData.productCode, customerId, amount, merchantTxRef || `betting_${Date.now()}`, valData.validationReference);
      if (vend.requestSuccessful && vend.responseBody?.vendStatus === 'SUCCESS') {
        return res.json({
          code: '00',
          description: 'success',
          data: {
            status: 'SUCCESS',
            transactionReference: vend.responseBody.transactionReference
          }
        });
      } else {
        return res.json({
          code: '99',
          description: vend.responseMessage || 'Betting wallet top-up failed.'
        });
      }
    }

    // 12. FX: Exchange Rates simulation
    if (url.startsWith('/v1/global-payout/exchange-rates') && method === 'GET') {
      const { from, to } = req.query;
      return res.json({
        code: '00',
        description: 'success',
        data: {
          rate: 0.00065,
          exchangeRateId: `rate_${from}_to_${to}_dummy`
        }
      });
    }

    // 13. FX: Money Convert simulation
    if (url === '/v1/global-payout/money/convert' && method === 'POST') {
      const { amount, currency, destinationCurrency } = body;
      return res.json({
        code: '00',
        description: 'success',
        data: {
          convertedAmount: parseFloat(amount) * 0.00065,
          rate: 0.00065,
          exchangeRateId: `rate_${currency}_to_${destinationCurrency}_dummy`
        }
      });
    }

    // 14. FX: Exchange Authorize simulation
    if (url === '/v1/global-payout/exchange/authorize' && method === 'POST') {
      return res.json({
        code: '00',
        description: 'success',
        data: {
          status: 'SUCCESS'
        }
      });
    }

    // Unhandled endpoint fallback - try calling Monnify directly
    console.warn(`Warning: Unhandled proxy route mapping for URL ${url}. Returning 501.`);
    return res.status(501).json({
      code: '99',
      description: `Monnify proxy does not support the request path: ${url}`
    });

  } catch (err) {
    console.error(`Monnify Proxy failed for [${name}] (${method} ${url}):`, err);
    return res.json({
      code: '99',
      description: `Payment gateway error: ${err.message || 'Unknown error'}`,
      rawError: err.message
    });
  }
}

router.post('/execute', handleSandboxExecution);

export default router;
