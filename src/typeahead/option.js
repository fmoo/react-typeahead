/**
 * @jsx React.DOM
 */

var React = window.React || require('react');

/**
 * A single option within the TypeaheadSelector
 */
var TypeaheadOption = React.createClass({
  propTypes: {
    onClick: React.PropTypes.func,
    children: React.PropTypes.string
  },

  getDefaultProps: function() {
    return {
      onClick: function() { return false; }
    };
  },

  getInitialState: function() {
    return {
      hover: false
    };
  },

  render: function() {
    return (
      <div>
        <a href="#" className={this._getClasses()} onClick={this._onClick}>
          { this.props.children }
        </a>
      </div>
    );
  },

  _getClasses: function() {
    var classes = ["typeahead-option"];
    if (this.props.hover) {
      classes.push("hover");
    }
    if (this.props.customClass) {
      classes.push(this.props.customClass);
    }
    return classes.join(' ');
  },

  _onClick: function(e) {
    return this.props.onClick();
  }
});


module.exports = TypeaheadOption;
