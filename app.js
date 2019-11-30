const express  = require('express');
const exphbs   = require('express-handlebars');
const path     = require('path');
const mongoose = require('mongoose');

// configure dotenv
require('dotenv').config();

// initialize app
const app = express();

// bodyparser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// connect to mongo database
mongoose
    .connect(process.env.DB_MONGOURI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(() => console.log('Database Connected'))
    .catch(err => console.log('Error in DB connection : ' + err));

// handlebars setup
var hbs = exphbs.create({
    extname:       'hbs',
    defaultLayout: 'main',
    partialsDir:   'views/partials/'
});  

// handlebars middleware
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use('/employee', require('./controllers/employeeController'));

const PORT = process.env.PORT || 5000;

// start server
app.listen(PORT, console.log(`Server started on port ${PORT}`));