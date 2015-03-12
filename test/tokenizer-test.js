var _ = require('lodash');
var assert = require('chai').assert;
var sinon = require('sinon');
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

function getTokens(component) {
  return TestUtils.scryRenderedComponentsWithType(component, Token);
}

function clearSelection(component) {
  var node = component.refs.typeahead.refs.entry.getDOMNode();
  var tokens = getTokens(component);
  node.value = "";

  TestUtils.Simulate.change(node);
  for ( var i = 0; i<tokens.length; i++) {
    TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_BACK_SPACE });
  }
  
  tokens = TestUtils.scryRenderedComponentsWithType(this.component, Token)
  assert.equal(0, tokens.length);
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
        clearSelection(this.component);
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

    describe('AllowCustomValues property test', function() {
      var tokenLength = 4;

      beforeEach(function() {
        this.sinon = sinon.sandbox.create();
        this.tokenAdd = this.sinon.spy();
        this.tokenRemove = this.sinon.spy();


        this.component = TestUtils.renderIntoDocument(<Tokenizer
          options={BEATLES}
          onTokenAdd={this.tokenAdd}
          onTokenRemove={this.tokenRemove}
          allowCustomValues={tokenLength}
          customClasses={{
            input: 'topcoat-text-input',
            results: 'topcoat-list__container',
            listItem: 'topcoat-list__item',
            listAnchor: 'topcoat-list__link',
            customAdd: 'topcoat-custom__token'
          }}
          ></Tokenizer>
        );
        clearSelection(this.component);

      });

      afterEach(function() {
        this.sinon.restore();
      })


      it('should not allow custom tokens that are less than specified allowCustomValues length', function() {
        var tokens = getTokens(this.component);
        var results = simulateTokenInput(this.component, "abz");
        assert.equal(0, results.length);
      });

      it('should display custom tokens when equal or exceeds allowCustomValues value', function() {
        var results = simulateTokenInput(this.component, "abzz");
        assert.equal(1, results.length);
        assert.equal("abzz", results[0].props.children);

        results = simulateTokenInput(this.component, "bakercharlie")
        assert.equal(1, results.length);
        assert.equal("bakercharlie", results[0].props.customValue);
      })

      it('should not add custom class to non-custom selection', function() {
        var results = simulateTokenInput(this.component, "o");
        assert.equal(3, results.length);
        assert(!results[0].getDOMNode().getAttribute('class').match(new RegExp(this.component.props.customClasses.customAdd)));
      })

      it('should add custom class to custom selection', function() {
        var results = simulateTokenInput(this.component, "abzz");
        assert(1, results.length)
        assert(results[0].getDOMNode().getAttribute('class').match(new RegExp(this.component.props.customClasses.customAdd)));
      })

      it('should allow selection of custom token', function() {
        var results = simulateTokenInput(this.component, "abzz");
        var input = this.component.refs.typeahead.refs.entry.getDOMNode();
        var tokens = getTokens(this.component);

        TestUtils.Simulate.keyDown(input, {keyCode: Keyevent.DOM_VK_DOWN})
        TestUtils.Simulate.keyDown(input, {keyCode: Keyevent.DOM_VK_RETURN})
        tokens = getTokens(this.component)
        assert(tokens.length == 1)
        assert.equal("abzz", tokens[0].props.children);
      })

      it('should call onTokenAdd for custom token', function() {
        var results = simulateTokenInput(this.component, "abzz");
        var input = this.component.refs.typeahead.refs.entry.getDOMNode();
        var tokens = getTokens(this.component);

        TestUtils.Simulate.keyDown(input, {keyCode: Keyevent.DOM_VK_DOWN})
        TestUtils.Simulate.keyDown(input, {keyCode: Keyevent.DOM_VK_RETURN})

        assert(this.tokenAdd.called);
        assert(this.tokenAdd.calledWith( this.component.state.selected ))
      })

      it('should call onTokenRemove for custom token', function() {
        var results = simulateTokenInput(this.component, "abzz");
        var input = this.component.refs.typeahead.refs.entry.getDOMNode();
        var tokens = getTokens(this.component);

        TestUtils.Simulate.keyDown(input, {keyCode: Keyevent.DOM_VK_DOWN})
        TestUtils.Simulate.keyDown(input, {keyCode: Keyevent.DOM_VK_RETURN})

        assert(this.tokenAdd.called);
        assert(this.tokenAdd.calledWith( this.component.state.selected ))

        tokens = getTokens(this.component);
        var tokenClose = TestUtils.scryRenderedDOMComponentsWithTag(tokens[0], "a")[0].getDOMNode();
        TestUtils.Simulate.click(tokenClose);
        assert(this.tokenRemove.called);
        assert(this.tokenRemove.calledWith(this.component.state.selected));
      })
    })
  });



});
