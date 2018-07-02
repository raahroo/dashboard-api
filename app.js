const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const dashboardRoutes = require('./api/routes/dashboards');

mongoose.connect('mongodb+srv://raissahohenester:'+
process.env.MONGO_ATLAS_PW +'@dash-api-8a4oy.mongodb.net/test?retryWrites=true');

mongoose.Promise = global.Promise;

app.use(morgan("dev"));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use((req, res, next) => { //Add some headers
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers", 
        "Origin, X-Requested-With, Content-Type, Accept, Authorization" 
    );

    if (req.method === 'OPTIONS'){ // OPTIONS - Default request from Browser
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

// Routes which should handle requests (middlewares)
app.use('/products', productRoutes); //filter
app.use('/orders', orderRoutes); 
app.use('/dashboards', dashboardRoutes); 



//error handling

app.use((req, res, next) => {  // you get here when no route was able to handle this request (upper routes)
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error:{
            message: error.message
        }
    });
});

module.exports = app;