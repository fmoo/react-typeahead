var assert = require('chai').assert;
var React = require('react/addons');
var ReactTypeahead = require('../src/react-typeahead');

describe('Main entry point', function() {

  it('exports a Typeahead component', function() {
    var typeahead = React.addons.TestUtils.renderIntoDocument(ReactTypeahead.Typeahead());
    assert.ok(React.addons.TestUtils.isCompositeComponent(typeahead));
  });

  it('exports a Tokenizer component', function() {
    var tokenizer = React.addons.TestUtils.renderIntoDocument(ReactTypeahead.Tokenizer());
    assert.ok(React.addons.TestUtils.isCompositeComponent(tokenizer));
  });

});
