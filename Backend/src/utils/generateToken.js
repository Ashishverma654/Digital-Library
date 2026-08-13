const jwt = require('jsonwebtoken');

const generateTokens = (id, role) => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  const accessExpiry = process.env.JWT_EXPIRES_IN || '15m';
  const refreshExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  const accessToken = jwt.sign({ id, role }, jwtSecret, {
    expiresIn: accessExpiry,
  });

  const refreshToken = jwt.sign({ id, role }, jwtRefreshSecret, {
    expiresIn: refreshExpiry,
  });

  return { accessToken, refreshToken };
};

module.exports = generateTokens;
