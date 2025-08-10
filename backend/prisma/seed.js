const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const wasteItems = [
  // WET WASTE
  { name: 'Vegetable Peels', category: 'WET', binType: 'WET', disposalInstructions: 'Dispose in green/wet waste bin. Can be composted at home.', points: 2 },
  { name: 'Fruit Scraps', category: 'WET', binType: 'WET', disposalInstructions: 'Dispose in green/wet waste bin. Perfect for home composting.', points: 2 },
  { name: 'Tea Leaves', category: 'WET', binType: 'WET', disposalInstructions: 'Dispose in green/wet waste bin. Great for composting.', points: 1 },
  { name: 'Coffee Grounds', category: 'WET', binType: 'WET', disposalInstructions: 'Dispose in green/wet waste bin. Excellent compost material.', points: 1 },
  { name: 'Eggshells', category: 'WET', binType: 'WET', disposalInstructions: 'Dispose in green/wet waste bin. Rich in calcium for compost.', points: 1 },
  { name: 'Leftover Food', category: 'WET', binType: 'WET', disposalInstructions: 'Dispose in green/wet waste bin. Avoid meat and dairy in home compost.', points: 2 },
  { name: 'Bread Crumbs', category: 'WET', binType: 'WET', disposalInstructions: 'Dispose in green/wet waste bin. Decomposes quickly.', points: 1 },
  { name: 'Flower Petals', category: 'WET', binType: 'WET', disposalInstructions: 'Dispose in green/wet waste bin. Natural and biodegradable.', points: 1 },
  { name: 'Coconut Shell', category: 'WET', binType: 'WET', disposalInstructions: 'Break into pieces before disposal in wet waste bin.', points: 3 },
  { name: 'Rice Husk', category: 'WET', binType: 'WET', disposalInstructions: 'Dispose in green/wet waste bin. Great for composting.', points: 1 },

  // DRY WASTE - RECYCLABLE
  { name: 'Plastic Bottle', category: 'RECYCLABLE', binType: 'DRY', disposalInstructions: 'Clean and dispose in blue/dry waste bin. Remove cap and label if possible.', points: 3 },
  { name: 'Aluminum Can', category: 'RECYCLABLE', binType: 'DRY', disposalInstructions: 'Rinse and dispose in blue/dry waste bin. Highly recyclable material.', points: 4 },
  { name: 'Glass Bottle', category: 'RECYCLABLE', binType: 'DRY', disposalInstructions: 'Clean and dispose in blue/dry waste bin. Handle with care.', points: 4 },
  { name: 'Cardboard Box', category: 'RECYCLABLE', binType: 'DRY', disposalInstructions: 'Flatten and dispose in blue/dry waste bin. Remove tape and staples.', points: 3 },
  { name: 'Newspaper', category: 'RECYCLABLE', binType: 'DRY', disposalInstructions: 'Keep dry and dispose in blue/dry waste bin. Highly recyclable.', points: 2 },
  { name: 'Magazine', category: 'RECYCLABLE', binType: 'DRY', disposalInstructions: 'Dispose in blue/dry waste bin. Remove plastic covers if any.', points: 2 },
  { name: 'Plastic Bag', category: 'RECYCLABLE', binType: 'DRY', disposalInstructions: 'Clean and dispose in blue/dry waste bin. Better to reuse multiple times.', points: 1 },
  { name: 'Milk Carton', category: 'RECYCLABLE', binType: 'DRY', disposalInstructions: 'Rinse thoroughly and dispose in blue/dry waste bin.', points: 3 },
  { name: 'Juice Tetra Pack', category: 'RECYCLABLE', binType: 'DRY', disposalInstructions: 'Rinse and dispose in blue/dry waste bin. Multi-layered packaging.', points: 3 },
  { name: 'Tin Can', category: 'RECYCLABLE', binType: 'DRY', disposalInstructions: 'Clean and dispose in blue/dry waste bin. Remove labels if possible.', points: 3 },

  // DRY WASTE - NON-RECYCLABLE
  { name: 'Broken Ceramic', category: 'DRY', binType: 'DRY', disposalInstructions: 'Wrap safely and dispose in blue/dry waste bin. Not recyclable.', points: 1 },
  { name: 'Styrofoam', category: 'DRY', binType: 'DRY', disposalInstructions: 'Dispose in blue/dry waste bin. Difficult to recycle, try to avoid buying.', points: 1 },
  { name: 'Candy Wrapper', category: 'DRY', binType: 'DRY', disposalInstructions: 'Dispose in blue/dry waste bin. Not recyclable due to mixed materials.', points: 1 },
  { name: 'Cigarette Butt', category: 'DRY', binType: 'DRY', disposalInstructions: 'Dispose in blue/dry waste bin. Contains harmful chemicals.', points: 1 },
  { name: 'Cotton Swab', category: 'DRY', binType: 'DRY', disposalInstructions: 'Dispose in blue/dry waste bin. Plastic stick is not biodegradable.', points: 1 },
  { name: 'Disposable Razor', category: 'DRY', binType: 'DRY', disposalInstructions: 'Dispose carefully in blue/dry waste bin. Sharp object.', points: 1 },
  { name: 'Laminated Paper', category: 'DRY', binType: 'DRY', disposalInstructions: 'Dispose in blue/dry waste bin. Plastic coating prevents recycling.', points: 1 },
  { name: 'Bubble Wrap', category: 'DRY', binType: 'DRY', disposalInstructions: 'Dispose in blue/dry waste bin. Reuse for packaging when possible.', points: 1 },

  // E-WASTE
  { name: 'Mobile Phone', category: 'E_WASTE', binType: 'E_WASTE', disposalInstructions: 'Take to authorized e-waste collection center. Contains valuable and hazardous materials.', points: 10 },
  { name: 'Laptop', category: 'E_WASTE', binType: 'E_WASTE', disposalInstructions: 'Take to authorized e-waste collection center. Remove personal data first.', points: 15 },
  { name: 'LED Bulb', category: 'E_WASTE', binType: 'E_WASTE', disposalInstructions: 'Take to authorized e-waste collection center. Contains electronic components.', points: 3 },
  { name: 'Computer Mouse', category: 'E_WASTE', binType: 'E_WASTE', disposalInstructions: 'Take to authorized e-waste collection center. Contains electronic components.', points: 4 },
  { name: 'Keyboard', category: 'E_WASTE', binType: 'E_WASTE', disposalInstructions: 'Take to authorized e-waste collection center. Plastic and electronic waste.', points: 5 },
  { name: 'Headphones', category: 'E_WASTE', binType: 'E_WASTE', disposalInstructions: 'Take to authorized e-waste collection center. Contains wires and electronic parts.', points: 4 },
  { name: 'Power Cable', category: 'E_WASTE', binType: 'E_WASTE', disposalInstructions: 'Take to authorized e-waste collection center. Copper wire can be recycled.', points: 3 },
  { name: 'USB Drive', category: 'E_WASTE', binType: 'E_WASTE', disposalInstructions: 'Take to authorized e-waste collection center. Clear data before disposal.', points: 3 },
  { name: 'Old Television', category: 'E_WASTE', binType: 'E_WASTE', disposalInstructions: 'Take to authorized e-waste collection center. Large electronic appliance.', points: 20 },
  { name: 'Calculator', category: 'E_WASTE', binType: 'E_WASTE', disposalInstructions: 'Take to authorized e-waste collection center. Remove batteries if possible.', points: 3 },

  // HAZARDOUS WASTE
  { name: 'Used Battery', category: 'HAZARDOUS', binType: 'HAZARDOUS', disposalInstructions: 'Take to battery collection point. Contains toxic chemicals.', points: 5 },
  { name: 'Expired Medicine', category: 'HAZARDOUS', binType: 'HAZARDOUS', disposalInstructions: 'Return to pharmacy or take to hazardous waste collection. Never flush or throw in regular bins.', points: 5 },
  { name: 'Paint Can', category: 'HAZARDOUS', binType: 'HAZARDOUS', disposalInstructions: 'Take to hazardous waste collection center. Contains toxic chemicals.', points: 8 },
  { name: 'Pesticide Container', category: 'HAZARDOUS', binType: 'HAZARDOUS', disposalInstructions: 'Take to hazardous waste collection center. Highly toxic contents.', points: 10 },
  { name: 'Motor Oil', category: 'HAZARDOUS', binType: 'HAZARDOUS', disposalInstructions: 'Take to auto service center or hazardous waste collection. Never pour down drain.', points: 8 },
  { name: 'Thermometer (Mercury)', category: 'HAZARDOUS', binType: 'HAZARDOUS', disposalInstructions: 'Take to hazardous waste collection center. Mercury is highly toxic.', points: 8 },
  { name: 'Fluorescent Tube', category: 'HAZARDOUS', binType: 'HAZARDOUS', disposalInstructions: 'Take to authorized collection center. Contains mercury vapor.', points: 6 },
  { name: 'Cleaning Chemical', category: 'HAZARDOUS', binType: 'HAZARDOUS', disposalInstructions: 'Take to hazardous waste collection center. Read label for specific disposal instructions.', points: 6 },

  // ADDITIONAL COMMON ITEMS
  { name: 'Paper Cup', category: 'DRY', binType: 'DRY', disposalInstructions: 'Dispose in blue/dry waste bin. Plastic lining prevents recycling.', points: 1 },
  { name: 'Cloth Rags', category: 'DRY', binType: 'DRY', disposalInstructions: 'Dispose in blue/dry waste bin. Consider donating if in good condition.', points: 2 },
  { name: 'Rubber Gloves', category: 'DRY', binType: 'DRY', disposalInstructions: 'Dispose in blue/dry waste bin. Not recyclable.', points: 1 },
  { name: 'Plastic Straw', category: 'DRY', binType: 'DRY', disposalInstructions: 'Dispose in blue/dry waste bin. Better to use reusable alternatives.', points: 1 },
  { name: 'Pizza Box', category: 'RECYCLABLE', binType: 'DRY', disposalInstructions: 'Remove food residue and dispose in blue/dry waste bin. Oil stains make it non-recyclable.', points: 2 },
  { name: 'Wooden Stick', category: 'DRY', binType: 'DRY', disposalInstructions: 'Dispose in blue/dry waste bin. Natural material but treated wood may not compost well.', points: 1 }
];

