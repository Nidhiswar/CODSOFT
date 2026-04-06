const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

const requiredEnvVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'CLIENT_URL' // For CORS
];

const validateEnv = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  
  // Warn if GOOGLE_API_KEY is missing but don't crash (feature flag style)
  if (!process.env.GOOGLE_API_KEY) {
      console.warn("⚠️ GOOGLE_API_KEY is missing. Generative AI features will be disabled.");
  }

  if (missing.length > 0) {
    throw new Error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  }
  
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      console.warn('⚠️  JWT_SECRET is short. It should be at least 32 characters long for security.');
  }

  if (process.env.MONGO_URI && process.env.MONGO_URI.includes('<password>')) {
    throw new Error('❌ MONGO_URI contains placeholder credentials. Please update your .env file.');
  }
};

// Validating on import
try {
    validateEnv();
} catch (error) {
    console.error(error.message);
    process.exit(1);
}

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  googleApiKey: process.env.GOOGLE_API_KEY,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  clientUrl: process.env.CLIENT_URL,
  env: process.env.NODE_ENV || 'development'
};
