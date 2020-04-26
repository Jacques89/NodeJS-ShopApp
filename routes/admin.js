const path = require('path')

const express = require('express')

const rootDir = require('../helpers/path')

const router = express.Router()

// /admin/add-product => GET
router.get('/add-product', (req, res, next) => {
    console.log('in the next middleware')
    res.sendFile(path.join(rootDir, 'views', 'add-product.html'))
})

// /admin/add-product => POST
router.post('/add-product', (req, res) => {
    console.log(req.body)
    res.redirect('/')
})

module.exports = router