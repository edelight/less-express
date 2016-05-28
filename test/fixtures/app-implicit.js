var express = require('express');
var lessExpress = require('./../../index');

var app = express();

app.use(lessExpress());

app.use(function(err, req, res, next){ //eslint-disable-line no-unused-vars
	res.status(err.status || 500);
	res.json({ok: false});
});

module.exports = app;
