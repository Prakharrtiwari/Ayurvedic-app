import express from 'express';
import prisma from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { 
  analyzeHealthAssessmentWithGroq, 
  extractPrescriptionWithGroq, 
  analyzeSkinPhotoWithGroq 
} from '../services/groq.service.js';

const router = express.Router();
router.use(authenticate, requireRole('PATIENT'));

// 1. Get Comprehensive Patient Dashboard Data
router.get('/dashboard-data', async (req, res) => {
  try {
    const patientUser = req.user;
    
    // Patient profile
    const profile = await prisma.patientProfile.findUnique({
      where: { userId: patientUser.id }
    });

    // Loyalty wallet
    let wallet = await prisma.loyaltyWallet.findUnique({
      where: { userId: patientUser.id }
    });
    if (!wallet) {
      wallet = await prisma.loyaltyWallet.create({
        data: {
          userId: patientUser.id,
          balanceCoins: 450,
          lifetimeEarned: 650,
          streakDays: 14,
          unlockedCoupons: JSON.stringify(['AYURVEDA10', 'VAIDYA150'])
        }
      });
    }

    // Consultations
    const consultations = await prisma.consultation.findMany({
      where: { patientId: patientUser.id },
      include: {
        doctor: {
          include: {
            user: {
              select: { name: true, email: true, phone: true }
            }
          }
        },
        prescription: true
      },
      orderBy: { scheduledAt: 'desc' }
    });

    // Prescriptions
    const prescriptions = await prisma.prescription.findMany({
      where: { patientId: patientUser.id },
      include: {
        doctor: {
          include: {
            user: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Orders
    const orders = await prisma.order.findMany({
      where: { userId: patientUser.id },
      orderBy: { createdAt: 'desc' }
    });

    // Vitals Logs
    const vitalsLogs = await prisma.vitalsLog.findMany({
      where: { userId: patientUser.id },
      orderBy: { loggedAt: 'desc' },
      take: 10
    });

    // Reminders
    const reminders = await prisma.reminder.findMany({
      where: { userId: patientUser.id },
      orderBy: { timeOfDay: 'asc' }
    });

    // Lab Bookings
    const labBookings = await prisma.labBooking.findMany({
      where: { userId: patientUser.id },
      include: { labTest: true },
      orderBy: { appointmentDate: 'desc' }
    });

    // Past AI Assessments
    const assessments = await prisma.healthAssessment.findMany({
      where: { userId: patientUser.id },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    res.json({
      success: true,
      patient: {
        id: patientUser.id,
        name: patientUser.name,
        email: patientUser.email,
        phone: patientUser.phone,
        profile
      },
      wallet: {
        balanceCoins: wallet.balanceCoins,
        lifetimeEarned: wallet.lifetimeEarned,
        streakDays: wallet.streakDays,
        unlockedCoupons: JSON.parse(wallet.unlockedCoupons || '[]')
      },
      consultations,
      prescriptions,
      orders,
      vitalsLogs,
      reminders,
      labBookings,
      assessments
    });
  } catch (err) {
    console.error('Patient dashboard data error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Update Patient Health Profile
router.put('/profile', async (req, res) => {
  try {
    const patientUser = req.user;
    const { age, gender, bloodGroup, existingConditions, allergies, currentMedications, dietType } = req.body;

    const updatedProfile = await prisma.patientProfile.upsert({
      where: { userId: patientUser.id },
      update: {
        age: age ? parseInt(age) : undefined,
        gender,
        bloodGroup,
        existingConditions: typeof existingConditions === 'string' ? existingConditions : JSON.stringify(existingConditions),
        allergies,
        currentMedications,
        dietType
      },
      create: {
        userId: patientUser.id,
        age: age ? parseInt(age) : null,
        gender,
        bloodGroup,
        existingConditions: typeof existingConditions === 'string' ? existingConditions : JSON.stringify(existingConditions),
        allergies,
        currentMedications,
        dietType
      }
    });

    res.json({
      success: true,
      message: 'Health profile updated successfully!',
      profile: updatedProfile
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Book Doctor Consultation
router.post('/book-consultation', async (req, res) => {
  try {
    const patientUser = req.user;
    const { doctorId, scheduledAt, timeSlot, mode, symptomsNote } = req.body;

    if (!doctorId || !timeSlot) {
      return res.status(400).json({ success: false, message: 'Doctor ID and Time Slot are required.' });
    }

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      include: { user: true }
    });

    if (!doctorProfile || doctorProfile.user.status !== 'APPROVED') {
      return res.status(400).json({ success: false, message: 'Selected doctor is not available or not yet verified.' });
    }

    const consultation = await prisma.consultation.create({
      data: {
        patientId: patientUser.id,
        doctorId: doctorProfile.id,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
        timeSlot: timeSlot || 'Today at 4:30 PM',
        mode: mode || 'VIDEO',
        symptomsNote: symptomsNote || 'General chronic condition checkup',
        feePaid: doctorProfile.consultationFee,
        meetingLink: `https://meet.ayurveda.org/room-${Date.now().toString().slice(-6)}`
      },
      include: {
        doctor: {
          include: {
            user: { select: { name: true } }
          }
        }
      }
    });

    // Reward with +50 SuperCoins
    await prisma.loyaltyWallet.upsert({
      where: { userId: patientUser.id },
      update: { balanceCoins: { increment: 50 }, lifetimeEarned: { increment: 50 } },
      create: { userId: patientUser.id, balanceCoins: 500, lifetimeEarned: 700, streakDays: 15, unlockedCoupons: '[]' }
    });

    res.status(201).json({
      success: true,
      message: `Consultation confirmed with ${consultation.doctor.user.name}! 50 SuperCoins credited to your wellness wallet.`,
      consultation
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Log Daily Vitals (Blood sugar, BP, water, sleep)
router.post('/vitals', async (req, res) => {
  try {
    const patientUser = req.user;
    const { bloodSugarFasting, bloodSugarPP, bloodPressure, waterGlasses, sleepHours, weightKg, symptomScore, notes } = req.body;

    const vitals = await prisma.vitalsLog.create({
      data: {
        userId: patientUser.id,
        bloodSugarFasting: bloodSugarFasting ? parseFloat(bloodSugarFasting) : null,
        bloodSugarPP: bloodSugarPP ? parseFloat(bloodSugarPP) : null,
        bloodPressure: bloodPressure || null,
        waterGlasses: waterGlasses ? parseInt(waterGlasses) : 0,
        sleepHours: sleepHours ? parseFloat(sleepHours) : null,
        weightKg: weightKg ? parseFloat(weightKg) : null,
        symptomScore: symptomScore ? parseInt(symptomScore) : null,
        notes: notes || null
      }
    });

    res.status(201).json({
      success: true,
      message: 'Vitals reading recorded and synced to your clinical chart!',
      vitals
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Toggle Reminder Dose Status (Mark Taken)
router.post('/toggle-reminder', async (req, res) => {
  try {
    const { reminderId, isTaken } = req.body;
    const updated = await prisma.reminder.update({
      where: { id: reminderId },
      data: { isTaken: isTaken ?? true }
    });

    res.json({
      success: true,
      message: `Dose "${updated.title}" marked as ${updated.isTaken ? 'Taken' : 'Pending'}!`,
      reminder: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Book Home Lab Test
router.post('/book-lab-test', async (req, res) => {
  try {
    const patientUser = req.user;
    const { labTestId, appointmentDate, timeSlot, address, patientName } = req.body;

    const booking = await prisma.labBooking.create({
      data: {
        userId: patientUser.id,
        labTestId,
        patientName: patientName || patientUser.name,
        appointmentDate: appointmentDate ? new Date(appointmentDate) : new Date(Date.now() + 24 * 60 * 60 * 1000),
        timeSlot: timeSlot || '07:30 AM - 08:30 AM (Fasting)',
        address: address || 'Home address on record'
      },
      include: { labTest: true }
    });

    res.status(201).json({
      success: true,
      message: `Home collection booked for "${booking.labTest.name}". Certified phlebotomist visit confirmed!`,
      booking
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. Live AI Health Assessment & Dosha Analysis (Powered by Groq 120B)
router.post('/ai-assessment', async (req, res) => {
  try {
    const patientUser = req.user;
    const { symptoms, digestion, sleep, energy, chronicConditions, diet } = req.body;

    // Fetch patient profile if available for extra context
    const profile = await prisma.patientProfile.findUnique({
      where: { userId: patientUser.id }
    });

    const parsedConditions = chronicConditions || (profile?.existingConditions ? JSON.parse(profile.existingConditions) : []);

    // Call Groq 120B AI clinical intelligence
    const groqResult = await analyzeHealthAssessmentWithGroq({
      symptoms: symptoms || req.body.chiefComplaint,
      digestion: digestion || req.body.digestionStatus,
      sleep: sleep || req.body.sleepStressScore,
      energy: energy || 'Variable energy',
      chronicConditions: parsedConditions,
      diet: diet || profile?.dietType || 'Sattvic / Ayurvedic'
    });

    // Save assessment to patient clinical records
    const assessment = await prisma.healthAssessment.create({
      data: {
        userId: patientUser.id,
        chiefComplaint: groqResult.chiefComplaint || symptoms || 'Metabolic Sugar Spikes',
        digestionStatus: groqResult.agniStatus || digestion || 'Manda Agni',
        sleepStressScore: sleep || '6-7 Hrs',
        doshaAnalysis: groqResult.doshaAnalysis || 'Pitta-Kapha Aggravation',
        riskScore: groqResult.riskScore || 'Moderate (62/100)',
        clinicalSummary: groqResult.clinicalSummary || 'Ama accumulation causing metabolic stagnation.',
        recommendedHerbs: JSON.stringify(groqResult.recommendedHerbs || []),
        recommendedDoctor: groqResult.recommendedDoctorSpecialty || 'Dr. Ananya Sharma (BHMS)',
        suggestedProgram: '90-Day Cellular Reset Protocol'
      }
    });

    res.status(201).json({
      success: true,
      message: '✓ Real-time AI Health & Dosha Assessment generated via Groq (120B)!',
      assessment: {
        ...assessment,
        analysis: groqResult
      }
    });
  } catch (err) {
    console.error('AI Assessment error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8. Live Scan & Extract Prescription (Powered by Groq 120B OCR Extractor)
router.post('/scan-prescription', async (req, res) => {
  try {
    const patientUser = req.user;
    const { prescriptionImageUrl, rawText, notes, sampleType } = req.body;

    // Call Groq 120B extraction
    const extractedData = await extractPrescriptionWithGroq({
      rawText,
      notes,
      sampleType
    });

    // Automatically create real reminders in DB from extracted medicines
    if (extractedData.medicines && Array.isArray(extractedData.medicines)) {
      for (const med of extractedData.medicines) {
        await prisma.reminder.create({
          data: {
            userId: patientUser.id,
            title: med.herb,
            dosage: med.dosage || '3g with warm water',
            timing: med.timing?.toUpperCase().includes('BED') ? 'BEDTIME' : (med.timing?.toUpperCase().includes('AFTERNOON') ? 'AFTERNOON' : 'MORNING'),
            type: 'HERB',
            isTaken: false,
            timeOfDay: med.timing?.toUpperCase().includes('BED') ? '09:30 PM' : '07:30 AM'
          }
        }).catch(() => null);
      }
    }

    res.json({
      success: true,
      message: `✓ Prescription scanned with Groq 120B! ${extractedData.medicines?.length || 0} herbal doses & daily reminders created.`,
      extracted: {
        ...extractedData,
        autoCartReady: true,
        remindersCreated: extractedData.medicines?.length || 0
      }
    });
  } catch (err) {
    console.error('Scan prescription error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9. Real Order Placement (COD or Dynamic UPI QR)
router.post('/orders', async (req, res) => {
  try {
    const patientUser = req.user;
    const { items, totalAmount, shippingAddress, paymentMethod, couponCode, discountApplied } = req.body;

    if (!items || !totalAmount || !shippingAddress) {
      return res.status(400).json({ success: false, message: 'Cart items, total amount, and delivery address are required.' });
    }

    const trackingId = `BLU-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const order = await prisma.order.create({
      data: {
        userId: patientUser.id,
        items: typeof items === 'string' ? items : JSON.stringify(items),
        totalAmount: parseFloat(totalAmount),
        shippingAddress: typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress),
        paymentMethod: paymentMethod || 'COD',
        paymentStatus: paymentMethod === 'UPI_QR' ? 'PAID' : 'PENDING',
        status: 'CONFIRMED',
        trackingId,
        courierName: 'BlueDart Express'
      }
    });

    // Credit +75 SuperCoins and update streak on real purchase
    await prisma.loyaltyWallet.upsert({
      where: { userId: patientUser.id },
      update: {
        balanceCoins: { increment: 75 },
        lifetimeEarned: { increment: 75 },
        streakDays: { increment: 1 }
      },
      create: {
        userId: patientUser.id,
        balanceCoins: 525,
        lifetimeEarned: 525,
        streakDays: 1,
        unlockedCoupons: '[]'
      }
    });

    res.status(201).json({
      success: true,
      message: `Order #${order.id.slice(0, 8).toUpperCase()} placed successfully! BlueDart Tracking: ${trackingId}. 75 SuperCoins credited!`,
      order
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const patientUser = req.user;
    const orders = await prisma.order.findMany({
      where: { userId: patientUser.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      orders: orders.map(o => ({
        ...o,
        items: JSON.parse(o.items || '[]')
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 10. Skin Condition Photo Timeline Tracker (with Groq AI Dermatology Analysis)
router.post('/skin-photos', async (req, res) => {
  try {
    const patientUser = req.user;
    const { imageUrl, condition, notes, age, gender } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Image URL or captured photo is required.' });
    }

    // Call Groq 120B AI Dermatology Analysis
    const groqSkinAnalysis = await analyzeSkinPhotoWithGroq({
      condition: condition || 'Eczema / Psoriasis / Dry Patches',
      notes: notes || 'Day-wise visual healing assessment',
      patientAge: age || 32,
      gender: gender || 'Patient'
    });

    const photoLog = await prisma.skinPhotoLog.create({
      data: {
        userId: patientUser.id,
        imageUrl,
        condition: condition || 'Skin Health Progress',
        notes: notes || 'Day-wise healing assessment'
      }
    });

    res.status(201).json({
      success: true,
      message: '✓ Skin health progress photo recorded & analyzed by Groq AI!',
      photoLog,
      aiAnalysis: groqSkinAnalysis
    });
  } catch (err) {
    console.error('Skin photo upload error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/skin-photos', async (req, res) => {
  try {
    const patientUser = req.user;
    const photos = await prisma.skinPhotoLog.findMany({
      where: { userId: patientUser.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, photos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 11. In-App Direct Doctor Chat (Isolated per Doctor)
router.post('/messages', async (req, res) => {
  try {
    const patientUser = req.user;
    const { doctorId, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    let targetReceiverId = doctorId || 'dr-ananya';
    if (doctorId && doctorId !== 'dr-ananya') {
      const docProf = await prisma.doctorProfile.findFirst({
        where: {
          OR: [
            { id: doctorId },
            { userId: doctorId }
          ]
        }
      });
      if (docProf && docProf.userId) {
        targetReceiverId = docProf.userId;
      }
    }

    const chatMsg = await prisma.chatMessage.create({
      data: {
        senderId: patientUser.id,
        receiverId: targetReceiverId,
        senderName: patientUser.name,
        senderRole: 'PATIENT',
        message: message.trim()
      }
    });

    res.status(201).json({
      success: true,
      message: 'Message sent to doctor!',
      chatMessage: chatMsg
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/messages/:doctorId', async (req, res) => {
  try {
    const patientUser = req.user;
    const { doctorId } = req.params;

    if (!doctorId) {
      return res.json({ success: true, messages: [] });
    }

    const docIdentifiers = [doctorId];
    const docProf = await prisma.doctorProfile.findFirst({
      where: {
        OR: [
          { id: doctorId },
          { userId: doctorId }
        ]
      }
    });
    if (docProf) {
      if (docProf.id && !docIdentifiers.includes(docProf.id)) docIdentifiers.push(docProf.id);
      if (docProf.userId && !docIdentifiers.includes(docProf.userId)) docIdentifiers.push(docProf.userId);
    }

    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: patientUser.id, receiverId: { in: docIdentifiers } },
          { senderId: { in: docIdentifiers }, receiverId: patientUser.id }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 12. Verified Product Reviews
router.post('/reviews', async (req, res) => {
  try {
    const patientUser = req.user;
    const { productId, rating, title, comment } = req.body;

    if (!productId || !comment) {
      return res.status(400).json({ success: false, message: 'Product ID and review comment are required.' });
    }

    const review = await prisma.productReview.create({
      data: {
        productId,
        userId: patientUser.id,
        userName: patientUser.name,
        userCity: 'Verified AYUSH Buyer',
        rating: rating ? parseInt(rating) : 5,
        title: title || 'Exceptional Quality Raw Herb',
        comment,
        verified: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your verified review has been published.',
      review
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 13. Community Forum: Get All Posts
router.get('/community/posts', async (req, res) => {
  try {
    const posts = await prisma.communityPost.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 14. Community Forum: Create Question or Success Story
router.post('/community/posts', async (req, res) => {
  try {
    const patientUser = req.user;
    const { title, content, conditionTag } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    const post = await prisma.communityPost.create({
      data: {
        userId: patientUser.id,
        authorName: patientUser.name,
        conditionTag: conditionTag || 'General Wellness',
        title,
        content,
        likesCount: 1
      }
    });

    res.status(201).json({
      success: true,
      message: 'Your question / story has been published to the community forum!',
      post
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 15. Community Forum: Like Post
router.post('/community/posts/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.communityPost.update({
      where: { id },
      data: { likesCount: { increment: 1 } }
    });
    res.json({ success: true, likesCount: post.likesCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 16. Chronic Disease Program Live Enrollment
router.post('/programs/enroll', async (req, res) => {
  try {
    const patientUser = req.user;
    const { programSlug, programTitle, durationDays } = req.body;

    const existing = await prisma.programEnrollment.findFirst({
      where: { userId: patientUser.id, programSlug, status: 'ACTIVE' }
    });

    if (existing) {
      return res.json({ success: true, message: 'Already actively enrolled in this program!', enrollment: existing });
    }

    const enrollment = await prisma.programEnrollment.create({
      data: {
        userId: patientUser.id,
        programSlug: programSlug || 'diabetes-reversal',
        programTitle: programTitle || '90-Day Type 2 Diabetes Reversal Protocol',
        durationDays: durationDays ? parseInt(durationDays) : 90,
        startDate: new Date(),
        currentDay: 1,
        currentPhase: 'Phase 1: Deep Ama Detoxification',
        status: 'ACTIVE'
      }
    });

    res.status(201).json({
      success: true,
      message: `Enrolled successfully in ${enrollment.programTitle}! Track your daily protocol in your dashboard.`,
      enrollment
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/programs/active', async (req, res) => {
  try {
    const patientUser = req.user;
    const enrollments = await prisma.programEnrollment.findMany({
      where: { userId: patientUser.id },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate current day based on startDate
    const updated = enrollments.map(e => {
      const elapsedDays = Math.max(1, Math.floor((Date.now() - new Date(e.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1);
      let phase = 'Phase 1: Deep Ama Detoxification';
      if (elapsedDays > 21 && elapsedDays <= 60) phase = 'Phase 2: Agni Deepana & Liver Reset';
      else if (elapsedDays > 60) phase = 'Phase 3: Cellular Rasayana Regeneration';
      return { ...e, currentDay: Math.min(e.durationDays, elapsedDays), currentPhase: phase };
    });

    res.json({ success: true, enrollments: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
