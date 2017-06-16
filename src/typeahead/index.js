import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Accessor from '../accessor';
import TypeaheadSelector from './selector';
import KeyEvent from '../keyevent';
import fuzzy from 'fuzzy';

/**
 * A "typeahead", an auto-completing text input
 *
 * Renders an text input that shows options nearby that you can use the
 * keyboard or mouse to select.  Requires CSS for MASSIVE DAMAGE.
 */

class Typeahead extends Component {

  static defaultProps = {
    options: [],
    customClasses: {},
    allowCustomValues: 0,
    initialValue: '',
    value: '',
    placeholder: '',
    disabled: false,
    textarea: false,
    inputProps: {},
    onOptionSelected: (option) => {},
    onChange: (event) => {},
    onKeyDown: (event) => {},
    onKeyPress: (event) => {},
    onKeyUp: (event) => {},
    onFocus: (event) => {},
    onBlur: (event) => {},
    filterOption: null,
    searchOptions: null,
    inputDisplayOption: null,
    defaultClassNames: true,
    customListComponent: TypeaheadSelector,
    showOptionsWhenEmpty: false,
    resultsTruncatedMessage: null
  }

  constructor(props, defaultProps) {
    super(props, defaultProps);

    this.state = {
      // The options matching the entry value
      searchResults: this.getOptionsForValue(props.initialValue, props.options),

      // This should be called something else, "entryValue"
      entryValue: props.value || props.initialValue,

      // A valid typeahead value
      selection: props.value,

      // Index of the selection
      selectionIndex: null,

      // Keep track of the focus state of the input element, to determine
      // whether to show options when empty (if showOptionsWhenEmpty is true)
      isFocused: false,

      // true when focused, false onOptionSelected
      showResults: false
    }
  }

  _shouldSkipSearch(input) {
    var emptyValue = !input || input.trim().length == 0;

    // this.state must be checked because it may not be defined yet if this function
    // is called from within getInitialState
    var isFocused = this.state && this.state.isFocused;
    return !(this.props.showOptionsWhenEmpty && isFocused) && emptyValue;
  }


  getOptionsForValue(value, options) {
    if (this._shouldSkipSearch(value)) { return []; }

    const searchOptions = this._generateSearchFunction();
    return searchOptions(value, options);
  }

  setEntryText(value) {
    this.entry.value = value;
    this._onTextEntryUpdated();
  }

  focus(){
    this.entry.focus()
  }

  _hasCustomValue() {
    if (this.props.allowCustomValues > 0 &&
      this.state.entryValue.length >= this.props.allowCustomValues &&
      this.state.searchResults.indexOf(this.state.entryValue) < 0) {
      return true;
    }

    return false;
  }

  _getCustomValue() {
    if (this._hasCustomValue()) {
      return this.state.entryValue;
    }
    return null;
  }

  _renderIncrementalSearchResults() {
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
        ref={sel => this.sel = sel}
        options={this.props.maxVisible ? this.state.searchResults.slice(0, this.props.maxVisible) : this.state.searchResults}
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
  }

  getSelection() {
    let index = this.state.selectionIndex;

    if (this._hasCustomValue()) {
      if (index === 0) {
        return this.state.entryValue;
      } else {
        index--;
      }
    }

    return this.state.searchResults[index];
  }

  _onOptionSelected = (option, event) => {
    const nEntry = this.entry;
    nEntry.focus();

    const displayOption = Accessor.generateOptionToStringFor(this.props.inputDisplayOption || this.props.displayOption);
    const optionString = displayOption(option, 0);

    const formInputOption = Accessor.generateOptionToStringFor(this.props.formInputOption || displayOption);
    const formInputOptionString = formInputOption(option);

    nEntry.value = optionString;

    this.setState({
      searchResults: this.getOptionsForValue(optionString, this.props.options),
      selection: formInputOptionString,
      entryValue: optionString,
      showResults: false
    });

    return this.props.onOptionSelected(option, event);
  }

  _onTextEntryUpdated = () => {
    const value = this.entry.value;

    this.setState({
      searchResults: this.getOptionsForValue(value, this.props.options),
      selection: '',
      entryValue: value
    });
  }

  _onEnter = (event) => {
    const selection = this.getSelection();

    if (!selection) {
      return this.props.onKeyDown(event);
    }

    return this._onOptionSelected(selection, event);
  }

  _onEscape = () => {
    this.setState({
      selectionIndex: null
    });
  }