const bins = [
  // Sample bins for different areas
  { name: 'Main Gate Wet Waste', latitude: 12.9716, longitude: 77.5946, type: 'WET', capacity: 200 },
  { name: 'Main Gate Dry Waste', latitude: 12.9716, longitude: 77.5947, type: 'DRY', capacity: 300 },
  { name: 'Cafeteria Wet Waste', latitude: 12.9720, longitude: 77.5950, type: 'WET', capacity: 150 },
  { name: 'Cafeteria Dry Waste', latitude: 12.9720, longitude: 77.5951, type: 'DRY', capacity: 200 },
  { name: 'Library E-Waste', latitude: 12.9725, longitude: 77.5955, type: 'E_WASTE', capacity: 50 },
  { name: 'Admin Block Hazardous', latitude: 12.9730, longitude: 77.5960, type: 'HAZARDOUS', capacity: 30 },
];

const valuableMaterials = [
  {
    name: 'Copper Wire',
    description: 'High-value recyclable metal found in electrical cables and appliances. Remove plastic coating for better value.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    valueLevel: 'HIGH'
  },
  {
    name: 'Aluminum Cans',
    description: 'Highly recyclable material. Clean cans fetch better prices. Aluminum can be recycled infinitely.',
    imageUrl: 'https://images.unsplash.com/photo-1572020154673-2cf6c3dd67be?w=400',
    valueLevel: 'HIGH'
  },
  {
    name: 'Brass Items',
    description: 'Heavy metal items like taps, door handles, and decorative pieces. Very valuable for scrap.',
    imageUrl: 'https://images.unsplash.com/photo-1589835515938-ce43d6b2d7e7?w=400',
    valueLevel: 'HIGH'
  },
  {
    name: 'Stainless Steel',
    description: 'Kitchen utensils, appliances, and industrial materials. Good value and widely accepted.',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    valueLevel: 'MEDIUM'
  },
  {
    name: 'Iron & Steel',
    description: 'Common metal found in household items. Separate from aluminum for better sorting.',
    imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400',
    valueLevel: 'MEDIUM'
  },
  {
    name: 'Plastic Bottles (PET)',
    description: 'Look for recycling code #1. Clean bottles without labels fetch better prices.',
    imageUrl: 'https://images.unsplash.com/photo-1572811866717-3b06b68e2e30?w=400',
    valueLevel: 'MEDIUM'
  },
  {
    name: 'Lead-Acid Batteries',
    description: 'Car batteries and UPS batteries. Contain valuable lead but also hazardous materials.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-4c7c4b8c5ed0?w=400',
    valueLevel: 'HIGH'
  },
  {
    name: 'Electronic Circuit Boards',
    description: 'From computers, phones, and appliances. Contain precious metals like gold and silver.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
    valueLevel: 'HIGH'
  }
];

