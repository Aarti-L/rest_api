const express = require('express');
const mongoose = require('mongoose');   
const Product = require('../models/product');
const { checkAdmin } = require('../middlewares/checkAuth');

const router = express.Router();

const getProducts = (req, res, next) => {
  Product
    .find()
    .select('_id name description price stock')
    .exec()
    .then(d => {
      (d.length <= 0) ? handleError({code:'NDF'}) : res.status(200).send({message:'Get All Products', products: d})
    })
    .catch(e => {
      handleError({code:'SWW'})
    })
  
  const handleError = (e) => {
    let errors = [
      { code: 'NDF', message: 'No Data Found' },
      { code: 'SWW', message: 'Something went wrong' },
    ];

    errors.filter(error => error.code === e.code).map(err => {
      res.status(500).send({
        error: {
          code: err.code,
          message: err.message
        }
      })
    })
  }  
}

const addProduct = (req, res, next) => {
  const state = { reqObj: req, reqBody: req.body };

  const validateInput = (state) => {
    (!state.reqBody.name || !state.reqBody.description || !state.reqBody.price || !state.reqBody.stock) ? handleError({ code: 'MII' }) : checkValidations(state);
  }

  const checkValidations = (state) => {
    (state.reqBody.price <= 0 || state.reqBody.stock <= 0) ? handleError({ code: 'INV' }) : checkUniqueProductName(state);
  }

  const checkUniqueProductName = (state) => {
    Product
      .findOne({ name: state.reqBody.name })
      .exec()
      .then(d => {
        (!d) ? saveProduct(state) : handleError({code:'DUP'})
       })
      .catch(e => {
        handleError({ code: 'SWW' });
      })
  }

  const saveProduct = (state) => {
    const product = new Product({
      _id: new mongoose.Types.ObjectId(),
      name: state.reqBody.name,
      description: state.reqBody.description,
      price: state.reqBody.price,
      stock: state.reqBody.stock
    })

    product
      .save()
      .then(d => {
        res.status(201).send({
          message: 'Product Added Successfully',
          product: {
            name: d.name,
            description: d.description,
            price: d.price,
            stock: d.stock
          }
        })
      })
      .catch(e => {
        handleError({ code: 'SWW' })
      })
  }

  const handleError = (e) => {
    let errors = [
      { code: 'MII', message: 'Missing Important Information' },
      { code: 'INV', message: 'Invalid data for price/stock' },
      { code: 'DUP', message: 'Product Already Exist' },
      { code: 'SWW', message: 'Something went wrong' },
    ];

    errors.filter(error => error.code === e.code).map(err => {
      res.status(500).send({
        error: {
          code: err.code,
          message: err.message
        }
      })
    })
  } 

  validateInput(state);
}

const getProductDetails = (req,res,next) => {
  const state = { reqObj: req, reqBody: req.body, reqParams:req.params };

  const validateInput = (state) => {
    (!state.reqParams.productId) ? handleError({ code: 'MII' }) : fetchProductDetails(state);
  }

  const fetchProductDetails = (state) => {
    Product
      .findById(state.reqParams.productId)
      .select('_id name description price stock')
      .exec()
      .then(d => {
        (!d) ? handleError({code:'INID'}) : res.status(200).send({ message:'Get Product Detail', product: d})
       })
      .catch(e => handleError({code:'SWW'}))
  }

  const handleError = (e) => {
    let errors = [
      { code: 'MII', message: 'Missing Important Information' },
      { code: 'INID', message: 'Invalid Product ID' },
      { code: 'SWW', message: 'Something went wrong' },
    ];

    errors.filter(error => error.code === e.code).map(err => {
      res.status(500).send({
        error: {
          code: err.code,
          message: err.message
        }
      })
    })
  } 

  validateInput(state);
}

const updateProduct = (req,res,next) => {
  const state = { reqObj: req, reqBody: req.body, reqParams: req.params };

  const validateInput = (state) => {
    (!state.reqParams.productId || !state.reqBody.name || !state.reqBody.description || !state.reqBody.price || !state.reqBody.stock) ? handleError({ code: 'SWW' }) : checkValidations(state);
  }

  const checkValidations = (state) => {
   (state.reqBody.price <= 0 || state.reqBody.stock <= 0) ? handleError({ code: 'INV' }) : checkProductId(state)
  } 

  const checkProductId = (state) => {
    Product
      .findById(state.reqParams.productId)
      .exec()
      .then(d => {
        (!d) ? handleError({ code: 'INID' }) : checkUniqueProductName(state);
       })
      .catch(e => handleError({ code:'SWW'}))
  }

  const checkUniqueProductName = (state) => {
    Product
      .findOne({ name: state.reqBody.name })
      .exec()
      .then(d => {
        (!d) ? updateProductDetails(state) : handleError({code:'DUP'})
       })
      .catch(e => {
        handleError({ code: 'SWW' });
      })
  }
  
  const updateProductDetails = (state) => {
    Product
      .updateOne({ _id: state.reqParams.productId }, {
        name: state.reqBody.name,
        description: state.reqBody.description,
        price: state.reqBody.price,
        stock: state.reqBody.stock
      })
      .exec()
      .then(d => {
        res.status(200).send({
          message: 'Update product details'
        })
      })
      .catch(e => handleError({code:'SWW'}))
  }

  const handleError = (e) => {
    let errors = [
      { code: 'MII', message: 'Missing Important Information' },
      { code: 'INID', message: 'Invalid Product ID' },
      { code: 'INV', message: 'Invalid data for price/stock' },
      { code: 'DUP', message: 'Product Already Exist' },
      { code: 'SWW', message: 'Something went wrong' },
    ];

    errors.filter(error => error.code === e.code).map(err => {
      res.status(500).send({
        error: {
          code: err.code,
          message: err.message
        }
      })
    })
  } 

  validateInput(state);
}

const deleteProduct = (req, res, next) => {
  const state = { reqObj: req, reqBody: req.body, reqParams: req.params };

  const validateInput = (state) => {
    (!state.reqParams.productId) ? handleError({ code: 'MII' }) : checkProductId(state); 
  }

  const checkProductId = (state) => {
    Product
      .findById(state.reqParams.productId)
      .exec()
      .then(d => { 
        (!d) ? handleError({code:'INID'}) : deleteProductDetails(state)
      })
      .catch(e => handleError({ code: 'SWW' }))
  }

  const deleteProductDetails = (state) => {
    Product
      .deleteOne({ _id: state.reqParams.productId })
      .exec()
      .then(d => {
        res.status(200).send({
          message: 'Delete product'
        })
      })
      .catch(e => handleError({code:'SWW'}))
  }

  const handleError = (e) => {
    let errors = [
      { code: 'MII', message: 'Missing Important Information' },
      { code: 'INID', message: 'Invalid Product ID' },
      { code: 'SWW', message: 'Something went wrong' },
    ];

    errors.filter(error => error.code === e.code).map(err => {
      res.status(500).send({
        error: {
          code: err.code,
          message: err.message
        }
      })
    })
  } 

  validateInput(state);
}

router.get('/', getProducts);
router.post('/', checkAdmin, addProduct);
router.get('/:productId', getProductDetails);
router.patch('/:productId', checkAdmin, updateProduct);
router.delete('/:productId', checkAdmin, deleteProduct);

module.exports = router;
