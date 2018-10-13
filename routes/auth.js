const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/user');

const router = express.Router();

const login = (req,res,next) => {
  const state = { reqObj: req, reqBody: req.body };

  const validateInput = (state) => {
    (!state.reqBody.username || !state.reqBody.email || !state.reqBody.password) ? handleError({ code: 'MII' }) : fetchUser(state);
  }

  const fetchUser = (state) => {
    User
      .findOne({ email: state.reqBody.email })
      .select("_id username email password usertype")
      .exec()
      .then(d => {
        (!d) ? handleError({ code: 'UNF' }) : checkAuthentication(Object.assign({}, state, {user:d}))
      })
      .catch(e =>handleError({ code: 'SWW' }))
  }

  const checkAuthentication = (state) => {
    bcrypt.compare(state.reqBody.password, state.user.password, (err, result) => {
      (result) ? createJWT(state)  : handleError({code: 'AF'});
    });
  }

  const createJWT = (state) => {
    const token = jwt.sign({
      email: state.user.email,
      username: state.user.username,
      usertype: state.user.usertype
    }, config.env.JWT_KEY);
    
    res.status(200).send({
      user: state.user,
      token: token
    });
  }

  const handleError = (e) => {
    let errors = [
      { code: 'UNF', message: 'User Not Found' },
      { code: 'AF', message: 'Authentication Failed'},
      { code: 'MII', message: 'Missing Important Information' },
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

const signup = (req, res, next) => {
  const state = {reqObj: req,reqBody: req.body};

  const validateInput = (state) => {
    (!state.reqBody.username || !state.reqBody.email || !state.reqBody.password) ? handleError({code: 'MII'}): checkEmail(state);
  }

  const checkEmail = (state) => {
    User
      .findOne({email: state.reqBody.email.toLowerCase()})
      .then(d => {
        (!d) ? createHash(state): handleError({code: 'DUE'})
      })
      .catch(e => handleError({ code: 'SWW' }))
  }

  const createHash = (state) => {
    const salt = bcrypt.genSaltSync(10);
    bcrypt.hash(state.reqBody.password, salt, (err, hash) => {
      (err) ? handleError({code: 'SWW'}): saveUser(Object.assign({}, state, { hashPassword: hash}));
    });
  }

  const saveUser = (state) => {
    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      username: state.reqBody.username,
      email: state.reqBody.email,
      password: state.hashPassword
    });

    user
      .save()
      .then(d => {
        res.status(201).send({
          message: 'User created',
          user: {
            username: d.username,
            email: d.email,
            usertype: d.usertype
          }
        })
      })
      .catch(e => handleError({code: 'SWW'}))
  }

  const handleError = (e) => {
    let errors = [
      {code: 'DUE',message: 'Email already exist'},
      {code: 'MII',message: 'Missing Important Information'},
      {code: 'SWW',message: 'Something went wrong'}
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

router.post('/login', login);
router.post('/signup', signup);

module.exports = router;
