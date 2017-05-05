require('isomorphic-fetch');
require('dotenv').config();
const API_KEY = process.env.API_SECRET_KEY;

function getTodaysQuote(req, res, next) {
  fetch('http://quotes.rest/qod.json', {
    headers: {
      'X-TheySaidSo-Api-Secret': API_KEY,
    }
  })
    .then((fetchRes) => {
      return fetchRes.json();
    }).then((jsonFetchRes) => {
      console.log(jsonFetchRes);
      console.log(jsonFetchRes.contents.quotes);
      // adding properties to res.locals
      res.locals.quoteOfTheDay = jsonFetchRes.contents.quotes[0].quote;
      res.locals.author = jsonFetchRes.contents.quotes[0].author;
      res.locals.category = jsonFetchRes.contents.quotes[0].category;
      res.locals.picture = jsonFetchRes.contents.quotes[0].background;
      next();
    }).catch((err) => {
      console.log(err);
      // in case there's an error in the API call, we don't want to just
      // display an error on the page... this helps the app stay functional
      res.locals.quoteOfTheDay = 'Coming Soon!';
      res.locals.author = null;
      res.locals.category = null;
      res.locals.picture = null;
      next();
    });
}

module.exports = {
  getTodaysQuote: getTodaysQuote,
};