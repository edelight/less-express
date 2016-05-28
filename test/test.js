var request = require('supertest');
var assert = require('assert');
var app = require('./fixtures/app');
var _ = require('underscore');
var lessExpress = require('./../index');

describe('less-express', function(){
	describe('module', function(){
		it('exports a function', function(){
			assert(_.isFunction(lessExpress));
		});
		it('exposes a #lessOptions method for storing globally applied less options', function(){
			assert(_.isFunction(lessExpress.lessOptions));
			assert.equal(lessExpress.lessOptions.length, 1);
			lessExpress.lessOptions({foo: 'bar'});
			assert.deepEqual(lessExpress.lessOptions(), {foo: 'bar'});
		});
		it('exposes a #options method for globally applied options', function(){
			assert(_.isFunction(lessExpress.options));
			assert.equal(lessExpress.options.length, 1);
			lessExpress.options({foo: 'bar'});
			assert.deepEqual(lessExpress.options(), {foo: 'bar'});
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
	});
	describe('configuration precendence', function(){
		it('applies global options when the key is not set locally', function(){
			lessExpress.options({opt: '1'});
			lessExpress.lessOptions({lessOpt: 0});
			var middleware = lessExpress('location.less');
			assert.strictEqual(middleware.options().opt, '1');
			assert.strictEqual(middleware.lessOptions().lessOpt, 0);
		});
		it('applies local options when the key is set locally', function(){
			var middleware = lessExpress('location.less', {lessOpt: '3'}, {opt: '2'});
			assert.strictEqual(middleware.options().opt, '2');
			assert.strictEqual(middleware.lessOptions().lessOpt, '3');
		});
	});
	describe('caching', function(){
		it('caches results by default when in production', function(){
			var middleware = lessExpress('location.less');
			assert(middleware.cache());
		});
		it('can skip caching in production by passing false', function(){
			var middleware = lessExpress('location.less', {}, {cache: false});
			assert(!middleware.cache());
		});
	});
	describe('middleware', function(){
		it('compiles less into css when the file is found', function(done){
			request(app)
				.get('/styles.css')
				.expect(200)
				.expect(/#ff00ff/)
				.end(done);
		});
		it('can automatically handle files with relative imports', function(done){
			request(app)
				.get('/import.css')
				.expect(200)
				.expect(/#ff00ff/)
				.end(done);
		});
		it('returns 404 on inexistent files', function(done){
			request(app)
				.get('/404.css')
				.expect(404)
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
	});
});
