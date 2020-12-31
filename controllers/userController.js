const mongoose = require('mongoose');
const promisify = require('es6-promisify');
const crypto = require('crypto');

const hash = (token) => crypto.createHash('sha256').update(token).digest('hex');


const User = mongoose.model('User');

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login' });
};

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register' });
};

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('name');
  req.checkBody('name', 'You must supply a name!').notEmpty();
  req.checkBody('email', 'That email is not valid!').notEmpty();
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false,
  });
  req.checkBody('password', 'Password cannot be blank!').notEmpty();
  req.checkBody('confirm-password', 'Password cannot be blank!').notEmpty();
  req
    .checkBody('confirm-password', 'Your passwords do not match!')
    .equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    req.flash(
      'error',
      errors.map((err) => err.msg),
    );
    res.render('register', {
      title: 'Register',
      body: req.body,
      flashes: req.flash(),
    });
    return;
  }
  next();
};

exports.register = async (req, _res, next) => {
  const user = new User({
    email: req.body.email,
    name: req.body.name,
  });
  const register = promisify(User.register, User); // Second parameter is object to bind it to
  await register(user, req.body.password);
  next();
};

exports.account = (req, res) => {
  res.render('account', { title: 'Edit Your Account' });
};

exports.updateAccount = async (req, res) => {
  const { name, email } = req.body;
  const { _id } = req.user;

  const query = { _id };
  const updates = {
    $set: {
      name,
      email,
    },
  };
  const options = {
    new: true,
    runValidators: true,
    context: 'query',
  };

  User.findOneAndUpdate(query, updates, options).then(() => {
    res.redirect('back');
  });
};
