const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/dashboard/metrics - Get dashboard metrics
router.get('/metrics', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get total waste logs today
    const wasteLogsToday = await prisma.wasteLog.count({
      where: {
        timestamp: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Get number of full bins
    const fullBins = await prisma.bin.count({
      where: {
        isFull: true
      }
    });

    // Get total active users
    const totalUsers = await prisma.user.count();

    // Get total points awarded today
    const pointsToday = await prisma.wasteLog.aggregate({
      _sum: {
        points: true
      },
      where: {
        timestamp: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Get waste type breakdown for today
    const wasteTypeBreakdown = await prisma.wasteLog.groupBy({
      by: ['wasteItemId'],
      _count: {
        _all: true
      },
      where: {
        timestamp: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Get waste items for the breakdown
    const wasteItemIds = wasteTypeBreakdown.map(item => item.wasteItemId);
    const wasteItems = await prisma.wasteItem.findMany({
      where: {
        id: {
          in: wasteItemIds
        }
      },
      select: {
        id: true,
        name: true,
        category: true
      }
    });

    // Combine the data
    const wasteTypeStats = wasteTypeBreakdown.map(item => {
      const wasteItem = wasteItems.find(wi => wi.id === item.wasteItemId);
      return {
        wasteItem: wasteItem?.name || 'Unknown',
        category: wasteItem?.category || 'Unknown',
        count: item._count._all
      };
    });

    res.json({
      success: true,
      data: {
        wasteLogsToday,
        fullBins,
        totalUsers,
        pointsToday: pointsToday._sum.points || 0,
        wasteTypeStats
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard metrics'
    });
  }
});

// GET /api/dashboard/bin-status - Get bin status with coordinates
router.get('/bin-status', authMiddleware, async (req, res) => {
  try {
    const bins = await prisma.bin.findMany({
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        type: true,
        isFull: true,
        capacity: true
      }
    });

    res.json({
      success: true,
      data: bins,
      total: bins.length
    });
  } catch (error) {
    console.error('Error fetching bin status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bin status'
    });
  }
});

// GET /api/dashboard/waste-feed - Get recent waste logs
router.get('/waste-feed', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const wasteLogs = await prisma.wasteLog.findMany({
      take: limit,
      orderBy: {
        timestamp: 'desc'
      },
      include: {
        user: {
          select: {
            name: true
          }
        },
        wasteItem: {
          select: {
            name: true,
            category: true
          }
        }
      }
    });

    const feed = wasteLogs.map(log => ({
      id: log.id,
      userName: log.user.name,
      wasteItemName: log.wasteItem.name,
      category: log.wasteItem.category,
      quantity: log.quantity,
      points: log.points,
      area: log.area || 'Unknown',
      timestamp: log.timestamp
    }));

    res.json({
      success: true,
      data: feed,
      total: feed.length
    });
  } catch (error) {
    console.error('Error fetching waste feed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch waste feed'
    });
  }
});

module.exports = router;
