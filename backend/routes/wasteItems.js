const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get all waste items with pagination and search
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100); // Max 100 items per page
    const search = req.query.search?.trim() || '';
    const category = req.query.category?.toUpperCase() || '';
    const offset = (page - 1) * limit;

    // Build where clause
    const where = {};
    
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    if (category && ['WET', 'DRY', 'E_WASTE', 'HAZARDOUS', 'RECYCLABLE'].includes(category)) {
      where.category = category;
    }

    // Get waste items and total count
    const [wasteItems, totalCount] = await Promise.all([
      prisma.wasteItem.findMany({
        where,
        select: {
          id: true,
          name: true,
          category: true,
          disposalInstructions: true,
          binType: true,
          points: true,
          createdAt: true
        },
        orderBy: [
          { category: 'asc' },
          { name: 'asc' }
        ],
        skip: offset,
        take: limit
      }),
      prisma.wasteItem.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: {
        wasteItems,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        filters: {
          search: search || null,
          category: category || null
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get waste item by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const wasteItem = await prisma.wasteItem.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            wasteLogs: true
          }
        }
      }
    });

    if (!wasteItem) {
      return res.status(404).json({
        success: false,
        error: 'Waste item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        wasteItem: {
          ...wasteItem,
          totalLogged: wasteItem._count.wasteLogs
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get waste categories and their counts
router.get('/stats/categories', async (req, res, next) => {
  try {
    const categoryStats = await prisma.wasteItem.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      orderBy: {
        category: 'asc'
      }
    });

    const formattedStats = categoryStats.map(stat => ({
      category: stat.category,
      count: stat._count.category,
      displayName: getCategoryDisplayName(stat.category)
    }));

    res.status(200).json({
      success: true,
      data: {
        categories: formattedStats,
        totalItems: categoryStats.reduce((sum, stat) => sum + stat._count.category, 0)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Search waste items (alternative endpoint for more specific search)
router.get('/search/:query', async (req, res, next) => {
  try {
    const { query } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters long'
      });
    }

    const wasteItems = await prisma.wasteItem.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            disposalInstructions: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        category: true,
        disposalInstructions: true,
        binType: true,
        points: true
      },
      orderBy: [
        { name: 'asc' }
      ],
      take: limit
    });

    res.status(200).json({
      success: true,
      data: {
        query,
        results: wasteItems,
        count: wasteItems.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to get display name for categories
function getCategoryDisplayName(category) {
  const displayNames = {
    'WET': 'Wet Waste',
    'DRY': 'Dry Waste',
    'E_WASTE': 'Electronic Waste',
    'HAZARDOUS': 'Hazardous Waste',
    'RECYCLABLE': 'Recyclable Waste'
  };
  return displayNames[category] || category;
}

module.exports = router;