const scrapPrices = [
  { materialName: 'Copper Wire (Clean)', pricePerKg: 650 },
  { materialName: 'Aluminum Cans', pricePerKg: 180 },
  { materialName: 'Brass Items', pricePerKg: 420 },
  { materialName: 'Stainless Steel', pricePerKg: 85 },
  { materialName: 'Iron & Steel', pricePerKg: 28 },
  { materialName: 'Lead-Acid Battery', pricePerKg: 95 },
  { materialName: 'PET Plastic Bottles', pricePerKg: 15 },
  { materialName: 'Circuit Boards', pricePerKg: 850 },
  { materialName: 'Zinc', pricePerKg: 135 },
  { materialName: 'Tin', pricePerKg: 280 }
];

async function main() {
  console.log('🌱 Starting EcoSort database seeding...');

  try {
    // Clear existing data
    console.log('🧹 Cleaning existing data...');
    await prisma.wasteLog.deleteMany({});
    await prisma.scrapPrice.deleteMany({});
    await prisma.valuableMaterial.deleteMany({});
    await prisma.wasteItem.deleteMany({});
    await prisma.bin.deleteMany({});
    await prisma.user.deleteMany({});

    // Seed waste items
    console.log('📦 Seeding waste items...');
    const createdWasteItems = await Promise.all(
      wasteItems.map(item => prisma.wasteItem.create({ data: item }))
    );
    console.log(`✅ Created ${createdWasteItems.length} waste items`);

    // Seed bins
    console.log('🗑️ Seeding bins...');
    const createdBins = await Promise.all(
      bins.map(bin => prisma.bin.create({ data: bin }))
    );
    console.log(`✅ Created ${createdBins.length} bins`);

    // Seed valuable materials
    console.log('💎 Seeding valuable materials...');
    const createdValuableMaterials = await Promise.all(
      valuableMaterials.map(material => prisma.valuableMaterial.create({ data: material }))
    );
    console.log(`✅ Created ${createdValuableMaterials.length} valuable materials`);

    // Seed scrap prices
    console.log('💰 Seeding scrap prices...');
    const createdScrapPrices = await Promise.all(
      scrapPrices.map(price => prisma.scrapPrice.create({ data: price }))
    );
    console.log(`✅ Created ${createdScrapPrices.length} scrap prices`);

    // Create sample users
    console.log('👥 Creating sample users...');
    const bcrypt = require('bcryptjs');
    const sampleUsers = [
      {
        name: 'Demo User',
        email: 'demo@ecosort.com',
        passwordHash: await bcrypt.hash('demo123', 10),
        points: 150
      },
      {
        name: 'Eco Warrior',
        email: 'warrior@ecosort.com',
        passwordHash: await bcrypt.hash('eco123', 10),
        points: 300
      }
    ];

    const createdUsers = await Promise.all(
      sampleUsers.map(user => prisma.user.create({ data: user }))
    );
    console.log(`✅ Created ${createdUsers.length} sample users`);

    // Create some sample waste logs
    console.log('📊 Creating sample waste logs...');
    const sampleLogs = [];
    const areas = ['Downtown', 'Campus', 'Mall', 'Residential', 'Office Complex'];
    
    for (let i = 0; i < 20; i++) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const randomWasteItem = createdWasteItems[Math.floor(Math.random() * createdWasteItems.length)];
      const randomArea = areas[Math.floor(Math.random() * areas.length)];
      sampleLogs.push({
        userId: randomUser.id,
        wasteItemId: randomWasteItem.id,
        quantity: Math.floor(Math.random() * 5) + 1,
        points: randomWasteItem.points,
        area: randomArea,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)) // Random time in last 7 days
      });
    }

    const createdLogs = await Promise.all(
      sampleLogs.map(log => prisma.wasteLog.create({ data: log }))
    );
    console.log(`✅ Created ${createdLogs.length} waste logs`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${createdWasteItems.length} waste items`);
    console.log(`   - ${createdBins.length} bins`);
    console.log(`   - ${createdValuableMaterials.length} valuable materials`);
    console.log(`   - ${createdScrapPrices.length} scrap prices`);
    console.log(`   - ${createdUsers.length} users`);
    console.log(`   - ${createdLogs.length} waste logs`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log('✨ Seeding process finished successfully!');
    process.exit(0);
  })
  .catch((e) => {
    console.error('💥 Seeding failed:', e);
    process.exit(1);
  });
