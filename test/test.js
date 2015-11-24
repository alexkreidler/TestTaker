var expect = require('chai').expect
var mocha = require('mocha')
var server = require('../server.js')
describe('Server', function() {
  describe('#toArray()', function() {
    expect(toArray({'key': 'value', 'key2': 'value2'})).to.equal(['value', 'value2'])
  });
});
