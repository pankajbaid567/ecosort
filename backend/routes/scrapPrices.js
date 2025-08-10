const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/scrap-prices - Get all scrap prices
router.get('/', async (req, res) => {
  try {
    const prices = await prisma.scrapPrice.findMany({
      orderBy: {
        materialName: 'asc'
      }
    });

    res.json({
      success: true,
      data: prices,
      total: prices.length
    });
  } catch (error) {
    console.error('Error fetching scrap prices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scrap prices'
    });
  }
});

// GET /api/scrap-prices/:id - Get single scrap price
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const price = await prisma.scrapPrice.findUnique({
      where: { id }
    });

    if (!price) {
      return res.status(404).json({
        success: false,
        error: 'Scrap price not found'
      });
    }

    res.json({
      success: true,
      data: price
    });
  } catch (error) {
    console.error('Error fetching scrap price:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scrap price'
    });
  }
});

// PATCH /api/scrap-prices/:id - Update scrap price (Admin only)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { pricePerKg } = req.body;

    // Note: For now, treating any authenticated user as admin
    // In production, you'd check user role/permissions

    if (!pricePerKg || pricePerKg <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid price per kg is required'
      });
    }

    const updatedPrice = await prisma.scrapPrice.update({
      where: { id },
      data: { 
        pricePerKg: parseFloat(pricePerKg),
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: updatedPrice,
      message: 'Scrap price updated successfully'
    });
  } catch (error) {
    console.error('Error updating scrap price:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Scrap price not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to update scrap price'
    });
  }
});

module.exports = router;
