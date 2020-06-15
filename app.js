/* eslint-disable no-unused-vars */
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')

const errorController = require('./controllers/error')
const mongoConnect = require('./helpers/database').mongoConnect
const User = require('./models/user')

const app = express()

app.set('view engine', 'ejs')

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
  User.findById("5ee6523919c7518224914a78")
    .then((user) => {
      req.user = new User(user.name, user.email, user.cart, user._id)
      next()
    })
    .catch((err) => console.log(err))
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)

app.use(errorController.get404)

mongoConnect(() => {
  app.listen(3000)
})