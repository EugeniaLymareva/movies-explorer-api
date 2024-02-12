require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const cors = require('cors');

const { login, createUser, logout } = require('./controllers/users');
const auth = require('./middlewares/auth');
const errorHandler = require('./middlewares/error-handler');
const { validationSignUp, validationSignIn } = require('./middlewares/validation');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const NotFoundError = require('./errors/not-found-err');

const {
  NODE_ENV,
  PORT = 3000,
  ORIGIN = 'http://localhost:3001',
  MONGO_URI,
} = process.env;

mongoose.connect(NODE_ENV === 'production' ? MONGO_URI : 'mongodb://127.0.0.1:27017/diplomdb', {
  useNewUrlParser: true,
});

const app = express();
app.use(cors({
  credentials: true,
  origin: ORIGIN,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);

app.post('/signin', validationSignIn, login);
app.post('/signup', validationSignUp, createUser);
app.use(auth);
app.use('/users', require('./routes/users'));
app.use('/movies', require('./routes/movies'));

app.post('/signout', logout);

app.use((req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
});

app.use(errorLogger);

app.use(errors());

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
