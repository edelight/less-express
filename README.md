# less-express

[![Build Status](https://travis-ci.org/edelight/less-express.svg?branch=master)](https://travis-ci.org/edelight/less-express)

> express middleware for artifact free LESS compiling

### Why another LESS middleware?

All existing LESS middlewares for express use a file based approach. This is great for big projects that require complex structures and high performance, yet this comes with two drawbacks: they generate build artifacts and complex setup. Sometimes you just want your app to serve a single CSS resource.

### Installation

Install from npm:

```sh
$ npm install less-express --save
```

### Usage

A simple example showing you how to serve the compiled version of `./public/stylesheets/app.less` at `/css/app.css`:

```js
var lessExpress = require('less-express');
app.get('/css/app.css', lessExpress('./public/stylesheets/app.less'));
```

### Configuration

You can configure the middleware by passing options to LESS or the middleware itself:

```js
app.get('/css/app.css', lessExpress('./public/stylesheets/app.less', lessOptions, middlewareOptions));
```

`lessOptions` will be passed through to LESS. See the [LESS documentation](http://lesscss.org/usage/#programmatic-usage) for available configuration. The following `middlewareOptions` are available for the middleware:

- `cache`: TTL in milliseconds that compilation results will be cached. When `true` is passed the cache will keep the initial compilation result infinitely. By default the middleware uses infinite caching in production. If you want to disable this pass `false`.
- `precompile`: Tell the middleware to precompile the stylesheet on application startup. This is happening per default in production and can be disabled by passing `false`. If you explicitly set `cache` to `false` this will do nothing.
- `stale`: If `true` then the middleware will return a stale cache of the stylesheet, if available, when a compilation error is encountered. This is `false` by default. If you explicitly set `cache` to `false` this will do nothing.
- `passThru`: If `true` then the middleware will not send the response and instead will assign the resulting stylesheet to `res.locals.lessCss` using the given location and call the next middleware. i.e
```js
lessExpress.options({passThru: true});
app.get('/css/app.css', lessExpress('./public/stylesheets/app.less'), function (req, res, next) {
    var css = res.locals.lessCss['./public/stylesheets/app.less'];
});
```
This is useful for extra processing you may want to apply after compilation, but before sending the response. This is `false` by default.

You can also set global configuration options that will be applied to all calls by using `#lessOptions` and `#options`:

```js
lessExpress.options({cache: false});
lessExpress.lessOptions({plugins: [cleanCSS]});
```

Options passed to the function invocation will take precedence:
```js
lessExpress.options({cache: false});
app.get('/css/app.css', lessExpress('./public/stylesheets/app.less', {}, {cache: 3600})); // will cache
```


### License

MIT © [Frederik Ring](http://www.frederikring.com)
