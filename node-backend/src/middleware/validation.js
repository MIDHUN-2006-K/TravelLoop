import Joi from 'joi';

export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        message: 'Validation error',
        errors,
      });
    }

    req.body = value;
    next();
  };
};

// Common validation schemas
export const schemas = {
  // Auth
  signup: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required(),
  }),

  resetPassword: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
    new_password: Joi.string().min(6).required(),
  }),

  updateProfile: Joi.object({
    name: Joi.string().optional(),
    avatar_url: Joi.string().uri().allow(null, '').optional(),
    language: Joi.string().optional(),
    preferences: Joi.object().optional(),
  }),

  // Trips
  createTrip: Joi.object({
    trip_name: Joi.string().required(),
    start_date: Joi.date().iso().required(),
    end_date: Joi.date().iso().greater(Joi.ref('start_date')).required(),
    description: Joi.string().allow(null, '').optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    status: Joi.string().valid('DRAFT', 'PLANNED', 'ACTIVE', 'COMPLETED').optional(),
    cover_image: Joi.string().allow(null, '').optional(),
    cover_image_url: Joi.string().uri().allow(null, '').optional(),
  }),

  updateTrip: Joi.object({
    trip_name: Joi.string().optional(),
    start_date: Joi.date().iso().optional(),
    end_date: Joi.date().iso().optional(),
    description: Joi.string().allow(null, '').optional(),
    is_public: Joi.boolean().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    status: Joi.string().valid('DRAFT', 'PLANNED', 'ACTIVE', 'COMPLETED').optional(),
    cover_image: Joi.string().allow(null, '').optional(),
    cover_image_url: Joi.string().uri().allow(null, '').optional(),
  }),

  // Stops
  createStop: Joi.object({
    city_id: Joi.string().uuid().optional(),
    stopping_place: Joi.string().optional(),
    latitude: Joi.number().optional(),
    longitude: Joi.number().optional(),
    notes: Joi.string().allow(null, '').optional(),
    start_date: Joi.date().iso().required(),
    end_date: Joi.date().iso().required(),
    order_index: Joi.number().integer().min(0).optional(),
  }).or('city_id', 'stopping_place'),

  updateStop: Joi.object({
    start_date: Joi.date().iso().optional(),
    end_date: Joi.date().iso().optional(),
    order_index: Joi.number().integer().min(0).optional(),
    notes: Joi.string().allow(null, '').optional(),
    latitude: Joi.number().optional(),
    longitude: Joi.number().optional(),
  }),

  reorderStops: Joi.object({
    stops: Joi.array().items(
      Joi.object({
        stop_id: Joi.string().uuid().required(),
        order_index: Joi.number().integer().min(0).required(),
      })
    ).required(),
  }),

  // Activities
  addActivity: Joi.object({
    activity_id: Joi.string().uuid().required(),
    scheduled_date: Joi.date().iso().optional(),
    custom_cost: Joi.number().min(0).optional(),
    notes: Joi.string().allow(null, '').optional(),
  }),

  updateActivity: Joi.object({
    custom_cost: Joi.number().min(0).allow(null).optional(),
    scheduled_date: Joi.date().iso().optional(),
    notes: Joi.string().allow(null, '').optional(),
  }),

  // Expenses
  createExpense: Joi.object({
    category: Joi.string().valid('transport', 'hotels', 'meals', 'activities', 'miscellaneous').required(),
    estimated_cost: Joi.number().positive().required(),
    actual_cost: Joi.number().min(0).optional(),
    description: Joi.string().allow(null, '').optional(),
    expense_date: Joi.date().iso().optional(),
  }),

  updateExpense: Joi.object({
    category: Joi.string().valid('transport', 'hotels', 'meals', 'activities', 'miscellaneous').optional(),
    estimated_cost: Joi.number().positive().optional(),
    actual_cost: Joi.number().min(0).allow(null).optional(),
    description: Joi.string().allow(null, '').optional(),
    expense_date: Joi.date().iso().optional(),
  }),

  // Notes
  createNote: Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    stop_id: Joi.string().uuid().optional(),
    day_date: Joi.date().iso().optional(),
  }),

  updateNote: Joi.object({
    title: Joi.string().optional(),
    content: Joi.string().optional(),
    stop_id: Joi.string().uuid().allow(null).optional(),
    day_date: Joi.date().iso().allow(null).optional(),
  }),

  // Packing
  createPackingItem: Joi.object({
    name: Joi.string().required(),
    category: Joi.string().valid('clothing', 'electronics', 'documents', 'essentials', 'medicine', 'toiletries').required(),
    quantity: Joi.number().integer().min(1).optional(),
  }),

  updatePackingItem: Joi.object({
    name: Joi.string().optional(),
    category: Joi.string().valid('clothing', 'electronics', 'documents', 'essentials', 'medicine', 'toiletries').optional(),
    is_packed: Joi.boolean().optional(),
    quantity: Joi.number().integer().min(1).optional(),
  }),

  // Saved Destinations
  createSavedDestination: Joi.object({
    city_id: Joi.string().uuid().required(),
    notes: Joi.string().allow(null, '').optional(),
  }),
};
