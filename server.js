'use strict';

console.log('hello');
const april_fool = 'April fool haa haa haaaa...';

// Dependencies
const express = require('express');
const superagent = require('superagent');
require('dotenv').config();

// Setup
let app = express();
const PORT = process.env.PORT;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Templating
app.set('view engine', 'ejs');

// Routes
app.get('/', handleHome);
app.get('/hello', handleWelcome);
app.get('/searches/new', handleForm);
app.post('/searches', handleSearch);

// Route not found
app.get('*', handleError);

// Make sure that the port listens
app.listen(PORT, ()=>{
    console.log(`the app is listening to => ${PORT}`);
});

// constructor
function Book(info) {
    const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
    this.title = info.title || 'No title available';
    this.author = info.author;
    this.description = info.description;
    this.img = placeholderImage;
    console.log(info);
}

function handleWelcome (req, res) {
    try {
        res.status(200).send(`Oops, something didn't go wrong => ${april_fool}`);
    } catch(error) {
        res.status(500).send(`Oops, something went wrong => ${error}`);
    }
}
function handleHome(req, res) {
    res.render('pages/index');
}
function handleForm(req, res) {
    res.render('searches/new');
}
function handleSearch(req, res) {
    let url = 'https://www.googleapis.com/books/v1/volumes?q=';
    if (req.body.search[1] === 'title') { url += `+intitle:${req.body.search[0]}`;}
    if (req.body.search[1] === 'author') { url += `+inauthor:${req.body.search[0]}`;}
    superagent.get(url)
        .then(elemnt => elemnt.body.items.map(book => new Book(book.volumeInfo)))
        .then(results => res.render('pages/show', { searchResults: results }))
        .catch(error => {
            handleError(req, res, error);
        });
}
function handleError(req, res, error){
    res.render('pages/error',{status:404, message:`Sorry some thing went wrong => ${error}`});
}
