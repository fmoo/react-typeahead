/**
 * @jsx React.DOM
 */

var React = window.React || require('react');

/**
 * Encapsulates the rendering of an option that has been "selected" in a
 * TypeaheadTokenizer
 */
var Token = React.createClass({
  propTypes: {
    children: React.PropTypes.string,
    onRemove: React.PropTypes.func
  },

  render: function() {
    return (
      <div {...this.props} className="typeahead-token">
        {this.props.children}
        {this._makeCloseButton()}
      </div>
    );
  },

  _makeCloseButton: function() {
    if (!this.props.onRemove) {
      return "";
    }
    return (
      <a className="typeahead-token-close" href="#" onClick={function(event) {
          this.props.onRemove(this.props.children);
          event.preventDefault();
        }.bind(this)}>&#x00d7;</a>
    );
  }
});

module.exports = Token;
