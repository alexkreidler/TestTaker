/*
Postponed work on tests till version 2.5
*/
var mocha = require('mocha');
var chaiHttp = require('chai-http');
var server = require('../server.js');
var chai = require('chai');
var expect = chai.expect;

chai.use(chaiHttp);
describe('Server', function() {
  it('should send the homepage on a GET request to root', function(done) {
    chai.request(server).get('/').end(function(err, res) {
     expect(err).to.be.null;
     expect(res).to.have.status(200);
     done();
    });
  });
});
