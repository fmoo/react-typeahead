var React = require('react');
var classNames = require('classnames');
var createReactClass = require('create-react-class');
var PropTypes = require('prop-types');

/**
 * Encapsulates the rendering of an option that has been "selected" in a
 * TypeaheadTokenizer
 */
var Token = createReactClass({
  propTypes: {
    className: PropTypes.string,
    name: PropTypes.string,
    children: PropTypes.string,
    object: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ]),
    onRemove: PropTypes.func,
    value: PropTypes.string
  },

  render: function() {
    var className = classNames([
      "typeahead-token",
      this.props.className
    ]);

    return (
      <div className={className}>
        {this._renderHiddenInput()}
        {this.props.children}
        {this._renderCloseButton()}
      </div>
    );
  },

  _renderHiddenInput: function() {
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
  },

  _renderCloseButton: function() {
    if (!this.props.onRemove) {
      return "";
    }
    return (
      <a className={this.props.className || "typeahead-token-close"} href="#" onClick={function(event) {
          this.props.onRemove(this.props.object);
          event.preventDefault();
        }.bind(this)}>&#x00d7;</a>
    );
  }
});

module.exports = Token;
