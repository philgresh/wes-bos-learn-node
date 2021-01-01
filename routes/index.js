const express = require('express');
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

const router = express.Router();

router.get('/', storeController.homePage);

router
  .route('/add')
  .get(authController.isLoggedIn, storeController.addStore)
  .post(
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

// eslint-disable-next-line prettier/prettier
router.route('/login')
  .get(userController.loginForm)
  .post(authController.login);
router.get('/logout', authController.logout);

router
  .route('/register')
  .get(userController.registerForm)
  .post(
    userController.validateRegister,
    userController.register,
    authController.login,
  );

router
  .route('/account')
  .get(authController.isLoggedIn, userController.account)
  .post(authController.isLoggedIn, catchErrors(userController.updateAccount));
router.post('/account/forgot', catchErrors(authController.forgot));
router
  .route('/account/reset/:resetToken')
  .get(authController.reset)
  .post(
    authController.confirmPasswords,
    catchErrors(authController.updatePassword),
  );

module.exports = router;
