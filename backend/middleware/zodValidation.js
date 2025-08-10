const { z } = require('zod');

// Validation schemas
const schemas = {
  // Auth schemas
  register: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email format').toLowerCase(),
    password: z.string().min(6, 'Password must be at least 6 characters').max(128)
  }),

  login: z.object({
    email: z.string().email('Invalid email format').toLowerCase(),
    password: z.string().min(1, 'Password is required')
  }),

  verifyToken: z.object({
    token: z.string().min(1, 'Token is required')
  }),

  // User schemas
  updateProfile: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    email: z.string().email('Invalid email format').toLowerCase().optional()
  }),

  // Waste log schemas
  wasteLog: z.object({
    wasteItemId: z.string().min(1, 'Waste item ID is required'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100).optional().default(1),
    area: z.string().max(100).optional()
  }),

  // Scrap price schemas
  updateScrapPrice: z.object({
    pricePerKg: z.number().positive('Price must be positive')
  }),

  // Search and pagination schemas
  pagination: z.object({
    page: z.number().int().min(1).optional().default(1),
    limit: z.number().int().min(1).max(100).optional().default(20)
  }),

  wasteItemQuery: z.object({
    search: z.string().max(100).optional(),
    category: z.enum(['WET', 'DRY', 'E_WASTE', 'HAZARDOUS', 'RECYCLABLE']).optional(),
    page: z.number().int().min(1).optional().default(1),
    limit: z.number().int().min(1).max(100).optional().default(20)
  })
};

// Validation middleware factory
const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      let dataToValidate;
      
      switch (source) {
        case 'body':
          dataToValidate = req.body;
          break;
        case 'query':
          // Convert string numbers to actual numbers for query params
          const processedQuery = { ...req.query };
          if (processedQuery.page) processedQuery.page = parseInt(processedQuery.page);
          if (processedQuery.limit) processedQuery.limit = parseInt(processedQuery.limit);
          if (processedQuery.quantity) processedQuery.quantity = parseInt(processedQuery.quantity);
          if (processedQuery.pricePerKg) processedQuery.pricePerKg = parseFloat(processedQuery.pricePerKg);
          dataToValidate = processedQuery;
          break;
        case 'params':
          dataToValidate = req.params;
          break;
        default:
          dataToValidate = req.body;
      }

      const validatedData = schema.parse(dataToValidate);
      
      // Replace the original data with validated data
      if (source === 'body') {
        req.body = validatedData;
      } else if (source === 'query') {
        req.query = validatedData;
      } else if (source === 'params') {
        req.params = validatedData;
      }
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: formattedErrors
        });
      }
      
      next(error);
    }
  };
};

// Validation middleware for common patterns
const validateId = validateRequest(z.object({
  id: z.string().min(1, 'ID is required')
}), 'params');

const validatePagination = validateRequest(schemas.pagination, 'query');

module.exports = {
  schemas,
  validateRequest,
  validateId,
  validatePagination
};
