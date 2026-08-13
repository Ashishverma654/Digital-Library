const verifyEnv = () => {
  const requiredEnv = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
  
  const missing = requiredEnv.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.error(`💥 FATAL ERROR: Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
};

module.exports = verifyEnv;
