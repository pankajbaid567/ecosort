const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');
const { validateRequest, schemas } = require('../middleware/validation');

const router = express.Router();
const prisma = new PrismaClient();

// Log waste disposal (requires authentication)
router.post('/', authMiddleware, validateRequest(schemas.wasteLog), async (req, res, next) => {
  try {
    const { wasteItemId, quantity } = req.body;
    const userId = req.user.id;

    // Verify waste item exists
    const wasteItem = await prisma.wasteItem.findUnique({
      where: { id: wasteItemId }
    });

    if (!wasteItem) {
      return res.status(404).json({
        success: false,
        error: 'Waste item not found'
      });
    }

    // Calculate points (base points * quantity)
    const points = wasteItem.points * (quantity || 1);

    // Create waste log and update user points in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create waste log
      const wasteLog = await prisma.wasteLog.create({
        data: {
          userId,
          wasteItemId,
          quantity: quantity || 1,
          points
        },
        include: {
          wasteItem: {
            select: {
              name: true,
              category: true,
              binType: true
            }
          }
        }
      });

      // Update user points
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          points: {
            increment: points
          }
        },
        select: {
          points: true
        }
      });

      return { wasteLog, updatedUser };
    });

    res.status(201).json({
      success: true,
      data: {
        message: `Great job! You've earned ${points} points! 🌟`,
        wasteLog: result.wasteLog,
        newTotalPoints: result.updatedUser.points,
        pointsEarned: points
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all waste logs (admin) or user's waste logs
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const userId = req.query.userId; // For admin to filter by specific user
    const category = req.query.category?.toUpperCase();
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const offset = (page - 1) * limit;

    // Build where clause - users can only see their own logs
    const where = {
      userId: req.user.id // Always filter by current user for now
    };

    // Add category filter if provided
    if (category && ['WET', 'DRY', 'E_WASTE', 'HAZARDOUS', 'RECYCLABLE'].includes(category)) {
      where.wasteItem = {
        category: category
      };
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate);
      }
    }

    const [wasteLogs, totalCount] = await Promise.all([
      prisma.wasteLog.findMany({
        where,
        include: {
          wasteItem: {
            select: {
              name: true,
              category: true,
              binType: true
            }
          },
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { timestamp: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.wasteLog.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: {
        wasteLogs,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        filters: {
          category: category || null,
          startDate: startDate || null,
          endDate: endDate || null
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get waste log by ID
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const wasteLog = await prisma.wasteLog.findFirst({
      where: {
        id,
        userId: req.user.id // Users can only view their own logs
      },
      include: {
        wasteItem: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!wasteLog) {
      return res.status(404).json({
        success: false,
        error: 'Waste log not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { wasteLog }
    });
  } catch (error) {
    next(error);
  }
});

// Get waste logging statistics
router.get('/stats/overview', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const days = parseInt(req.query.days) || 30; // default last 30 days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get stats for the specified period
    const stats = await prisma.wasteLog.groupBy({
      by: ['wasteItemId'],
      where: {
        userId,
        timestamp: {
          gte: startDate
        }
      },
      _sum: {
        quantity: true,
        points: true
      },
      _count: true
    });

    // Get waste items details
    const wasteItemIds = stats.map(stat => stat.wasteItemId);
    const wasteItems = await prisma.wasteItem.findMany({
      where: { id: { in: wasteItemIds } },
      select: { id: true, name: true, category: true }
    });

    // Group by category
    const categoryStats = stats.reduce((acc, stat) => {
      const wasteItem = wasteItems.find(item => item.id === stat.wasteItemId);
      const category = wasteItem?.category || 'OTHER';
      
      if (!acc[category]) {
        acc[category] = { quantity: 0, points: 0, count: 0, items: [] };
      }
      
      acc[category].quantity += stat._sum.quantity || 0;
      acc[category].points += stat._sum.points || 0;
      acc[category].count += stat._count;
      acc[category].items.push({
        name: wasteItem?.name,
        quantity: stat._sum.quantity || 0,
        points: stat._sum.points || 0,
        logs: stat._count
      });
      
      return acc;
    }, {});

    // Get daily breakdown
    const dailyStats = await prisma.wasteLog.groupBy({
      by: ['timestamp'],
      where: {
        userId,
        timestamp: {
          gte: startDate
        }
      },
      _sum: {
        quantity: true,
        points: true
      },
      _count: true,
      orderBy: {
        timestamp: 'desc'
      }
    });

    // Group daily stats by date
    const dailyBreakdown = dailyStats.reduce((acc, stat) => {
      const date = stat.timestamp.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { quantity: 0, points: 0, logs: 0 };
      }
      acc[date].quantity += stat._sum.quantity || 0;
      acc[date].points += stat._sum.points || 0;
      acc[date].logs += stat._count;
      return acc;
    }, {});

    const totalStats = {
      quantity: Object.values(categoryStats).reduce((sum, cat) => sum + cat.quantity, 0),
      points: Object.values(categoryStats).reduce((sum, cat) => sum + cat.points, 0),
      logs: Object.values(categoryStats).reduce((sum, cat) => sum + cat.count, 0)
    };

    res.status(200).json({
      success: true,
      data: {
        period: `Last ${days} days`,
        totalStats,
        byCategory: categoryStats,
        dailyBreakdown,
        user: {
          currentPoints: req.user.points
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Delete waste log (user can only delete their own logs within 24 hours)
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const wasteLog = await prisma.wasteLog.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!wasteLog) {
      return res.status(404).json({
        success: false,
        error: 'Waste log not found'
      });
    }

    // Check if log is within 24 hours (allow deletion)
    const now = new Date();
    const logTime = new Date(wasteLog.timestamp);
    const hoursDiff = (now - logTime) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete waste logs older than 24 hours'
      });
    }

    // Delete waste log and refund points in a transaction
    await prisma.$transaction(async (prisma) => {
      // Delete the waste log
      await prisma.wasteLog.delete({
        where: { id }
      });

      // Refund points to user
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          points: {
            decrement: wasteLog.points
          }
        }
      });
    });

    res.status(200).json({
      success: true,
      data: {
        message: 'Waste log deleted and points refunded',
        pointsRefunded: wasteLog.points
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
