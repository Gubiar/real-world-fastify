import { FastifyHelmetOptions } from '@fastify/helmet';
import { FastifyCorsOptions } from '@fastify/cors';
import { RateLimitPluginOptions } from '@fastify/rate-limit';
import { env, isProduction } from './env';
import { timingSafeEqual } from '../utils/security';

export const helmetConfig: FastifyHelmetOptions = {
  global: true,
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https:', 'data:'],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https://validator.swagger.io'],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'"],
      scriptSrcAttr: ["'none'"],
      styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
      upgradeInsecureRequests: [],
    },
  } : false,
  crossOriginEmbedderPolicy: !isProduction,
  hsts: isProduction ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  } : false,
};

export const corsConfig: FastifyCorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = env.CORS_ORIGIN.split(',').map(o => o.trim());
    
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400,
};

export const rateLimitConfig: RateLimitPluginOptions = {
  global: true,
  max: env.RATE_LIMIT_MAX,
  timeWindow: env.RATE_LIMIT_WINDOW,
  cache: 10000,
  allowList: async (req) => {
    const bypassHeader = req.headers['x-rate-limit-bypass'];
    if (!bypassHeader || typeof bypassHeader !== 'string') {
      return false;
    }
    return await timingSafeEqual(bypassHeader, env.JWT_SECRET);
  },
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] as string || req.ip;
  },
  errorResponseBuilder: () => {
    return {
      success: false,
      message: 'Too many requests, please try again later',
      statusCode: 429,
    };
  },
};

export const authRateLimitConfig: RateLimitPluginOptions = {
  max: env.RATE_LIMIT_AUTH_MAX,
  timeWindow: env.RATE_LIMIT_AUTH_WINDOW,
  cache: 5000,
  keyGenerator: (req) => {
    const ip = req.headers['x-forwarded-for'] as string || req.ip;
    const body = req.body as Record<string, unknown> | undefined;
    const email = body?.['email'] as string | undefined;
    return email ? `${ip}-${email}` : ip;
  },
  errorResponseBuilder: () => {
    return {
      success: false,
      message: 'Too many authentication attempts, please try again later',
      statusCode: 429,
    };
  },
};

