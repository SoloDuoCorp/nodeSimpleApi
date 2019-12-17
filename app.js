const express = require('express');
const bodyParser = require('body-parser');



//var limiter = require('express-limiter')
const app = express();

//BodyParser
app.use(bodyParser.urlencoded({ extended: true }));

//Import Routes
const apiRoute = require('./routes/api')
app.use('/api', apiRoute)

//Routes
app.get('/', (req, res) => {
    res.send('Home !');
})

//Port
app.listen(5000);






//proccess.env.secretKey