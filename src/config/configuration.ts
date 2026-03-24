export default () => ({
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
  },
  database: {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    accessTokenExpires: process.env.JWT_ACCESS_TOKEN_EXPIRES || '7d',
    refreshTokenExpires: process.env.JWT_REFRESH_TOKEN_EXPIRES || '30d',
  },
  throttler: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '10', 10),
  },
  swagger: {
    enabled: process.env.SWAGGER_ENABLED === 'true',
    path: process.env.SWAGGER_PATH || 'api/docs',
  },
});