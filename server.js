require('dotenv').config();
const express = require('express');
const superAgent = require('superagent');

const PORT = process.env.PORT || 3000;
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public/styles'));
app.listen(PORT, () => {
        console.log(`Listening to port No. ${PORT}`);
})

//------------------------------

//handlers 
// app.post('/show', showHandler);
// app.get('/error', errorHandler);
app.get('/index', indexHandler);

function indexHandler(req, res) {
        res.render('pages/index');
};





