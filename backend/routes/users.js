const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');
const { validateRequest, schemas } = require('../middleware/validation');

const router = express.Router();
const prisma = new PrismaClient();

// Get current user profile
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            wasteLogs: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          ...user,
          totalWasteLogs: user._count.wasteLogs
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/me', authMiddleware, validateRequest(schemas.updateProfile), async (req, res, next) => {
  try {
    const { name, email } = req.body;
    
    // If email is being updated, check if it's already taken
    if (email && email !== req.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email is already taken'
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, email },
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      data: {
        message: 'Profile updated successfully! ✨',
        user: updatedUser
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get user's waste logs
router.get('/me/waste-logs', authMiddleware, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [wasteLogs, totalCount] = await Promise.all([
      prisma.wasteLog.findMany({
        where: { userId: req.user.id },
        include: {
          wasteItem: {
            select: {
              name: true,
              category: true,
              binType: true
            }
          }
        },
        orderBy: { timestamp: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.wasteLog.count({
        where: { userId: req.user.id }
      })
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
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get user statistics
router.get('/me/stats', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get total points and waste logs count
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        points: true,
        _count: {
          select: {
            wasteLogs: true
          }
        }
      }
    });

    // Get waste logs by category for this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const wasteByCategory = await prisma.wasteLog.groupBy({
      by: ['wasteItemId'],
      where: {
        userId: userId,
        timestamp: {
          gte: startOfMonth
        }
      },
      _sum: {
        quantity: true,
        points: true
      },
      _count: true
    });

    // Get waste items details for the categories
    const wasteItemIds = wasteByCategory.map(item => item.wasteItemId);
    const wasteItems = await prisma.wasteItem.findMany({
      where: { id: { in: wasteItemIds } },
      select: { id: true, category: true }
    });

    // Group by category
    const categoryStats = wasteByCategory.reduce((acc, log) => {
      const wasteItem = wasteItems.find(item => item.id === log.wasteItemId);
      const category = wasteItem?.category || 'OTHER';
      
      if (!acc[category]) {
        acc[category] = { quantity: 0, points: 0, count: 0 };
      }
      
      acc[category].quantity += log._sum.quantity || 0;
      acc[category].points += log._sum.points || 0;
      acc[category].count += log._count;
      
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        totalPoints: user?.points || 0,
        totalWasteLogs: user?._count.wasteLogs || 0,
        thisMonthByCategory: categoryStats
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const topUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        points: true,
        _count: {
          select: {
            wasteLogs: true
          }
        }
      },
      orderBy: { points: 'desc' },
      take: limit
    });

    res.status(200).json({
      success: true,
      data: {
        leaderboard: topUsers.map((user, index) => ({
          ...user,
          rank: index + 1,
          totalLogs: user._count.wasteLogs
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
