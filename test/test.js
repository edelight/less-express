var request = require('supertest');
var assert = require('assert');
var app = require('./fixtures/app');
var _ = require('underscore');
var lessExpress = require('./../index');
var fs = require('fs');

describe('less-express', function(){
	describe('module', function(){
		it('exports a function', function(){
			assert(_.isFunction(lessExpress));
		});
		it('exposes a #lessOptions method for storing globally applied less options', function(){
			assert(_.isFunction(lessExpress.lessOptions));
			assert.equal(lessExpress.lessOptions.length, 1);
			assert.deepEqual(lessExpress.lessOptions(), {sourceMap: {sourceMapFileInline: true}});
		});
		it('exposes a #options method for globally applied options', function(){
			assert(_.isFunction(lessExpress.options));
			assert.equal(lessExpress.options.length, 1);
			assert.deepEqual(lessExpress.options(), {cache: 360000});
		});
		it('throws when invoked without arguments', function(){
			assert.throws(function(){
				lessExpress();
			});
		});
		it('throws when the first argument is not a string', function(){
			assert.throws(function(){
				lessExpress(['zalgo', 'he comes']);
			});
		});
		it('returns a middleware function when called with correct arguments', function(){
			var middleware = lessExpress('./files/base.less');
			assert(_.isFunction(middleware));
			assert.equal(middleware.length, 3);
		});
	});
	describe('configuration precendence', function(){
		it('applies global options when the key is not set locally', function(done){
			request(app)
				.get('/styles.css')
				.expect(200)
				.expect(/sourceMappingURL/)
				.end(done);
		});
		it('applies local options when the key is set locally', function(done){
			request(app)
				.get('/no-map.css')
				.expect(200)
				.expect(function(res){
					if (res.text.indexOf('sourceMappingURL') > -1){
						throw new Error('Local option was not applied.');
					}
				})
				.end(done);
		});
	});
	describe('middleware', function(){
		var expectMatch = /#ff00ff/;
		after(function(done){
			fs.unlink('./test/fixtures/stale.less', done);
		});

		it('compiles less into css when the file is found', function(done){
			request(app)
				.get('/styles.css')
				.expect(200)
				.expect(expectMatch)
				.end(done);
		});
		it('can automatically handle files with relative imports', function(done){
			request(app)
				.get('/import.css')
				.expect(200)
				.expect(expectMatch)
				.end(done);
		});
		it('returns 404 on inexistent files', function(done){
			request(app)
				.get('/404.css')
				.expect(404)
				.end(done);
		});
		it('returns 500 on invalid files', function(done){
			request(app)
				.get('/broken.css')
				.expect(500)
				.end(done);
		});
		it('uses passed LESS options', function(done){
			request(app)
				.get('/minified.css')
				.expect(200)
				.expect(function(res){
					if (res.text.match(/MINIFICATION_TEST_TOKEN/) !== null){
						throw new Error('Passed LESS plugin was not applied.');
					}
				})
				.end(done);
		});
		it('returns last cached css if less encounter an error', function(done){
			var endpoint = '/stale.css'
				, requestApp = request(app);
			fs.symlinkSync('simple.less', './test/fixtures/stale.less');
			requestApp
				.get(endpoint)
				.expect(200)
				.expect(expectMatch)
				.end(function(){
					fs.unlinkSync('./test/fixtures/stale.less');
					fs.symlinkSync('broken.less', './test/fixtures/stale.less');
					requestApp
						.get(endpoint)
						.expect(200)
						.expect(expectMatch)
						.end(done);
				});
		});
	});
});
