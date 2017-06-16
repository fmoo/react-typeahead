import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Accessor from '../accessor';
import Token from './token';
import KeyEvent from '../keyevent';
import Typeahead from '../typeahead';
import classNames from 'classnames';

const _arraysAreDifferent = (array1, array2) => {
  if (array1.length != array2.length){
    return true;
  }
  for (var i = array2.length - 1; i >= 0; i--) {
    if (array2[i] !== array1[i]){
      return true;
    }
  }
}

/**
 * A typeahead that, when an option is selected, instead of simply filling
 * the text entry widget, prepends a renderable "token", that may be deleted
 * by pressing backspace on the beginning of the line with the keyboard.
 */
class TypeaheadTokenizer extends Component {

  static defaultProps = {
      options: [],
      defaultSelected: [],
      customClasses: {},
      allowCustomValues: 0,
      initialValue: '',
      placeholder: '',
      disabled: false,
      inputProps: {},
      defaultClassNames: true,
      filterOption: null,
      searchOptions: null,
      displayOption: (token) => token,
      formInputOption: null,
      onKeyDown: (event) => {},
      onKeyPress: (event) => {},
      onKeyUp: (event) => {},
      onFocus: (event) => {},
      onBlur: (event) => {},
      onTokenAdd: () => {},
      onTokenRemove: () => {}
  }

  constructor(props, defaultProps) {
    super(props, defaultProps);

    this.state = {
      // We need to copy this to avoid incorrect sharing
      // of state across instances (e.g., via getDefaultProps())
      selected: props.defaultSelected.slice(0)
    }
  }

  componentWillReceiveProps(nextProps) {
    // if we get new defaultProps, update selected
    if (_arraysAreDifferent(this.props.defaultSelected, nextProps.defaultSelected)){
      this.setState({
        selected: nextProps.defaultSelected.slice(0)
      });
    }
  }

  focus() {
    this.typeahead.focus();
  }

  getSelectedTokens() {
    return this.state.selected;
  }

  // TODO: Support initialized tokens
  //
  _renderTokens() {
    let tokenClasses = {};
    tokenClasses[this.props.customClasses.token] = !!this.props.customClasses.token;

    const classList = classNames(tokenClasses);

    return this.state.selected.map(selected => {
      const displayString = Accessor.valueForOption(this.props.displayOption, selected);
      const value = Accessor.valueForOption(this.props.formInputOption || this.props.displayOption, selected);

      return (
        <Token 
          key={displayString} 
          className={classList}
          onRemove={this._removeTokenForValue}
          object={selected}
          value={value}
          name={this.props.name}>
          {displayString}
        </Token>
      );
    });
  }

  _getOptionsForTypeahead() {
    // return this.props.options without this.selected
    return this.props.options;
  }

  _onKeyDown = (event) => {
    // We only care about intercepting backspaces
    if (event.keyCode === KeyEvent.DOM_VK_BACK_SPACE) {
      return this._handleBackspace(event);
    }

    this.props.onKeyDown(event);
  }

  _handleBackspace = (event) => {
    // No tokens
    if (!this.state.selected.length) {
      return;
    }

    // Remove token ONLY when bksp pressed at beginning of line
    // without a selection
    const entry = this.typeahead.entry;

    if (entry.selectionStart == entry.selectionEnd && entry.selectionStart == 0) {
      this._removeTokenForValue(this.state.selected[this.state.selected.length - 1]);
      event.preventDefault();
    }
  }

  _removeTokenForValue(value) {
    var index = this.state.selected.indexOf(value);
    if (index == -1) {
      return;
    }

    this.state.selected.splice(index, 1);
    this.setState({
      selected: this.state.selected
    });
    this.props.onTokenRemove(value);
    return;
  }

  _addTokenForValue = (value) => {
    if (this.state.selected.indexOf(value) != -1) {
      return;
    }

    this.state.selected.push(value);
    this.setState({
      selected: this.state.selected
    });
    this.typeahead.setEntryText('');
    this.typeahead.entry.blur();
    this.typeahead.entry.focus();
    this.props.onTokenAdd(value);
  }

  render() {
    let classes = {};
    classes[this.props.customClasses.typeahead] = !!this.props.customClasses.typeahead;

    const classList = classNames(classes);
    let tokenizerClasses = [this.props.defaultClassNames && "typeahead-tokenizer"];
    tokenizerClasses[this.props.className] = !!this.props.className;

    const tokenizerClassList = classNames(tokenizerClasses)

    return (
      <div className={tokenizerClassList}>
        { this._renderTokens() }
        <Typeahead 
          ref={typeahead => this.typeahead = typeahead}
          className={classList}
          placeholder={this.props.placeholder}
          disabled={this.props.disabled}
          inputProps={this.props.inputProps}
          allowCustomValues={this.props.allowCustomValues}
          customClasses={this.props.customClasses}
          options={this._getOptionsForTypeahead()}
          initialValue={this.props.initialValue}
          maxVisible={this.props.maxVisible}
          resultsTruncatedMessage={this.props.resultsTruncatedMessage}
          onOptionSelected={this._addTokenForValue}
          onKeyDown={this._onKeyDown}
          onKeyPress={this.props.onKeyPress}
          onKeyUp={this.props.onKeyUp}
          onFocus={this.props.onFocus}
          onBlur={this.props.onBlur}
          displayOption={this.props.displayOption}
          defaultClassNames={this.props.defaultClassNames}
          filterOption={this.props.filterOption}
          searchOptions={this.props.searchOptions} />
      </div>
    );
  }
}

TypeaheadTokenizer.propTypes = {
  name: PropTypes.string,
  options: PropTypes.array,
  customClasses: PropTypes.object,
  allowCustomValues: PropTypes.number,
  defaultSelected: PropTypes.array,
  initialValue: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  inputProps: PropTypes.object,
  onTokenRemove: PropTypes.func,
  onKeyDown: PropTypes.func,
  onKeyPress: PropTypes.func,
  onKeyUp: PropTypes.func,
  onTokenAdd: PropTypes.func,
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
  formInputOption: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func
  ]),
  maxVisible: PropTypes.number,
  resultsTruncatedMessage: PropTypes.string,
  defaultClassNames: PropTypes.bool
}

export default TypeaheadTokenizer;
