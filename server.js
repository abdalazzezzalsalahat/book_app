'use strict';
//#region variavles
// Dependencies
const express = require('express');
const superagent = require('superagent');
require('dotenv').config();
const pg = require('pg');

// Setup
let app = express();
const PORT = process.env.PORT || 5555;
const DATABASE_URL = process.env.DATABASE_URL;
const user = new pg.Client(DATABASE_URL);

//#endregion

//#region mids and routs
// Middleware
user.connect();
user.on('error', error => console.error(error));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

// Templating
app.set('view engine', 'ejs');

// Routes
app.get('/', handleHome);
app.get('/searches/new', handleForm);
app.post('/searches', handleSearch);
app.post('/books', handleSavingBooks);
app.get('/books/:id', handleDetails);
// Route not found
app.get('*', handleError);
//#endregion
// Make sure that the port listens
app.listen(PORT, ()=>{
    console.log(`the app is listening to => ${PORT}`);
});

// constructor
function Book(data) {
    const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
    this.title = data.title || 'title is not available';
    this.author = data.author || 'author is not available';
    this.description = data.description || 'description is not available';
    this.img = (data.imageLinks && data.imageLinks.thumbnail) ? data.imageLinks.thumbnail : placeholderImage;
    this.ISBN = (data.indutryIdentifiers) ? data.indutryIdentifiers[0].identifier : 'ISBN is not available';
}

// functions
function handleHome(req, res) {
    let sql = 'SELECT * FROM books;';
    return user.query(sql)
        .then(results => res.render('pages/index', {books: results.rows}))
        .catch((error) => handleError(error, res));
}
function handleForm(req, res) {
    res.render('pages/searches/new');
}
function handleSearch(req, res) {
    let url = 'https://www.googleapis.com/books/v1/volumes?q=';
    if (req.body.search[1] === 'title') { url += `+intitle:${req.body.search[0]}`;}
    if (req.body.search[1] === 'author') { url += `+inauthor:${req.body.search[0]}`;}
    superagent.get(url)
        .then(elemnt => elemnt.body.items.map(book => new Book(book.volumeInfo)))
        .then(results => res.render('pages/books/show', {book: results}))
        .catch(error => handleError(error, res));
}
function handleSavingBooks(req, res) {
    let { title, author, ISBN, image_url, description} = req.body;
    let sql = `INSERT INTO books (title, author, isbn, image_url, description)
                VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
    let values = [title, author, ISBN, image_url, description];
    return user.query(sql, values)
        .then(results => res.redirect(`/books/${results.rows[0].id}`))
        .catch((error) => handleError(error, res));
}
function handleDetails(req, res) {
    let sql = `select * from books where id = $1;`;
    let values = [req.params.id];
    user.query(sql, values)
        .then(results => {
            console.log('single', results.rows[0]);
            res.render('pages/books/details', {book: results.rows[0]}); })
        .catch((err) => handleError(err, res));
}
function handleError(error, res){
    res.render('pages/error',{status:404, message:`Sorry something went wrong => ${error}`});
}
