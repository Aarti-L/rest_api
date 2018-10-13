const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { checkAdmin } = require('../middlewares/checkAuth');

const router = express.Router();

const getUsers = (req, res, next) => {
  const state = { reqObj: req, reqBody: req.body };
  
  User
    .find()
    .select("_id username usertype email")
    .then(d => {
      res.status(200).send({
        message: 'All users details',
        users: d
      })
    })
    .catch(e => {
      handleError({code: 'SWW'})
    })
  
  const handleError = (e) => {
    let errors = [
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

const getUserDetails = (req, res, next) => {
  const state = { reqObj: req, reqBody: req.body, reqParams: req.params };

  const validateInput = (state) => {
    (!state.reqParams.userId) ? handleError({ code: 'MII' }) : fetchUserDetails(state);
  }
  
  const fetchUserDetails = (state) => {
    User
      .findById(state.reqParams.userId)
      .select("_id username usertype email")
      .then(d => {
         (!d) ? handleError({ code: 'INID' }) : res.status(200).send({ message: 'User Details', user: d }) 
      })
      .catch(e => {
        handleError({ code: 'SWW' })
      })
  }
  
  const handleError = (e) => {
    let errors = [
      { code: 'INID', message: 'No data found for provided ID' },
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

  validateInput(state)
}

// const addUser = (req, res, next) => {
//   const state = { reqObj: req, reqBody: req.body };

//   const validateInput = (state) => {
//     (!state.reqBody.username || !state.reqBody.email || !state.reqBody.password) ? handleError({ code: 'MII' }) : checkEmail(state);
//   }

//   const checkEmail = (state) => {
//     User
//       .findOne({ email: state.reqBody.email.toLowerCase() })
//       .then(d => {
//         (!d) ? createHash(state) : handleError({code: 'DUE'})
//       })
//       .catch(e => {
//         handleError({code: 'SWW'})
//       })
//   }

//   const createHash = (state) => {
//     const salt = bcrypt.genSaltSync(10);
//     bcrypt.hash(state.reqBody.password, salt, (err, hash) => {
//       (err) ? handleError({ code: 'SWW' }) : saveUser(Object.assign({},state,{ hashPassword:hash }));
//     });
//   }

//   const saveUser = (state) => {
//     const user = new User({
//       _id: new mongoose.Types.ObjectId(),
//       username: state.reqBody.username,
//       email: state.reqBody.email,
//       password: state.hashPassword
//     });

//     user
//       .save()
//       .then(d => {
//         res.status(201).send({
//           message: 'User created',
//           user: {
//             username: d.username,
//             email: d.email,
//             usertype: d.usertype
//           }
//         })
//       })
//       .catch(e => {
//         handleError({code: 'SWW'})
//       })
//   }

//   const handleError = (e) => {
//     let errors = [
//       { code: 'DUE', message: 'Email already exist' },
//       { code: 'MII', message: 'Missing Important Information' },
//       { code: 'SWW', message: 'Something went wrong' },
//     ];

//     errors.filter(error => error.code === e.code).map(err => {
//       res.status(500).send({
//         error: {
//           code: err.code,
//           message: err.message
//         }
//       })
//     })
//   }  
  
//   validateInput(state);
// }

const updateUser = (req, res, next) => {
  const state = { reqObj: req, reqBody: req.body, reqParams: req.params };

  const validateInput = (state) => {
    (!state.reqParams.userId) ? handleError({ code: 'MII' }) : fetchUser(state);
  }

  const fetchUser = (state) => {
    User
      .findOne({ _id: state.reqParams.userId })
      .then(d => {
        (!d) ? handleError({ code: 'INID' }) : updateUserDetails(state);
      })
      .catch(e => {
        handleError({code: 'SWW'})
      })
  }

  const updateUserDetails = (state) => {
    User
      .updateOne({ _id: state.reqParams.userId }, { username: state.reqBody.username })
      .then(d => {
        res.status(200).send({
          message:'Updated username'
        })
      })
      .catch(e => {
        handleError({code: 'SWW'})
      })
  }

  const handleError = (e) => {
    let errors = [
      { code: 'INID', message: 'Invalid Id' },
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

const deleteUser = (req, res, next) => {
  const state = { reqObj: req,reqBody: req.body,reqParams: req.params };

  const validateInput = (state) => {
    (!state.reqParams.userId) ? handleError({ code: 'MII' }) : fetchUser(state);
  }

  const fetchUser = (state) => {
    User
      .findOne({
        _id: state.reqParams.userId
      })
      .then(d => {
        (!d) ? handleError({ code: 'INID' }) : deleteUserDetails(state);
      })
      .catch(e => {
        handleError({code: 'SWW'})
      })
  }

  const deleteUserDetails = (state) => {
    User
      .deleteOne({_id: state.reqParams.userId})
      .then(d => {
        res.status(200).send({
          message: 'Deleted user'
        });
      })
      .catch(e => {
        handleError({ code: 'SWW' });
      })
  }

  const handleError = (e) => {
    let errors = [{
        code: 'INID',
        message: 'Invalid Id'
      },
      {
        code: 'MII',
        message: 'Missing Important Information'
      },
      {
        code: 'SWW',
        message: 'Something went wrong'
      },
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

router.get('/', checkAdmin, getUsers);
// router.post('/', addUser);
router.get('/:userId', getUserDetails);
router.patch('/:userId', updateUser);
router.delete('/:userId', deleteUser);


module.exports = router;
