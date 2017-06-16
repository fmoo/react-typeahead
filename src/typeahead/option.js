import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * A single option within the TypeaheadSelector
 */
class TypeaheadOption extends Component {
  constructor(props) {
    super(props);
  }

  getDefaultProps() {
    return {
      customClasses: {},
      onClick: (event) => {
        event.preventDefault();
      }
    };
  }

  _getClasses() {
    let classes = {
      "typeahead-option": true,
    };
    classes[this.props.customClasses.listAnchor] = !!this.props.customClasses.listAnchor;

    return classNames(classes);
  }

  _onClick = event => {
      event.preventDefault();
      return this.props.onClick(event);
  }

  render() {
    let classes = {};
    classes[this.props.customClasses.hover || "hover"] = !!this.props.hover;
    classes[this.props.customClasses.listItem] = !!this.props.customClasses.listItem;

    if (this.props.customValue) {
      classes[this.props.customClasses.customAdd] = !!this.props.customClasses.customAdd;
    }

    const classList = classNames(classes);

    return (
      <li className={classList} onClick={this._onClick}>
        <a href="javascript: void 0;" className={this._getClasses()} ref="anchor">
          { this.props.children }
        </a>
      </li>
    );
  }
}

TypeaheadOption.propTypes = {
  customClasses: PropTypes.object,
  customValue: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.string,
  hover: PropTypes.bool
};

export default TypeaheadOption;
