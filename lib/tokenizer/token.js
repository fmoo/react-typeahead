var React = require('react');
var classNames = require('classnames');

/**
 * Encapsulates the rendering of an option that has been "selected" in a
 * TypeaheadTokenizer
 */
var Token = React.createClass({
  displayName: 'Token',

  propTypes: {
    className: React.PropTypes.string,
    name: React.PropTypes.string,
    children: React.PropTypes.string,
    object: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.object]),
    onRemove: React.PropTypes.func,
    value: React.PropTypes.string
  },

  render: function () {
    var className = classNames(["typeahead-token", this.props.className]);

    return React.createElement(
      'div',
      { className: className },
      this._renderHiddenInput(),
      this.props.children,
      this._renderCloseButton()
    );
  },

  _renderHiddenInput: function () {
    // If no name was set, don't create a hidden input
    if (!this.props.name) {
      return null;
    }

    return React.createElement('input', {
      type: 'hidden',
      name: this.props.name + '[]',
      value: this.props.value || this.props.object
    });
  },

  _renderCloseButton: function () {
    if (!this.props.onRemove) {
      return "";
    }
    return React.createElement(
      'a',
      { className: 'typeahead-token-close', href: '#', onClick: function (event) {
          this.props.onRemove(this.props.object);
          event.preventDefault();
        }.bind(this) },
      '×'
    );
  }
});

module.exports = Token;