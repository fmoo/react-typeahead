var _ = require('lodash');
var assert = require('chai').assert;
var sinon = require('sinon');
var React = require('react/addons');
var Typeahead = require('../src/typeahead');
var TypeaheadOption = require('../src/typeahead/option');
var TypeaheadSelector = require('../src/typeahead/selector');
var Keyevent = require('../src/keyevent');
var TestUtils = React.addons.TestUtils;

function simulateTextInput(component, value) {
  var node = component.refs.entry;
  node.value = value;
  TestUtils.Simulate.change(node);
  return TestUtils.scryRenderedComponentsWithType(component, TypeaheadOption);
}

var BEATLES = ['John', 'Paul', 'George', 'Ringo'];

var BEATLES_COMPLEX = [
  {
    firstName: 'John',
    lastName: 'Lennon',
    nameWithTitle: 'John Winston Ono Lennon MBE'
  }, {
    firstName: 'Paul',
    lastName: 'McCartney',
    nameWithTitle: 'Sir James Paul McCartney MBE'
  }, {
    firstName: 'George',
    lastName: 'Harrison',
    nameWithTitle: 'George Harrison MBE'
  }, {
    firstName: 'Ringo',
    lastName: 'Starr',
    nameWithTitle: 'Richard Starkey Jr. MBE'
  }
];

