import prisma from './src/db.js';
import bcrypt from 'bcryptjs';

async function seedPatientsAndConsultations() {
  console.log('Seeding rich patient directory and doctor consultations...');

  const passwordHash = await bcrypt.hash('patient123', 10);

  // 1. Get all Doctors
  const doctors = await prisma.doctorProfile.findMany({
    include: { user: true }
  });

  if (doctors.length === 0) {
    console.error('No doctors found to attach consultations to.');
    process.exit(1);
  }

  const primaryDoctor = doctors[0]; // Dr. Ananya Sharma

  // 2. Define 6 realistic patients with deep ayurvedic case history
  const patientData = [
    {
      name: 'Rahul Sharma',
      email: 'rahul.sharma@gmail.com',
      phone: '+91 98112 34567',
      age: 38,
      gender: 'Male',
      bloodGroup: 'O+',
      dietType: 'Vegetarian',
      conditions: ['Type 2 Diabetes', 'Non-Alcoholic Fatty Liver (Grade 1)'],
      allergies: 'Dust, Mild pollen',
      medications: 'Metformin 500mg morning',
      symptoms: 'Fasting blood sugar 148 mg/dL, post-meal heaviness, sluggish digestion after dinner.',
      diagnosis: 'Kapha-Pitta Prameha & Manda Agni',
      herbs: [
        { herb: 'Meshashringi (Gymnema Sylvestre)', dosage: '3g with lukewarm water before meals', duration: '45 days' },
        { herb: 'Vijaysar Churna', dosage: '5g soaked overnight in water, drink in morning', duration: '60 days' },
        { herb: 'Triphala Kadha', dosage: '15ml bedtime', duration: '30 days' }
      ],
      diet: 'Barley (Yava) roti, Bitter gourd (Karela) juice twice a week, avoid refined sugars and dairy after sundown.',
      lifestyle: '30 min brisk morning walk in natural sunlight, Kapalbhati pranayama 10 mins.'
    },
    {
      name: 'Priya Patel',
      email: 'priya.patel94@yahoo.com',
      phone: '+91 98201 87654',
      age: 29,
      gender: 'Female',
      bloodGroup: 'B+',
      dietType: 'Sattvic Vegetarian',
      conditions: ['PCOS / PCOD', 'Hormonal Jawline Acne', 'Delayed Menstrual Cycles'],
      allergies: 'None',
      medications: 'Folic acid supplements',
      symptoms: 'Irregular cycles (42-45 days), cystic acne on chin, severe water retention and anxiety.',
      diagnosis: 'Artava Dushti & Vata-Kapha Strotorodha',
      herbs: [
        { herb: 'Shatavari Powder', dosage: '5g with warm almond milk at bedtime', duration: '60 days' },
        { herb: 'Kanchanar Guggulu', dosage: '2 tablets twice daily with Kanchanar Kwath', duration: '45 days' },
        { herb: 'Lodhra Churna', dosage: '3g with rice water twice daily', duration: '30 days' }
      ],
      diet: 'Warm spiced foods, flaxseeds powder 1 tsp daily, green tea, completely eliminate processed bakery items.',
      lifestyle: 'Baddha Konasana (Butterfly pose) 15 mins daily, Anulom Vilom pranayama.'
    },
    {
      name: 'Amit Verma',
      email: 'amit.verma68@outlook.com',
      phone: '+91 97170 23412',
      age: 52,
      gender: 'Male',
      bloodGroup: 'A+',
      dietType: 'Vegetarian',
      conditions: ['Bilateral Knee Osteoarthritis', 'Cervical Stiffness'],
      allergies: 'Penicillin',
      medications: 'Calcium & Vitamin D3',
      symptoms: 'Crepitus in right knee, difficulty descending stairs, morning stiffness lasting 40 minutes.',
      diagnosis: 'Sandhigata Vata & Asthi Dhatu Kshaya',
      herbs: [
        { herb: 'Shallaki (Boswellia Serrata)', dosage: '500mg capsule twice daily after meals', duration: '90 days' },
        { herb: 'Yograj Guggulu', dosage: '2 tablets twice daily with Rasnadi Kwath', duration: '45 days' },
        { herb: 'Mahanarayan Taila', dosage: 'Gentle warm oil massage on knees for 15 mins', duration: 'Daily' }
      ],
      diet: 'Warm sesame seeds, drumsticks (Moringa) soup, avoid curd and fermented batter foods.',
      lifestyle: 'Low-impact swimming, avoid deep knee bending or sitting on floor.'
    },
    {
      name: 'Sunita Rao',
      email: 'sunita.rao@rediffmail.com',
      phone: '+91 94480 12890',
      age: 46,
      gender: 'Female',
      bloodGroup: 'AB+',
      dietType: 'Sattvic Vegetarian',
      conditions: ['Essential Hypertension', 'Chronic Insomnia / Stress'],
      allergies: 'Sulfur compounds',
      medications: 'Telmisartan 40mg',
      symptoms: 'BP 142/90 mmHg, waking up multiple times between 2 AM to 4 AM, palpitations when stressed.',
      diagnosis: 'Rakta Vata & Manovaha Srotas Dushti',
      herbs: [
        { herb: 'Sarpagandha Ghan Vati', dosage: '1 tablet with water at bedtime', duration: '30 days' },
        { herb: 'Brahmi Ghrita', dosage: '1 tsp morning on empty stomach with warm water', duration: '45 days' },
        { herb: 'Ashwagandha Extract', dosage: '300mg before sleep with warm milk', duration: '60 days' }
      ],
      diet: 'Low sodium rock salt (Saindhava), pomegranate juice, coconut water, no caffeine post 2 PM.',
      lifestyle: 'Yoga Nidra guided relaxation before sleep, Shirodhara therapy recommendation.'
    },
    {
      name: 'Vikram Singh',
      email: 'vikram.singh.tech@gmail.com',
      phone: '+91 99887 66554',
      age: 34,
      gender: 'Male',
      bloodGroup: 'B+',
      dietType: 'Vegetarian',
      conditions: ['Chronic Plaque Psoriasis', 'Scalp Itching & Scaling'],
      allergies: 'Certain artificial colors',
      medications: 'Topical coconut oil',
      symptoms: 'Silvery scale plaques on elbows and scalp, intense flare-ups during dry winter season.',
      diagnosis: 'Kushtha Roga (Eka Kushtha) - Vata-Kapha dominant',
      herbs: [
        { herb: 'Khadirarishta', dosage: '20ml with equal water after lunch & dinner', duration: '60 days' },
        { herb: 'Manjishtadi Kwath', dosage: '15ml twice daily on empty stomach', duration: '60 days' },
        { herb: 'Neem Taila + Marichyadi Taila', dosage: 'External application twice daily', duration: 'Continuous' }
      ],
      diet: 'Bitter greens (Karela, Methi, Neem patra), strictly avoid sour, salty, and conflicting foods (Viruddha Ahara like milk with citrus).',
      lifestyle: 'Sunbath for 15 minutes before 8 AM, cotton clothing only.'
    },
    {
      name: 'Neha Gupta',
      email: 'neha.gupta2021@gmail.com',
      phone: '+91 98711 00982',
      age: 27,
      gender: 'Female',
      bloodGroup: 'O-',
      dietType: 'Vegan',
      conditions: ['Irritable Bowel Syndrome (IBS-D)', 'Chronic Flatulence & Hyperacidity'],
      allergies: 'Gluten sensitivity, Dairy lactose',
      medications: 'Digestive probiotics',
      symptoms: 'Alternating constipation and loose stools, post-prandial abdominal cramping, acid reflux.',
      diagnosis: 'Grahani Roga (Pitta-Vataja)',
      herbs: [
        { herb: 'Bilwadi Churna', dosage: '3g with fresh thin buttermilk (Takra)', duration: '40 days' },
        { herb: 'Kutajghan Vati', dosage: '2 tablets twice daily after meals', duration: '30 days' },
        { herb: 'Avipattikar Churna', dosage: '3g with cold water before sleep', duration: '30 days' }
      ],
      diet: 'Fresh buttermilk seasoned with roasted cumin and mint, moong dal khichdi, avoid raw salads and carbonated drinks.',
      lifestyle: 'Vajrasana for 10 minutes immediately after every meal.'
    }
  ];

  for (let i = 0; i < patientData.length; i++) {
    const p = patientData[i];
    
    // Upsert User & PatientProfile
    let user = await prisma.user.findUnique({ where: { email: p.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: p.name,
          email: p.email,
          phone: p.phone,
          passwordHash,
          role: 'PATIENT',
          status: 'APPROVED',
          avatar: `https://images.unsplash.com/photo-${1534528741775 + i * 1000}?auto=format&fit=crop&w=200&q=80`
        }
      });
    }

    await prisma.patientProfile.upsert({
      where: { userId: user.id },
      update: {
        age: p.age,
        gender: p.gender,
        bloodGroup: p.bloodGroup,
        dietType: p.dietType,
        existingConditions: JSON.stringify(p.conditions),
        allergies: p.allergies,
        currentMedications: p.medications,
        emergencyContact: '+91 98100 99999'
      },
      create: {
        userId: user.id,
        age: p.age,
        gender: p.gender,
        bloodGroup: p.bloodGroup,
        dietType: p.dietType,
        existingConditions: JSON.stringify(p.conditions),
        allergies: p.allergies,
        currentMedications: p.medications,
        emergencyContact: '+91 98100 99999'
      }
    });

    // Create Consultations, Prescriptions, and Chats for EACH doctor
    for (let dIdx = 0; dIdx < doctors.length; dIdx++) {
      const docForConsult = doctors[dIdx];
      
      // 1 Completed Consultation with Prescription
      const consultPast = await prisma.consultation.create({
        data: {
          patientId: user.id,
          doctorId: docForConsult.id,
          scheduledAt: new Date(Date.now() - (i + 1) * 86400000 * 2), // 2, 4, 6... days ago
          timeSlot: '11:00 AM - 11:30 AM',
          mode: (i + dIdx) % 2 === 0 ? 'VIDEO' : 'CHAT',
          status: 'COMPLETED',
          symptomsNote: p.symptoms,
          feePaid: docForConsult.consultationFee || 499,
          meetingLink: 'https://meet.ayurveda.org/ayur-tele-consult-' + user.id.slice(0, 6)
        }
      });

      // Digital Prescription for completed consult
      await prisma.prescription.create({
        data: {
          consultationId: consultPast.id,
          patientId: user.id,
          doctorId: docForConsult.id,
          diagnosis: p.diagnosis,
          herbsPrescribed: JSON.stringify(p.herbs),
          dietaryAdvice: p.diet,
          lifestyleGuidelines: p.lifestyle,
          followUpDate: new Date(Date.now() + 30 * 86400000)
        }
      });

      // 1 Upcoming Consultation for Today or Tomorrow
      await prisma.consultation.create({
        data: {
          patientId: user.id,
          doctorId: docForConsult.id,
          scheduledAt: new Date(Date.now() + ((i + dIdx) * 3600000 * 4)), // today & tomorrow
          timeSlot: ['10:00 AM - 10:30 AM', '02:30 PM - 03:00 PM', '05:00 PM - 05:30 PM'][(i + dIdx) % 3],
          mode: (i + dIdx) % 2 === 0 ? 'VIDEO' : 'CHAT',
          status: 'CONFIRMED',
          symptomsNote: `Follow-up review: ${p.conditions.join(', ')}. Monitoring pulse, digestion, and sleep improvements.`,
          feePaid: docForConsult.consultationFee || 499,
          meetingLink: 'https://meet.ayurveda.org/ayur-tele-consult-' + user.id.slice(0, 6)
        }
      });

      // Realtime Chat Message between Patient and Doctor
      await prisma.chatMessage.create({
        data: {
          senderId: user.id,
          receiverId: docForConsult.userId,
          senderRole: 'PATIENT',
          senderName: p.name,
          message: `Namaste Dr. ${docForConsult.user.name.split(' ')[1]}, taking prescribed herbs regularly. Noticeable improvement in ${p.conditions[0]}. When should I do repeat blood work?`
        }
      });

      await prisma.chatMessage.create({
        data: {
          senderId: docForConsult.userId,
          receiverId: user.id,
          senderRole: 'DOCTOR',
          senderName: docForConsult.user.name,
          message: `Namaste ${p.name.split(' ')[0]}. Wonderful to see steady recovery. Please continue the morning decoction and send fasting reports after 3 weeks.`
        }
      });
    }

    // Create Sample Orders for Patient
    await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: 1250 + (i * 300),
        status: i % 2 === 0 ? 'DELIVERED' : 'DISPATCHED',
        paymentMethod: i % 2 === 0 ? 'UPI_QR' : 'COD',
        paymentStatus: 'PAID',
        shippingAddress: `${100 + i * 12}, Green Avenue, ${['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Jaipur'][i]}, India`,
        trackingId: `BLU-88210${i}`,
        courierName: 'BlueDart Express',
        items: JSON.stringify([
          { name: p.herbs[0].herb, quantity: 2, price: 450 },
          { name: 'Triphala Bio-Cleanse Extract', quantity: 1, price: 350 }
        ])
      }
    });

    console.log(`✓ Seeded Patient ${p.name} with consultations, prescriptions, chat, and orders.`);
  }

  console.log('✅ Successfully seeded rich patient roster and clinical records!');
}

seedPatientsAndConsultations()
  .catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
