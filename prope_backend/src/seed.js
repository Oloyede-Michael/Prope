import { query } from './db.js';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  console.log('Starting database seeding...');
  
  try {
    // 1. Clean existing mock properties to prevent duplicates
    console.log('Cleaning existing seed properties...');
    await query("DELETE FROM properties WHERE id::text LIKE 'a0000000-%'");
    await query("DELETE FROM landlords WHERE id::text LIKE 'b0000000-%'");

    // 2. Create landlords
    const landlord1Id = 'b0000000-0000-0000-0000-000000000001';
    const landlord2Id = 'b0000000-0000-0000-0000-000000000002';

    console.log('Inserting landlords...');
    await query(`
      INSERT INTO landlords (id, name, email, phone, bank_account_number, bank_code, bank_account_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone
    `, [landlord1Id, 'Marcus Sterling', 'm.sterling@prope-luxury.com', '+234 815 555 9010', '0068687503', '035', 'Marcus Sterling Portfolio Account']);

    await query(`
      INSERT INTO landlords (id, name, email, phone, bank_account_number, bank_code, bank_account_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone
    `, [landlord2Id, 'Siena Montgomery', 's.montgomery@prope-luxury.com', '+1 (310) 555-9030', '5772529181', '232', 'Siena Montgomery Trust']);

    // 3. Create properties matching the UI listings
    const propertiesData = [
      {
        id: 'a0000000-0000-0000-0000-000000000001',
        landlordId: landlord1Id,
        title: 'The Obsidian Penthouse',
        type: 'SALE',
        status: 'LISTED',
        area: 'Banana Island, Lagos',
        buildingType: 'Duplex Penthouse',
        price: 1850000000,
        imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
        firstPaymentAmount: 185000000,
        paymentFrequency: 'ANNUAL',
        annualProjections: '14.5% YoY Capital Gain | 9.2% Net Yield',
        isAssured: true,
        caretakerName: 'Damilola Coker',
        caretakerEmail: 'damilola@prope.com',
        caretakerPhone: '+234 812 345 6789'
      },
      {
        id: 'a0000000-0000-0000-0000-000000000002',
        landlordId: landlord2Id,
        title: 'The Horizon Oceanfront Villa',
        type: 'RENT',
        status: 'LISTED',
        area: 'Malibu, California',
        buildingType: 'Oceanfront Villa',
        price: 360000000,
        imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
        firstPaymentAmount: 90000000,
        paymentFrequency: 'ANNUAL',
        annualProjections: '11.2% Capital Yield | Rental Rate Index Stable',
        isAssured: true,
        caretakerName: 'George Davis',
        caretakerEmail: 'george@prope.com',
        caretakerPhone: '+1 (310) 555-0199'
      },
      {
        id: 'a0000000-0000-0000-0000-000000000003',
        landlordId: landlord2Id,
        title: 'The Copperwood Canopy',
        type: 'SALE',
        status: 'LISTED',
        area: 'Aspen, Colorado',
        buildingType: 'Eco-Luxury Lodge',
        price: 980000000,
        imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
        firstPaymentAmount: 245000000,
        paymentFrequency: 'ANNUAL',
        annualProjections: '16.8% YoY Yield due to Ski-in Access Expansion',
        isAssured: false,
        caretakerName: 'Robert Miller',
        caretakerEmail: 'r.miller@prope.com',
        caretakerPhone: '+1 (970) 555-8833'
      },
      {
        id: 'a0000000-0000-0000-0000-000000000004',
        landlordId: landlord1Id,
        title: 'La Vista Marina Estate',
        type: 'SALE',
        status: 'LISTED',
        area: 'Ikoyi, Lagos',
        buildingType: 'Waterfront Villa',
        price: 1550000000,
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        firstPaymentAmount: 310000000,
        paymentFrequency: 'ANNUAL',
        annualProjections: '13.2% Capital Yield | Stable Rental Outlook',
        isAssured: true,
        caretakerName: 'Damilola Coker',
        caretakerEmail: 'damilola@acrewise.com',
        caretakerPhone: '+234 812 345 6789'
      },
      {
        id: 'a0000000-0000-0000-0000-000000000005',
        landlordId: landlord2Id,
        title: 'The Amber Heights Estate',
        type: 'RENT',
        status: 'LISTED',
        area: 'Lekki Phase 1, Lagos',
        buildingType: 'Contemporary Villa',
        price: 180000000,
        imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
        firstPaymentAmount: 180000000,
        paymentFrequency: 'ANNUAL',
        annualProjections: '10.5% Capital Growth YoY',
        isAssured: true,
        caretakerName: 'Bisi Adebayo',
        caretakerEmail: 'bisi@acrewise.com',
        caretakerPhone: '+234 809 111 2233'
      },
      {
        id: 'a0000000-0000-0000-0000-000000000006',
        landlordId: landlord1Id,
        title: 'The Glass Obsidian Pavilions',
        type: 'RENT',
        status: 'LISTED',
        area: 'Banana Island, Lagos',
        buildingType: 'Ultra-Modern Smart Villa',
        price: 270000000,
        imageUrl: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=80',
        firstPaymentAmount: 270000000,
        paymentFrequency: 'ANNUAL',
        annualProjections: '15.0% Est. Valuation Yield',
        isAssured: true,
        caretakerName: 'Damilola Coker',
        caretakerEmail: 'damilola@acrewise.com',
        caretakerPhone: '+234 812 345 6789'
      }
    ];

    console.log('Inserting seed properties...');
    for (const p of propertiesData) {
      await query(`
        INSERT INTO properties (
          id, landlord_id, title, type, status, verification_status, area, building_type, price,
          total_units, available_units, image_url, first_payment_amount, payment_frequency,
          annual_projections, is_assured, caretaker_name, caretaker_email, caretaker_phone
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1, 1, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (id) DO NOTHING
      `, [
        p.id, p.landlordId, p.title, p.type, p.status, 'VERIFIED', p.area, p.buildingType, p.price,
        p.imageUrl, p.firstPaymentAmount, p.paymentFrequency, p.annualProjections, p.isAssured,
        p.caretakerName, p.caretakerEmail, p.caretakerPhone
      ]);
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    process.exit(0);
  }
}

seed();
