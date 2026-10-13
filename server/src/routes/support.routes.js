import express from 'express';
import prisma from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All support routes require authentication
router.use(authenticate);

// 1. Create a Support Ticket (Raised by Patient, Doctor, or Farmer)
router.post('/tickets', async (req, res) => {
  try {
    const { category, subject, description, priority, phone } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ticket Subject and Detailed Description are required.' 
      });
    }

    const ticketNumber = `TIK-${Math.floor(10000 + Math.random() * 90000)}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId: req.user.id,
        userName: req.user.name,
        userEmail: req.user.email,
        userPhone: phone || req.user.phone || null,
        userRole: req.user.role,
        category: category || 'GENERAL',
        subject,
        description,
        priority: priority || 'MEDIUM',
        status: 'OPEN'
      }
    });

    // Real-time WebSocket notification if socket is available
    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('support_ticket_created', {
        ticket,
        message: `New support ticket raised by ${ticket.userName} (${ticket.userRole})`
      });
    }

    res.status(201).json({
      success: true,
      message: `Support ticket #${ticket.ticketNumber} created successfully! Our super admin desk will review it shortly.`,
      ticket
    });
  } catch (err) {
    console.error('Create support ticket error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Get tickets raised by the current authenticated user (Patient, Doctor, or Farmer)
router.get('/tickets/my', async (req, res) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: tickets.length,
      tickets
    });
  } catch (err) {
    console.error('Fetch my tickets error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Super Admin: List All Support Tickets with Search, Filters, and High-Performance Pagination
router.get('/tickets', async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Super Admin access required to view all tickets.' });
    }

    const { 
      status, 
      category, 
      priority, 
      userRole, 
      search, 
      page = 1, 
      limit = 10 
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * take;

    const where = {};

    if (status && status !== 'ALL') {
      where.status = status.toUpperCase();
    }
    if (category && category !== 'ALL') {
      where.category = category.toUpperCase();
    }
    if (priority && priority !== 'ALL') {
      where.priority = priority.toUpperCase();
    }
    if (userRole && userRole !== 'ALL') {
      where.userRole = userRole.toUpperCase();
    }

    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { ticketNumber: { contains: q } },
        { subject: { contains: q } },
        { userName: { contains: q } },
        { userEmail: { contains: q } },
        { description: { contains: q } }
      ];
    }

    const [total, tickets] = await Promise.all([
      prisma.supportTicket.count({ where }),
      prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take
      })
    ]);

    res.json({
      success: true,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take) || 1
      },
      tickets
    });
  } catch (err) {
    console.error('Admin tickets query error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Super Admin: Reply and Resolve Support Ticket
router.patch('/tickets/:id', async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Super Admin access required.' });
    }

    const { id } = req.params;
    const { adminResponse, adminReply, status } = req.body;

    const existing = await prisma.supportTicket.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    const reply = adminReply || adminResponse || existing.adminResponse || existing.adminReply;
    const newStatus = status ? status.toUpperCase() : existing.status;
    const isResolved = newStatus === 'RESOLVED' || newStatus === 'CLOSED';

    const updated = await prisma.supportTicket.update({
      where: { id },
      data: {
        adminResponse: reply,
        adminReply: reply,
        repliedBy: req.user.name || 'Super Admin Desk',
        repliedAt: reply ? new Date() : existing.repliedAt,
        status: newStatus,
        resolvedAt: isResolved ? (existing.resolvedAt || new Date()) : null
      }
    });

    // Notify ticket owner in real time
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${updated.userId}`).emit('support_ticket_updated', {
        ticket: updated,
        message: `Your support ticket #${updated.ticketNumber} has been updated: ${updated.status}`
      });
    }

    res.json({
      success: true,
      message: `Support ticket #${updated.ticketNumber} updated successfully!`,
      ticket: updated
    });
  } catch (err) {
    console.error('Update ticket error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
