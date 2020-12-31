const passport = require('passport');
const mongoose = require('mongoose');
const crypto = require('crypto');
const promisify = require('es6-promisify');

const User = mongoose.model('User');

const ONE_HOUR = 60 * 60 * 1000;

const hash = async (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed login!',
  successRedirect: '/',
  successFlash: "You're now logged in",
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out!');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
    return;
  }
  req.flash('error', 'You must be logged in to do that.');
  res.redirect('/login');
};

exports.forgot = async (req, res) => {
  // 1. See if user exists with that email
  // 2. Set reset tokens and expiry on that account
  // 3. Send an email with that token
  // 4. Redirect with login page
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.flash('success', 'A reset link has been sent to you.');
    return;
  }

  const token = crypto.randomBytes(20).toString('hex');

  user.resetPasswordToken = await hash(token);
  user.resetPasswordExpires = Date.now() + ONE_HOUR;
  await user.save();

  const resetURL = `http://${req.headers.host}/account/reset/${token}`;

  req.flash('success', 'A reset link has been sent to you.', resetURL);
  res.redirect('/login');
};

exports.reset = async (req, res) => {
  const hashedToken = await hash(req.params.resetToken);

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gte: Date.now() },
  });

  if (!user) {
    res.flash('error', 'That reset token was invalid or has expired.');
    return;
  }
  res.render('reset', { title: 'Reset your password' });
};

exports.confirmPasswords = async (req, res, next) => {
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
    res.redirect('back');
    return;
  }
  next();
};

exports.updatePassword = async (req, res) => {
  const { resetToken } = req.params;

  const hashedToken = await hash(resetToken);

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gte: Date.now() },
  });

  if (!user) {
    res.flash('error', 'That reset token was invalid or has expired.');
    return;
  }

  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  const setPassword = promisify(user.setPassword, user);

  await setPassword(req.body.password);
  const updatedUser = await user.save();

  await req.login(updatedUser);

  req.flash('success', 'Your password has been reset');
  res.redirect('/');
};
