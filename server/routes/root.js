const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    return res.render('root');
  } catch (err) {
    return res.status(500).json();
  }
});

module.exports = {
  url: '/',
  route: router,
};
