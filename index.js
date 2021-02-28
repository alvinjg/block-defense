const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');

const app = express();

// use handlebars as view template engine
app.engine('handlebars', exphbs({defaultLayout: 'mainLayout'}));
app.set('view engine', 'handlebars');

// expose static files
app.use(express.static(path.join(__dirname,'public')));
app.use('/js', express.static(path.join(__dirname,'node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname,'node_modules/jquery/dist')));
app.use('/css', express.static(path.join(__dirname,'node_modules/bootstrap/dist/css')));

// URL routing for page and api
app.use('/', require('./routes/pageRouter'));
app.use('/api/game', require('./routes/api/game'));

const PORT = process.env.PORT || 1235;
app.listen(PORT, ()=>{
    console.log(`Server started on port ${PORT}`);
});

