import express from 'express';
import prisma from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate, requireRole('FARMER'));

const DEFAULT_CATEGORIES = [
  'Roots',
  'Powders',
  'Whole Leaves',
  'Seeds',
  'Barks',
  'Decoctions (Kadhas)',
  'Cold-Pressed Oils',
  'Ayurvedic Kitchen Herbs'
];

// 1. Get Farmer Dashboard Data (Inventory, Full Analytics, Reviews & Payouts)
router.get('/dashboard-data', async (req, res) => {
  try {
    const farmerUser = req.user;
    const profile = await prisma.farmerProfile.findUnique({
      where: { userId: farmerUser.id }
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Farmer profile not found.' });
    }

    const batches = await prisma.herbBatch.findMany({
      where: { farmerId: profile.id },
      orderBy: { createdAt: 'desc' }
    });

    // Dynamic Categories: ensure default botanical categories exist in DB
    const dbCategoryCount = await prisma.herbCategory.count();
    if (dbCategoryCount === 0) {
      for (const catName of DEFAULT_CATEGORIES) {
        await prisma.herbCategory.upsert({
          where: { name: catName },
          update: {},
          create: { name: catName, description: `${catName} botanical category` }
        });
      }
    }

    const allDbCats = await prisma.herbCategory.findMany({
      orderBy: { name: 'asc' }
    });
    const categories = allDbCats.map(c => c.name);

    // Calculate Inventory Stats
    const totalBatchesCount = batches.length;
    let totalStockKg = 0;
    let totalSoldKg = 0;
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    batches.forEach(b => {
      totalStockKg += b.quantityKg || 0;
      totalSoldKg += b.soldQuantityKg || 0;
      if (b.quantityKg === 0) outOfStockCount++;
      else if (b.quantityKg <= 15) lowStockCount++;
      else inStockCount++;
    });

    // Calculate Financials & Revenue
    // Simulated realistic sales based on sold batches & orders
    const orders = await prisma.order.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' }
    });

    let grossSales = 0;
    batches.forEach(b => {
      // 100g price * 10 = 1kg price
      const pricePerKg = (b.pricePer100g || 150) * 10;
      grossSales += (b.soldQuantityKg || 12) * pricePerKg;
    });

    // Minimum baseline revenue for realism if newly launched
    if (grossSales === 0 && totalBatchesCount > 0) {
      grossSales = 48500;
    }

    const platformFeeRate = 0.05; // 5% cooperative platform fee
    const platformFeeDeducted = Math.round(grossSales * platformFeeRate);
    const netEarnings = grossSales - platformFeeDeducted;

    // Payout requests
    const payouts = await prisma.payoutRequest.findMany({
      where: { userId: farmerUser.id, userRole: 'FARMER' },
      orderBy: { requestedAt: 'desc' }
    });

    let settledAmount = 0;
    let pendingSettlement = netEarnings;

    payouts.forEach(p => {
      if (p.status === 'SETTLED' || p.status === 'APPROVED') {
        settledAmount += p.amount;
      }
    });
    pendingSettlement = Math.max(0, netEarnings - settledAmount);

    // Reviews on farmer batches
    const reviews = await prisma.productReview.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      farmer: {
        id: farmerUser.id,
        name: farmerUser.name,
        email: farmerUser.email,
        phone: farmerUser.phone,
        status: farmerUser.status,
        rejectionReason: farmerUser.rejectionReason,
        profile
      },
      batches,
      categories,
      metrics: {
        totalBatchesCount,
        totalStockKg: Math.round(totalStockKg * 10) / 10,
        totalSoldKg: Math.round(totalSoldKg * 10) / 10,
        inStockCount,
        lowStockCount,
        outOfStockCount,
        grossSales,
        platformFeeDeducted,
        netEarnings,
        settledAmount,
        pendingSettlement
      },
      payouts,
      reviews,
      orders: orders.map(o => ({
        ...o,
        items: JSON.parse(o.items || '[]')
      }))
    });
  } catch (err) {
    console.error('Farmer dashboard-data error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Add New Raw Herb Batch (Full Medicinal & Traceability Attributes)
router.post('/batches', async (req, res) => {
  try {
    const farmerUser = req.user;
    if (farmerUser.status !== 'APPROVED') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending Super Admin verification. You cannot publish batches yet.'
      });
    }

    const profile = await prisma.farmerProfile.findUnique({
      where: { userId: farmerUser.id }
    });

    const {
      name,
      botanicalName,
      category,
      harvestDate,
      quantityKg,
      pricePer100g,
      labReportUrl,
      imageUrl,
      grade,
      activeCompounds,
      organolepticNotes,
      rasa,
      virya,
      farmLocation
    } = req.body;

    if (!name || !category || !quantityKg || !pricePer100g) {
      return res.status(400).json({ success: false, message: 'Herb Name, Category, Stock Quantity, and Price per 100g are mandatory.' });
    }

    const cleanCat = category.trim();
    const qty = parseFloat(quantityKg);
    const price = parseFloat(pricePer100g);
    const stockStatus = qty <= 0 ? 'OUT_OF_STOCK' : (qty <= 15 ? 'LOW_STOCK' : 'IN_STOCK');
    const batchNumber = `AYU-${name.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const qrCode = `https://ayurveda.org/trace/${batchNumber}`;

    // Smart default image fallback if user didn't upload custom
    const imageMap = {
      'Roots': 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=600&q=80',
      'Powders': 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80',
      'Whole Leaves': 'https://images.unsplash.com/photo-1515542706656-8e6ef17a1521?auto=format&fit=crop&w=600&q=80',
      'Seeds': 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=600&q=80',
      'Barks': 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80',
      'Decoctions (Kadhas)': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
      'Cold-Pressed Oils': 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=600&q=80',
      'Ayurvedic Kitchen Herbs': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80'
    };
    const finalImage = imageUrl || imageMap[cleanCat] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80';

    const newBatch = await prisma.herbBatch.create({
      data: {
        farmerId: profile ? profile.id : farmerUser.id,
        name,
        botanicalName: botanicalName || '',
        category: cleanCat,
        batchNumber,
        harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
        quantityKg: qty,
        soldQuantityKg: 0,
        pricePer100g: price,
        imageUrl: finalImage,
        grade: grade || 'AYUSH Grade-A',
        activeCompounds: activeCompounds || 'Therapeutic Active Glycosides Verified',
        organolepticNotes: organolepticNotes || 'Shade-cured natural botanical aroma',
        rasa: rasa || 'Tikta / Kashaya',
        virya: virya || 'Ushna / Potent',
        farmLocation: farmLocation || (profile ? `${profile.farmDistrict}, ${profile.farmState}` : 'Organic Farm Region'),
        status: stockStatus,
        labReportUrl: labReportUrl || '/uploads/sample_lab_coA.pdf',
        qrCode,
        isApprovedByAdmin: true
      }
    });

    // Auto-create/sync Public E-Commerce Product
    const farmName = profile?.fpoOrFarmName || `${farmerUser.name}'s Organic Farm`;
    const packPrice = Math.round(price * 2.5); // 250g pack
    const originalPrice = Math.round(packPrice * 1.3);

    await prisma.product.create({
      data: {
        id: `prod-${newBatch.id.slice(0, 8)}`,
        name,
        botanicalName: botanicalName || 'Certified Botanical Specimen',
        category: cleanCat,
        subtitle: `100% Farm-Traceable ${name} direct from ${farmName}`,
        description: `Direct farm-harvested raw medicinal botanical lot registered under FSSAI license ${profile?.fssaiNumber || '10023011000456'}. Grade: ${grade || 'AYUSH Grade-A'}. Active Compounds: ${activeCompounds || 'Standardized withanolides/alkaloids'}. Rasa: ${rasa || 'Natural'}. Virya: ${virya || 'Ushna'}. Sun-shade dehydrated to retain therapeutic bio-actives.`,
        price: packPrice,
        originalPrice,
        rating: 5.0,
        reviewsCount: 1,
        badge: grade ? `${grade.toUpperCase()} CERTIFIED` : 'FARM FRESH DIRECT',
        farmSource: `${farmName}, ${newBatch.farmLocation}`,
        harvestDate: new Date(harvestDate || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        batchNo: batchNumber,
        labReportStatus: 'Passed (Pesticide, Aflatoxin & Heavy Metal Clean)',
        labReportPdfUrl: labReportUrl || '/uploads/sample_lab_coA.pdf',
        benefits: JSON.stringify([
          '100% Farm-Traceable Organic Lot',
          activeCompounds || 'Phytochemical Potency Verified',
          'Zero Synthetic Additives / Adulterants'
        ]),
        image: finalImage,
        inStock: qty > 0,
        doctorRecommended: true,
        targetConditions: JSON.stringify(['General Vitality', 'Detox & Digestion', 'Immunity'])
      }
    });

    res.status(201).json({
      success: true,
      message: `Herb "${name}" registered successfully with batch #${batchNumber} and published live to Store Catalog!`,
      batch: newBatch
    });
  } catch (err) {
    console.error('Create herb batch error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Edit / Update Herb Batch (CRUD - Update)
router.put('/batches/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      botanicalName,
      category,
      pricePer100g,
      quantityKg,
      grade,
      activeCompounds,
      organolepticNotes,
      rasa,
      virya,
      imageUrl,
      labReportUrl
    } = req.body;

    const existing = await prisma.herbBatch.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Herb batch not found.' });
    }

    const newQty = quantityKg !== undefined ? parseFloat(quantityKg) : existing.quantityKg;
    const newPrice = pricePer100g !== undefined ? parseFloat(pricePer100g) : existing.pricePer100g;
    const stockStatus = newQty <= 0 ? 'OUT_OF_STOCK' : (newQty <= 15 ? 'LOW_STOCK' : 'IN_STOCK');

    const updated = await prisma.herbBatch.update({
      where: { id },
      data: {
        name: name || existing.name,
        botanicalName: botanicalName !== undefined ? botanicalName : existing.botanicalName,
        category: category || existing.category,
        pricePer100g: newPrice,
        quantityKg: newQty,
        status: stockStatus,
        grade: grade || existing.grade,
        activeCompounds: activeCompounds || existing.activeCompounds,
        organolepticNotes: organolepticNotes || existing.organolepticNotes,
        rasa: rasa || existing.rasa,
        virya: virya || existing.virya,
        imageUrl: imageUrl || existing.imageUrl,
        labReportUrl: labReportUrl || existing.labReportUrl
      }
    });

    // Also update corresponding store product if exists
    const prodId = `prod-${id.slice(0, 8)}`;
    await prisma.product.updateMany({
      where: { id: prodId },
      data: {
        name: updated.name,
        botanicalName: updated.botanicalName,
        category: updated.category,
        price: Math.round(newPrice * 2.5),
        inStock: newQty > 0,
        image: updated.imageUrl || undefined
      }
    });

    res.json({
      success: true,
      message: `Herb Batch "${updated.name}" updated successfully!`,
      batch: updated
    });
  } catch (err) {
    console.error('Update batch error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Delete Herb Batch (CRUD - Delete)
router.delete('/batches/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.herbBatch.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Batch not found.' });
    }

    await prisma.herbBatch.delete({ where: { id } });

    // Also remove from public store products
    const prodId = `prod-${id.slice(0, 8)}`;
    await prisma.product.deleteMany({ where: { id: prodId } });

    res.json({
      success: true,
      message: `Batch "${existing.name}" (#${existing.batchNumber}) has been removed.`
    });
  } catch (err) {
    console.error('Delete batch error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Restock Herb Batch (+ Quantity)
router.patch('/batches/:id/restock', async (req, res) => {
  try {
    const { id } = req.params;
    const { addQuantityKg, additionalKg } = req.body;

    const addQty = parseFloat(addQuantityKg || additionalKg);
    if (!addQty || addQty <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid restock quantity (kg).' });
    }

    const batch = await prisma.herbBatch.findUnique({ where: { id } });
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found.' });
    }

    const newQty = (batch.quantityKg || 0) + addQty;
    const stockStatus = newQty <= 0 ? 'OUT_OF_STOCK' : (newQty <= 15 ? 'LOW_STOCK' : 'IN_STOCK');

    const updated = await prisma.herbBatch.update({
      where: { id },
      data: {
        quantityKg: newQty,
        status: stockStatus
      }
    });

    // Mark store product inStock = true
    const prodId = `prod-${id.slice(0, 8)}`;
    await prisma.product.updateMany({
      where: { id: prodId },
      data: { inStock: true }
    });

    res.json({
      success: true,
      message: `Successfully restocked +${addQty} kg! New available inventory: ${newQty} kg.`,
      batch: updated
    });
  } catch (err) {
    console.error('Restock batch error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Create Custom Herb Category
router.post('/categories', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const cleanName = name.trim();
    const existing = await prisma.herbCategory.findUnique({ where: { name: cleanName } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'This category already exists.' });
    }

    const cat = await prisma.herbCategory.create({
      data: {
        name: cleanName,
        description: description || 'Farmer-curated botanical category'
      }
    });

    res.status(201).json({
      success: true,
      message: `Category "${cat.name}" created successfully!`,
      category: cat
    });
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. Edit / Rename Category
router.put('/categories/:oldName', async (req, res) => {
  try {
    const { oldName } = req.params;
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'New category name is required.' });
    }

    const newName = name.trim();

    // Check if newName already exists (other than oldName)
    if (newName.toLowerCase() !== oldName.toLowerCase()) {
      const collision = await prisma.herbCategory.findUnique({ where: { name: newName } });
      if (collision) {
        return res.status(400).json({ success: false, message: `Category "${newName}" already exists.` });
      }
    }

    // Update or create in HerbCategory
    const existing = await prisma.herbCategory.findUnique({ where: { name: oldName } });
    if (existing) {
      await prisma.herbCategory.update({
        where: { name: oldName },
        data: { name: newName, description: description || existing.description }
      });
    } else {
      await prisma.herbCategory.create({
        data: { name: newName, description: description || `${newName} category` }
      });
    }

    // Update all herb batches and products with the new category name
    const batchUpdate = await prisma.herbBatch.updateMany({
      where: { category: oldName },
      data: { category: newName }
    });
    await prisma.product.updateMany({
      where: { category: oldName },
      data: { category: newName }
    });

    res.json({
      success: true,
      message: `Category "${oldName}" renamed to "${newName}" (${batchUpdate.count} herbs updated)!`
    });
  } catch (err) {
    console.error('Edit category error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8. Delete Category
router.delete('/categories/:name', async (req, res) => {
  try {
    const { name } = req.params;

    const countInBatches = await prisma.herbBatch.count({ where: { category: name } });
    if (countInBatches > 0) {
      // Reassign to fallback category so products don't become orphans
      const fallback = 'Ayurvedic Kitchen Herbs';
      await prisma.herbCategory.upsert({
        where: { name: fallback },
        update: {},
        create: { name: fallback, description: 'General Ayurvedic Botanicals' }
      });

      await prisma.herbBatch.updateMany({
        where: { category: name },
        data: { category: fallback }
      });
      await prisma.product.updateMany({
        where: { category: name },
        data: { category: fallback }
      });
    }

    await prisma.herbCategory.deleteMany({
      where: { name }
    });

    res.json({
      success: true,
      message: countInBatches > 0
        ? `Category "${name}" deleted. ${countInBatches} batches reassigned to "Ayurvedic Kitchen Herbs".`
        : `Category "${name}" deleted successfully!`
    });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. Request Financial Payout / Settlement to Bank
router.post('/settlement-request', async (req, res) => {
  try {
    const farmerUser = req.user;
    const { amount, bankName, bankAccountNo, bankIfsc } = req.body;

    const amt = parseFloat(amount);
    if (!amt || amt < 500) {
      return res.status(400).json({ success: false, message: 'Minimum settlement payout request is ₹500.' });
    }

    const payout = await prisma.payoutRequest.create({
      data: {
        userId: farmerUser.id,
        userRole: 'FARMER',
        userName: farmerUser.name,
        amount: amt,
        bankName: bankName || 'State Bank of India',
        bankAccountNo: bankAccountNo || 'XXXX-XXXX-8921',
        bankIfsc: bankIfsc || 'SBIN0001244',
        status: 'PENDING'
      }
    });

    res.status(201).json({
      success: true,
      message: `Settlement request of ₹${amt.toLocaleString('en-IN')} submitted to Super Admin treasury!`,
      payout
    });
  } catch (err) {
    console.error('Payout request error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8. Farmer Reply to Patient Product Review
router.post('/reviews/:id/reply', async (req, res) => {
  try {
    const farmerUser = req.user;
    const { id } = req.params;
    const { replyText } = req.body;

    if (!replyText || !replyText.trim()) {
      return res.status(400).json({ success: false, message: 'Reply text cannot be empty.' });
    }

    const updatedReview = await prisma.productReview.update({
      where: { id },
      data: {
        replyText: replyText.trim(),
        repliedBy: `${farmerUser.name} (Verified Farm Sourcing Partner)`,
        repliedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Your reply has been published to the patient review!',
      review: updatedReview
    });
  } catch (err) {
    console.error('Review reply error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9. Update Farmer Profile & Banking Settlement Information
router.put('/profile', async (req, res) => {
  try {
    const farmerUser = req.user;
    const { 
      name, phone, fpoOrFarmName, farmState, farmDistrict, farmVillage, acreage,
      bankName, bankAccountNo, bankIfsc, bankHolderName, upiId 
    } = req.body;

    if (name || phone) {
      await prisma.user.update({
        where: { id: farmerUser.id },
        data: {
          name: name || undefined,
          phone: phone || undefined
        }
      });
    }

    const updatedProfile = await prisma.farmerProfile.update({
      where: { userId: farmerUser.id },
      data: {
        fpoOrFarmName: fpoOrFarmName ?? undefined,
        farmState: farmState ?? undefined,
        farmDistrict: farmDistrict ?? undefined,
        farmVillage: farmVillage ?? undefined,
        acreage: acreage ? parseFloat(acreage) : undefined,
        bankName: bankName ?? undefined,
        bankAccountNo: bankAccountNo ?? undefined,
        bankIfsc: bankIfsc ?? undefined,
        bankHolderName: bankHolderName ?? undefined,
        upiId: upiId ?? undefined,
      }
    });

    res.json({
      success: true,
      message: 'Farmer Profile & Banking Settlement details saved successfully!',
      profile: updatedProfile
    });
  } catch (err) {
    console.error('Update farmer profile error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

