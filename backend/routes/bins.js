const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// Get all bins with optional filtering
router.get('/', async (req, res, next) => {
  try {
    const type = req.query.type?.toUpperCase();
    const isFull = req.query.isFull;
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseFloat(req.query.radius) || 10; // default 10km radius

    // Build where clause
    const where = {};
    
    if (type && ['WET', 'DRY', 'E_WASTE', 'HAZARDOUS', 'RECYCLABLE'].includes(type)) {
      where.type = type;
    }

    if (isFull !== undefined) {
      where.isFull = isFull === 'true';
    }

    let bins = await prisma.bin.findMany({
      where,
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        type: true,
        isFull: true,
        capacity: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { name: 'asc' }
    });

    // If lat/lng provided, filter by distance and add distance field
    if (!isNaN(lat) && !isNaN(lng)) {
      bins = bins
        .map(bin => ({
          ...bin,
          distance: calculateDistance(lat, lng, bin.latitude, bin.longitude)
        }))
        .filter(bin => bin.distance <= radius)
        .sort((a, b) => a.distance - b.distance);
    }

    res.status(200).json({
      success: true,
      data: {
        bins,
        count: bins.length,
        filters: {
          type: type || null,
          isFull: isFull !== undefined ? isFull === 'true' : null,
          location: (!isNaN(lat) && !isNaN(lng)) ? { lat, lng, radius } : null
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get bin by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const bin = await prisma.bin.findUnique({
      where: { id }
    });

    if (!bin) {
      return res.status(404).json({
        success: false,
        error: 'Bin not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { bin }
    });
  } catch (error) {
    next(error);
  }
});

// Get bins by type
router.get('/type/:type', async (req, res, next) => {
  try {
    const { type } = req.params;
    const binType = type.toUpperCase();

    if (!['WET', 'DRY', 'E_WASTE', 'HAZARDOUS', 'RECYCLABLE'].includes(binType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid bin type. Valid types: WET, DRY, E_WASTE, HAZARDOUS, RECYCLABLE'
      });
    }

    const bins = await prisma.bin.findMany({
      where: { type: binType },
      orderBy: { name: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: {
        bins,
        type: binType,
        count: bins.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get nearby bins
router.get('/nearby/:lat/:lng', async (req, res, next) => {
  try {
    const lat = parseFloat(req.params.lat);
    const lng = parseFloat(req.params.lng);
    const radius = parseFloat(req.query.radius) || 5; // default 5km radius
    const limit = parseInt(req.query.limit) || 20;

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid latitude or longitude'
      });
    }

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

    // Calculate distances and filter
    const nearbyBins = bins
      .map(bin => ({
        ...bin,
        distance: calculateDistance(lat, lng, bin.latitude, bin.longitude)
      }))
      .filter(bin => bin.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    res.status(200).json({
      success: true,
      data: {
        bins: nearbyBins,
        center: { lat, lng },
        radius,
        count: nearbyBins.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get bin statistics
router.get('/stats/overview', async (req, res, next) => {
  try {
    const stats = await prisma.bin.groupBy({
      by: ['type', 'isFull'],
      _count: true,
      orderBy: [
        { type: 'asc' },
        { isFull: 'asc' }
      ]
    });

    const totalBins = await prisma.bin.count();

    const formattedStats = stats.reduce((acc, stat) => {
      if (!acc[stat.type]) {
        acc[stat.type] = { total: 0, full: 0, available: 0 };
      }
      
      acc[stat.type].total += stat._count;
      if (stat.isFull) {
        acc[stat.type].full += stat._count;
      } else {
        acc[stat.type].available += stat._count;
      }
      
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        totalBins,
        byType: formattedStats,
        summary: {
          total: totalBins,
          full: stats.filter(s => s.isFull).reduce((sum, s) => sum + s._count, 0),
          available: stats.filter(s => !s.isFull).reduce((sum, s) => sum + s._count, 0)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/bins/:id/report-full - Mark bin as full
router.patch('/:id/report-full', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const bin = await prisma.bin.findUnique({
      where: { id }
    });

    if (!bin) {
      return res.status(404).json({
        success: false,
        error: 'Bin not found'
      });
    }

    if (bin.isFull) {
      return res.status(400).json({
        success: false,
        error: 'Bin is already marked as full'
      });
    }

    const updatedBin = await prisma.bin.update({
      where: { id },
      data: { 
        isFull: true,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: updatedBin,
      message: 'Bin marked as full. Thank you for reporting!'
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

module.exports = router;
