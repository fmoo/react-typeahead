import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Encapsulates the rendering of an option that has been "selected" in a
 * TypeaheadTokenizer
 */
class Token extends Component {
  constructor(props) {
    super(props);
  }

  _renderHiddenInput() {
    // If no name was set, don't create a hidden input
    if (!this.props.name) {
      return null;
    }

    return (
      <input
        type="hidden"
        name={ this.props.name + '[]' }
        value={ this.props.value || this.props.object }
      />
    );
  }

  _renderCloseButton() {
    if (!this.props.onRemove) {
      return '';
    }

    return (
      <a className="typeahead-token-close" href="#" onClick={(event => {
          this.props.onRemove(this.props.object);
          event.preventDefault();
        })}>&#x00d7;</a>
    );
  }

  render() {
    const className = classNames([
      'typeahead-token',
      this.props.className
    ]);

    return (
      <div className={className}>
        {this._renderHiddenInput()}
        {this.props.children}
        {this._renderCloseButton()}
      </div>
    );
  }
}

Token.propTypes = {
  className: React.PropTypes.string,
  name: React.PropTypes.string,
  children: React.PropTypes.string,
  object: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.object,
  ]),
  onRemove: React.PropTypes.func,
  value: React.PropTypes.string
}

export default Token;
