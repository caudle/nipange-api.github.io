import joi from '@hapi/joi';

// validate register
export const validateRegister = (data) => {
  const schema = joi.object({
    phone: joi.string().min(10),
    email: joi.string().min(4).email(),
    username: joi.string().min(2),
    password: joi.string().min(6).required(),
    device: joi.string().min(2),
    isEmailVerified: joi.boolean(),
    isPhoneVerified: joi.boolean(),
    listings: joi.array(),
    dp: joi.optional(),
    type: joi.optional(),
  });
  return schema.validate(data);
};

// validate login
export const validateLogin = (data) => {
  const schema = joi.object({
    login: joi.string().min(2).required(),
    password: joi.string().min(6).required(),
  });
  return schema.validate(data);
};

// validate property type
export const validatePropertyType = (data) => {
  const schema = joi.object({
    name: joi.string().required(),
    propertyType: joi.string(),
    hostId: joi.string(),
    listingId: joi.optional(),
    bathroom: joi.number(),
    bedroom: joi.number(),
    size: joi.optional(),
    building: joi.optional(),
  });
  return schema.validate(data);
};

// validate loc
export const validateLocation = (data) => {
  const schema = joi.object({
    location: joi.object(),
  });
  return schema.validate(data);
};

// validate aments
export const validateAmenities = (data) => {
  const schema = joi.object({
    amenities: joi.array(),
  });
  return schema.validate(data);
};

// validt prcng and desc
export const validatePrice = (data) => {
  const schema = joi.object({
    price: joi.number(),
    description: joi.string(),
    terms: joi.optional(),
    fee: joi.optional(),
  });
  return schema.validate(data);
};
