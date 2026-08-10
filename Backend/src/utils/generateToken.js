const jwt = require('jsonwebtoken');

const generateTokens = (id, role) => {
  const accessToken = jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '15m', // Short-lived access token
  });

  const refreshToken = jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '7d', // Long-lived refresh token
  });

  return { accessToken, refreshToken };
};

module.exports = generateTokens;
