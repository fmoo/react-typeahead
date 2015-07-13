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


var BEATLES = ['John', 'Paul', 'George', 'Ringo'];

describe('TypeaheadTokenizer Component', function() {

  describe('basic tokenizer', function() {
    beforeEach(function() {
      this.component = TestUtils.renderIntoDocument(
        <Tokenizer
          options={BEATLES}
          customClasses={{
            token: 'custom-token'
          }}
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

    it('should have custom and default token classes', function() {
      simulateTokenInput(this.component, 'o');
      var entry = this.component.refs.typeahead.refs.entry.getDOMNode();
      TestUtils.Simulate.keyDown(entry, { keyCode: Keyevent.DOM_VK_DOWN });
      TestUtils.Simulate.keyDown(entry, { keyCode: Keyevent.DOM_VK_RETURN });

      var tokens = getTokens(this.component);
      assert.equal(tokens.length, 1);
      assert.isDefined(tokens[0]);

      TestUtils.findRenderedDOMComponentWithClass(tokens[0], 'typeahead-token');
      TestUtils.findRenderedDOMComponentWithClass(tokens[0], 'custom-token');
    });

    context('onKeyDown', function() {
      it('should bind to key events on the input', function(done) {
        var component = TestUtils.renderIntoDocument(<Tokenizer
          options={ BEATLES }
          onKeyDown={ function(e) {
              assert.equal(e.keyCode, 87);
              done();
            }
          }
        />);
        var input = React.findDOMNode(component.refs.typeahead.refs.entry);
        TestUtils.Simulate.keyDown(input, { keyCode: 87 });
      });
    });

    context('onKeyUp', function() {
      it('should bind to key events on the input', function(done) {
        var component = TestUtils.renderIntoDocument(<Tokenizer
          options={ BEATLES }
          onKeyUp={ function(e) {
              assert.equal(e.keyCode, 87);
              done();
            }
          }
        />);

        var input = React.findDOMNode(component.refs.typeahead.refs.entry);
        TestUtils.Simulate.keyUp(input, { keyCode: 87 });
      });
    });

    describe('component functions', function() {
      beforeEach(function() {
        this.sinon = sinon.sandbox.create();
      });
      afterEach(function() {
        this.sinon.restore();
      });

      it('focuses the typeahead', function() {
        this.sinon.spy(this.component.refs.typeahead, 'focus');
        this.component.focus();
        assert.equal(this.component.refs.typeahead.focus.calledOnce, true);
      });
    });

    it('should provide an exposed component function to get the selected tokens', function() {
      simulateTokenInput(this.component, 'o');
      var entry = this.component.refs.typeahead.refs.entry.getDOMNode();
      TestUtils.Simulate.keyDown(entry, { keyCode: Keyevent.DOM_VK_DOWN });
      TestUtils.Simulate.keyDown(entry, { keyCode: Keyevent.DOM_VK_RETURN });

      assert.equal(this.component.getSelectedTokens().length, 1);
      assert.equal(this.component.getSelectedTokens()[0], "John");
    });

    describe('keyboard controls', function() {
      it('down arrow + return creates a token', function() {
        var results = simulateTokenInput(this.component, 'o');
        var secondItem = results[1].getDOMNode().innerText;
        var node = this.component.refs.typeahead.refs.entry.getDOMNode();
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_DOWN });
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_DOWN });
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_RETURN });
        var Tokens = getTokens(this.component);
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
        var Tokens = getTokens(this.component);
        assert.equal(Tokens[0].props.children, firstItem);
      });

      it('should remove a token when BKSPC is pressed on an empty input', function() {
        // Select two items
        simulateTokenInput(this.component, 'o');
        var entry = this.component.refs.typeahead.refs.entry.getDOMNode();
        TestUtils.Simulate.keyDown(entry, { keyCode: Keyevent.DOM_VK_DOWN });
        TestUtils.Simulate.keyDown(entry, { keyCode: Keyevent.DOM_VK_RETURN });

        simulateTokenInput(this.component, 'o');
        TestUtils.Simulate.keyDown(entry, { keyCode: Keyevent.DOM_VK_DOWN });
        TestUtils.Simulate.keyDown(entry, { keyCode: Keyevent.DOM_VK_DOWN });
        TestUtils.Simulate.keyDown(entry, { keyCode: Keyevent.DOM_VK_RETURN });

        // re-set the typeahead entry
        var results = getTokens(this.component);
        var startLength = results.length;
        assert.equal(entry.value, "");
        assert.equal(startLength, 2);
        assert.equal(startLength, results.length);

        // Now press backspace with the empty entry
        TestUtils.Simulate.keyDown(entry, { keyCode: Keyevent.DOM_VK_BACK_SPACE });
        results = getTokens(this.component);
        assert.equal(results.length + 1, startLength);
      });

      it('should not remove a token on BKSPC when input is not empty', function() {
        var input = this.component.refs.typeahead.refs.entry.getDOMNode();
        var startLength = getTokens(this.component).length;

        input.value = "hello";
        TestUtils.Simulate.change(input);
        TestUtils.Simulate.keyDown(input, { keyCode: Keyevent.DOM_VK_BACK_SPACE });

        results = getTokens(this.component);
        assert.equal(startLength , results.length);
      });

      it('tab to choose first item', function() {
        var results = simulateTokenInput(this.component, 'o');
        var itemText = results[0].getDOMNode().innerText;
        var node = this.component.refs.typeahead.refs.entry.getDOMNode();
        var tokens = getTokens(this.component);

        // Need to check Token list for props.children
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_TAB });

        var newTokens = getTokens(this.component)
        assert.equal(tokens.length, newTokens.length - 1);
        assert.equal(newTokens[newTokens.length - 1].props.children, itemText);
      });

      it('tab to selected current item', function() {
        var results = simulateTokenInput(this.component, 'o');
        var itemText = results[1].getDOMNode().innerText;
        var node = this.component.refs.typeahead.refs.entry.getDOMNode();
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_DOWN });
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_DOWN });
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_TAB });
        var tokens = getTokens(this.component);
        assert.equal(tokens[tokens.length - 1].props.children, itemText);
      });
    });

  });

  describe('AllowCustomValues property test', function() {
    var tokenLength = 4;

    beforeEach(function() {
      this.sinon = sinon.sandbox.create();
      this.tokenAdd = this.sinon.spy();
      this.tokenRemove = this.sinon.spy();


      this.component = TestUtils.renderIntoDocument(
        <Tokenizer
          options={BEATLES}
          onTokenAdd={this.tokenAdd}
          onTokenRemove={this.tokenRemove}
          allowCustomValues={tokenLength}
          customClasses={{
            customAdd: 'topcoat-custom__token'
          }}
        />
      );
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
      assert(this.tokenAdd.calledWith( "abzz" ))
    })

    it('should call onTokenRemove for custom token', function() {
      var results = simulateTokenInput(this.component, "abzz");
      var input = this.component.refs.typeahead.refs.entry.getDOMNode();
      var tokens = getTokens(this.component);

      TestUtils.Simulate.keyDown(input, {keyCode: Keyevent.DOM_VK_DOWN})
      TestUtils.Simulate.keyDown(input, {keyCode: Keyevent.DOM_VK_RETURN})

      assert(this.tokenAdd.called);
      assert(this.tokenAdd.calledWith( "abzz" ))

      tokens = getTokens(this.component);
      var tokenClose = TestUtils.scryRenderedDOMComponentsWithTag(tokens[0], "a")[0].getDOMNode();
      TestUtils.Simulate.click(tokenClose);
      assert(this.tokenRemove.called);
      assert(this.tokenRemove.calledWith("abzz"));
    })

    it('should not return undefined for a custom token when not selected', function() {
      var results = simulateTokenInput(this.component, "abzz");
      var input = this.component.refs.typeahead.refs.entry.getDOMNode();
      var tokens = getTokens(this.component);
      TestUtils.Simulate.keyDown(input, {keyCode: Keyevent.DOM_VK_TAB})

      var newTokens = getTokens(this.component)
      // behavior is custom token is selected
      assert(tokens.length < newTokens.length);
      assert(input.value == "");
      assert.equal(newTokens[0].props.children, "abzz");
    })

    it('should not select value for a custom token when too short', function() {
      var results = simulateTokenInput(this.component, "abz");
      var input = this.component.refs.typeahead.refs.entry.getDOMNode();
      var tokens = getTokens(this.component);
      TestUtils.Simulate.keyDown(input, {keyCode: Keyevent.DOM_VK_TAB})

      var newTokens = getTokens(this.component)
      // behavior is custom token is selected
      assert(newTokens.length == 0);
      assert(input.value == "abz");
    })
  })

});
