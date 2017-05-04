const Quote = require('../models/quote');

const controller = {};

controller.index = (req, res) => {
  Quote.findAll()
    .then(quotes => {
      res.render('quotes/quotes-index', {
        documentTitle: 'Ada\'s Quotes!!',
        quotesData: quotes,
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

controller.show = (req, res) => {
  Quote.findById(req.params.id)
    .then(quote => {
      res.render('quotes/quotes-single', {
        documentTitle: 'Ada\'s Quotes!!',
        quote: quote,
      });
    })
    .catch(err => {
      console.log(err);
      res.status(400).json(err);
    });
};

controller.create = (req, res) => {
  Quote.create({
      content: req.body.content,
      author: req.body.author,
      genre_id: req.body.genre_id,
    })
    .then(quote => {
      res.redirect('/quotes');
    })
    .catch(err => {
      res.status(400).json(err);
    });
};

controller.edit = (req, res) => {
  Quote.findById(req.params.id)
    .then(quote => {
      console.log(quote);
      res.render('quotes/quotes-edit', {
        documentTitle: 'Ada\'s Quotes!!',
        quote: quote,
        id: req.params.id,
      });
    })
    .catch(err => {
      res.status(400).json(err);
    });
};

controller.update = (req, res) => {
  Quote.update({
      content: req.body.content,
      author: req.body.author,
      genre_id: req.body.genre_id,
    }, req.params.id)
    .then(quote => {
      res.redirect('/quotes');
    })
    .catch(err => {
      res.status(400).json(err);
    });
};

controller.destroy = (req, res) => {
  Quote.destroy(req.params.id)
    .then(() => {
      res.redirect('/quotes');
    })
    .catch(err => {
      res.status(400).json(err);
    });
};

module.exports = controller;