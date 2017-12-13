var Accessor = require('../accessor');
var React = require('react');
var TypeaheadSelector = require('./selector');
var KeyEvent = require('../keyevent');
var fuzzy = require('fuzzy');
var classNames = require('classnames');
var createReactClass = require('create-react-class');
var PropTypes = require('prop-types');

/**
 * A "typeahead", an auto-completing text input
 *
 * Renders an text input that shows options nearby that you can use the
 * keyboard or mouse to select.  Requires CSS for MASSIVE DAMAGE.
 */
var Typeahead = createReactClass({
  propTypes: {
    name: PropTypes.string,
    customClasses: PropTypes.object,
    maxVisible: PropTypes.number,
    resultsTruncatedMessage: PropTypes.string,
    options: PropTypes.array,
    allowCustomValues: PropTypes.number,
    initialValue: PropTypes.string,
    value: PropTypes.string,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    textarea: PropTypes.bool,
    inputProps: PropTypes.object,
    onOptionSelected: PropTypes.func,
    onChange: PropTypes.func,
    onKeyDown: PropTypes.func,
    onKeyPress: PropTypes.func,
    onKeyUp: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    filterOption: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func
    ]),
    searchOptions: PropTypes.func,
    displayOption: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func
    ]),
    inputDisplayOption: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func
    ]),
    formInputOption: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func
    ]),
    defaultClassNames: PropTypes.bool,
    customListComponent: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.func
    ]),
    showOptionsWhenEmpty: PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      options: [],
      customClasses: {},
      allowCustomValues: 0,
      initialValue: "",
      value: "",
      placeholder: "",
      disabled: false,
      textarea: false,
      inputProps: {},
      onOptionSelected: function(option) {},
      onChange: function(event) {},
      onKeyDown: function(event) {},
      onKeyPress: function(event) {},
      onKeyUp: function(event) {},
      onFocus: function(event) {},
      onBlur: function(event) {},
      filterOption: null,
      searchOptions: null,
      inputDisplayOption: null,
      defaultClassNames: true,
      customListComponent: TypeaheadSelector,
      showOptionsWhenEmpty: false,
      resultsTruncatedMessage: null
    };
  },

  getInitialState: function() {
    return {
      // The options matching the entry value
      searchResults: this.getOptionsForValue(this.props.initialValue, this.props.options),

      // This should be called something else, "entryValue"
      entryValue: this.props.value || this.props.initialValue,

      // A valid typeahead value
      selection: this.props.value,

      // Index of the selection
      selectionIndex: null,

      // Keep track of the focus state of the input element, to determine
      // whether to show options when empty (if showOptionsWhenEmpty is true)
      isFocused: false,

      // true when focused, false onOptionSelected
      showResults: false
    };
  },

  _shouldSkipSearch: function(input) {
    var emptyValue = !input || input.trim().length == 0;

    // this.state must be checked because it may not be defined yet if this function
    // is called from within getInitialState
    var isFocused = this.state && this.state.isFocused;
    return !(this.props.showOptionsWhenEmpty && isFocused) && emptyValue;
  },

  getOptionsForValue: function(value, options) {
    if (this._shouldSkipSearch(value)) { return []; }

    var searchOptions = this._generateSearchFunction();
    return searchOptions(value, options);
  },

  setEntryText: function(value) {
    this.refs.entry.value = value;
    this._onTextEntryUpdated();
  },

  focus: function(){
    this.refs.entry.focus()
  },

  _hasCustomValue: function() {
    if (this.props.allowCustomValues > 0 &&
      this.state.entryValue.length >= this.props.allowCustomValues &&
      this.state.searchResults.indexOf(this.state.entryValue) < 0) {
      return true;
    }
    return false;
  },

  _getCustomValue: function() {
    if (this._hasCustomValue()) {
      return this.state.entryValue;
    }
    return null;
  },

  _renderIncrementalSearchResults: function() {
    // Nothing has been entered into the textbox
    if (this._shouldSkipSearch(this.state.entryValue)) {
      return "";
    }

    // Something was just selected
    if (this.state.selection) {
      return "";
    }

    return (
      <this.props.customListComponent
        ref="sel" options={this.props.maxVisible ? this.state.searchResults.slice(0, this.props.maxVisible) : this.state.searchResults}
        areResultsTruncated={this.props.maxVisible && this.state.searchResults.length > this.props.maxVisible}
        resultsTruncatedMessage={this.props.resultsTruncatedMessage}
        onOptionSelected={this._onOptionSelected}
        allowCustomValues={this.props.allowCustomValues}
        customValue={this._getCustomValue()}
        customClasses={this.props.customClasses}
        selectionIndex={this.state.selectionIndex}
        defaultClassNames={this.props.defaultClassNames}
        displayOption={Accessor.generateOptionToStringFor(this.props.displayOption)} />
    );
  },

  getSelection: function() {
    var index = this.state.selectionIndex;
    if (this._hasCustomValue()) {
      if (index === 0) {
        return this.state.entryValue;
      } else {
        index--;
      }
    }
    return this.state.searchResults[index];
  },

  _onOptionSelected: function(option, event) {
    var nEntry = this.refs.entry;
    nEntry.focus();

    var displayOption = Accessor.generateOptionToStringFor(this.props.inputDisplayOption || this.props.displayOption);
    var optionString = displayOption(option, 0);

    var formInputOption = Accessor.generateOptionToStringFor(this.props.formInputOption || displayOption);
    var formInputOptionString = formInputOption(option);

    nEntry.value = optionString;
    this.setState({searchResults: this.getOptionsForValue(optionString, this.props.options),
                   selection: formInputOptionString,
                   entryValue: optionString,
                   showResults: false});
    return this.props.onOptionSelected(option, event);
  },

  _onTextEntryUpdated: function() {
    var value = this.refs.entry.value;
    this.setState({searchResults: this.getOptionsForValue(value, this.props.options),
                   selection: '',
                   entryValue: value});
  },

  _onEnter: function(event) {
    var selection = this.getSelection();
    if (!selection) {
      return this.props.onKeyDown(event);
    }
    return this._onOptionSelected(selection, event);
  },

  _onEscape: function() {
    this.setState({
      selectionIndex: null
    });
  },

  _onTab: function(event) {
    var selection = this.getSelection();
    var option = selection ?
      selection : (this.state.searchResults.length > 0 ? this.state.searchResults[0] : null);

    if (option === null && this._hasCustomValue()) {
      option = this._getCustomValue();
    }

    if (option !== null) {
      return this._onOptionSelected(option, event);
    }
  },

  eventMap: function(event) {
    var events = {};

    events[KeyEvent.DOM_VK_UP] = this.navUp;
    events[KeyEvent.DOM_VK_DOWN] = this.navDown;
    events[KeyEvent.DOM_VK_RETURN] = events[KeyEvent.DOM_VK_ENTER] = this._onEnter;
    events[KeyEvent.DOM_VK_ESCAPE] = this._onEscape;
    events[KeyEvent.DOM_VK_TAB] = this._onTab;

    return events;
  },

  _nav: function(delta) {
    if (!this._hasHint()) {
      return;
    }
    var newIndex = this.state.selectionIndex === null ? (delta == 1 ? 0 : delta) : this.state.selectionIndex + delta;
    var length = this.props.maxVisible ? this.state.searchResults.slice(0, this.props.maxVisible).length : this.state.searchResults.length;
    if (this._hasCustomValue()) {
      length += 1;
    }

    if (newIndex < 0) {
      newIndex += length;
    } else if (newIndex >= length) {
      newIndex -= length;
    }

    this.setState({selectionIndex: newIndex});
  },

  navDown: function() {
    this._nav(1);
  },

  navUp: function() {
    this._nav(-1);
  },

  _onChange: function(event) {
    if (this.props.onChange) {
      this.props.onChange(event);
    }

    this._onTextEntryUpdated();
  },

  _onKeyDown: function(event) {
    // If there are no visible elements, don't perform selector navigation.
    // Just pass this up to the upstream onKeydown handler.
    // Also skip if the user is pressing the shift key, since none of our handlers are looking for shift
    if (!this._hasHint() || event.shiftKey) {
      return this.props.onKeyDown(event);
    }

    var handler = this.eventMap()[event.keyCode];

    if (handler) {
      handler(event);
    } else {
      return this.props.onKeyDown(event);
    }
    // Don't propagate the keystroke back to the DOM/browser
    event.preventDefault();
  },

  componentWillReceiveProps: function(nextProps) {
    var searchResults = this.getOptionsForValue(this.state.entryValue, nextProps.options);
    var showResults = Boolean(searchResults.length) && this.state.isFocused;
    this.setState({
      searchResults: searchResults,
      showResults: showResults
    });
  },

  render: function() {
    var inputClasses = {};
    inputClasses[this.props.customClasses.input] = !!this.props.customClasses.input;
    var inputClassList = classNames(inputClasses);

    var classes = {
      typeahead: this.props.defaultClassNames
    };
    classes[this.props.className] = !!this.props.className;
    var classList = classNames(classes);

    var InputElement = this.props.textarea ? 'textarea' : 'input';
    return (
      <div className={classList}>
        { this._renderHiddenInput() }
        <InputElement ref="entry" type="text"
          disabled={this.props.disabled}
          {...this.props.inputProps}
          placeholder={this.props.placeholder}
          className={inputClassList}
          value={this.state.entryValue}
          onChange={this._onChange}
          onKeyDown={this._onKeyDown}
          onKeyPress={this.props.onKeyPress}
          onKeyUp={this.props.onKeyUp}
          onFocus={this._onFocus}
          onBlur={this._onBlur}
        />
        { this.state.showResults && this._renderIncrementalSearchResults() }
      </div>
    );
  },

  _onFocus: function(event) {
    this.setState({isFocused: true, showResults: true}, function () {
      this._onTextEntryUpdated();
    }.bind(this));
    if ( this.props.onFocus ) {
      return this.props.onFocus(event);
    }
  },

  _onBlur: function(event) {
    this.setState({isFocused: false}, function () {
      this._onTextEntryUpdated();
    }.bind(this));
    if ( this.props.onBlur ) {
      return this.props.onBlur(event);
    }
  },

  _renderHiddenInput: function() {
    if (!this.props.name) {
      return null;
    }

    return (
      <input
        type="hidden"
        name={ this.props.name }
        value={ this.state.selection }
      />
    );
  },

  _generateSearchFunction: function() {
    var searchOptionsProp = this.props.searchOptions;
    var filterOptionProp = this.props.filterOption;
    if (typeof searchOptionsProp === 'function') {
      if (filterOptionProp !== null) {
        console.warn('searchOptions prop is being used, filterOption prop will be ignored');
      }
      return searchOptionsProp;
    } else if (typeof filterOptionProp === 'function') {
      return function(value, options) {
        return options.filter(function(o) { return filterOptionProp(value, o); });
      };
    } else {
      var mapper;
      if (typeof filterOptionProp === 'string') {
        mapper = Accessor.generateAccessor(filterOptionProp);
      } else {
        mapper = Accessor.IDENTITY_FN;
      }
      return function(value, options) {
        return fuzzy
          .filter(value, options, {extract: mapper})
          .map(function(res) { return options[res.index]; });
      };
    }
  },

  _hasHint: function() {
    return this.state.searchResults.length > 0 || this._hasCustomValue();
  }
});

module.exports = Typeahead;
