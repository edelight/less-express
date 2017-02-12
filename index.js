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
	var localStale = localOptions.cache && localOptions.stale
		, localStaleCache = {};
	var localCache = localOptions.cache === false
		? null
		: (localOptions.cache || process.env.NODE_ENV === 'production')
			? new LRU({
				length: function(){ return 1; }
				, max: 100
				, maxAge: _.isFinite(localOptions.cache) ? localOptions.cache : 0
				, dispose: function(key, val){ if (!localStaleCache[key]) localStaleCache[key] = val; }
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

		function sendOrNext(css){
			if (localOptions.passThru){
				res.locals.lessCss = res.locals.lessCss || {};
				res.locals.lessCss[location] = css;
				next();
			} else {
				res.set('Content-Type', 'text/css').send(css);
			}
		}

		var result;
		if (localCache){
			result = localCache.get(location);
			if (result){
				return result.then(sendOrNext)
				.catch(next);
			}
		}
		result = render(location, localLessOptions).then(function(css){
			sendOrNext(css);
			if (localCache) localCache.set(location, result);
			return css;
		})
		.catch(localStale ? function(err){
			var lastBuild = localCache && (localCache.get(location) || localStaleCache[location]);
			if (lastBuild){
				return lastBuild.then(sendOrNext);
			} else throw err;
		} : null)
		.catch(next);
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
