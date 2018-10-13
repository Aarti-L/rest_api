const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Product = require('../models/product');
const Order = require('../models/order');

const getOrders = (req,res,next) => {
  const state = { reqObj: req, reqBody: req.body, user:req.user };

  const validateInput = (state) => {
    (!state.user || !state.user._id) ? handleError({ code: 'MII' }) : fetchOrders(state);
  }

  const fetchOrders = (state) => {
    Order.find({ user: state.user._id })
      .select("_id product quantity total")
      .populate("product", "name")
      .exec()
      .then(d => {
        (d.length <= 0) ? handleError({ code: "NDF" }) :
          res.status(200).send({
            message: "Get all orders",
            orders: d.map(order => {
              return {
                _id: order._id,
                quantity: order.quantity,
                productName: order.product.name,
                productId: order.product._id,
                total: order.total
              }
            })
          });
      })
      .catch(e => handleError({ code: "SWW" }));
  }

  const handleError = (e) => {
    let errors = [
      { code: 'MII', message: 'Missing Important Information' },
      { code: 'NDF', message: 'No data found for provided Id' },
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

const saveOrder = (req, res, next) => {
  const state = { reqObj: req, reqBody: req.body, user: req.user };

  const validateInput = (state) => {
    (!state.reqBody.productId || !state.reqBody.quantity) ? handleError({ code: 'MII' }) :  checkValidations(state);
  }

  const checkValidations = (state) => {
    (state.reqBody.quantity <= 0) ? handleError({ code: 'INV' }) : checkUser(state);
  }

  const checkUser = (state) => {
    (!state.user) ? handleError({ code: 'UNF' }) : checkProduct(state);  
  }

  const checkProduct = (state) => {
    Product
      .findById(state.reqBody.productId)
      .select('_id name price')
      .exec()
      .then(d => { 
        (!d) ? handleError({ code: 'INID' }) : saveOrderDetails(Object.assign({},state,{product: d}));
      })
      .catch(e => handleError({code:'SWW'}))
  }

  const saveOrderDetails = (state) => {
    const order = new Order({
      _id: new mongoose.Types.ObjectId(),
      user: state.user._id,
      product: state.reqBody.productId,
      quantity: state.reqBody.quantity,
      total: state.product.price * state.reqBody.quantity
    });

    order
      .save()
      .then(d => {
        res.status(201).send({
          message: 'Order placed successfully',
          orderDetails: {
            orderId: d._id,
            product: state.product.name,
            quantity: d.quantity,
            total: d.total
          }
        })
      })
      .catch(e=> handleError({code:'SWW'}))
  }

  const handleError = (e) => {
    let errors = [
      { code: 'MII', message: 'Missing Important Information' },
      { code: 'INID', message: 'Invalid Product ID' },
      { code: 'INV', message: 'Quantity should be greater than 0' },
      { code:'UNF', message:'User not found'},
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

const getOrderDetails = (req,res,next) => {
  const state = { reqObj: req, reqBody: req.body, reqParams: req.params };

  const validateInput = (state) => {
    (!state.reqParams.orderId) ? handleError({ code: 'MII' }) : fetchOrder(state);
  }

  const fetchOrder = (state) => {
    Order
      .findById(state.reqParams.orderId)
      .select('_id product quantity total')
      .populate('product', 'name')
      .exec()
      .then(d => {
        (!d) ? handleError({ code: 'NDF' }) :
          res.status(200).send({
            message: 'Get order details',
            order: {
              _id: d._id,
              quantity: d.quantity,
              productName: d.product.name,
              productId: d.product._id,
              total: d.total
             }
          })
      })
      .catch(e => handleError({ code: 'SWW' }))
  }

  validateInput(state);
}

const deleteOrder = (req, res, next) => {
  const state = { reqObj: req, reqBody: req.body, reqParams: req.params };

  validateInput(state);
} 

router.get('/', getOrders);
router.post('/', saveOrder);
router.get('/:orderId', getOrderDetails);
router.delete('/:orderId', deleteOrder);

module.exports = router;

