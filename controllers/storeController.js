const mongoose = require('mongoose');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const Store = mongoose.model('Store');
const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      next(null, true);
    } else next({ message: 'That filetype isn\t allowed' }, false);
  },
};

exports.homePage = (_req, res) => {
  res.render('index');
};

exports.addStore = (_req, res) => {
  res.render('editStore', {
    title: 'Add Store',
  });
};

exports.uploadPhoto = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  if (!req.file) {
    next();
    return;
  }
  const { mimetype, buffer } = req.file;
  const extension = mimetype.split('/')[1];

  const newName = `${uuid.v4()}.${extension}`;
  req.body.photo = newName;

  const photo = await jimp.read(buffer);
  await photo.resize(800, jimp.AUTO);

  await photo.write(`./public/uploads/${req.body.photo}`);

  next();
};

exports.createStore = async (req, res) => {
  const store = await new Store(req.body).save();
  req.flash('success', `Successfully created ${store.name}`);
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (_req, res) => {
  const stores = await Store.find();

  res.render('stores', {
    stores,
    title: 'Stores',
  });
};

exports.editStore = async (req, res) => {
  // 1. Find the store given the ID
  const store = await Store.findById(req.params.id);
  // 2. confirm they are the owner of the store
  // TODO
  // 3. Render out the edit form so the user can update their store
  res.render('editStore', { title: `Edit ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
  // find and update the store
  const conditions = { _id: req.params.id };
  const update = req.body;
  update.location.type = 'Point';

  const options = {
    new: true, // return the new store instead of the old one
    runValidators: true,
  };

  const store = await Store.findOneAndUpdate(
    conditions,
    update,
    options,
  ).exec();
  req.flash(
    'success',
    `Successfully updated <strong>${store.name}</strong>. 
      <a href="/stores/${store.slug}">View Store →</a>`,
  );
  res.redirect(`/stores/${store._id}/edit`);
  // Redriect them the store and tell them it worked
};

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug });
  if (!store) {
    return next();
  }
  res.render('showStore', { title: store.name, store });
};

exports.getStoresByTag = async (req, res, next) => {
  const tags = await Store.getTagsList();
  const { tag } = req.params;
  res.render('tags', { tag: tag || 'Tags', tags, title: 'Tags' });
};