describe('Typeahead Component', function() {

  describe('sanity', function() {
    beforeEach(function() {
      this.component = TestUtils.renderIntoDocument(<Typeahead options={
        BEATLES
      } />);
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
        var results = simulateTextInput(this.component, value);
        assert.equal(results.length, expected, 'Text input: ' + value);
      }, this);
    });

    it('does not change the url hash when clicking on options', function() {
      var results = simulateTextInput(this.component, 'o');
      var firstResult = results[0];
      var anchor = TestUtils.findRenderedDOMComponentWithTag(firstResult, 'a');
      var href = anchor.getDOMNode().getAttribute('href');
      assert.notEqual(href, '#');
    });

    describe('keyboard controls', function() {
      it('down arrow + return selects an option', function() {
        var results = simulateTextInput(this.component, 'o');
        var secondItem = results[1].getDOMNode().innerText;
        var node = this.component.refs.entry;
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_DOWN });
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_DOWN });
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_RETURN });
        assert.equal(node.value, secondItem); // Poor Ringo
      });

      it('up arrow + return navigates and selects an option', function() {
        var results = simulateTextInput(this.component, 'o');
        var firstItem = results[0].getDOMNode().innerText;
        var node = this.component.refs.entry;
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_DOWN });
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_DOWN });
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_UP });
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_RETURN });
        assert.equal(node.value, firstItem);
      });

      it('escape clears selection', function() {
        var results = simulateTextInput(this.component, 'o');
        var firstItem = results[0].getDOMNode();
        var node = this.component.refs.entry;
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_DOWN });
        assert.ok(firstItem.classList.contains('hover'));
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_ESCAPE });
        assert.notOk(firstItem.classList.contains('hover'));
      });

      it('tab to choose first item', function() {
        var results = simulateTextInput(this.component, 'o');
        var itemText = results[0].getDOMNode().innerText;
        var node = this.component.refs.entry;
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_TAB });
        assert.equal(node.value, itemText);
      });

      it('tab to selected current item', function() {
        var results = simulateTextInput(this.component, 'o');
        var itemText = results[1].getDOMNode().innerText;
        var node = this.component.refs.entry;
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_DOWN });
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_DOWN });
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_TAB });
        assert.equal(node.value, itemText);
      });

      it('tab on no selection should not be undefined', function() {
        var results = simulateTextInput(this.component, 'oz');
        assert(results.length == 0);
        var node = this.component.refs.entry;
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_TAB });
        assert.equal("oz", node.value);
      });

      it('should set hover', function() {
        var results = simulateTextInput(this.component, 'o');
        var node = this.component.refs.entry;
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_DOWN });
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_DOWN });
        assert.equal(true, results[1].props.hover);
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
        var node = React.findDOMNode(this.component.refs.entry);
        this.sinon.spy(node, 'focus');
        this.component.focus();
        assert.equal(node.focus.calledOnce, true);
      });
    });
  });

  describe('props', function() {
    context('maxVisible', function() {
      it('limits the result set based on the maxVisible option', function() {
        var component = TestUtils.renderIntoDocument(<Typeahead
          options={ BEATLES }
          maxVisible={ 1 }
          ></Typeahead>);
        var results = simulateTextInput(component, 'o');
        assert.equal(results.length, 1);
      });
    });

    context('displayOption', function() {
      it('renders simple options verbatim when not specified', function() {
        var component = TestUtils.renderIntoDocument(<Typeahead
          options={ BEATLES }
        />);
        var results = simulateTextInput(component, 'john');
        assert.equal(results[0].getDOMNode().textContent, 'John');
      });

      it('renders custom options when specified as a string', function() {
        var component = TestUtils.renderIntoDocument(<Typeahead
          options={ BEATLES_COMPLEX }
          filterOption='firstName'
          displayOption='nameWithTitle'
        />);
        var results = simulateTextInput(component, 'john');
        assert.equal(results[0].getDOMNode().textContent, 'John Winston Ono Lennon MBE');
      });

      it('renders custom options when specified as a function', function() {
        var component = TestUtils.renderIntoDocument(<Typeahead
          options={ BEATLES_COMPLEX }
          filterOption='firstName'
          displayOption={ function(o, i) { return i + ' ' + o.firstName + ' ' + o.lastName; } }
        />);
        var results = simulateTextInput(component, 'john');
        assert.equal(results[0].getDOMNode().textContent, '0 John Lennon');
      });
    });

    context('allowCustomValues', function() {

      beforeEach(function() {
        this.sinon = sinon.sandbox.create()
        this.selectSpy = this.sinon.spy();
        this.component = TestUtils.renderIntoDocument(<Typeahead
          options={BEATLES}
          allowCustomValues={3}
          onOptionSelected={this.selectSpy}
          ></Typeahead>);
      });

      afterEach(function() {
        this.sinon.restore();
      })

      it('should not display custom value if input length is less than entered', function() {
        var input = this.component.refs.entry;
        input.value = "zz";
        TestUtils.Simulate.change(input);
        var results = TestUtils.scryRenderedComponentsWithType(this.component, TypeaheadOption);
        assert.equal(0, results.length);
        assert.equal(false, this.selectSpy.called);
      });

      it('should display custom value if input exceeds props.allowCustomValues', function() {
        var input = this.component.refs.entry;
        input.value = "ZZZ";
        TestUtils.Simulate.change(input);
        var results = TestUtils.scryRenderedComponentsWithType(this.component, TypeaheadOption);
        assert.equal(1, results.length);
        assert.equal(false, this.selectSpy.called);
      });

      it('should call onOptionSelected when selecting from options', function() {
        var results = simulateTextInput(this.component, 'o');
        var firstItem = results[0].getDOMNode().innerText;
        var node = this.component.refs.entry;
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_DOWN });
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_DOWN });
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_UP });
        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_RETURN });

        assert.equal(true, this.selectSpy.called);
        assert(this.selectSpy.calledWith(firstItem));
      })

      it('should call onOptionSelected when custom value is selected', function() {
        var input = this.component.refs.entry;
        input.value = "ZZZ";
        TestUtils.Simulate.change(input);
        TestUtils.Simulate.keyDown(input, { keyCode: Keyevent.DOM_VK_DOWN });
        TestUtils.Simulate.keyDown(input, { keyCode: Keyevent.DOM_VK_RETURN });
        assert.equal(true, this.selectSpy.called);
        assert(this.selectSpy.calledWith(input.value));
      })

      it('should add hover prop to customValue', function() {
        var input = this.component.refs.entry;
        input.value = "ZZZ";
        TestUtils.Simulate.change(input);
        var results = TestUtils.scryRenderedComponentsWithType(this.component, TypeaheadOption);
        TestUtils.Simulate.keyDown(input, { keyCode: Keyevent.DOM_VK_DOWN });
        assert.equal(true, results[0].props.hover)
      })


    });

    context('customClasses', function() {

      before(function() {
        var customClasses = {
          input: 'topcoat-text-input',
          results: 'topcoat-list__container',
          listItem: 'topcoat-list__item',
          listAnchor: 'topcoat-list__link',
          hover: 'topcoat-list__item-active'
        };

        this.component = TestUtils.renderIntoDocument(<Typeahead
          options={ BEATLES }
          customClasses={ customClasses }
        ></Typeahead>);

        simulateTextInput(this.component, 'o');
      });

      it('adds a custom class to the typeahead input', function() {
        var input = this.component.refs.entry.getDOMNode();
        assert.isTrue(input.classList.contains('topcoat-text-input'));
      });

      it('adds a custom class to the results component', function() {
        var results = TestUtils.findRenderedComponentWithType(this.component, TypeaheadSelector).getDOMNode();
        assert.isTrue(results.classList.contains('topcoat-list__container'));
      });

      it('adds a custom class to the list items', function() {
        var typeaheadOptions = TestUtils.scryRenderedComponentsWithType(this.component, TypeaheadOption);
        var listItem = typeaheadOptions[1].getDOMNode();
        assert.isTrue(listItem.classList.contains('topcoat-list__item'));
      });

      it('adds a custom class to the option anchor tags', function() {
        var typeaheadOptions = TestUtils.scryRenderedComponentsWithType(this.component, TypeaheadOption);
        var listAnchor = typeaheadOptions[1].refs.anchor.getDOMNode();
        assert.isTrue(listAnchor.classList.contains('topcoat-list__link'));
      });

      it('adds a custom class to the list items when active', function() {
        var typeaheadOptions = TestUtils.scryRenderedComponentsWithType(this.component, TypeaheadOption);
        var node = this.component.refs.entry;

        TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_DOWN });

        var listItem = typeaheadOptions[0];
        var domListItem = listItem.getDOMNode();

        assert.isTrue(domListItem.classList.contains('topcoat-list__item-active'));
      });
    });

    context('defaultValue', function() {
      it('should perform an initial search if a default value is provided', function() {
        var component = TestUtils.renderIntoDocument(<Typeahead
          options={ BEATLES }
          defaultValue={ 'o' }
        />);

        var results = TestUtils.scryRenderedComponentsWithType(component, TypeaheadOption);
        assert.equal(results.length, 3);
      });
    });

    context('value', function() {
      it('should set input value', function() {
        var component = TestUtils.renderIntoDocument(<Typeahead
          options={ BEATLES }
          value={ 'John' }
        />);

        var input = component.refs.entry;
        assert.equal(input.value, 'John');
      });
    });

    context('onKeyDown', function() {
      it('should bind to key events on the input', function() {
        var component = TestUtils.renderIntoDocument(<Typeahead
          options={ BEATLES }
          onKeyDown={ function(e) {
              assert.equal(e.keyCode, 87);
            }
          }
        />);

        var input = component.refs.entry;
        TestUtils.Simulate.keyDown(input, { keyCode: 87 });
      });
    });

    context('onKeyUp', function() {
      it('should bind to key events on the input', function() {
        var component = TestUtils.renderIntoDocument(<Typeahead
          options={ BEATLES }
          onKeyUp={ function(e) {
              assert.equal(e.keyCode, 87);
            }
          }
        />);

        var input = component.refs.entry;
        TestUtils.Simulate.keyUp(input, { keyCode: 87 });
      });
    });

    context('onClick', function() {
      it('should bind to input', function() {
        var component = TestUtils.renderIntoDocument(<Typeahead
          options={ BEATLES }
          onClick={ function(e) {
              assert.equal(e.constructor.name, 'SyntheticEvent');
            }
          }
        />);

        var input = component.refs.entry.getDOMNode();
        TestUtils.Simulate.click(input);
      });
    });

    context('inputProps', function() {
      it('should forward props to the input element', function() {
        var component = TestUtils.renderIntoDocument(<Typeahead
          options={ BEATLES }
          inputProps={{ autoCorrect: 'off' }}
        />);

        var input = component.refs.entry;
        assert.equal(input.props.autoCorrect, 'off');
      });
    });

    context('defaultClassNames', function() {
      it('should remove default classNames when this prop is specified and false', function() {
        var component = TestUtils.renderIntoDocument(<Typeahead
          options={ BEATLES }
          defaultClassNames={false}
        />);
        simulateTextInput(component, 'o');

        assert.notOk(component.getDOMNode().classList.contains("typeahead"));
        assert.notOk(component.refs.sel.getDOMNode().classList.contains("typeahead-selector"));
      });
    });

    context('filterOption', function() {
      var FN_TEST_PLANS = [
        {
          name: 'accepts everything',
          fn: function() { return true; },
          input: 'xxx',
          output: 4
        }, {
          name: 'rejects everything',
          fn: function() { return false; },
          input: 'o',
          output: 0
        }
      ];

      _.each(FN_TEST_PLANS, function(testplan) {
        it('should filter with a custom function that ' + testplan.name, function() {
          var component = TestUtils.renderIntoDocument(<Typeahead
            options={ BEATLES }
            filterOption={ testplan.fn }
          />);

          var results = simulateTextInput(component, testplan.input);
          assert.equal(results.length, testplan.output);
        });
      });

      var STRING_TEST_PLANS = {
        'o': 3,
        'pa': 1,
        'Grg': 1,
        'Ringo': 1,
        'xxx': 0
      };

      it('should filter using fuzzy matching on the provided field name', function() {
        var component = TestUtils.renderIntoDocument(<Typeahead
          options={ BEATLES_COMPLEX }
          filterOption='firstName'
          displayOption='firstName'
        />);

        _.each(STRING_TEST_PLANS, function(expected, value) {
          var results = simulateTextInput(component, value);
          assert.equal(results.length, expected, 'Text input: ' + value);
        }, this);
      });
    });

    context('formInputOption', function() {
      var FORM_INPUT_TEST_PLANS = [
        {
          name: 'uses simple options verbatim when not specified',
          props: {
            options: BEATLES
          },
          output: 'John'
        }, {
          name: 'defaults to the display string when not specified',
          props: {
            options: BEATLES_COMPLEX,
            filterOption: 'firstName',
            displayOption: 'nameWithTitle'
          },
          output: 'John Winston Ono Lennon MBE'
        }, {
          name: 'uses custom options when specified as a string',
          props: {
            options: BEATLES_COMPLEX,
            filterOption: 'firstName',
            displayOption: 'nameWithTitle',
            formInputOption: 'lastName'
          },
          output: 'Lennon'
        }, {
          name: 'uses custom optinos when specified as a function',
          props: {
            options: BEATLES_COMPLEX,
            filterOption: 'firstName',
            displayOption: 'nameWithTitle',
            formInputOption: function(o, i) { return o.firstName + ' ' + o.lastName; }
          },
          output: 'John Lennon'
        }
      ];

      _.each(FORM_INPUT_TEST_PLANS, function(testplan) {
        it(testplan.name, function() {
          var component = TestUtils.renderIntoDocument(<Typeahead
            {...testplan.props}
            name='beatles'
          />);
          var results = simulateTextInput(component, 'john');

          var node = component.refs.entry;
          TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_DOWN });
          TestUtils.Simulate.keyDown(node, { keyCode: Keyevent.DOM_VK_RETURN });

          assert.equal(component.state.selection, testplan.output);
        });
      });
    });

    context('customListComponent', function() {
      before(function() {
        ListComponent = React.createClass({
          render: function() {
            return <div></div>;
          }
        });

        this.ListComponent = ListComponent;
      })

      beforeEach(function() {

        this.component = TestUtils.renderIntoDocument(
          <Typeahead
            options={ BEATLES }
            customListComponent={this.ListComponent}/>
        );
      });

      it('should not show the customListComponent when the input is empty', function() {
        var results = TestUtils.scryRenderedComponentsWithType(this.component, this.ListComponent);
        assert.equal(0, results.length);
      });

      it('should show the customListComponent when the input is not empty', function() {
        var input = this.component.refs.entry;
        input.value = "o";
        TestUtils.Simulate.change(input);
        var results = TestUtils.scryRenderedComponentsWithType(this.component, this.ListComponent);
        assert.equal(1, results.length);
      });

      it('should no longer show the customListComponent after an option has been selected', function() {
        var input = this.component.refs.entry;
        input.value = "o";
        TestUtils.Simulate.change(input);
        TestUtils.Simulate.keyDown(input, { keyCode: Keyevent.DOM_VK_TAB });
        var results = TestUtils.scryRenderedComponentsWithType(this.component, this.ListComponent);
        assert.equal(0, results.length);
      });
    });

    context('textarea', function() {
      it('should render a <textarea> input', function() {
        var component = TestUtils.renderIntoDocument(<Typeahead
          options={ BEATLES }
          textarea={ true }
        />);

        var input = component.refs.entry.getDOMNode();
        assert.equal(input.tagName.toLowerCase(), 'textarea');
      });

      it('should render a <input> input', function() {
        var component = TestUtils.renderIntoDocument(<Typeahead
          options={ BEATLES }
        />);

        var input = component.refs.entry.getDOMNode();
        assert.equal(input.tagName.toLowerCase(), 'input');
      });
    })
  });
});
