const express = require('express');
const router = express.Router(); // Handle different routes, different endpoints
const mongoose = require('mongoose');
const multer = require('multer');

const storage = multer.diskStorage({
    destinaton: function(req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function(req, file, cb){
       cb(null, new Date().toISOString() + file.originalname)   
    }
});


const fileFilter = (req, file, cb) => {
    //Reject a file
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true);
    } else {
        cb(null, false);
    }
}
const upload = multer({
    storage:  storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

const Product = require('../models/prod');

//Register different routes
router.get('/', (req, res, next) => { // Method handle incoming requests && second argument is a handler
   /*  res.status(200).json({
        message: 'Handling GET requests to /products'
    }) */
    Product.find()
        .select('name price _id productImage')
        .exec()
        .then( docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        product: doc.productImage,
                        _id: doc._id,
                        url: {
                            type: 'GET',
                            url: 'http://localhost:3000/products/' + doc._id //you can hard cord your domain
                        }
                    }
                })
            }
            //console.log(docs);
            //if(docs.length >= 0){
               res.status(200).json(response);
           /*  } else {
                res.status(404).json({
                    message: 'No entries found'
                });
            } */
        })
        .catch( err => {        
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
});

router.post('/', upload.single('productImage'), (req, res, next) => { // Method handle incoming requests && second argument is a handler
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });

    product
        .save() //save method provided by mongoose
        .then(result => { //Promise
            console.log(result);
            res.status(201).json({
              message: "Created product successfully",
              createdProduct: {
                name: result.name,
                price: result.price,
                _id: result._id,
                request:{
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + result._id
                }
              }
            }); 
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.get("/:productId", (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .select('name price _id productImage')
        .exec()
        .then(doc => {
            console.log("From database", doc);
            if (doc) {
            res.status(200).json({
                product:doc,
                request:{
                    type: 'GET',
                    description: 'Get all products',
                    url: 'http://localhost:3000/products/' 
                }
            });
            } else {
            res
                .status(404)
                .json({ message: "No valid entry found for provided ID" });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });

       /*  if( id === 'special') {
        res.status(200).json({
            message: 'You discovered the special ID',
            id: id
        });
    } else {
        res.status(200).json({
            message: 'You passed an ID'
        });
    } */
});

router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for ( const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Product.update({ _id: id }, {
        $set: updateOps
    })
    .exec()
    .then( result => {
        //console.log(result);
        res.status(200).json({
            message: 'Product updated',
            url: 'http://localhost:3000/products/' + id
        })
    })
    .catch( err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
   /*  res.status(200).json({
        message: 'Updated product!'
    }); */
});


router.delete('/:productId', (req, res, next) => { //7
    const id = req.params.productId;
    Product.findOneAndRemove({ _id: id })//updated function from .remove()
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Product Removed Successfuly",
                request:{
                    type: 'POST',
                    url:'http://localhost:3000/products',
                    body:{
                        name: 'String', price: 'Number'
                    }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
    /*  res.status(200).json({
        message: 'Deleted product!'
    }); */
});


module.exports = router;    