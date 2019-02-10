const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();
const middlewares = require('./middlewares');
const auth = require('./authentication/index');
const api = require('./api/index');
const app = express();

//Mongoose setup
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true,  useCreateIndex: true, replicaSet: 'Cluster0-shard-0'})
  .then(() => {
    console.log('Database connected');
  })
  .catch(err => console.error(err));
require('./models/user')
require('./models/job')
require('./models/subJob')
require('./models/question')
//Middlewares setup
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    msg: 'Welcome to this API 🤩💎🦄'
  })
});

app.use('/auth', auth);
app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;