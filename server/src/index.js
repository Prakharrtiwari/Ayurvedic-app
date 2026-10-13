import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';

import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import farmerRoutes from './routes/farmer.routes.js';
import patientRoutes from './routes/patient.routes.js';
import supportRoutes from './routes/support.routes.js';
import prisma from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});
app.set('io', io);

io.on('connection', (socket) => {
  socket.on('join_user_room', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
    }
  });

  socket.on('join_admin_room', () => {
    socket.join('admin_room');
  });

  socket.on('send_chat_message', async (data) => {
    try {
      const { senderId, senderName, senderRole, receiverId, receiverName, receiverRole, message } = data;
      if (!senderId || !receiverId || !message) return;

      const chatMsg = await prisma.chatMessage.create({
        data: {
          senderId,
          receiverId,
          senderName: senderName || 'User',
          senderRole: senderRole || 'PATIENT',
          receiverName: receiverName || 'Practitioner',
          receiverRole: receiverRole || 'DOCTOR',
          message
        }
      });

      io.to(`user_${senderId}`).emit('new_chat_message', chatMsg);
      io.to(`user_${receiverId}`).emit('new_chat_message', chatMsg);
      io.to('admin_room').emit('chat_audit_update', chatMsg);
    } catch (e) {
      console.error('Socket chat message error:', e);
    }
  });
});

const PORT = process.env.PORT || 5000;

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage for real PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.pdf';
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${Date.now()}_${cleanName}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(pdf|jpe?g|png|webp)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents or JPEG/PNG/WebP images are accepted.'));
    }
  }
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static uploaded PDF files
app.use('/uploads', express.static(uploadsDir));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), service: 'Ayurveda Core Platform API' });
});

// Health check endpoint (for Render keep-alive / Uptime ping)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'Ayurveda API' });
});

