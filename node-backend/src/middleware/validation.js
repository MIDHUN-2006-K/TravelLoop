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
  signup: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  createTrip: Joi.object({
    trip_name: Joi.string().required(),
    start_date: Joi.date().iso().required(),
    end_date: Joi.date().iso().greater(Joi.ref('start_date')).required(),
    description: Joi.string().optional(),
  }),

  updateTrip: Joi.object({
    trip_name: Joi.string().optional(),
    start_date: Joi.date().iso().optional(),
    end_date: Joi.date().iso().optional(),
    description: Joi.string().allow(null, '').optional(),
    is_public: Joi.boolean().optional(),
  }),

  createStop: Joi.object({
    city_id: Joi.string().uuid().optional(),
    stopping_place: Joi.string().optional(),
    start_date: Joi.date().iso().required(),
    end_date: Joi.date().iso().greater(Joi.ref('start_date')).required(),
    order_index: Joi.number().integer().min(0).optional(),
  }).or('city_id', 'stopping_place'),

  updateStop: Joi.object({
    start_date: Joi.date().iso().optional(),
    end_date: Joi.date().iso().optional(),
    order_index: Joi.number().integer().min(0).optional(),
  }),

  addActivity: Joi.object({
    activity_id: Joi.string().uuid().required(),
    scheduled_date: Joi.date().iso().optional(),
  }),

  updateActivity: Joi.object({
    custom_cost: Joi.number().positive().optional(),
    scheduled_date: Joi.date().iso().optional(),
    notes: Joi.string().optional(),
  }),
};
