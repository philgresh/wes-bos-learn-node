const mongoose = require('mongoose');

const Store = mongoose.model('Store');

exports.homePage = (_req, res) => {
  res.render('index');
};

exports.addStore = (_req, res) => {
  res.render('editStore', {
    title: 'Add Store',
  });
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
