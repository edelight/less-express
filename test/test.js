var request = require('supertest');
var app = require('./fixtures/app');

describe('less-express', function(){
	it('compiles less into css', function(done){
		request(app)
			.get('/styles.css')
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
});
