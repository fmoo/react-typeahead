var _ = require('lodash');
var assert = require('chai').assert;
var React = require('react/addons');
var Typeahead = require('../src/typeahead');
var TypeaheadOption = require('../src/typeahead/option');
var TypeaheadSelector = require('../src/typeahead/selector');
var Tokenizer = require('../src/tokenizer');
var Token = require('../src/tokenizer/token');
var Keyevent = require('../src/keyevent');
var TestUtils = React.addons.TestUtils;

function simulateTextInput(component, value) {
  var node = component.refs.entry.getDOMNode();
  node.value = value;
  TestUtils.Simulate.change(node);
  return TestUtils.scryRenderedComponentsWithType(component, TypeaheadOption);
}

function simulateTokenInput(component, value) {
  var typeahead = component.refs.typeahead;
  return simulateTextInput(typeahead, value);
}

var BEATLES = ['John', 'Paul', 'George', 'Ringo'];

describe('TypeaheadTokenizer Component', function() {

  describe('sanity', function() {
    beforeEach(function() {
      this.component = TestUtils.renderIntoDocument(<Tokenizer
        options={BEATLES}
        />
      );
    });

    it('should fuzzy search and render matching results', function() {
      // input value: num of expected results
      var testplan = {
        'o': 3,
        'pa': 1,
        'Grg': 1,
        'Ringo': 1,
        'xxx': 0
      };

      _.each(testplan, function(expected, value) {
        var results = simulateTokenInput(this.component, value);
        assert.equal(results.length, expected, 'Text input: ' + value);
      }, this);
    });

    describe('keyboard controls', function() {
      it('down arrow + return creates a token', function() {
        var results = simulateTokenInput(this.component, 'o');
        var secondItem = results[1].getDOMNode().innerText;
        var node = this.component.refs.typeahead.refs.entry.getDOMNode();
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_DOWN });
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_DOWN });
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_RETURN });
        var Tokens = TestUtils.scryRenderedComponentsWithType(this.component, Token);
        assert.equal(Tokens[0].props.children, secondItem); // Poor Ringo
      });

      it('up arrow + return navigates and creates a token', function() {
        var results = simulateTokenInput(this.component, 'o');
        var firstItem = results[0].getDOMNode().innerText;
        var node = this.component.refs.typeahead.refs.entry.getDOMNode();
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_DOWN });
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_DOWN });
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_UP });
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_RETURN });
        var Tokens = TestUtils.scryRenderedComponentsWithType(this.component, Token);
        assert.equal(Tokens[1].props.children, firstItem);
      });

      it('should remove a token when BKSPC is pressed on an empty input', function() {
        var results = TestUtils.scryRenderedComponentsWithType(this.component, Token);
        var input = this.component.refs.typeahead.refs.entry.getDOMNode();
        var startLength = results.length;
        assert.equal(input.value, "");
        assert.equal(startLength, 2);
        assert.equal(startLength, results.length);

        TestUtils.Simulate.keyDown(input, { keyCode: Keyevent.DOM_VK_BACK_SPACE });
        results = TestUtils.scryRenderedComponentsWithType(this.component, Token);
        assert.equal(startLength, results.length + 1);

      });

      it('should not remove a token on BKSPC when input is not empty', function() {
        var input = this.component.refs.typeahead.refs.entry.getDOMNode();
        var startLength = TestUtils.scryRenderedComponentsWithType(this.component, Token).length;

        input.value = "hello";
        TestUtils.Simulate.change(input);
        TestUtils.Simulate.keyDown(input, { keyCode: Keyevent.DOM_VK_BACK_SPACE });
        
        results = TestUtils.scryRenderedComponentsWithType(this.component, Token);
        assert.equal(startLength , results.length);
      });

      it('tab to choose first item', function() {
        var results = simulateTokenInput(this.component, 'o');
        var itemText = results[0].getDOMNode().innerText;
        var node = this.component.refs.typeahead.refs.entry.getDOMNode();
        var tokens = TestUtils.scryRenderedComponentsWithType(this.component, Token);

        // Need to check Token list for props.children
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_TAB });

        var newTokens = TestUtils.scryRenderedComponentsWithType(this.component, Token)
        assert.equal(tokens.length, newTokens.length - 1);
        assert.equal(newTokens[newTokens.length - 1].props.children, itemText);

        // Clear out tokens for next test.
        node.value = "";
        TestUtils.Simulate.change(node);
        for ( var i = 0; i<newTokens.length; i++) {
          TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_BACK_SPACE });
        }
        
        newTokens = TestUtils.scryRenderedComponentsWithType(this.component, Token)
        assert.equal(0, newTokens.length);
      });

      it('tab to selected current item', function() {
        var results = simulateTokenInput(this.component, 'o');
        var itemText = results[1].getDOMNode().innerText;
        var node = this.component.refs.typeahead.refs.entry.getDOMNode();
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_DOWN });
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_DOWN });
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_TAB });
        var tokens = TestUtils.scryRenderedComponentsWithType(this.component, Token);
        assert.equal(tokens[tokens.length - 1].props.children, itemText);
      });
    });

  });



});
