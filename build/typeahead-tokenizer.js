/** @jsx React.DOM */

/**
 * Bullshit PolyFills
 */
var KeyEvent = KeyEvent || {};
KeyEvent.DOM_VK_UP = KeyEvent.DOM_VK_UP || 38;
KeyEvent.DOM_VK_DOWN = KeyEvent.DOM_VK_DOWN || 40;
KeyEvent.DOM_VK_BACK_SPACE = KeyEvent.DOM_VK_BACK_SPACE || 8;
KeyEvent.DOM_VK_RETURN = KeyEvent.DOM_VK_RETURN || 13;
KeyEvent.DOM_VK_ENTER = KeyEvent.DOM_VK_ENTER || 14;
KeyEvent.DOM_VK_ESCAPE = KeyEvent.DOM_VK_ESCAPE || 27;


var Typeahead = React.createClass({displayName: 'Typeahead',
  propTypes: {
    // TODO: maxVisible: React.PropTypes.number,
    options: React.PropTypes.array,
    defaultValue: React.PropTypes.string,
    onOptionSelected: React.PropTypes.func,
    onKeyDown: React.PropTypes.func,
  },

  getDefaultProps: function() {
    return {
      options: [],
      defaultValue: "",
      onKeyDown: function(event) { return true; },
      onOptionSelected: function(option) { }
    };
  },

  getInitialState: function() {
    // We sort the options initially, so that shorter results match first
    var sortedOptions = this.props.options.slice();
    sortedOptions.sort(function(a, b) {
      return a.length - b.length;
    });

    return {
      // The set of all options... Does this need to be state?  I guess for lazy load...
      'options': sortedOptions,

      // The currently visible set of options
      'visible': this.getOptionsForValue(this.props.defaultValue, this.props.options),

      // This should be called something else, "entryValue"
      'entryValue': this.props.defaultValue,

      // A valid typeahead value
      'selection': null,
    };
  },

  getOptionsForValue: function(value, options) {
    // TODO: add a prop for maximumVisible
    var result = options.filter(function(option) {
      return option.indexOf(value) != -1;
    }.bind(this));
    return result;
  },

  setEntryText: function(value) {
    this.refs.entry.getDOMNode().value = value;
    this._onTextEntryUpdated();
  },

  _renderIncrementalSearchResults: function() {
    if (!this.state.entryValue) {
      return "";
    }
    if (this.state.selection) {
      return "";
    }

    return TypeaheadSelector( {ref:"sel", options:this.state.visible, 
              onOptionSelected: this._onOptionSelected } );
  },

  _onOptionSelected: function(option) {
    var nEntry = this.refs.entry.getDOMNode();
    nEntry.focus();
    nEntry.value = option;
    this.setState({visible: this.getOptionsForValue(option, this.state.options),
                   selection: option,
                   entryValue: option});
    this.props.onOptionSelected(option);
  },

  _onTextEntryUpdated: function() {
    var value = this.refs.entry.getDOMNode().value;
    this.setState({visible: this.getOptionsForValue(value, this.state.options),
                   selection: null,
                   entryValue: value});
    return false;
  },

  _onKeyDown: function(event) {
    // If there are no visible elements, don't perform selector navigation.
    // Just pass this up to the upstream onKeydown handler
    if (!this.refs.sel) {
      return this.props.onKeyDown(event);
    }

    if (event.keyCode == KeyEvent.DOM_VK_UP) {
      this.refs.sel.navUp();
    } else if (event.keyCode == KeyEvent.DOM_VK_DOWN) {
      this.refs.sel.navDown();
    } else if (event.keyCode == KeyEvent.DOM_VK_RETURN ||
               event.keyCode == KeyEvent.DOM_VK_ENTER) {
      if (!this.refs.sel.state.selection) {
        return this.props.onKeyDown(event);
      }
      this._onOptionSelected(this.refs.sel.state.selection);
    } else if (event.keyCode == KeyEvent.DOM_VK_ESCAPE) {
      this.refs.sel.setSelectionIndex(null);
    } else {
      return this.props.onKeyDown(event);
    }
    // Don't propagate the keystroke back to the DOM/browser 
    return false;
  },

  render: function() {
    return React.DOM.div(null, 
      React.DOM.input( {ref:"entry", type:"text", defaultValue:this.state.entryValue,
        onChange: this._onTextEntryUpdated,  onKeyDown:this._onKeyDown} ),
       this._renderIncrementalSearchResults() 
    );
  }
});

