import dotenv from 'dotenv';
type Environment = 'development' | 'production';

const env = (process.env.NODE_ENV || 'development') as Environment;
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

const config = {
  development: require('./env/development').default,
  production: require('./env/production').default,
};

export default config[env];