  _onTab = (event) => {
    const selection = this.getSelection();
    let option = selection 
      ? selection 
      : (this.state.searchResults.length > 0 ? this.state.searchResults[0] : null);

    if (option === null && this._hasCustomValue()) {
      option = this._getCustomValue();
    }

    if (option !== null) {
      return this._onOptionSelected(option, event);
    }
  }

  eventMap(event) {
    var events = {};

    events[KeyEvent.DOM_VK_UP] = this.navUp;
    events[KeyEvent.DOM_VK_DOWN] = this.navDown;
    events[KeyEvent.DOM_VK_RETURN] = events[KeyEvent.DOM_VK_ENTER] = this._onEnter;
    events[KeyEvent.DOM_VK_ESCAPE] = this._onEscape;
    events[KeyEvent.DOM_VK_TAB] = this._onTab;

    return events;
  }

  _nav(delta) {
    if (!this._hasHint()) {
      return;
    }

    let newIndex = this.state.selectionIndex === null ? (delta == 1 ? 0 : delta) : this.state.selectionIndex + delta;
    let length = this.props.maxVisible ? this.state.searchResults.slice(0, this.props.maxVisible).length : this.state.searchResults.length;

    if (this._hasCustomValue()) {
      length += 1;
    }

    if (newIndex < 0) {
      newIndex += length;
    } else if (newIndex >= length) {
      newIndex -= length;
    }

    this.setState({
      selectionIndex: newIndex
    });
  }

  navDown = () => {
    this._nav(1);
  }

  navUp = () => {
    this._nav(-1);
  }

  _onChange = (event) => {
    if (this.props.onChange) {
      this.props.onChange(event);
    }

    this._onTextEntryUpdated();
  }

  _onKeyDown = (event) => {
    // If there are no visible elements, don't perform selector navigation.
    // Just pass this up to the upstream onKeydown handler.
    // Also skip if the user is pressing the shift key, since none of our handlers are looking for shift
    if (!this._hasHint() || event.shiftKey) {
      return this.props.onKeyDown(event);
    }

    const handler = this.eventMap()[event.keyCode];

    if (handler) {
      handler(event);
    } else {
      return this.props.onKeyDown(event);
    }
    // Don't propagate the keystroke back to the DOM/browser
    event.preventDefault();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      searchResults: this.getOptionsForValue(this.state.entryValue, nextProps.options)
    });
  }

  _onFocus = (event) => {
    this.setState({
      isFocused: true, 
      showResults: true
    }, () => this._onTextEntryUpdated());

    if ( this.props.onFocus ) {
      return this.props.onFocus(event);
    }
  }

  _onBlur = (event) => {
    this.setState({
      isFocused: false
    }, () => this._onTextEntryUpdated());

    if ( this.props.onBlur ) {
      return this.props.onBlur(event);
    }
  }

  _renderHiddenInput() {
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
  }

  _generateSearchFunction() {
    const searchOptionsProp = this.props.searchOptions;
    const filterOptionProp = this.props.filterOption;

    if (typeof searchOptionsProp === 'function') {
      if (filterOptionProp !== null) {
        console.warn('searchOptions prop is being used, filterOption prop will be ignored');
      }
      return searchOptionsProp;
    } else if (typeof filterOptionProp === 'function') {
      return (value, options) => options.filter((o) => filterOptionProp(value, o));
    } else {
      const mapper = typeof filterOptionProp === 'string'
        ? Accessor.generateAccessor(filterOptionProp)
        : Accessor.IDENTITY_FN
      
      return (value, options) => fuzzy
          .filter(value, options, { extract: mapper })
          .map((res) => options[res.index]);
    }
  }

  _hasHint() {
    return this.state.searchResults.length > 0 || this._hasCustomValue();
  }

  render() {
    let inputClasses = {};
    inputClasses[this.props.customClasses.input] = !!this.props.customClasses.input;
    const inputClassList = classNames(inputClasses);

    let classes = {
      typeahead: this.props.defaultClassNames
    };
    classes[this.props.className] = !!this.props.className;
    const classList = classNames(classes);

    const InputElement = this.props.textarea ? 'textarea' : 'input';

    return (
      <div className={classList}>
        { this._renderHiddenInput() }
        <InputElement 
          ref={entry => this.entry = entry}
          type="text"
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
  }
}

Typeahead.propTypes = {
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
};

export default Typeahead;
