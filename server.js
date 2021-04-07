'use strict';

//#region variavles

// Dependencies
const express = require('express');
require('dotenv').config();
const pg = require('pg');
const cors = require('cors');
const superagent = require('superagent');
const override = require('method-override');

// Setup
let app = express();
const PORT = process.env.PORT || 5555;
const DATABASE_URL = process.env.DATABASE_URL;
const user = new pg.Client(DATABASE_URL);

//#endregion

//#region Middlewares and routes

// Middleware
user.connect();
user.on('error', error => console.error(error));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.use(override('_method'));
app.use(cors());

// Templating
app.set('view engine', 'ejs');

// Routes
app.get('/', handleHome);

app.get('/search', handleSearch);

app.post('/show', handleSearchResults);

app.post('/books', handleSavingBooks);

app.get('/books/:id', handleDetails);

app.post('/books/:id', handleUpdate);

app.delete('/books/:id', handleDelete);

app.put('/books/:id', handleUpdateData);

// Route not found
app.get('*', handleError);


// Make sure that the port listens
app.listen(PORT, ()=>{
    console.log(`the app is listening to => ${PORT}`);
});
//#endregion

//#region constructor

// constructor
function Book(data) {
    const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
    this.title = (data.title) ? data.title : 'title is not available';
    this.author = (data.author) ? data.author : 'author is not available';
    this.isbn = (data.indutryIdentifiers) ? data.indutryIdentifiers[0].identifier : 'ISBN is not available';
    this.img = (data.imageLinks && data.imageLinks.thumbnail) ? data.imageLinks.thumbnail : placeholderImage;
    this.description = (data.description) ? data.description : 'description is not available';
}

//#endregion

//#region functions

// functions
function handleHome(req, res) {
    let sql = 'SELECT * FROM books;';
    return user.query(sql)
        .then(results => res.render('pages/index', {books: results.rows}))
        .catch((error) => handleError(error, res));
}

function handleSearch(req, res) {
    res.render('pages/searches/new');
}

function handleSearchResults(req, res) {
    let url = 'https://www.googleapis.com/books/v1/volumes?q=';
    if (req.body.search[1] === 'title') { url += `+intitle:${req.body.search[0]}`;}
    if (req.body.search[1] === 'author') { url += `+inauthor:${req.body.search[0]}`;}
    superagent.get(url)
        .then(elemnt => elemnt.body.items.map(book => new Book(book.volumeInfo)))
        .then(results => res.render('pages/searches/show', {books: results}))
        .catch(error => handleError(error, res));
}

function handleSavingBooks(req, res) {
    let { title, author, isbn, image_url, description} = req.body;
    let sql = `INSERT INTO books (title, author, isbn, image_url, description)
                VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
    let values = [title, author, isbn, image_url, description];
    return user.query(sql, values)
        .then(results => res.redirect(`/books/${results.rows[0].id}`, {books: results.rows}))
        .catch((error) => handleError(error, res));
}

function handleDetails(req, res) {
    let sql = `SELECT * FROM books WHERE id = $1;`;
    let values = [req.params.id];
    user.query(sql, values)
        .then(results => res.render('pages/books/details', {books: results.rows[0]}))
        .catch((err) => handleError(err, res));
}

function handleDelete(req, res){
    let id = req.params.id;
    let sql = `DELETE FROM books WHERE id = ${id}`;
    user.query(sql)
        .then(() => res.redirect('/'))
        .catch(error => handleError(error, res));
}

function handleUpdate(req, res){
    let sql = `SELECT * FROM books WHERE id = $1`;
    let values = [req.params.id];
    user.query(sql, values)
        .then(result => res.render('pages/books/edit', {books: result.rows}))
        .catch(error => handleError(error, res));
}

function handleUpdateData(req,res){
    let { title, author, ISBN, description} = req.body;
    let sql = `UPDATE books SET title=$1, author=$2, isbn=$3, description=$4  WHERE id =$5`;
    let value = [title, author, ISBN, description, req.params.id];
    user.query(sql,value)
        .then(result => res.redirect(`/books/${result.params.id}`, {books: result.rows[0]}))
        .catch(error => handleError(error, res));
}

function handleError(error, res){
    res.render('pages/error',{status:404, message:`Sorry something went wrong => ${error}`});
}

//#endregion
