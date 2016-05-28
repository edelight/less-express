var Promise = require('bluebird');
var less = require('less');
var fs = require('fs');
var _ = require('underscore');
var LRU = require('lru-cache');

var CACHE_KEY = function(str){
	return 'result' + str;
};

var globalOptions = {}, globalLessOptions = {};

function render(location, lessOpts){
	return new Promise(function(resolve, reject){
		fs.readFile(location, 'utf-8', function(err, lessString){
			if (err && err.code === 'ENOENT') err.status = 404;
			if (err) return reject(err);
			less.render(lessString, lessOpts || {})
				.then(function(result){
					resolve(result.css);
				})
				.catch(reject);
		});
	});
}

function locationToDir(location){
	return _.initial(location.split('/')).join('/');
}

function lessExpress(location, lessOptions, options){

	if (!_.isString(location)){
		throw new Error('You need to pass a `location` parameter to generate a `less-express` middleware function.');
	}

	var localLessOptions = _.extend({paths: [locationToDir(location)]}, globalLessOptions, lessOptions || {});
	var localOptions = _.extend({}, globalOptions, options || {});
	var localCache = localOptions.cache === false
		? null
		: (localOptions.cache || process.env.NODE_ENV === 'production')
			? new LRU({maxAge: _.isFinite(localOptions.cache) ? localOptions.cache : 0})
			: null;

	var middleware = function(req, res, next){
		if (req.method.toLowerCase() !== 'get' && req.method.toLowerCase() !== 'head'){
			return next();
		}
		var result;
		if (localCache){
			result = localCache.get(CACHE_KEY(location));
			if (result) return Promise.resolve(result);
		}
		result = render(location, localLessOptions).then(function(css){
			res.set('Content-Type', 'text/css');
			res.send(css);
		}).catch(next);
		if (localCache) localCache.set(CACHE_KEY(location), result);
	};
	middleware.options = function(){
		return _.extend({}, localOptions);
	};
	middleware.lessOptions = function(){
		return _.extend({}, localLessOptions);
	};
	middleware.cache = function(){
		return localCache;
	};
	return middleware;
}

lessExpress.lessOptions = function(newOpts){
	globalLessOptions = _.extend({}, globalLessOptions, newOpts || {});
	return globalLessOptions;
};

lessExpress.options = function(newOpts){
	globalOptions = _.extend({}, globalOptions, newOpts || {});
	return globalOptions;
};

module.exports = lessExpress;
