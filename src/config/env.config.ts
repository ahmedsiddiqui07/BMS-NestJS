import { Config } from 'src/common/types/interface';

export default (): Config => ({
  app: {
    nodeEnv: process.env.NODE_ENV || 'local',
    port: Number(process.env.PORT) || 3000,
    host: process.env.HOST || 'localhost',
  },
  database: {
    user: process.env.DB_USER || '',
    host: process.env.DB_HOST || '',
    name: process.env.DB_NAME || '',
    password: process.env.DB_PASSWORD || '',
    port: Number(process.env.DB_PORT) || 5432,
  },
  jwt: {
    secretKey: process.env.JWT_SECRET_KEY || '',
    expires: (process.env.JWT_EXPIRES || '1d') as '1d',
    refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET || '',
    refreshExpires: (process.env.JWT_REFRESH_EXPIRES || '7d') as '7d',
  },
  mail: {
    host: process.env.MAIL_HOST || '',
    port: Number(process.env.MAIL_PORT) || 1025,
    from: process.env.MAIL_FROM || '',
    auth: process.env.MAIL_AUTH || null,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || '',
  },
});
