const express = require('express');
const passport = require('passport');
const { JWTStrategy } = require('@sap/xssec');
const xsenv = require('@sap/xsenv');

const { getProducts, getProductsByName } = require('./lib/repository');

const app = express();
const port = process.env.PORT || 8080;

// XSUAA / JWT authentication middleware
passport.use(new JWTStrategy(xsenv.getServices({ uaa: { tag: 'xsuaa' } }).uaa));

app.use(passport.initialize());
app.use(passport.authenticate('JWT', { session: false }));

// Authorization check
function checkReadScope(req, res, next) {
  if (req.authInfo && req.authInfo.checkLocalScope('read')) {
    return next();
  }

  console.log('Missing the expected scope');
  res.status(403).end('Forbidden');
}

// API route
app.get('/products', checkReadScope, getProducts);

// Optional: product by name route
app.get('/products/:name', checkReadScope, getProductsByName);

// Static files, if needed
app.use('/', express.static('static/'));

app.listen(port, () => {
  console.log(`Product List app listening on port ${port}`);
});