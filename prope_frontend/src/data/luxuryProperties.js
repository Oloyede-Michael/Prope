export const LUXURY_PROPERTIES = [
  {
    id: "lux-1",
    title: "The Obsidian Penthouse",
    type: "SALE",
    status: "LISTED",
    price: 1850000000, // NGN
    priceUSD: 1230000,
    priceEUR: 1150000,
    area: "Banana Island, Lagos",
    buildingType: "Duplex Penthouse",
    beds: 5,
    baths: 6,
    sqft: 7200,
    yearBuilt: 2024,
    tag: "Exclusive Listing",
    isAssured: true,
    description: "Designed by award-winning architects, The Obsidian Penthouse represents the absolute pinnacle of luxury. Located in Lagos's most exclusive enclave, this home commands 360-degree views of the Atlantic shoreline and the Lagos lagoon. Featuring custom Italian marble flooring, warm copper-trimmed fixtures, double-height ceilings, and fully automated Crestron systems, this residence is designed for the modern connoisseur. It also comes complete with a private terrace infinity pool and direct elevator access.",
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1613977257592-4871e5fbe7c5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=800&q=80"
    ],
    mapCoords: { x: 38, y: 42 }, // percentage coordinates on our custom map canvas
    amenities: {
      interior: ["Private Elevator", "Bespoke Wine Cellar", "Gaggenau Kitchen", "Italian Statuario Marble", "Private Steam Room"],
      exterior: ["Infinity Terrace Pool", "Panoramic Deck", "Copper Firepit", "Automated Sunshades"],
      building: ["24/7 Elite Concierge", "Private Resident Lounge", "Helipad Access", "Three Secure Parking Slots"],
      eco: ["Solar Microgrid Integration", "Smart HVAC Zonation", "Triple-Glazed Thermal Glass", "Living Green Balcony Walls"]
    },
    agent: {
      name: "Marcus Sterling",
      role: "Senior Managing Director",
      phone: "+234 815 555 9010",
      email: "m.sterling@prope-luxury.com",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&h=256&q=80"
    },
    caretakerName: "Damilola Coker",
    caretakerEmail: "damilola@prope-luxury.com",
    caretakerPhone: "+234 812 345 6789",
    firstPaymentAmount: 185000000,
    paymentFrequency: "ANNUAL",
    annualProjections: "14.5% YoY Capital Gain | 9.2% Net Yield"
  },
  {
    id: "lux-2",
    title: "The Horizon Oceanfront Villa",
    type: "RENT",
    status: "LISTED",
    price: 360000000, // NGN per year
    priceUSD: 240000,
    priceEUR: 225000,
    area: "Malibu, California",
    buildingType: "Oceanfront Villa",
    beds: 4,
    baths: 4.5,
    sqft: 5800,
    yearBuilt: 2023,
    tag: "Architectural Masterpiece",
    isAssured: true,
    description: "Suspended above the Malibu shoreline, this glass-and-steel masterpiece offers unprecedented privacy and architectural refinement. Floor-to-ceiling glass walls slide back to seamlessly blend indoor and outdoor spaces, opening up to a massive wrap-around deck with a heated lap pool. Featuring curated warm bronze metalworks, custom teak cabinets, and premium Sub-Zero/Wolf appliances, this villa offers a world-class beachside retreat with smart climate control and private beach stairs.",
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502005229762-fc1b2b812ca5?auto=format&fit=crop&w=800&q=80"
    ],
    mapCoords: { x: 75, y: 28 },
    amenities: {
      interior: ["Chef's Kitchen", "Private Media Cinema", "Bespoke Fireplace", "Smart Creston Integration", "Gym & Sauna Studio"],
      exterior: ["Heated Infinity Pool", "Direct Private Beach Access", "Outdoor Kitchen & Bar", "Hot Tub Spa"],
      building: ["Private Gated Driveway", "State-of-the-Art Alarm Matrix", "Underground Parking"],
      eco: ["Tesla Powerwall Arrays", "Rainwater Filtering Matrix", "Eco-Engineered Foundation Shielding", "High-Efficiency Aerated Water System"]
    },
    agent: {
      name: "Siena Montgomery",
      role: "Luxury Portfolio Specialist",
      phone: "+1 (310) 555-9030",
      email: "s.montgomery@prope-luxury.com",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80"
    },
    caretakerName: "George Davis",
    caretakerEmail: "george@prope-luxury.com",
    caretakerPhone: "+1 (310) 555-0199",
    firstPaymentAmount: 90000000,
    paymentFrequency: "ANNUAL",
    annualProjections: "11.2% Capital Yield | Rental Rate Index Stable"
  },
  {
    id: "lux-3",
    title: "The Copperwood Canopy",
    type: "SALE",
    status: "LISTED",
    price: 980000000, // NGN
    priceUSD: 653000,
    priceEUR: 612500,
    area: "Aspen, Colorado",
    buildingType: "Eco-Luxury Lodge",
    beds: 6,
    baths: 7,
    sqft: 8500,
    yearBuilt: 2022,
    tag: "Price Reduced",
    isAssured: false,
    description: "Tucked inside a dense stand of Aspen trees, this massive alpine residence pairs rustic grandeur with eco-luxury features. Copper-clad exterior panels adjust dynamically to the season's light, while the interior boasts floor-to-ceiling granite fireplaces, double-height exposed structural timber, and a state-of-the-art geo-thermal heating system. Unwind in the glass-enclosed spa area, or enjoy direct ski-in/ski-out convenience to Aspen's premier slopes.",
    images: [
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1504624724422-3de351415f33?auto=format&fit=crop&w=800&q=80"
    ],
    mapCoords: { x: 50, y: 15 },
    amenities: {
      interior: ["Granite Double Fireplaces", "Alpine Gear Locker Rooms", "Integrated Steam Bath", "Professional Grade Galley"],
      exterior: ["Ski-in / Ski-out Deck", "Heated Soaking Hot Springs Pool", "Stone Veranda", "Outdoor Hearth"],
      building: ["Heated Gated Entryway", "Professional Security Patrol", "Valet Shuttle Access"],
      eco: ["Geothermal Radiant Loop Heating", "Custom Graywater Recovery", "Smart Solar Roof Design", "Passive Triple Insulated Envelope"]
    },
    agent: {
      name: "Christian Vance",
      role: "Mountain Estates Director",
      phone: "+1 (970) 555-0144",
      email: "c.vance@prope-luxury.com",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&h=256&q=80"
    },
    caretakerName: "Robert Miller",
    caretakerEmail: "r.miller@prope-luxury.com",
    caretakerPhone: "+1 (970) 555-8833",
    firstPaymentAmount: 245000000,
    paymentFrequency: "ANNUAL",
    annualProjections: "16.8% YoY Yield due to Ski-in Access Expansion"
  },
  {
    id: "lux-4",
    title: "La Vista Marina Estate",
    type: "SALE",
    status: "LISTED",
    price: 1550000000, // NGN
    priceUSD: 1033000,
    priceEUR: 968000,
    area: "Ikoyi, Lagos",
    buildingType: "Waterfront Villa",
    beds: 5,
    baths: 5.5,
    sqft: 6800,
    yearBuilt: 2023,
    tag: "Exclusive Listing",
    isAssured: true,
    description: "Positioned directly on the waterfront in Ikoyi, this modern villa is an entertainer's dream. An expansive open-plan layout flows onto a pool deck overlooking the water, complete with a private jetty. High-spec custom metalworks, bronze panel details, and premium slab marble define the interior. Complete with a multi-camera AI security network, massive back-up diesel & solar hybrid generators, and executive staff quarters.",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80"
    ],
    mapCoords: { x: 22, y: 65 },
    amenities: {
      interior: ["Curator-Style Art Gallery Hallway", "High-Security Vault Room", "Staff Quarters Wing", "Private Lounge Bar"],
      exterior: ["Private Boat Slip & Jetty", "Waterfront Infinity Pool", "Teak Sun Deck", "Lawn Barbecue Station"],
      building: ["Perimeter Armored Guard Shack", "CCTV AI Intrusion Matrix", "Triple Gated Entrance"],
      eco: ["Solar & Battery Storage Array", "Central Water Treatment Unit", "Low-Energy LED Systems", "Passive Thermal Walls"]
    },
    agent: {
      name: "Marcus Sterling",
      role: "Senior Managing Director",
      phone: "+234 815 555 9010",
      email: "m.sterling@prope-luxury.com",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&h=256&q=80"
    },
    caretakerName: "Damilola Coker",
    caretakerEmail: "damilola@prope-luxury.com",
    caretakerPhone: "+234 812 345 6789",
    firstPaymentAmount: 310000000,
    paymentFrequency: "ANNUAL",
    annualProjections: "13.2% Capital Yield | Stable Rental Outlook"
  },
  {
    id: "lux-5",
    title: "The Amber Heights Estate",
    type: "RENT",
    status: "LISTED",
    price: 180000000, // NGN per year
    priceUSD: 120000,
    priceEUR: 112500,
    area: "Lekki Phase 1, Lagos",
    buildingType: "Contemporary Villa",
    beds: 4,
    baths: 4.5,
    sqft: 5000,
    yearBuilt: 2023,
    tag: "Exclusive Listing",
    isAssured: true,
    description: "An elegant contemporary villa located in the secure heart of Lekki Phase 1. Designed for sophisticated living, this home integrates premium warm copper screen panels on the exterior for privacy and solar shading. The double-height lounge is flooded with ambient light and connects directly to a pristine garden courtyard. Enjoy top-tier security, integrated surround sound, and premium finishing throughout.",
    images: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800&q=80"
    ],
    mapCoords: { x: 55, y: 70 },
    amenities: {
      interior: ["Double-Height Ceiling Lounge", "Preinstalled Sound System", "Spacious Family Lounge", "Integrated Dry Kitchen"],
      exterior: ["Courtyard Garden", "Private Plunge Pool", "Terrace Sitting Lounge", "Automated Gate Access"],
      building: ["Armed Patrol Community Security", "Electric Fencing", "Serviced Power Grid"],
      eco: ["Smart Energy Controls", "Energy-Star Cooling Matrix", "Low-flow aerated taps"]
    },
    agent: {
      name: "Siena Montgomery",
      role: "Luxury Portfolio Specialist",
      phone: "+1 (310) 555-9030",
      email: "s.montgomery@prope-luxury.com",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80"
    },
    caretakerName: "Bisi Adebayo",
    caretakerEmail: "bisi@prope-luxury.com",
    caretakerPhone: "+234 809 111 2233",
    firstPaymentAmount: 180000000,
    paymentFrequency: "ANNUAL",
    annualProjections: "10.5% Capital Growth YoY"
  },
  {
    id: "lux-6",
    title: "The Glass Obsidian Pavilions",
    type: "RENT",
    status: "LISTED",
    price: 270000000, // NGN per year
    priceUSD: 180000,
    priceEUR: 168000,
    area: "Banana Island, Lagos",
    buildingType: "Ultra-Modern Smart Villa",
    beds: 4,
    baths: 5,
    sqft: 6100,
    yearBuilt: 2024,
    tag: "Exclusive Listing",
    isAssured: true,
    description: "Constructed primarily from structural black steel and performance obsidian reflective glass, this villa defines the minimalist aesthetic. A clean geometric floor plan links three independent pavilions via glazed climate-controlled walkways. It includes a custom sunken courtyard firepit, massive multi-room master suite, smart solar roofing, fully automated security and concierge links, and automated lighting design.",
    images: [
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80"
    ],
    mapCoords: { x: 34, y: 20 },
    amenities: {
      interior: ["Structural Glazed Hallways", "Hidden Safe Rooms", "Home Automation Hub", "Private Gym Loft"],
      exterior: ["Sunken Courtyard Seating", "Custom Linear Lap Pool", "Wrap-Around Obsidian Deck"],
      building: ["Secure Controlled Enclave", "Integrated Biometric Access", "Subterranean Staff Wing"],
      eco: ["Solar Tile Roof Tiles", "Advanced Thermal Glass Core", "Living Wall Planters", "Integrated Water Recycling Plant"]
    },
    agent: {
      name: "Marcus Sterling",
      role: "Senior Managing Director",
      phone: "+234 815 555 9010",
      email: "m.sterling@prope-luxury.com",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&h=256&q=80"
    },
    caretakerName: "Damilola Coker",
    caretakerEmail: "damilola@prope-luxury.com",
    caretakerPhone: "+234 812 345 6789",
    firstPaymentAmount: 270000000,
    paymentFrequency: "ANNUAL",
    annualProjections: "15.0% Est. Valuation Yield"
  }
];
