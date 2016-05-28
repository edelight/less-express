var Promise = require('bluebird');
var less = require('less');
var url = require('url');
var fs = require('fs');
var _ = require('underscore');
var LRU = require('lru-cache');

var CACHE_KEY = function(str){
	return 'result' + str;
};

function render(location, lessOpts){
	return new Promise(function(resolve, reject){
		fs.readFile(location, 'utf-8', function(err, lessString){
			if (err) return reject(err);
			less.render(lessString, lessOpts || {})
				.then(function(result){
					resolve(result.css);
				})
				.catch(reject);
		});
	});
}

function statFile(file){
	return new Promise(function(resolve, reject){
		fs.stat(file, function(err){
			if (err && err.code === 'ENOENT'){
				err.status = 404;
			}
			if (err){
				return reject(err);
			}
			resolve(file);
		});
	});
}

module.exports = function(location, lessOptions, options){

	if (!_.isString(location) && arguments.length < 3){
		location = null;
		options = arguments[1];
		lessOptions = arguments[0];
	}

	options = _.extend({}, options);
	lessOptions = _.extend({}, lessOptions);

	var cache = (options.cache || process.env.NODE_ENV === 'production')
		? new LRU({maxAge: _.isFinite(options.cache) ? options.cache : 3600})
		: null;

	return function(req, res, next){
		var result;
		var localLocation = statFile(location || url.parse(req.url).pathname.replace(/\.css$/, '.less'));

		localLocation
			.then(function(location){
				if (cache){
					result = cache.get(CACHE_KEY(location));
					if (result) return Promise.resolve(result);
				}
				result = render(location, lessOptions);
				if (cache) cache.set(CACHE_KEY(location), result);
				return result;
			})
			.then(function(css){
				res.status(200);
				res.set('Content-Type', 'text/css');
				res.send(css);
			})
			.catch(next);
	};
};
