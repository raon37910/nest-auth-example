import * as Joi from 'joi'

export const CONFIGURATION = Joi.object({
  DB_TYPE: Joi.string().required(),
  PG_USER: Joi.string().required(),
  PG_PASSWORD: Joi.string().required(),
  PG_DB: Joi.string().required(),
  PG_PORT: Joi.number().required(),
  PG_HOST: Joi.string().required(),
  HASH_ROUNDS: Joi.number().required(),
})
