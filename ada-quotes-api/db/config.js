const options = {
  receive: (data, result, e) => {
    console.log(e.query);
  },
  query: (e) => {
    console.log(e.query);
  },
};

const pgp = require('pg-promise')(options);

let db;

if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  db = pgp({
    database: 'adabckapi_dev',
    port: 5432,
    host: 'localhost'
  });
} else if (process.env.NODE_ENV === 'production') {
  db = pgp({
    database: 'adabckapi_prod',
    port: 5432,
    host: 'localhost'
  });
}

module.exports = db;