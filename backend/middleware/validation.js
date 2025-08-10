const { z } = require('zod');

// Zod validation schemas
const schemas = {
  register: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email().toLowerCase(),
    password: z.string().min(6).max(128)
  }),

  login: z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(1)
  }),

  updateProfile: z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().toLowerCase().optional()
  }),

  wasteLog: z.object({
    wasteItemId: z.string().min(1),
    quantity: z.number().int().min(1).max(100).optional().default(1)
  })
};

const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
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

module.exports = { schemas, validateRequest };
