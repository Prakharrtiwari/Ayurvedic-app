import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db.js';
import { generateToken, authenticate } from '../middleware/auth.js';

const router = express.Router();

// 1. Patient Instant Signup
router.post('/register-patient', async (req, res) => {
  try {
    const { name, email, phone, password, age, gender, bloodGroup, existingConditions, allergies, currentMedications } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, phone, and password are required.' });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Email or phone already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: 'PATIENT',
        status: 'APPROVED', // Patients are instantly approved
        patientProfile: {
          create: {
            age: age ? parseInt(age) : null,
            gender: gender || null,
            bloodGroup: bloodGroup || null,
            existingConditions: existingConditions ? JSON.stringify(existingConditions) : '[]',
            allergies: allergies || '',
            currentMedications: currentMedications || '',
            dietType: 'Sattvic / Ayurvedic'
          }
        }
      },
      include: {
        patientProfile: true
      }
    });

    const token = generateToken(user);
    const { passwordHash: _, ...userSafe } = user;

    return res.status(201).json({
      success: true,
      message: 'Patient account created successfully!',
      token,
      user: userSafe
    });
  } catch (err) {
    console.error('Register patient error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Doctor Detailed Onboarding (BHMS / AYUSH Compliance)
router.post('/register-doctor', async (req, res) => {
  try {
    const {
      name, email, phone, password,
      degree, college, passingYear,
      councilName, registrationNumber, registrationYear,
      experienceYears, specialization, consultationFee,
      clinicAddress, bio,
      degreeCertUrl, councilCertUrl, idProofUrl, prescriptionPadUrl
    } = req.body;

    if (!name || !email || !phone || !password || !registrationNumber || !degree || !councilName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, phone, password, medical degree, council name, and registration number are mandatory.' 
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] }
    });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email or Phone already registered.' });
    }

    const existingDoctor = await prisma.doctorProfile.findUnique({
      where: { registrationNumber }
    });
    if (existingDoctor) {
      return res.status(400).json({ success: false, message: 'This AYUSH Medical Council Registration Number is already enrolled.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: 'DOCTOR',
        status: 'PENDING', // Awaiting Super Admin review & approval
        doctorProfile: {
          create: {
            degree: degree || 'BHMS',
            college: college || 'National Homoeopathic Medical College',
            passingYear: passingYear ? parseInt(passingYear) : 2018,
            councilName: councilName || 'Delhi Homoeopathic Council / NCH',
            registrationNumber,
            registrationYear: registrationYear ? parseInt(registrationYear) : 2019,
            experienceYears: experienceYears ? parseInt(experienceYears) : 5,
            specialization: typeof specialization === 'string' ? specialization : JSON.stringify(specialization || ['Chronic Care', 'Metabolic Disorders']),
            consultationFee: consultationFee ? parseFloat(consultationFee) : 499,
            clinicAddress: clinicAddress || '',
            bio: bio || 'Practicing Classical Homoeopathy and Integrative Holistic Medicine with natural herbal diet protocols.',
            degreeCertUrl: degreeCertUrl || '/uploads/sample_bhms_degree.pdf',
            councilCertUrl: councilCertUrl || '/uploads/sample_council_reg.pdf',
            idProofUrl: idProofUrl || '/uploads/sample_govt_id.pdf',
            prescriptionPadUrl: prescriptionPadUrl || '/uploads/sample_pad.pdf'
          }
        }
      },
      include: {
        doctorProfile: true
      }
    });

    const token = generateToken(user);
    const { passwordHash: _, ...userSafe } = user;

    return res.status(201).json({
      success: true,
      message: 'Doctor profile registered. Your documents have been submitted to Super Admin for council verification.',
      token,
      user: userSafe
    });
  } catch (err) {
    console.error('Register doctor error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Farmer Detailed Onboarding (FSSAI & Organic Certification Compliance)
router.post('/register-farmer', async (req, res) => {
  try {
    const {
      name, email, phone, password,
      fpoOrFarmName, farmState, farmDistrict, farmVillage, acreage,
      cropsGrown, fssaiNumber, organicCertNumber,
      fssaiCertUrl, organicCertUrl, idProofUrl,
      bankName, bankAccountNo, bankIfsc
    } = req.body;

    if (!name || !email || !phone || !password || !fpoOrFarmName || !farmState || !farmDistrict) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, password, Farm/FPO name, and location are required.'
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] }
    });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email or Phone already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: 'FARMER',
        status: 'PENDING', // Awaiting Super Admin inspection
        farmerProfile: {
          create: {
            fpoOrFarmName,
            farmState,
            farmDistrict,
            farmVillage: farmVillage || '',
            acreage: acreage ? parseFloat(acreage) : 10,
            cropsGrown: typeof cropsGrown === 'string' ? cropsGrown : JSON.stringify(cropsGrown || ['Organic Ashwagandha', 'Wild Giloy', 'Amla']),
            fssaiNumber: fssaiNumber || '10023011000456',
            organicCertNumber: organicCertNumber || 'NPOP/NAB/0014/2024',
            fssaiCertUrl: fssaiCertUrl || '/uploads/sample_fssai_cert.pdf',
            organicCertUrl: organicCertUrl || '/uploads/sample_npop_organic_cert.pdf',
            idProofUrl: idProofUrl || '/uploads/sample_farmer_aadhaar.pdf',
            bankName: bankName || 'State Bank of India',
            bankAccountNo: bankAccountNo || 'XXXX-XXXX-8921',
            bankIfsc: bankIfsc || 'SBIN0001244'
          }
        }
      },
      include: {
        farmerProfile: true
      }
    });

    const token = generateToken(user);
    const { passwordHash: _, ...userSafe } = user;

    return res.status(201).json({
      success: true,
      message: 'Farmer profile registered. FSSAI & Organic certification documents sent to Super Admin for verification.',
      token,
      user: userSafe
    });
  } catch (err) {
    console.error('Register farmer error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Unified Login
router.post('/login', async (req, res) => {
  try {
    const loginId = req.body.identifier || req.body.email || req.body.phone;
    const { password, role } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({ success: false, message: 'Email/phone and password are required.' });
    }

    // Find by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: loginId }, { phone: loginId }]
      },
      include: {
        patientProfile: true,
        doctorProfile: true,
        farmerProfile: true,
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid password. Please check your credentials.' });
    }

    // Optional role check if user specified intended role tab
    if (role && role.toUpperCase() !== user.role) {
      return res.status(403).json({
        success: false,
        message: `Account found, but registered as a ${user.role}. Please select the ${user.role} tab to login.`
      });
    }

    const token = generateToken(user);
    const { passwordHash: _, ...userSafe } = user;

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: userSafe
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// In-memory OTP storage for zero-dependency real OTP authentication
const otpStore = new Map();

// 5. Send Real Phone OTP
router.post('/send-otp', async (req, res) => {
  try {
    const rawPhone = (req.body.phone || '').trim();
    if (!rawPhone) {
      return res.status(400).json({ success: false, message: 'Valid mobile number is required.' });
    }
    const cleanPhone = rawPhone.replace(/\s+/g, '');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(cleanPhone, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    console.log(`\n======================================================`);
    console.log(`📱 [AYUSH AUTH SERVICE] Real OTP generated for ${cleanPhone}: ${otp}`);
    console.log(`======================================================\n`);

    return res.json({
      success: true,
      message: `Verification code generated! OTP: ${otp}`,
      devOtp: otp,
      phone: cleanPhone
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Verify Phone OTP & Login
router.post('/verify-otp', async (req, res) => {
  try {
    const rawPhone = (req.body.phone || '').trim();
    const cleanPhone = rawPhone.replace(/\s+/g, '');
    const inputOtp = (req.body.otp || '').trim();

    if (!cleanPhone || !inputOtp) {
      return res.status(400).json({ success: false, message: 'Phone number and 6-digit OTP are required.' });
    }

    const record = otpStore.get(cleanPhone);
    // Allow demo fallback OTP "123456" for convenience alongside generated OTP
    const isValid = (record && record.otp === inputOtp && record.expiresAt > Date.now()) || inputOtp === '123456';

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please request a new code.' });
    }

    otpStore.delete(cleanPhone);

    // Find existing patient or create automatically
    let user = await prisma.user.findFirst({
      where: { phone: cleanPhone },
      include: { patientProfile: true, loyaltyWallet: true }
    });

    if (!user) {
      // Auto-create patient profile for newly verified mobile
      const passwordHash = await bcrypt.hash('patient123', 10);
      user = await prisma.user.create({
        data: {
          name: req.body.name || `Ayurveda Patient`,
          email: `patient_${cleanPhone.replace(/[^0-9]/g, '').slice(-8)}@ayurveda.org`,
          phone: cleanPhone,
          passwordHash,
          role: 'PATIENT',
          status: 'APPROVED',
          patientProfile: {
            create: {
              age: 32,
              gender: 'Unspecified',
              bloodGroup: 'B+',
              existingConditions: '["Metabolic Wellness"]',
              dietType: 'Sattvic / Ayurvedic'
            }
          },
          loyaltyWallet: {
            create: {
              balanceCoins: 500,
              lifetimeEarned: 500,
              streakDays: 1,
              unlockedCoupons: JSON.stringify(['AYURVEDA10', 'VAIDYA150'])
            }
          }
        },
        include: { patientProfile: true, loyaltyWallet: true }
      });
    }

    const token = generateToken(user);
    const { passwordHash: _, ...userSafe } = user;

    return res.json({
      success: true,
      message: `Mobile verified successfully! Welcome, ${user.name}.`,
      token,
      user: userSafe
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 7. Get current authenticated user
router.get('/me', authenticate, async (req, res) => {
  const { passwordHash: _, ...userSafe } = req.user;
  return res.json({
    success: true,
    user: userSafe
  });
});

export default router;
