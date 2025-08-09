let refreshTokens = [];

module.exports = {
  saveToken: (token) => refreshTokens.push(token),
  removeToken: (token) => {
    refreshTokens = refreshTokens.filter(t => t !== token);
  },
  exists: (token) => refreshTokens.includes(token),
};
