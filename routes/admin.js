const path = require('path')

const express = require('express')
const { body } = require('express-validator')

const adminController = require('../controllers/admin')
const isAuth = require('../middleware/is-auth')

const router = express.Router()

/**
 * ADD PRODUCT
 */
router.get('/add-product', isAuth, adminController.getAddProduct)

router.post(
  '/add-product', 
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .withMessage('Please enter a title')
      .trim(),
    body('price')
      .isFloat()
      .withMessage('Please enter a price'),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim(),
  ],
  isAuth, 
  adminController.postAddProduct
)

/**
 * PRODUCTS
 */
router.get('/products', isAuth, adminController.getProducts)

/**
 * EDIT PRODUCT
 */
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct)

router.post(
  '/edit-product',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .withMessage('Please enter a title')
      .trim(),
    body('price')
      .isFloat()
      .withMessage('Please enter a price'),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim(),
  ], 
  isAuth, 
  adminController.postEditProduct
)

/**
 * DELETE PRODUCT
 */
router.delete('/product/:productId', isAuth, adminController.deleteProduct)

module.exports = router