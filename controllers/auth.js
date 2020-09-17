const crypto = require('crypto')

const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const mailgunTransporter = require('nodemailer-mailgun-transport')

const User = require("../models/user")

const mg = nodemailer.createTransport(mailgunTransporter({
  auth: {
    api_key: process.env.API_KEY,
    domain: process.env.DOMAIN
  }
}))

exports.getLogin = (req, res, next) => {
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message
  })
}

exports.getSignup = (req, res, next) => {
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message
  })
}

exports.postLogin = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  User.findOne({
    email: email
  })
  .then(user => {
    if (!user) {
      return res.redirect('/login')
    }
    bcrypt
    .compare(password, user.password)
    .then(passwordMatch => {
      if (passwordMatch) {
        req.session.isLoggedIn = true
        req.session.user = user
        return req.session.save(err => {
          console.log(err)
          res.redirect('/')
        })
      }
      req.flash('error', 'Invalid email or password.')
      res.redirect('/login')
    })
    .catch(err => {
      console.log(err)
      res.redirect('/login')
    })
  })
  .catch(err => {
    console.log(err)
  })
}

exports.postSignup = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  const confirmPassword = req.body.confirmPassword
  User.findOne({
    email: email
  })
  .then(userDoc => {
    if (userDoc) {
      req.flash('error', 'E-mail already exists')
      return res.redirect('/signup')
    }
    return bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] }
      })
      return user.save()
    })
    .then(result => {
      res.redirect('/login')
      return mg.sendMail({
        from: 'shop@jacques.com',
        to: email,
        subject: 'Signup succeeded',
        text: 'Welcome, You successfully signed up!'
      })
    })
    .catch(err => {
      console.log(err)
    })
  })
  .catch(err => {
    console.log(err)
  })
}

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err)
    res.redirect('/')
  })
}

exports.getReset = (req, res, next) => {
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  })
}

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err)
      return res.redirect('/reset')
    }
    const token = buffer.toString('hex')
    User.findOne({
      email: req.body.email,
    })
    .then(user => {
      if (!user) {
        req.flash('error', 'This email is not registered in our system')
        return res.redirect('/reset')
      }
      user.resetToken = token
      user.resetTokenExpiration = Date.now() + 3600000
      return user.save()
    })
    .then(result => {
      res.redirect('/')
      return mg.sendMail({
        from: 'shop@jacques.com',
        to: req.body.email,
        subject: 'Password reset',
        html: `
          <p>You requested a password reset. Please click the link below to set a new password</p>
          <p>Please click this <a href="http://localhost:3000/reset/${token}">link</a> below to set a new password</p>
        `
      })
    })
    .catch(err => {
      console.log(err)
    })
  })
}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token
  User.findOne({
    resetToken: token,
    resetTokenExpiration: {$gt: Date.now()}
  })
  .then(user => {
    let message = req.flash('error')
    if (message.length > 0) {
      message = message[0]
    } else {
      message = null
    }
    res.render('auth/new-password', {
      path: '/new-password',
      pageTitle: 'New Password',
      errorMessage: message,
      userId: user._id.toString(),
      passwordToken: token
    })
  })
  .catch(err => {
    console.log(err)
  })
}

exports.postNewPassword = (req, res, next ) => {
  const newPassword = req.body.password
  const userId = req.body.userId
  const passwordToken = req.body.passwordToken
  let resetUser

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: {$gt: Date.now()},
    _id: userId
  })
  .then(user => {
    resetUser = user
    return bcrypt.hash(newPassword, 12)
  })
  .then(hashedPassword => {
    resetUser.password = hashedPassword
    resetUser.resetToken = null
    resetUser.resetTokenExpiration = null
    return resetUser.save()
  })
  .then(result => {
    res.redirect('/login')
  })
  .catch(err => {
    console.log(err)
  })
}