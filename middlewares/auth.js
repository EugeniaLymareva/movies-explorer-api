const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-err');

const { JWT_SECRET, NODE_ENV } = process.env;

module.exports = (req, res, next) => {
  // достаём авторизационный заголовок
  const { token: cookieToken } = req.cookies || {};
  const { authorization: headersToken } = req.headers || {};
  const token = (cookieToken || headersToken || '').replace('Bearer ', '');
  /// убеждаемся, что он есть или начинается с Bearer
  if (!token) {
    throw new UnauthorizedError('Необходима авторизация');
  }
  /// извлекаем токен методом replace чтобы выкинуть из заголовка приставку 'Bearer ',
  /// в константу запишется только JWT
  let payload;

  try {
    /// верифицируем токен методом verify
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key');
  } catch (err) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  return next(); // пропускаем запрос дальше
};
