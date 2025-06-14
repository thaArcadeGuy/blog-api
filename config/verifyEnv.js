const requiredEnvVars = [
  'MONGO_DB_URI_PROD',
  'JWT_SECRET',
  'NODE_ENV'
];

function verifyEnv() {
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    process.exit(1);
  }
}

module.exports = verifyEnv;