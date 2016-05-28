var request = require('supertest');
var explicitApp = require('./fixtures/app-explicit');
var implicitApp = require('./fixtures/app-implicit');

describe('less-express', function(){
	describe('explicit filenames', function(){
		it('compiles less into css when the file is found', function(done){
			request(explicitApp)
				.get('/styles.css')
				.expect(200)
				.expect(/#ff00ff/)
				.end(done);
		});
		it('returns 404 on inexistent files', function(done){
			request(explicitApp)
				.get('/404.css')
				.expect(404)
				.end(done);
		});
	});
	describe('implicit filenames', function(){
		it('compiles less into css when the file is found', function(done){
			request(implicitApp)
				.get('/test/fixtures/base.css')
				.expect(200)
				.expect(/#ff00ff/)
				.end(done);
		});
		it('returns 404 on inexistent files', function(done){
			request(implicitApp)
				.get('/test/fixtures/404.css')
				.expect(404)
				.end(done);
		});
		it('skips non-GET requests', function(done){
			request(implicitApp)
				.post('/test/fixtures/base.css')
				.expect(404)
				.end(done);
		});
	});
});
