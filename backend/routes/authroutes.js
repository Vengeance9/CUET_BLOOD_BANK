
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { updateUserAvatar } = require('../controllers/userController');


const registerValidation = [
  body('firstName').notEmpty().withMessage('Firstname is required'),
  body('lastName').notEmpty().withMessage('Lastname is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('bloodGroup').notEmpty().withMessage('Blood group is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword')
  .custom((value,{req})=>{
    if(value!== req.body.password){
        throw new Error('Passwords do not match')
  }
    return true
}
)
];


const loginValidation = [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').exists().withMessage('Password is required'),
];

router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/admin/login', loginValidation,authController.adminlogin);


module.exports = router;