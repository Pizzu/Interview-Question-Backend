const mongoose = require('mongoose');
let isConnected;

module.exports = connectToDatabase = () => {
  if  (isConnected) {
    console.log('=> using existing database connection');
    return Promise.resolve();
  }
  console.log('=> using new database connection');
  return mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true,  useCreateIndex: true, replicaSet: 'Cluster0-shard-0'})
    .then(db => {
      isConnected = db.connections[0].readyState;
    });
};