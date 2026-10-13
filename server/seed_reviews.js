import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedReviews() {
  console.log('Seeding customer reviews...');

  // Delete existing reviews to avoid duplicate clutter
  await prisma.productReview.deleteMany({});

  const now = new Date('2026-10-02T11:45:00.000Z');
  const todayMorning = new Date('2026-10-02T08:30:00.000Z');
  const todayEarlier = new Date('2026-10-02T05:15:00.000Z');

  const daysAgo = (d, h = 10) => {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    date.setHours(h, 0, 0, 0);
    return date;
  };

  const reviewsData = [
    // --- TODAY (2026-10-02) ---
    {
      productId: 'herb-1',
      userName: 'Siddharth Saxena',
      userCity: 'Bengaluru, Karnataka',
      rating: 5,
      title: 'Exceptional Nagori Ashwagandha Quality! Direct from farm',
      comment: 'Received the batch today morning. The root texture and authentic earthy aroma confirms genuine organic harvesting without chemical washes. Sleep quality and cortisol reduction has already improved with daily milk decoction.',
      replyText: 'Thank you Siddharth ji! We sun-cure each batch at our Neemuch farm for 6 days under shade to retain maximum Withaferin-A potency.',
      repliedBy: 'Certified Producer',
      repliedAt: new Date('2026-10-02T10:00:00.000Z'),
      verified: true,
      createdAt: todayMorning
    },
    {
      productId: 'herb-2',
      userName: 'Dr. Meenakshi Sundaram',
      userCity: 'Chennai, Tamil Nadu',
      rating: 5,
      title: 'Fresh Wild Giloy Stem - Potent Therapeutic Grade',
      comment: 'As an Ayurvedic practitioner, finding fresh Neem-climbing Giloy stems with high juice density is rare. The bitter rasa is sharp and authentic. Recommended to 4 of my liver detox patients today.',
      replyText: null,
      repliedBy: null,
      repliedAt: null,
      verified: true,
      createdAt: now
    },
    {
      productId: 'herb-5',
      userName: 'Ananya Deshmukh',
      userCity: 'Pune, Maharashtra',
      rating: 5,
      title: 'Clean Shatavari Root, Excellent packaging & Lab QR scan',
      comment: 'Scanned the QR batch code on the packet and saw the actual NABL test certificate showing zero heavy metals. Purity and transparency is top notch. Delivery was fast!',
      replyText: 'Dhanyawad Ananya ji! All our roots undergo NABL heavy metal and microbial testing before dispatch.',
      repliedBy: 'Farm Quality Desk',
      repliedAt: new Date('2026-10-02T09:30:00.000Z'),
      verified: true,
      createdAt: todayEarlier
    },

    // --- THIS WEEK (1 - 6 days ago) ---
    {
      productId: 'herb-1',
      userName: 'Vikramaditya Rao',
      userCity: 'Hyderabad, Telangana',
      rating: 5,
      title: 'Real Ashwagandha without additives or chalk powder',
      comment: 'Most store-bought ashwagandha powder is adulterated with rice flour. Ordering whole dried roots from this farmer has been a gamechanger. We grind it fresh at home.',
      replyText: 'Happy to serve! Whole root form ensures zero scope of adulteration.',
      repliedBy: 'Farmer Cooperative',
      repliedAt: daysAgo(2, 14),
      verified: true,
      createdAt: daysAgo(2, 11)
    },
    {
      productId: 'herb-3',
      userName: 'Pooja Kashyap',
      userCity: 'Jaipur, Rajasthan',
      rating: 4,
      title: 'Tangy and vitamin-C rich Wild Amla Churna',
      comment: 'Very fine milling and retains natural tartness. We mix a spoonful with warm water and raw honey every sunrise. Good packaging and resealable pouch.',
      replyText: null,
      repliedBy: null,
      repliedAt: null,
      verified: true,
      createdAt: daysAgo(3, 16)
    },
    {
      productId: 'herb-4',
      userName: 'Col. Rajesh Bakshi (Retd.)',
      userCity: 'Dehradun, Uttarakhand',
      rating: 5,
      title: 'Pure Himalayan Shilajit - Genuine burn test passed',
      comment: 'Dissolves completely in warm water with golden hue, doesn’t bubble up like fake coal tar. Fulvic acid content is evident from energy levels. Excellent ethical sourcing.',
      replyText: 'Warm regards Colonel Sir! Our resin is harvested above 16,000 feet in Kinnaur valleys.',
      repliedBy: 'High Altitude Harvester',
      repliedAt: daysAgo(5, 12),
      verified: true,
      createdAt: daysAgo(5, 9)
    },

    // --- THIS MONTH (7 - 25 days ago) ---
    {
      productId: 'herb-2',
      userName: 'Kavita Nambiar',
      userCity: 'Kochi, Kerala',
      rating: 5,
      title: 'Immunity booster for family monsoon health',
      comment: 'Prepared daily Kwath with crushed Giloy stem, black pepper, and Tulsi. Kept seasonal viral fevers completely away from my elderly parents this month.',
      replyText: null,
      repliedBy: null,
      repliedAt: null,
      verified: true,
      createdAt: daysAgo(10, 15)
    },
    {
      productId: 'herb-1',
      userName: 'Harish Chandra Verma',
      userCity: 'Indore, MP',
      rating: 4,
      title: 'Prompt delivery to local city, great batch',
      comment: 'Being close to Neemuch, shipment reached within 24 hours. Roots were dry, unblemished, and well sorted by size. Price per 100g is very fair.',
      replyText: 'Thank you Harish ji for supporting local state farmers directly!',
      repliedBy: 'Farmer Cooperative',
      repliedAt: daysAgo(14, 11),
      verified: true,
      createdAt: daysAgo(15, 10)
    },
    {
      productId: 'herb-5',
      userName: 'Sunita Agarwal',
      userCity: 'Lucknow, Uttar Pradesh',
      rating: 5,
      title: 'Ayurvedic doctor recommended this exact farm lot',
      comment: 'My Vaidya ji told me to purchase directly from this certified farmer portal instead of branded OTC pills. Purity difference is remarkable.',
      replyText: null,
      repliedBy: null,
      repliedAt: null,
      verified: true,
      createdAt: daysAgo(21, 14)
    }
  ];

  for (const r of reviewsData) {
    await prisma.productReview.create({ data: r });
  }

  const count = await prisma.productReview.count();
  console.log(`Successfully seeded ${count} customer reviews!`);
}

seedReviews()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
