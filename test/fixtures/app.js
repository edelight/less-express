var express = require('express');
var lessExpress = require('./../../index');
var LessPluginCleanCSS = require('less-plugin-clean-css');

var app = express();
var cleanCSSPlugin = new LessPluginCleanCSS({advanced: true});

app.get('/styles.css', lessExpress('./test/fixtures/simple.less'));
app.get('/minified.css', lessExpress('./test/fixtures/minified.less', {plugins: [cleanCSSPlugin]}));
app.get('/404.css', lessExpress('./test/fixtures/404.less'));

app.use(function(err, req, res, next){ //eslint-disable-line no-unused-vars
	res.status(err.status || 500);
	res.json({ok: false});
});

module.exports = app;
