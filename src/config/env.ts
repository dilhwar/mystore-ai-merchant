/**
 * Environment variables configuration
 * All variables must be defined in .env and .env.example files
 */

import Constants from 'expo-constants';

const ENV = {
  dev: {
    API_URL: 'http://192.168.1.207:8000/api/v1',
    API_TIMEOUT: 15000,
    APP_ENV: 'development',
  },
  staging: {
    API_URL: 'https://api.my-store.ai/api/v1',
    API_TIMEOUT: 15000,
    APP_ENV: 'staging',
  },
  prod: {
    API_URL: 'https://api.my-store.ai/api/v1',
    API_TIMEOUT: 15000,
    APP_ENV: 'production',
  },
};

type Environment = 'dev' | 'staging' | 'prod';

const getEnv = (): Environment => {
  const appEnv = Constants.expoConfig?.extra?.appEnv || 'prod';
  return appEnv as Environment;
};

const currentEnv = getEnv();
const envConfig = ENV[currentEnv];

export const config = {
  // API Configuration
  API_URL: envConfig.API_URL,
  API_TIMEOUT: envConfig.API_TIMEOUT,

  // App Configuration
  APP_ENV: envConfig.APP_ENV,

  // Optional: Sentry DSN for error tracking
  SENTRY_DSN: Constants.expoConfig?.extra?.sentryDsn || '',

  // Optional: EAS Project ID for OTA updates
  EAS_PROJECT_ID: Constants.expoConfig?.extra?.easProjectId || '',

  // Feature flags
  ENABLE_NOTIFICATIONS: true,
  ENABLE_OFFLINE_MODE: true,
};

export default config;
