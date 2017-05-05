
# Making API calls from an Express backend

### Learning Objectives

- Avoid CORS issues by calling third-party APIs from the server side
- Create middleware that gets data from third-party APIs
- Use a `.env` file to protect API keys
- Explore the `response` object a little more, notably `res.locals`.

## APIs are cool.

And it makes sense that we'd want to include them in our apps. However, there are some things that make APIs frustrating to work with on the client side.
- They can make page loading look a little funky. (Remember HackerNews articles loading one by one?)
- CORS (cross-origin resource sharing) issues are sometimes a problem. 
- It's difficult to hide an API key.

Fortunately, an Express backend helps us solve all these issues at once by allowing us to make API requests from our shiny new Express server.

## Setting up `fetch`

We've been using `fetch` to make API requests. However, `fetch` is built into browsers -- not node. In order to use `fetch` on the server side, we'll need to use the `fetch` polyfill. (Because we really want to make `fetch` happen.)

```bash
npm install --save isomorphic-fetch 
```

We'll learn where and how to `require` these in a minute.

## Creating our own custom middleware

So far, we've been using middleware that's been built by other people. But, we can also make our _own_ middleware and include it in our routes. Let's set up to do just that, working from the [`final-adaquotes-mvc-full-crud`](https://git.generalassemb.ly/nyc-wdi-ada/LECTURE_U02_D10_Express-MVC-CRUD-misc/tree/master/final-adaquotes-mvc-full-crud) app from the update & delete lecture. 

The end goal is to get a quote of the day from the [They Said So API](https://theysaidso.com).

### File structure & setup

In your `routes` folder, make a new directory `routehelpers`. Then, within that directory, make a new file: `quoteHelpers.js`. (This way of naming files is convention -- lets others know that the file is meant to add functionality to the quotes route.)

Directory structue check-in:

```bash
[ bunch of stuff up here ]
├── routes
│   └── quotes.js
├── services
│   └── quotes
│        └── quoteHelpers.js
```


### Creating the middleware

Let's start simple, by saying 'Hello World!' in the ancient tradition of our people. In `services/quotes/quoteHelpers.js`, we write a simple function (named `getTodaysQuote`, since that's what we know it's going to do in the end) that `console.log`s Hello World and export it.

```js
function getTodaysQuote() {
  console.log('hello world!');
}

module.exports = {
  getTodaysQuote: getTodaysQuote,
}
```

However, before we can do anything with it in an Express context, we have to make sure it has access to the request object, the response object, and the `next` function. And we have to call `next();` at the end, just like we had to at the end of all the `authHelpers`.

```js
function getTodaysQuote(req, res, next) {
  console.log('hello world! i\'m in quoteHelpers');
  next();
}

module.exports = {
  getTodaysQuote: getTodaysQuote,
}
```

Then, we can add it to our route. In `routes/quotes.js`:

```js
// underneath where we require the controller
const quoteHelpers = require('../services/quotes/quoteHelpers');

// in place of `quoteRoutes.get('/', controller.index);`
quoteRoutes.get('/', quoteHelpers.getTodaysQuote, controller.index);
```


### Setting `fetch` usage

Remember when we imported `isomorphic-fetch`? Let's require and use them at the top of `services/quotes/quoteHelpers.js`.

```js
require('isomorphic-fetch');
```

Then we can get the data we want, just like with a normal `fetch` request:

```js
function getTodaysQuote(req, res, next) {
  fetch('http://quotes.rest/qod.json')
    .then((fetchRes) => {
      return fetchRes.json();
    }).then((jsonFetchRes) => {
      console.log(jsonFetchRes);
      console.log(jsonFetchRes.contents.quotes);
      next();
    });
}
```

(Note that the `next` call has to go inside the `.then`, otherwise it will run before we get the data back in the correct format.)

Now we have the data we want. But what do we do with it?

### `res.locals`

During the request-response cycle, the request and response objects remain the same object throughout, just passed from one middleware to the next. This is how the `body-parser` middleware adds `req.body` for us to access. And it's how we'll be able to access the data we get from the `fetch` request: by attaching it to the response object.

Express has a built-in property for us to use here: `req.locals`. From the [documentation](https://expressjs.com/en/4x/api.html#res.locals): "An object that contains response local variables scoped to the request, and therefore available only to the view(s) rendered during that request / response cycle (if any)."

This means that if we attach something to `res.locals` in `routes/routehelpers/quoteHelpers.js`, we'll be able to access it in `controller.index` in `controllers/quotesController.js`.

```js
// in routes/routehelpers/quoteHelpers.js
function getTodaysQuote(req, res, next) {
  fetch('http://quotes.rest/qod.json')
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
```

```js
// in controllers/quotesController.js
controller.index = (req, res) => {
  // not changing anything about the database
  Quote.findAll()
    .then(quotes => {
      res.render('quotes/quotes-index', {
        documentTitle: 'Ada\'s Quotes!!',
        quotesData: quotes,
        // adding a quote of the day object to what we're sending
        // to the view, and accessing what we stored in `res.locals`
        quoteOfTheDay: {
          quote: res.locals.quoteOfTheDay,
          author: res.locals.author,
          category: res.locals.category,
          picture: res.locals.picture,
        }
      });
    })
    .catch(err => {
      res.status(400).json(err);
    });
};
```

And access it in `views/quotes/quotes-index.ejs`.

```html
<div class='my-quote'>
  <h2 class='qotd'>Quote of the Day</h2>
  <h3><%= quoteOfTheDay.quote %></h3>
  <div class='meta'>
    <span class='author'><%= quoteOfTheDay.author %></span>
    <span class='genre'><%= quoteOfTheDay.category %></span>
  </div>
  <img src='<%= quoteOfTheDay.picture %>' alt='<%=quoteOfTheDay.category%>'/>
</div>
```

## But what if my API needs a key?

Good question!! With API keys, you don't want to push them to GitHub -- and you don't want to use them on the frontend, because then anyone who's keeping track of what API calls you're making can see the the key and potentially steal it.

That's where the `.env` file comes in.

If you haven't already, go ahead and run `npm install --save dotenv`.

Then, you'll be able to put a line in your `.env` file that looks something like this:

```
API_SECRET_KEY=[your secret key here!!]
```

Then, in `services/quotes/quoteHelpers.js`, grab the environment variables from the `.env` file by including these lines:

```js
require('dotenv').config();
const API_KEY = process.env.API_SECRET_KEY;
```

Then, we have to change the query to include the secret key.

```js
function getTodaysQuote(req, res, next) {
  // we're including the API key using a template literal
  // which also means we have to switch from single quotes
  // to backticks
  fetch(`http://quotes.rest/qod.json?api_key=${API_KEY}`)
  .then( /* ...
  there is a bunch of other stuff in this function, see above...
  */
```

Sometimes the API requires custom "headers". We'll dive more into those later. For now, that looks like this:

```js
function getTodaysQuote(req, res, next) {
  // note that the fetch function now takes two arguments:
  // the URL and a configuration object.
  fetch('http://quotes.rest/qod.json', {
    // 'headers' is an object within the configuration object
    headers: {
      // name of the header, in single quotes
      'X-TheySaidSo-Api-Secret': API_KEY,
                                 // and the key from the .env file.
    }
  })
    .then(/* ...
  there is a bunch of other stuff in this function, see above...
  */
```