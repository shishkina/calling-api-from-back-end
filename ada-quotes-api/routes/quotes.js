const express = require('express');
const controller = require('../controllers/quotesController');

const quoteRoutes = express.Router();

quoteRoutes.get('/', /*quoteHelpers.getTodaysQuote,*/ controller.index);
quoteRoutes.get('/add', (req, res) => {
  res.render('quotes/quotes-add', {
    documentTitle: 'Ada\'s Quotes!!',
  });
});
quoteRoutes.get('/edit/:id', controller.edit);
quoteRoutes.get('/:id', controller.show);
quoteRoutes.post('/', controller.create);
quoteRoutes.put('/:id', controller.update);
quoteRoutes.delete('/:id', controller.destroy);

module.exports = quoteRoutes;