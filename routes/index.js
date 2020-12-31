const express = require('express');
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

const router = express.Router();

router.get('/', storeController.homePage);
router.get('/add', authController.isLoggedIn, storeController.addStore);
router.post(
  '/add',
  storeController.uploadPhoto,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore),
);
router.post(
  '/add/:id',
  storeController.uploadPhoto,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore),
);
router.get('/stores', catchErrors(storeController.getStores));
router.get('/stores/:id/edit', catchErrors(storeController.editStore));

router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));

router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));

router.get('/login', userController.loginForm);
router.post('/login', authController.login);

router.get('/register', userController.registerForm);
router.post(
  '/register',
  userController.validateRegister,
  userController.register,
  authController.login,
);

router.get('/logout', authController.logout);

router.get('/account', authController.isLoggedIn, userController.account);
router.post(
  '/account',
  authController.isLoggedIn,
  catchErrors(userController.updateAccount),
);
router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:resetToken', authController.reset);
router.post(
  '/account/reset/:resetToken',
  authController.confirmPasswords,
  catchErrors(authController.updatePassword),
);

module.exports = router;
