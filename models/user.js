const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const isEmail = require('validator/lib/isEmail');
const UnauthorizedError = require('../errors/unauthorized-err');
// const isURL = require('validator/lib/isURL');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => isEmail(v),
      message: 'Неправильный формат почты',
    },
  },
  password: {
    type: String,
    required: true,
    select: false, // хеш пароля пользователя не будет возвращаться из базы
  },
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
});

/// проверка почты и пароля как часть схемы
userSchema.statics.findUserByCredentials = function (email, password) {
  /// ищем пользователя по почте и сравниваем хеши /// this — это модель User
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user || !bcrypt.compareSync(password, user.password)) {
        throw new UnauthorizedError('Неправильная почта или пароль');
      }
      return user;
    });
};

module.exports = mongoose.model('user', userSchema);
