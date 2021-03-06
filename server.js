const express = require ('express');
const router = express.Router();
const morgan = require('morgan');
const bodyParser = require ('body-parser');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const jsonParser = bodyParser.json();
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const mancalaAPIRouter = require('./mancala/mancalaAPIRouter');
const gameRouter = require('./mancala/gameRouter');
const usersRouter = require('./users/usersRouter')
const { DATABASE_URL, PORT } = require('./config');

app.use(morgan('common'));

app.use(express.static('public'));
app.enable("trust proxy")

app.use('/mancala', mancalaAPIRouter);
app.use('/game', gameRouter)
app.use('/users', usersRouter)

let server;

function runServer(database_url, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(database_url, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };