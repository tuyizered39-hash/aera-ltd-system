const { z } = require('zod');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Parse and validate the request body
      const result = schema.parse(req.body);
      // Replace req.body with the parsed result (including transformed values)
      req.body = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
};

// Common validation schemas
const schemas = {
  // Login validation
  login: z.object({
    username: z.string().min(3).max(50),
    password: z.string().min(6),
  }),
  
  // Create user validation
  createUser: z.object({
    username: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().min(2).max(100),
    phone: z.string().optional().nullable(),
    role: z.enum(['ADMIN', 'WORKER']).optional(),
  }),
  
  // ✅ FIXED: Create service validation with proper null handling
  createService: z.object({
    serviceType: z.enum([
      'IT_MAINTENANCE', 
      'ELECTRICAL_INSTALLATION', 
      'CONSTRUCTION', 
      'GENERATOR_REPAIR', 
      'OFFICE_STATIONARY', 
      'DECORATION_SOUND'
    ]),
    clientName: z.string().min(2).max(100),
    clientPhone: z.string().optional().nullable(),
    clientEmail: z.string().email().optional().nullable(),
    location: z.string().min(2),
    district: z.string().min(2),
    
    // ✅ Amount: Accept string or number, convert to number
    amount: z.preprocess(
      (val) => {
        if (typeof val === 'string') {
          const num = parseFloat(val);
          return isNaN(num) ? val : num;
        }
        return val;
      },
      z.number().positive('Amount must be a positive number')
    ),
    
    // ✅ AmountPaid: Accept string or number, convert to number, allow null
    amountPaid: z.preprocess(
      (val) => {
        if (val === '' || val === null || val === undefined) return null;
        if (typeof val === 'string') {
          const num = parseFloat(val);
          return isNaN(num) ? null : num;
        }
        return val;
      },
      z.number().min(0, 'Amount paid must be at least 0').nullable().optional()
    ),
    
    paymentStatus: z.enum(['PAID', 'UNPAID', 'PARTIAL']).optional(),
    paymentMode: z.enum(['CASH', 'MTN', 'BANK']).optional(),
    description: z.string().optional().nullable(),
    
    // ✅ StartDate: Accept string or Date, convert to Date
    startDate: z.preprocess(
      (val) => {
        if (val instanceof Date) return val;
        if (typeof val === 'string') {
          const date = new Date(val);
          return isNaN(date.getTime()) ? val : date;
        }
        return val;
      },
      z.date().refine(date => !isNaN(date.getTime()), {
        message: 'Invalid start date format'
      })
    ),
    
    // ✅ EndDate: Accept string or Date, convert to Date, allow null
    endDate: z.preprocess(
      (val) => {
        if (val === '' || val === null || val === undefined) return null;
        if (val instanceof Date) return val;
        if (typeof val === 'string') {
          const date = new Date(val);
          return isNaN(date.getTime()) ? null : date;
        }
        return val;
      },
      z.date().nullable().optional()
    ),
    
    // ✅ FIXED: tentQuantity - Accept string, number, or null
    tentQuantity: z.preprocess(
      (val) => {
        if (val === '' || val === null || val === undefined) return null;
        if (typeof val === 'string') {
          const num = parseInt(val);
          return isNaN(num) ? null : num;
        }
        if (typeof val === 'number') {
          return val;
        }
        return null;
      },
      z.number().int().min(0, 'Tent quantity must be a positive integer').nullable().optional()
    ),
    
    // ✅ DecorationItems: Allow null or array
    decorationItems: z.preprocess(
      (val) => {
        if (val === '' || val === null || val === undefined) return null;
        return val;
      },
      z.array(z.object({
        name: z.string().min(1, 'Item name is required'),
        quantity: z.number().int().min(0, 'Quantity must be at least 0'),
      })).nullable().optional()
    ),
    
    notes: z.string().optional().nullable(),
  }),
};

module.exports = { validate, schemas };