const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/valuable-materials - Get all valuable materials
router.get('/', async (req, res) => {
  try {
    const materials = await prisma.valuableMaterial.findMany({
      orderBy: {
        valueLevel: 'desc'
      }
    });

    res.json({
      success: true,
      data: materials,
      total: materials.length
    });
  } catch (error) {
    console.error('Error fetching valuable materials:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch valuable materials'
    });
  }
});

// GET /api/valuable-materials/:id - Get single valuable material
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const material = await prisma.valuableMaterial.findUnique({
      where: { id }
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        error: 'Valuable material not found'
      });
    }

    res.json({
      success: true,
      data: material
    });
  } catch (error) {
    console.error('Error fetching valuable material:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch valuable material'
    });
  }
});

module.exports = router;