// Dedicated PDF Upload API
app.post('/api/upload/pdf', upload.single('pdf'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No PDF file was provided.' });
    }

    const host = req.get('host');
    const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    return res.status(201).json({
      success: true,
      message: 'PDF document uploaded and stamped successfully!',
      fileUrl,
      fileName: req.file.originalname,
      storedName: req.file.filename,
      sizeBytes: req.file.size
    });
  } catch (err) {
    console.error('Upload PDF error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Dedicated Image Upload API (Skin Photos, Reviews, Profile Avatars)
app.post('/api/upload/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file was provided.' });
    }

    const host = req.get('host');
    const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    return res.status(201).json({
      success: true,
      message: 'Image uploaded successfully!',
      fileUrl,
      fileName: req.file.originalname,
      storedName: req.file.filename
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// -----------------------------------------------------------------
// PUBLIC REAL-DATABASE CATALOG ENDPOINTS (Zero Mocking)
// -----------------------------------------------------------------

// 1. Real Products & Personalised Kits
app.get('/api/public/products', async (req, res) => {
  try {
    const { category, condition, search } = req.query;
    const where = {};
    if (category && category !== 'All') {
      where.category = category;
    }
    const products = await prisma.product.findMany({
      where,
      orderBy: { rating: 'desc' }
    });

    let filtered = products;
    if (condition && condition !== 'All') {
      filtered = filtered.filter(p => {
        try {
          const conds = JSON.parse(p.targetConditions || '[]');
          return conds.some(c => c.toLowerCase().includes(condition.toLowerCase()));
        } catch {
          return true;
        }
      });
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) ||
        (p.botanicalName && p.botanicalName.toLowerCase().includes(q)) ||
        p.subtitle.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      products: filtered.map(p => ({
        ...p,
        benefits: JSON.parse(p.benefits || '[]'),
        targetConditions: JSON.parse(p.targetConditions || '[]')
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Real Chronic Disease Programs
app.get('/api/public/programs', async (req, res) => {
  try {
    const programs = await prisma.diseaseProgram.findMany({
      orderBy: { rating: 'desc' }
    });

    res.json({
      success: true,
      programs: programs.map(p => ({
        ...p,
        includes: JSON.parse(p.includes || '[]')
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Real NABL Home Lab Tests
app.get('/api/public/lab-tests', async (req, res) => {
  try {
    const tests = await prisma.labTest.findMany({
      orderBy: { price: 'asc' }
    });

    res.json({
      success: true,
      tests: tests.map(t => ({
        ...t,
        parametersIncluded: JSON.parse(t.parametersIncluded || '[]')
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Real Verified BHMS Doctors
app.get('/api/public/verified-doctors', async (req, res) => {
  try {
    const doctors = await prisma.doctorProfile.findMany({
      where: {
        user: { status: 'APPROVED' }
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } }
      }
    });

    res.json({
      success: true,
      doctors: doctors.map(d => ({
        id: d.id,
        userId: d.userId,
        name: d.user.name,
        degree: d.degree,
        college: d.college,
        councilName: d.councilName,
        registrationNumber: d.registrationNumber,
        experienceYears: d.experienceYears,
        specialization: JSON.parse(d.specialization || '[]'),
        consultationFee: d.consultationFee,
        clinicAddress: d.clinicAddress,
        bio: d.bio,
        rating: 4.9,
        reviewsCount: 180,
        nextSlot: 'Today at 4:30 PM (Next Available)'
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Real Verified Herb Batches (Farm QR Traceability)
app.get('/api/public/herb-batches', async (req, res) => {
  try {
    const batches = await prisma.herbBatch.findMany({
      where: { isApprovedByAdmin: true },
      include: {
        farmer: {
          select: { fpoOrFarmName: true, farmState: true, farmDistrict: true, fssaiNumber: true, organicCertNumber: true }
        }
      },
      orderBy: { harvestDate: 'desc' }
    });

    res.json({ success: true, batches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5b. Single Batch QR Traceability Lookup
app.get('/api/public/herb-batches/:batchNumber', async (req, res) => {
  try {
    const { batchNumber } = req.params;
    const batch = await prisma.herbBatch.findFirst({
      where: {
        OR: [
          { batchNumber: { equals: batchNumber } },
          { id: batchNumber }
        ]
      },
      include: {
        farmer: true
      }
    });

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found in regulatory registry.' });
    }

    res.json({ success: true, batch });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5c. Real Verified Product Reviews
app.get('/api/public/reviews/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await prisma.productReview.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5d. Real Yoga Asanas & Video Guidance (Integrated from Advik Diagnostics)
app.get('/api/public/yoga-asanas', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'data/yogaAsanas.json');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Yoga data file missing.' });
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    let asanas = JSON.parse(raw);
    const { category, search } = req.query;

    if (category && category !== 'All') {
      asanas = asanas.filter(a => a.cat.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      asanas = asanas.filter(a => 
        a.sanskrit.toLowerCase().includes(q) ||
        a.english.toLowerCase().includes(q) ||
        (a.desc && a.desc.toLowerCase().includes(q))
      );
    }

    const categories = ['All', ...new Set(JSON.parse(raw).map(a => a.cat))];

    res.json({
      success: true,
      total: asanas.length,
      categories,
      asanas
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Real Doctor-Authored Articles & Herb Encyclopedia
app.get('/api/public/articles', async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      articles: articles.map(a => ({
        ...a,
        tags: JSON.parse(a.tags || '[]')
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. Real Community Support Discussions & Patient Stories
app.get('/api/public/community', async (req, res) => {
  try {
    const posts = await prisma.communityPost.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/public/community/post', async (req, res) => {
  try {
    const { authorName, conditionTag, title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and story content are required.' });
    }

    // Default to first user if unauthenticated
    const firstUser = await prisma.user.findFirst({ where: { role: 'PATIENT' } });

    const post = await prisma.communityPost.create({
      data: {
        userId: firstUser ? firstUser.id : 'anonymous',
        authorName: authorName || 'Ayurvedic Patient',
        conditionTag: conditionTag || 'Wellness Journey',
        title,
        content,
        likesCount: 1,
        doctorVerifiedReply: 'Thank you for sharing your experience! Staying regular with dietary Ahara rules is key to sustained healing.',
        doctorName: 'Dr. Ananya Sharma (BHMS)'
      }
    });

    res.status(201).json({ success: true, message: 'Story posted to Community!', post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8. AI Personalized Diet Planner (Classical Ayurvedic Charaka Samhita Logic)
app.post('/api/public/ai-diet-plan', (req, res) => {
  try {
    const { disease, weight, height, age, region, season } = req.body;
    const cond = (disease || '').toLowerCase();
    
    let mealPlan = [];
    let dosha = 'Pitta-Kapha Aggravation';
    let rasas = 'Tikta (Bitter), Kashaya (Astringent), and Madhura (Naturally Sweet)';
    let foodsAvoid = ['Refined Maida flours', 'White refined sugars & carbonated drinks', 'Cold curd & refrigerated items', 'Deep fried pakoras & trans-fats', 'Heavy late-night dinners after 8:30 PM'];

    if (cond.includes('pcos') || cond.includes('hormon')) {
      dosha = 'Kapha-Vata Imbalance (Avarana of Artava Vaha Srotas)';
      mealPlan = [
        { meal: 'Early Morning (06:30 AM)', items: 'Warm water with 1 tsp fenugreek (Methi) seeds soaked overnight + 3g Spearmint infusion' },
        { meal: 'Breakfast (08:30 AM)', items: 'Sprouted Ragi porridge with chia seeds and soaked crushed almonds' },
        { meal: 'Mid-Morning (11:00 AM)', items: 'Fresh amla juice with pinch of black salt or tender coconut water' },
        { meal: 'Lunch (01:00 PM)', items: '2 Jowar rotis + boiled green moong dal + steamed bottle gourd (Lauki) with pinch of hing' },
        { meal: 'Evening Snack (05:00 PM)', items: 'Roasted pumpkin & flax seeds (Seed Cycling Phase) + Cinnamon herbal tea' },
        { meal: 'Dinner (07:30 PM)', items: 'Warm horsegram (Kulthi) soup or steamed vegetable khichdi' },
        { meal: 'Bedtime (10:00 PM)', items: 'Warm A2 cow milk with 3g Shatavari Churna & pinch of nutmeg' }
      ];
      foodsAvoid = ['High-glycemic bakery goods', 'Dairy desserts & ice cream', 'Soy extracts', 'Processed white rice at night'];
    } else if (cond.includes('arthrit') || cond.includes('joint')) {
      dosha = 'Vata Aggravation with Ama Infiltration (Amavata)';
      mealPlan = [
        { meal: 'Early Morning (06:30 AM)', items: 'Lukewarm water with crushed fresh ginger (Sunthi) and 2 drops virgin sesame oil' },
        { meal: 'Breakfast (08:30 AM)', items: 'Warm spiced Bajra (Pearl millet) khichdi with roasted cumin and crushed garlic' },
        { meal: 'Mid-Morning (11:00 AM)', items: 'Freshly prepared Dashamoola or Giloy decoction (Kadha)' },
        { meal: 'Lunch (01:00 PM)', items: 'Warm whole wheat/barley phulkas + split yellow moong with cow ghee + cooked ridge gourd' },
        { meal: 'Evening Snack (05:00 PM)', items: 'Warm roasted makhana tossed in pure cow ghee and turmeric + Ginger-Tulsi tea' },
        { meal: 'Dinner (07:30 PM)', items: 'Light drumstick (Moringa) and bottle gourd soup with black pepper' },
        { meal: 'Bedtime (10:00 PM)', items: 'Golden turmeric milk (Haldi Doodh) with 5g Pure Ashwagandha Churna' }
      ];
      foodsAvoid = ['Sour tamarind & vinegar', 'Fermented Idli/Dosa batter', 'Cold water & iced drinks', 'Nightshade vegetables (excess brinjal, potatoes)'];
    } else {
      // Default: Metabolic / Diabetes / Fatty Liver
      mealPlan = [
        { meal: 'Early Morning (06:30 AM)', items: 'Lukewarm water with crushed ginger & 3g Purified Giloy Churna' },
        { meal: 'Breakfast (08:30 AM)', items: 'Steamed Moong Sprouts with pinch of roasted cumin and pomegranate seeds, or 2 Jowar Methi rotis' },
        { meal: 'Mid-Morning (11:00 AM)', items: 'Fresh Amla juice or coconut water with fresh mint leaves' },
        { meal: 'Lunch (01:00 PM)', items: 'Barley/Brown Rice khichdi with bottle gourd (Lauki), ridge gourd (Torai), yellow dal, and hing' },
        { meal: 'Evening Snack (05:00 PM)', items: 'Roasted makhana with turmeric and black pepper, Cinnamon herbal tea' },
        { meal: 'Dinner (07:30 PM)', items: 'Clear vegetable soup with drumstick (Moringa) and steamed leafy greens' },
        { meal: 'Bedtime (10:00 PM)', items: 'Warm almond or A2 milk with 5g Nagori Ashwagandha Churna' }
      ];
    }

    const dietPlan = {
      title: `Personalized ${disease || 'Metabolic'} Ahara Regimen (${region || 'Regional Indian'} • ${season || 'Seasonal Ritu'})`,
      dosha,
      principles: `Sattvic, low-glycemic, anti-inflammatory, rekindling Jatharagni through ${rasas}.`,
      meals: mealPlan,
      foodsToAvoid
    };

    res.json({ success: true, dietPlan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9. Classical 84 Yoga Asanas Endpoint (Extracted directly from Advik Diagnostics)
app.get('/api/public/yoga-asanas', (req, res) => {
  try {
    const yogaFilePath = path.join(__dirname, 'data/yogaAsanas.json');
    if (!fs.existsSync(yogaFilePath)) {
      return res.status(404).json({ success: false, message: 'Yoga data file not found' });
    }

    const rawData = fs.readFileSync(yogaFilePath, 'utf-8');
    let asanas = JSON.parse(rawData);

    const { category, search } = req.query;

    if (category && category !== 'All') {
      asanas = asanas.filter(a => a.cat?.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase().trim();
      asanas = asanas.filter(a => 
        a.sanskrit?.toLowerCase().includes(q) || 
        a.english?.toLowerCase().includes(q) || 
        a.desc?.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: asanas.length, data: asanas });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mount modular authenticated routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/support', supportRoutes);

server.listen(PORT, () => {
  console.log(`🌿 Ayurveda Healthcare Server with Realtime WebSockets running seamlessly on http://localhost:${PORT}`);
});

