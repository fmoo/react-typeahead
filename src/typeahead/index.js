/**
 * @jsx React.DOM
 */

var React = window.React || require('react');
var TypeaheadSelector = require('./selector');
var KeyEvent = require('../keyevent');
var fuzzy = require('fuzzy');

/**
 * A "typeahead", an auto-completing text input
 *
 * Renders an text input that shows options nearby that you can use the
 * keyboard or mouse to select.  Requires CSS for MASSIVE DAMAGE.
 */
var Typeahead = React.createClass({
  propTypes: {
    maxVisible: React.PropTypes.number,
    options: React.PropTypes.array,
    defaultValue: React.PropTypes.string,
    onOptionSelected: React.PropTypes.func,
    onKeyDown: React.PropTypes.func
  },

  getDefaultProps: function() {
    return {
      options: [],
      defaultValue: "",
      onKeyDown: function(event) { return true; },
      onOptionSelected: function(option) { }
    };
  },

  getInitialState: function() {
    // We sort the options initially, so that shorter results match first
    var sortedOptions = this.props.options.slice();
    sortedOptions.sort(function(a, b) {
      return a.length - b.length;
    });

    return {
      // The set of all options... Does this need to be state?  I guess for lazy load...
      options: sortedOptions,

      // The currently visible set of options
      visible: this.getOptionsForValue(this.props.defaultValue, this.props.options),

      // This should be called something else, "entryValue"
      entryValue: this.props.defaultValue,

      // A valid typeahead value
      selection: null
    };
  },

  getOptionsForValue: function(value, options) {
    // TODO: add a prop for maximumVisible
    var result = fuzzy.filter(value, options).map(function(res) {
      return res.string;
    });

    if (this.props.maxVisible) {
      result = result.slice(0, this.props.maxVisible);
    }
    return result;
  },

  setEntryText: function(value) {
    this.refs.entry.getDOMNode().value = value;
    this._onTextEntryUpdated();
  },

  _renderIncrementalSearchResults: function() {
    // Nothing has been entered into the textbox
    if (!this.state.entryValue) {
      return "";
    }

    // Something was just selected
    if (this.state.selection) {
      return "";
    }

    // There are no typeahead / autocomplete suggestions
    if (!this.state.visible.length) {
      return "";
    }

    return (
      <TypeaheadSelector
        ref="sel" options={ this.state.visible }
        onOptionSelected={ this._onOptionSelected }
        customclassName={this.props.customOptionClass} />
   );
  },

  _onOptionSelected: function(option) {
    var nEntry = this.refs.entry.getDOMNode();
    nEntry.focus();
    nEntry.value = option;
    this.setState({visible: this.getOptionsForValue(option, this.state.options),
                   selection: option,
                   entryValue: option});
    this.props.onOptionSelected(option);
  },

  _onTextEntryUpdated: function() {
    var value = this.refs.entry.getDOMNode().value;
    this.setState({visible: this.getOptionsForValue(value, this.state.options),
                   selection: null,
                   entryValue: value});
    return false;
  },

  _onKeyDown: function(event) {
    // If there are no visible elements, don't perform selector navigation.
    // Just pass this up to the upstream onKeydown handler
    if (!this.refs.sel) {
      return this.props.onKeyDown(event);
    }

    if (event.keyCode == KeyEvent.DOM_VK_UP) {
      this.refs.sel.navUp();
    } else if (event.keyCode == KeyEvent.DOM_VK_DOWN) {
      this.refs.sel.navDown();
    } else if (event.keyCode == KeyEvent.DOM_VK_RETURN ||
               event.keyCode == KeyEvent.DOM_VK_ENTER) {
      if (!this.refs.sel.state.selection) {
        return this.props.onKeyDown(event);
      }
      this._onOptionSelected(this.refs.sel.state.selection);
    } else if (event.keyCode == KeyEvent.DOM_VK_ESCAPE) {
      this.refs.sel.setSelectionIndex(null);
    } else {
      return this.props.onKeyDown(event);
    }
    // Don't propagate the keystroke back to the DOM/browser
    return false;
  },

  render: function() {
    var classList = this.props.customInputClass || "";
    return (
      <div className="typeahead">
        <input ref="entry" type="text" defaultValue={this.state.entryValue}
          className={classList}
          onChange={ this._onTextEntryUpdated } onKeyDown={this._onKeyDown} />
        { this._renderIncrementalSearchResults() }
      </div>
    );
  }
});

module.exports = Typeahead;
