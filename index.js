var _ = require('underscore');
var LRU = require('lru-cache');
var render = require('./render');

var globalOptions = {};
var globalLessOptions = {};

function lessExpress(location, lessOptions, options){

	if (!_.isString(location)){
		throw new Error(
			'You need to pass a `location` parameter to generate a `less-express` middleware function.'
		);
	}

	var localLessOptions = _.extend({
		paths: [_.initial(location.split('/')).join('/')]
	}, globalLessOptions, lessOptions);
	var localOptions = _.extend({}, globalOptions, options);
	var localCache = localOptions.cache === false
		? null
		: (localOptions.cache || process.env.NODE_ENV === 'production')
			? new LRU({
				maxAge: _.isFinite(localOptions.cache) ? localOptions.cache : 0
			})
			: null;

	if (localCache
		&& (process.env.NODE_ENV === 'production' && localOptions.precompile !== false)
		|| localOptions.precompile){
		localCache.set(location, render(location, localLessOptions));
	}

	return function(req, res, next){
		if (req.method.toLowerCase() !== 'get' && req.method.toLowerCase() !== 'head'){
			return next();
		}

		var result;
		if (localCache){
			result = localCache.get(location);
			if (result){
				return result.then(function(css){
					res.set('Content-Type', 'text/css');
					res.send(css);
				})
				.catch(next);
			}
		}
		result = render(location, localLessOptions).then(function(css){
			res.set('Content-Type', 'text/css');
			res.send(css);
		}).catch(next);

		if (localCache) localCache.set(location, result);
	};

}

lessExpress.lessOptions = function(newOpts){
	globalLessOptions = _.extend({}, globalLessOptions, newOpts);
	return globalLessOptions;
};

lessExpress.options = function(newOpts){
	globalOptions = _.extend({}, globalOptions, newOpts);
	return globalOptions;
};

module.exports = lessExpress;
