/* eslint-disable func-names */
/*
  Catch Errors Handler

  With async/await, you need some way to catch errors
  Instead of using try{} catch(e) {} in each controller, we wrap the function in
  catchErrors(), catch any errors they throw, and 
  pass it along to our express middleware with next()
*/

module.exports.catchErrors = (fn) => {
  return function (req, res, next) {
    return fn(req, res, next).catch(next);
  };
};

/*
  Not Found Error Handler

  If we hit a route that is not found, we mark it as 404 and 
  pass it along to the next error handler to display
*/
module.exports.notFound = (_req, _res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
};

/*
  MongoDB Validation Error Handler

  Detect if there are mongodb validation errors that we can nicely 
  show via flash messages
*/

// eslint-disable-next-line consistent-return
module.exports.flashValidationErrors = (err, req, res, next) => {
  if (!err.errors) return next(err);
  // validation errors look like
  const errorKeys = Object.keys(err.errors);
  errorKeys.forEach((key) => req.flash('error', err.errors[key].message));
  res.redirect('back');
};

/*
  Development Error Handler

  In development we show good error messages so if we hit a syntax 
  error or any other previously un-handled error, we can show good 
  info on what happened
*/
module.exports.developmentErrors = (err, _req, res, _next) => {
  // eslint-disable-next-line no-param-reassign
  err.stack = err.stack || '';
  const errorDetails = {
    message: err.message,
    status: err.status,
    stackHighlighted: err.stack.replace(
      /[a-z_-\d]+.js:\d+:\d+/gi,
      '<mark>$&</mark>',
    ),
  };
  res.status(err.status || 500);
  res.format({
    // Based on the `Accept` http header
    'text/html': () => {
      res.render('error', errorDetails);
    }, // Form Submit, Reload the page
    'application/json': () => res.json(errorDetails), // Ajax call, send JSON back
  });
};

/*
  Production Error Handler

  No stacktraces are leaked to user
*/
module.exports.productionErrors = (err, _req, res, _next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
};
