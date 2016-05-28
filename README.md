# less-express

[![Build Status](https://travis-ci.org/m90/less-express.svg?branch=master)](https://travis-ci.org/m90/less-express)

> express middleware for artifact free LESS compiling

#### Disclaimer

This package is currently being developed. You can install it from npm, but things will probably not work correctly yet and everything still is subject to change.

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
- `precompile`: Tell the middleware to precompile the resource on application startup. This is happening per default in production and can be disabled by passing `false`.

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
