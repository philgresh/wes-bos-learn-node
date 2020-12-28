const express = require('express');
const storeController = require('../controllers/storeController');
const { catchErrors } = require('../handlers/errorHandlers');

const router = express.Router();

router.get('/', storeController.homePage);
router.get('/add', storeController.addStore);
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

module.exports = router;
