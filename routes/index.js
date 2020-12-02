const express = require('express');
const router = express.Router();

// Do work here
router.get('/', (req, res) => {
  const options = {
    name: req.query.name,
  };
  res.render('hello', options);
});

router.get('/reverse/:name', (req, res) => {
  const reverse = [...req.params.name].reverse().join('');
  res.send(reverse);
});

module.exports = router;
