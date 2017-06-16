import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import TypeaheadOption from './option';

/**
 * Container for the options rendered as part of the autocompletion process
 * of the typeahead
 */
class TypeaheadSelector extends Component {
  constructor(props) {
    super(props);
  }

  getDefaultProps() {
    return {
      selectionIndex: null,
      customClasses: {},
      allowCustomValues: 0,
      customValue: null,
      onOptionSelected: function(option) { },
      defaultClassNames: true
    };
  }

   _onClick = (result, event) => {
    return this.props.onOptionSelected(result, event);
  }

  render() {
    // Don't render if there are no options to display
    if (!this.props.options.length && this.props.allowCustomValues <= 0) {
      return false;
    }

    let classes = {
      "typeahead-selector": this.props.defaultClassNames
    };
    classes[this.props.customClasses.results] = this.props.customClasses.results;
    const classList = classNames(classes);

    // CustomValue should be added to top of results list with different class name
    let customValue = null;
    let customValueOffset = 0;
    if (this.props.customValue !== null) {
      customValueOffset++;
      customValue = (
        <TypeaheadOption ref={this.props.customValue} key={this.props.customValue}
          hover={this.props.selectionIndex === 0}
          customClasses={this.props.customClasses}
          customValue={this.props.customValue}
          onClick={this._onClick.bind(this, this.props.customValue)}>
          { this.props.customValue }
        </TypeaheadOption>
      );
    }

    const results = this.props.options.map((result, i) => {
      var displayString = this.props.displayOption(result, i);
      var uniqueKey = displayString + '_' + i;
      return (
        <TypeaheadOption ref={uniqueKey} key={uniqueKey}
          hover={this.props.selectionIndex === i + customValueOffset}
          customClasses={this.props.customClasses}
          onClick={this._onClick.bind(this, result)}>
          { displayString }
        </TypeaheadOption>
      );
    }, this);

    if (this.props.areResultsTruncated && this.props.resultsTruncatedMessage !== null) {
      var resultsTruncatedClasses = {
        "results-truncated": this.props.defaultClassNames
      };
      resultsTruncatedClasses[this.props.customClasses.resultsTruncated] = this.props.customClasses.resultsTruncated;
      var resultsTruncatedClassList = classNames(resultsTruncatedClasses);

      results.push(
        <li key="results-truncated" className={resultsTruncatedClassList}>
          {this.props.resultsTruncatedMessage}
        </li>
      );
    }

    return (
      <ul className={classList}>
        { customValue }
        { results }
      </ul>
    );
  }

}

TypeaheadSelector.propTypes = {
  options: PropTypes.array,
  allowCustomValues: PropTypes.number,
  customClasses: PropTypes.object,
  customValue: PropTypes.string,
  selectionIndex: PropTypes.number,
  onOptionSelected: PropTypes.func,
  displayOption: PropTypes.func.isRequired,
  defaultClassNames: PropTypes.bool,
  areResultsTruncated: PropTypes.bool,
  resultsTruncatedMessage: PropTypes.string
}


export default TypeaheadSelector;
