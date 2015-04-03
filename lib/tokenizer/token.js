/**
 * @jsx React.DOM
 */

var React = window.React || require('react');

/**
 * Encapsulates the rendering of an option that has been "selected" in a
 * TypeaheadTokenizer
 */
var Token = React.createClass({displayName: "Token",
  propTypes: {
    className: React.PropTypes.string,
    name: React.PropTypes.string,
    children: React.PropTypes.string,
    onRemove: React.PropTypes.func
  },

  render: function() {
    var className = React.addons.classSet(
      "typeahead-token",
      this.props.className
    );

    return (
      React.createElement("div", {className: className}, 
        this._renderHiddenInput(), 
        this.props.children, 
        this._renderCloseButton()
      )
    );
  },

  _renderHiddenInput: function() {
    // If no name was set, don't create a hidden input
    if (!this.props.name) {
      return null;
    }

    return (
      React.createElement("input", {
        type: "hidden", 
        name:  this.props.name + '[]', 
        value:  this.props.children}
      )
    );
  },

  _renderCloseButton: function() {
    if (!this.props.onRemove) {
      return "";
    }
    return (
      React.createElement("a", {className: "typeahead-token-close", href: "#", onClick: function(event) {
          this.props.onRemove(this.props.children);
          event.preventDefault();
        }.bind(this)}, "×")
    );
  }
});

module.exports = Token;
