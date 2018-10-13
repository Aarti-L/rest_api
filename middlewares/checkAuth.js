const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/user');
const config = require('../config');

const checkToken = (req,res,next) => {
 const state = { reqObj: req, headers: req.headers };
  
  const validateHeader = (state) => {
    (!state.headers || !state.headers.authorization) ? handleError({ code: 'MHI' }) : decodeToken(state);
  }

  const decodeToken = (state) => {
    const token = state.headers.authorization.split(" ")[1];
    jwt.verify(token, config.env.JWT_KEY, (err, decodedToken) => {
      (!decodedToken) ? handleError({ code: 'INVT' }) : checkUser(Object.assign({}, state, {decoded:decodedToken}))
    })
  }

  const checkUser = (state) => {
    User
      .findOne({ email: state.decoded.email })
      .select('_id username email usertype')
      .exec()
      .then(d => {
        (!d) ? handleError({ code: 'AF' }) : sendUser(Object.assign({}, state, { user: d }));
      })
      .catch(e => {
        handleError({code:'SWW'})
      })
  }

  const sendUser = (state) => {
    req.user = state.user;
    next();
  }

  const handleError = (e) => {
    let errors = [
      { code: 'INVT', message: 'Invalid Token' },
      { code: 'AF', message: 'Authentication Failed' },
      { code: 'MHI', message: 'Missing Token' },
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
  
  validateHeader(state);
}

const checkUser = (req,res,next) => {
 const state = { reqObj: req, headers: req.headers };
  
  const validateHeader = (state) => {
    (!state.headers || !state.headers.authorization) ? handleError({ code: 'MHI' }) : decodeToken(state);
  }

  const decodeToken = (state) => {
    const token = state.headers.authorization.split(" ")[1];
    jwt.verify(token, config.env.JWT_KEY, (err, decodedToken) => {
      (!decodedToken) ? handleError({ code: 'INVT' }) : checkUser(Object.assign({}, state, {decoded:decodedToken}))
    })
  }

  const checkUser = (state) => {
    User
      .findOne({ email: state.decoded.email })
      .select('_id username email usertype')
      .exec()
      .then(d => {
        (!d) ? handleError({ code: 'UNF' }) : checkUserType(Object.assign({}, state, { user: d }));
      })
      .catch(e => {
        handleError({code:'SWW'})
      })
  }

  const checkUserType = (state) => {
    if (state.user.usertype === 'user') {
      req.user = state.user;
      next();
    } else {
      handleError({ code: 'AF' });
    }
  }

  const handleError = (e) => {
    let errors = [
      { code: 'INVT', message: 'Invalid Token' },
      { code: 'AF', message: 'Authentication Failed' },
      { code: 'UNF', message: 'User Not Found' },
      { code: 'MHI', message: 'Missing Header Information' },
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
  
  validateHeader(state);
}

const checkAdmin = (req,res,next) => {
  const state = { reqObj: req, headers: req.headers };
  
  const validateHeader = (state) => {
    (!state.headers || !state.headers.authorization) ? handleError({ code: 'MHI' }) : decodeToken(state);
  }

  const decodeToken = (state) => {
    const token = state.headers.authorization.split(" ")[1];
    jwt.verify(token, config.env.JWT_KEY, (err, decodedToken) => {
      (!decodedToken) ? handleError({ code: 'INVT' }) : checkUser(Object.assign({}, state, {decoded:decodedToken}))
    })
  }

  const checkUser = (state) => {
    User
      .findOne({ email: state.decoded.email })
      .select('_id username email usertype')
      .exec()
      .then(d => {
        (!d) ? handleError({ code: 'UNF' }) : checkUserType(Object.assign({}, state, { user: d }));
      })
      .catch(e => {
        handleError({code:'SWW'})
      })
  }

  const checkUserType = (state) => {
    //@TODO: change usertype to admin
    if (state.user.usertype === 'user') {
      req.user = state.user;
      next();
    } else {
      handleError({ code: 'AF' });
    }
  }

  const handleError = (e) => {
    let errors = [
      { code: 'INVT', message: 'Invalid Token' },
      { code: 'AF', message: 'Authentication Failed' },
      { code: 'UNF', message: 'User Not Found' },
      { code: 'MHI', message: 'Missing Header Information' },
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
  
  validateHeader(state);
}

module.exports = { checkToken, checkUser, checkAdmin };
