var assert = require('chai').assert;
var React = require('react');
var TestUtils = require('react-addons-test-utils');
var ReactTypeahead = require('../src/react-typeahead').Typeahead;
var ReactTokenizer = require('../src/react-typeahead').Tokenizer;

describe('Main entry point', function() {

  it('exports a Typeahead component', function() {
    var typeahead = TestUtils.renderIntoDocument(<ReactTypeahead />);
    assert.ok(TestUtils.isCompositeComponent(typeahead));
  });

  it('exports a Tokenizer component', function() {
    var tokenizer = TestUtils.renderIntoDocument(<ReactTokenizer />);
    assert.ok(TestUtils.isCompositeComponent(tokenizer));
  });

});
