const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const config = require('./config');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const {checkUser} = require('./middlewares/checkAuth');

const app = express();

mongoose.connect(config.env.DB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true
})

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

app.use((req,res,next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
})

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', checkUser, orderRoutes);

app.use((req,res,next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
})

app.use((error,req,res,next) => {
  res.status(error.status || 500);
  res.send({
    error: {
      global: error.message
    }
  })
})

module.exports = app;
