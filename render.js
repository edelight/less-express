var less = require('less');
var fs = require('fs');

module.exports = function render(location, lessOpts){
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
};
