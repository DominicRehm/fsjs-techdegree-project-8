var express = require('express');
var router = express.Router();
const app = express();
// SQL Connection
const Book = require('../models').Book;

function asyncHandler(cb) {
  return async(req, res, next) => {
    try {
      await cb(req, res, next);
    } catch(error) {
      next(error);
    }
  }
}

// GET - Root
router.get('/', asyncHandler(async (req, res) => {
  res.redirect('/books')
}));

// GET - Show all Books
router.get('/books', asyncHandler(async (req, res) => {
  const books = await Book.findAll();
  res.render('./books/index', { books, title: 'Book List' })
}));

// GET - Show new Book page
router.get('/books/new', (req, res) => {
  res.locals.book = {};
  res.render('./books/new-book', {title: 'New Book'});
});

// POST - Create new book
router.post('/books/new', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect('/');
  } catch(error) {
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      res.render('./books/new-book', { book, errors: error.errors, title: 'New Book' });
    } else {
      throw error;
    }
  }
}));

// GET - Update book
router.get('/books/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.locals.book = book;
    res.render('./books/update-book', {title: 'Update Book'});
  } else {
      res.render('./books/book-not-found');
  }
}));

// POST - Update book
router.post('/books/:id', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if(book) {
      await book.update(req.body);
      res.redirect("/"); 
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id; // make sure correct article gets updated
      res.render("./books/update-book", { book, errors: error.errors, title: "Update Book" })
    } else {
      throw error;
    }
  }
}));

// POST - Delete book
router.post('/books/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    await book.destroy();
    res.redirect('/');
  } else {
    res.sendStatus(404);
  }
}));

module.exports = router;