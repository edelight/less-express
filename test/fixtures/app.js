var express = require('express');
var lessExpress = require('./../../index');
var LessPluginCleanCSS = require('less-plugin-clean-css');

var app = express();
var cleanCSSPlugin = new LessPluginCleanCSS({advanced: true});

lessExpress.lessOptions({sourceMap: {sourceMapFileInline: true}});
lessExpress.options({cache: 360000});

app.get('/styles.css', lessExpress('./test/fixtures/simple.less'));
app.get('/no-map.css', lessExpress('./test/fixtures/simple.less', {sourceMap: false}));
app.get('/minified.css', lessExpress('./test/fixtures/minified.less', {plugins: [cleanCSSPlugin]}));
app.get('/import.css', lessExpress('./test/fixtures/import.less'));
app.get('/404.css', lessExpress('./test/fixtures/404.less'));
app.get('/broken.css', lessExpress('./test/fixtures/broken.less'));

app.use(function(err, req, res, next){ //eslint-disable-line no-unused-vars
	res.status(err.status || 500);
	res.json({ok: false});
});

module.exports = app;
