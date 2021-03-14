const http = require('http')
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');
const socketHandler = require('./controller/socketHandler');

const app = express();

// use json middleware during request processing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// use handlebars as view template engine
app.engine('handlebars', exphbs({ defaultLayout: 'mainLayout' }));
app.set('view engine', 'handlebars');

// expose static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));


// URL routing for page and api
app.use('/', require('./routes/pageRouter'));
app.use('/api/game', require('./routes/api/gameAPI'));


const PORT = process.env.PORT || 1235;

//connect to mongodb
const dbURI = process.env.MONGO_CONNECTION_URL || null;
if(dbURI){
    mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => {
        console.log("Connected to DB")
        const server = app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });

        // Handle socket connection for each client
        socketHandler(server);
       
    })
    .catch((error) => { console.log(error) });
}else{
    const server = app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
    });
    // Handle socket connection for each client
    socketHandler(server);
}