var TypeaheadSelector = React.createClass({displayName: 'TypeaheadSelector',
  propTypes: {
    options: React.PropTypes.array,
    selectionIndex: React.PropTypes.number,
    onOptionSelected: React.PropTypes.func,
  },

  getDefaultProps: function() {
    return {
      selectionIndex: null
    };
  },

  getInitialState: function() {
    return {
      selectionIndex: this.props.selectionIndex,
      selection: this.getSelectionForIndex(this.props.selectionIndex),
    };
  },

  render: function() {
    var i = 0;
    var results = this.props.options.map(function(result) {
      return TypeaheadOption( {ref:result, key:result, onClick:function() {
          if (this.props.onOptionSelected) {
            this.props.onOptionSelected(result);
          }
          return false;
        }.bind(this)}, 
         result 
      );
    }.bind(this));
    return React.DOM.div(null,  results );
  },

  setSelectionIndex: function(index) {
    this.setState({
      selectionIndex: index,
      selection: this.getSelectionForIndex(index),
    });
  },

  getSelectionForIndex: function(index) {
    if (index === null) {
      return null;
    }
    return this.props.options[index];
  },

  _nav: function(delta) {
    if (!this.props.options) {
      return; 
    }
    var newIndex;
    if (this.state.selectionIndex === null) {
      if (delta == 1) {
        newIndex = 0;
      } else {
        newIndex = delta;
      }
    } else {
      newIndex = this.state.selectionIndex + delta;
      this.refs[this.state.selection].setHover(false);
    }
    if (newIndex < 0) {
      newIndex += this.props.options.length;
    } else if (newIndex >= this.props.options.length) {
      newIndex -= this.props.options.length;
    }
    var newSelection = this.getSelectionForIndex(newIndex);
    this.refs[this.getSelectionForIndex(newIndex)].setHover(true);
    this.setState({selectionIndex: newIndex,
                   selection: newSelection});
  },

  navDown: function() {
    this._nav(1);
  },

  navUp: function() {
    this._nav(-1);
  }

});

var TypeaheadOption = React.createClass({displayName: 'TypeaheadOption',
  propTypes: {
    onClick: React.PropTypes.func,
    children: React.PropTypes.string,
  },

  getDefaultProps: function() {
    return {
      onClick: function() { return false; }
    };
  },

  getInitialState: function() {
    return {
      hover: false,
    };
  },

  render: function() {
    return React.DOM.div(null, React.DOM.a( {href:"#", className:this._getClasses(), onClick:this._onClick}, 
       this.props.children 
    ));
  },

  setHover: function(hover) {
    this.setState({hover: hover});
  },

  _getClasses: function() {
    var classes = "typeahead-option";
    if (this.state.hover) {
      classes += " hover";
    }
    return classes;
  },

  _onClick: function() {
    return this.props.onClick();
  }
});


var Token = React.createClass({displayName: 'Token',
  propTypes: {
    children: React.PropTypes.string,
    onRemove: React.PropTypes.func,
  },

  render: function() {
    return React.DOM.div(null, 
      this.props.children,
      this._makeCloseButton()
    );
  },

  _makeCloseButton: function() {
    if (!this.props.onRemove) {
      console.log("NO ONREMOVE FUNCTION");
      return "";
    }
    return 
      React.DOM.a( {className:"token-close", href:"#", onClick:function() {
          this.props.onRemove(this.props.children);
          return true;
        }}, 
" x "      );
  }
});


var TypeaheadTokenizer = React.createClass({displayName: 'TypeaheadTokenizer',
  propTypes: {
    options: React.PropTypes.array,
    defaultSelected: React.PropTypes.array,
    defaultValue: React.PropTypes.string
  },

  getInitialState: function() {
    return {
      selected: this.props.defaultSelected
    };
  },

  getDefaultProps: function() {
    return {
      options: [],
      defaultSelected: [],
      defaultValue: ""
    };
  },

  // TODO: Support initialized tokens
  //
  _renderTokens: function() {
    var result = this.state.selected.map(function(selected) {
      return Token( {key: selected,  onRemove: this._removeTokenForValue },  selected );
    }.bind(this));
    return result;
  },

  _getOptionsForTypeahead: function() {
    // return this.props.options without this.selected
    return this.props.options
  },

  _onKeyDown: function(event) {
    if (event.keyCode == KeyEvent.DOM_VK_BACK_SPACE) {
      // If there are no tokens, abort early
      if (!this.state.selected.length) {
        return true;
      }

      // Remove token ONLY when bksp pressed at beginning of line
      // without a selection
      var entry = this.refs.typeahead.refs.entry.getDOMNode();
      if (entry.selectionStart == entry.selectionEnd &&
          entry.selectionStart == 0) {
        this._removeTokenForValue(
          this.state.selected[this.state.selected.length-1]);
        return false;
      }
      return true;
    }
    return true;
  },

  _removeTokenForValue: function(value) {
    var index = this.state.selected.indexOf(value);
    if (index == -1) {
      return false;
    }

    this.state.selected.splice(index, 1);
    this.setState({selected: this.state.selected});
    return false;
  },

  _addTokenForValue: function(value) {
    if (this.state.selected.indexOf(value) != -1) {
      return;
    }
    this.state.selected.push(value);
    this.setState({selected: this.state.selected});
    this.refs.typeahead.setEntryText("");
  },

  render: function() {
    return React.DOM.div(null, 
       this._renderTokens(), 
      Typeahead( {ref:"typeahead", options:this._getOptionsForTypeahead(),
        defaultValue:this.props.defaultValue, 
        onOptionSelected:this._addTokenForValue, 
        onKeyDown:this._onKeyDown} )
    )
  }
});
