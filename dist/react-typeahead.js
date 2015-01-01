!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.ReactTypeahead=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * Fuzzy
 * https://github.com/myork/fuzzy
 *
 * Copyright (c) 2012 Matt York
 * Licensed under the MIT license.
 */

(function() {

var root = this;

var fuzzy = {};

// Use in node or in browser
if (typeof exports !== 'undefined') {
  module.exports = fuzzy;
} else {
  root.fuzzy = fuzzy;
}

// Return all elements of `array` that have a fuzzy
// match against `pattern`.
fuzzy.simpleFilter = function(pattern, array) {
  return array.filter(function(string) {
    return fuzzy.test(pattern, string);
  });
};

// Does `pattern` fuzzy match `string`?
fuzzy.test = function(pattern, string) {
  return fuzzy.match(pattern, string) !== null;
};

// If `pattern` matches `string`, wrap each matching character
// in `opts.pre` and `opts.post`. If no match, return null
fuzzy.match = function(pattern, string, opts) {
  opts = opts || {};
  var patternIdx = 0
    , result = []
    , len = string.length
    , totalScore = 0
    , currScore = 0
    // prefix
    , pre = opts.pre || ''
    // suffix
    , post = opts.post || ''
    // String to compare against. This might be a lowercase version of the
    // raw string
    , compareString =  opts.caseSensitive && string || string.toLowerCase()
    , ch, compareChar;

  pattern = opts.caseSensitive && pattern || pattern.toLowerCase();

  // For each character in the string, either add it to the result
  // or wrap in template if its the next string in the pattern
  for(var idx = 0; idx < len; idx++) {
    ch = string[idx];
    if(compareString[idx] === pattern[patternIdx]) {
      ch = pre + ch + post;
      patternIdx += 1;

      // consecutive characters should increase the score more than linearly
      currScore += 1 + currScore;
    } else {
      currScore = 0;
    }
    totalScore += currScore;
    result[result.length] = ch;
  }

  // return rendered string if we have a match for every char
  if(patternIdx === pattern.length) {
    return {rendered: result.join(''), score: totalScore};
  }

  return null;
};

// The normal entry point. Filters `arr` for matches against `pattern`.
// It returns an array with matching values of the type:
//
//     [{
//         string:   '<b>lah' // The rendered string
//       , index:    2        // The index of the element in `arr`
//       , original: 'blah'   // The original element in `arr`
//     }]
//
// `opts` is an optional argument bag. Details:
//
//    opts = {
//        // string to put before a matching character
//        pre:     '<b>'
//
//        // string to put after matching character
//      , post:    '</b>'
//
//        // Optional function. Input is an element from the passed in
//        // `arr`, output should be the string to test `pattern` against.
//        // In this example, if `arr = [{crying: 'koala'}]` we would return
//        // 'koala'.
//      , extract: function(arg) { return arg.crying; }
//    }
fuzzy.filter = function(pattern, arr, opts) {
  opts = opts || {};
  return arr
          .reduce(function(prev, element, idx, arr) {
            var str = element;
            if(opts.extract) {
              str = opts.extract(element);
            }
            var rendered = fuzzy.match(pattern, str, opts);
            if(rendered != null) {
              prev[prev.length] = {
                  string: rendered.rendered
                , score: rendered.score
                , index: idx
                , original: element
              };
            }
            return prev;
          }, [])

          // Sort by score. Browsers are inconsistent wrt stable/unstable
          // sorting, so force stable by using the index in the case of tie.
          // See http://ofb.net/~sethml/is-sort-stable.html
          .sort(function(a,b) {
            var compare = b.score - a.score;
            if(compare) return compare;
            return a.index - b.index;
          });
};


}());


},{}],2:[function(require,module,exports){
/**
 * PolyFills make me sad
 */
var KeyEvent = KeyEvent || {};
KeyEvent.DOM_VK_UP = KeyEvent.DOM_VK_UP || 38;
KeyEvent.DOM_VK_DOWN = KeyEvent.DOM_VK_DOWN || 40;
KeyEvent.DOM_VK_BACK_SPACE = KeyEvent.DOM_VK_BACK_SPACE || 8;
KeyEvent.DOM_VK_RETURN = KeyEvent.DOM_VK_RETURN || 13;
KeyEvent.DOM_VK_ENTER = KeyEvent.DOM_VK_ENTER || 14;
KeyEvent.DOM_VK_ESCAPE = KeyEvent.DOM_VK_ESCAPE || 27;
KeyEvent.DOM_VK_TAB = KeyEvent.DOM_VK_TAB || 9;

module.exports = KeyEvent;

},{}],3:[function(require,module,exports){
var Typeahead = require('./typeahead');
var Tokenizer = require('./tokenizer');

module.exports = {
  Typeahead: Typeahead,
  Tokenizer: Tokenizer
};

},{"./tokenizer":4,"./typeahead":6}],4:[function(require,module,exports){
/**
 * @jsx React.DOM
 */

var React = window.React || require('react');
var Token = require('./token');
var KeyEvent = require('../keyevent');
var Typeahead = require('../typeahead');

/**
 * A typeahead that, when an option is selected, instead of simply filling
 * the text entry widget, prepends a renderable "token", that may be deleted
 * by pressing backspace on the beginning of the line with the keyboard.
 */
var TypeaheadTokenizer = React.createClass({displayName: "TypeaheadTokenizer",
  propTypes: {
    options: React.PropTypes.array,
    customClasses: React.PropTypes.object,
    defaultSelected: React.PropTypes.array,
    defaultValue: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    onTokenRemove: React.PropTypes.func,
    onTokenAdd: React.PropTypes.func
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
      customClasses: {},
      defaultValue: "",
      placeholder: "",
      onTokenAdd: function() {},
      onTokenRemove: function() {}
    };
  },

  // TODO: Support initialized tokens
  //
  _renderTokens: function() {
    var tokenClasses = {}
    tokenClasses[this.props.customClasses.token] = !!this.props.customClasses.token;
    var classList = React.addons.classSet(tokenClasses);
    var result = this.state.selected.map(function(selected) {
      return (
        React.createElement(Token, {key: selected, className: classList, 
          onRemove:  this._removeTokenForValue}, 
          selected 
        )
      )
    }, this);
    return result;
  },

  _getOptionsForTypeahead: function() {
    // return this.props.options without this.selected
    return this.props.options;
  },

  _onKeyDown: function(event) {
    // We only care about intercepting backspaces
    if (event.keyCode !== KeyEvent.DOM_VK_BACK_SPACE) {
      return;
    }

    // No tokens
    if (!this.state.selected.length) {
      return;
    }

    // Remove token ONLY when bksp pressed at beginning of line
    // without a selection
    var entry = this.refs.typeahead.refs.entry.getDOMNode();
    if (entry.selectionStart == entry.selectionEnd &&
        entry.selectionStart == 0) {
      this._removeTokenForValue(
        this.state.selected[this.state.selected.length - 1]);
      event.preventDefault();
    }
  },

  _removeTokenForValue: function(value) {
    var index = this.state.selected.indexOf(value);
    if (index == -1) {
      return;
    }

    this.state.selected.splice(index, 1);
    this.setState({selected: this.state.selected});
    this.props.onTokenRemove(this.state.selected);
    return;
  },

  _addTokenForValue: function(value) {
    if (this.state.selected.indexOf(value) != -1) {
      return;
    }
    this.state.selected.push(value);
    this.setState({selected: this.state.selected});
    this.refs.typeahead.setEntryText("");
    this.props.onTokenAdd(this.state.selected);
  },

  render: function() {
    var classes = {}
    classes[this.props.customClasses.typeahead] = !!this.props.customClasses.typeahead;
    var classList = React.addons.classSet(classes);
    return (
      React.createElement("div", null, 
         this._renderTokens(), 
        React.createElement(Typeahead, {ref: "typeahead", 
          className: classList, 
          placeholder: this.props.placeholder, 
          customClasses: this.props.customClasses, 
          options: this._getOptionsForTypeahead(), 
          defaultValue: this.props.defaultValue, 
          onOptionSelected: this._addTokenForValue, 
          onKeyDown: this._onKeyDown})
      )
    )
  }
});

module.exports = TypeaheadTokenizer;

},{"../keyevent":2,"../typeahead":6,"./token":5,"react":"react"}],5:[function(require,module,exports){
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
    children: React.PropTypes.string,
    onRemove: React.PropTypes.func
  },

  render: function() {
    return (
      React.createElement("div", React.__spread({},  this.props, {className: "typeahead-token"}), 
        this.props.children, 
        this._makeCloseButton()
      )
    );
  },

  _makeCloseButton: function() {
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

},{"react":"react"}],6:[function(require,module,exports){
/**
 * @jsx React.DOM
 */

var React = window.React || require('react/addons');
var TypeaheadSelector = require('./selector');
var KeyEvent = require('../keyevent');
var fuzzy = require('fuzzy');

/**
 * A "typeahead", an auto-completing text input
 *
 * Renders an text input that shows options nearby that you can use the
 * keyboard or mouse to select.  Requires CSS for MASSIVE DAMAGE.
 */
var Typeahead = React.createClass({displayName: "Typeahead",
  propTypes: {
    customClasses: React.PropTypes.object,
    maxVisible: React.PropTypes.number,
    options: React.PropTypes.array,
    defaultValue: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    onOptionSelected: React.PropTypes.func,
    onKeyDown: React.PropTypes.func
  },

  getDefaultProps: function() {
    return {
      options: [],
      customClasses: {},
      defaultValue: "",
      placeholder: "",
      onKeyDown: function(event) { return },
      onOptionSelected: function(option) { }
    };
  },

  getInitialState: function() {
    return {
      // The set of all options... Does this need to be state?  I guess for lazy load...
      options: this.props.options,

      // The currently visible set of options
      visible: this.getOptionsForValue(this.props.defaultValue, this.props.options),

      // This should be called something else, "entryValue"
      entryValue: this.props.defaultValue,

      // A valid typeahead value
      selection: null
    };
  },

  getOptionsForValue: function(value, options) {
    var result = fuzzy.filter(value, options).map(function(res) {
      return res.string;
    });

    if (this.props.maxVisible) {
      result = result.slice(0, this.props.maxVisible);
    }
    return result;
  },

  setEntryText: function(value) {
    this.refs.entry.getDOMNode().value = value;
    this._onTextEntryUpdated();
  },

  _renderIncrementalSearchResults: function() {
    // Nothing has been entered into the textbox
    if (!this.state.entryValue) {
      return "";
    }

    // Something was just selected
    if (this.state.selection) {
      return "";
    }

    // There are no typeahead / autocomplete suggestions
    if (!this.state.visible.length) {
      return "";
    }

    return (
      React.createElement(TypeaheadSelector, {
        ref: "sel", options:  this.state.visible, 
        onOptionSelected:  this._onOptionSelected, 
        customClasses: this.props.customClasses})
   );
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
  },

  _onEnter: function(event) {
    if (!this.refs.sel.state.selection) {
      return this.props.onKeyDown(event);
    }
    this._onOptionSelected(this.refs.sel.state.selection);
  },

  _onEscape: function() {
    this.refs.sel.setSelectionIndex(null)
  },

  _onTab: function(event) {
    var option = this.refs.sel.state.selection ?
      this.refs.sel.state.selection : this.state.visible[0];
    this._onOptionSelected(option)
  },

  eventMap: function(event) {
    var events = {};

    events[KeyEvent.DOM_VK_UP] = this.refs.sel.navUp;
    events[KeyEvent.DOM_VK_DOWN] = this.refs.sel.navDown;
    events[KeyEvent.DOM_VK_RETURN] = events[KeyEvent.DOM_VK_ENTER] = this._onEnter;
    events[KeyEvent.DOM_VK_ESCAPE] = this._onEscape;
    events[KeyEvent.DOM_VK_TAB] = this._onTab;

    return events;
  },

  _onKeyDown: function(event) {
    // If there are no visible elements, don't perform selector navigation.
    // Just pass this up to the upstream onKeydown handler
    if (!this.refs.sel) {
      return this.props.onKeyDown(event);
    }

    var handler = this.eventMap()[event.keyCode];

    if (handler) {
      handler(event);
    } else {
      return this.props.onKeyDown(event);
    }
    // Don't propagate the keystroke back to the DOM/browser
    event.preventDefault();
  },

  render: function() {
    var inputClasses = {}
    inputClasses[this.props.customClasses.input] = !!this.props.customClasses.input;
    var inputClassList = React.addons.classSet(inputClasses)

    var classes = {
      typeahead: true
    }
    classes[this.props.className] = !!this.props.className;
    var classList = React.addons.classSet(classes);

    return (
      React.createElement("div", {className: classList}, 
        React.createElement("input", {ref: "entry", type: "text", 
          placeholder: this.props.placeholder, 
          className: inputClassList, defaultValue: this.state.entryValue, 
          onChange: this._onTextEntryUpdated, onKeyDown: this._onKeyDown}), 
         this._renderIncrementalSearchResults() 
      )
    );
  }
});

module.exports = Typeahead;

},{"../keyevent":2,"./selector":8,"fuzzy":1,"react/addons":"react/addons"}],7:[function(require,module,exports){
/**
 * @jsx React.DOM
 */

var React = window.React || require('react/addons');

/**
 * A single option within the TypeaheadSelector
 */
var TypeaheadOption = React.createClass({displayName: "TypeaheadOption",
  propTypes: {
    customClasses: React.PropTypes.object,
    onClick: React.PropTypes.func,
    children: React.PropTypes.string
  },

  getDefaultProps: function() {
    return {
      customClasses: {},
      onClick: function(event) { 
        event.preventDefault(); 
      }
    };
  },

  getInitialState: function() {
    return {
      hover: false
    };
  },

  render: function() {
    var classes = {
      hover: this.props.hover
    }
    classes[this.props.customClasses.listItem] = !!this.props.customClasses.listItem;
    var classList = React.addons.classSet(classes);

    return (
      React.createElement("li", {className: classList, onClick: this._onClick}, 
        React.createElement("a", {href: "#", className: this._getClasses(), ref: "anchor"}, 
           this.props.children
        )
      )
    );
  },

  _getClasses: function() {
    var classes = {
      "typeahead-option": true,
    };
    classes[this.props.customClasses.listAnchor] = !!this.props.customClasses.listAnchor;
    return React.addons.classSet(classes);
  },

  _onClick: function() {
    return this.props.onClick();
  }
});


module.exports = TypeaheadOption;

},{"react/addons":"react/addons"}],8:[function(require,module,exports){
/**
 * @jsx React.DOM
 */

var React = window.React || require('react/addons');
var TypeaheadOption = require('./option');

/**
 * Container for the options rendered as part of the autocompletion process
 * of the typeahead
 */
var TypeaheadSelector = React.createClass({displayName: "TypeaheadSelector",
  propTypes: {
    options: React.PropTypes.array,
    customClasses: React.PropTypes.object,
    selectionIndex: React.PropTypes.number,
    onOptionSelected: React.PropTypes.func
  },

  getDefaultProps: function() {
    return {
      selectionIndex: null,
      customClasses: {},
      onOptionSelected: function(option) { }
    };
  },

  getInitialState: function() {
    return {
      selectionIndex: this.props.selectionIndex,
      selection: this.getSelectionForIndex(this.props.selectionIndex)
    };
  },

  render: function() {
    var classes = {
      "typeahead-selector": true
    };
    classes[this.props.customClasses.results] = this.props.customClasses.results;
    var classList = React.addons.classSet(classes);

    var results = this.props.options.map(function(result, i) {
      return (
        React.createElement(TypeaheadOption, {ref: result, key: result, 
          hover: this.state.selectionIndex === i, 
          customClasses: this.props.customClasses, 
          onClick: this._onClick.bind(this, result)}, 
          result 
        )
      );
    }, this);
    return React.createElement("ul", {className: classList}, results );
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

  _onClick: function(result) {
    this.props.onOptionSelected(result);
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
    }
    if (newIndex < 0) {
      newIndex += this.props.options.length;
    } else if (newIndex >= this.props.options.length) {
      newIndex -= this.props.options.length;
    }
    var newSelection = this.getSelectionForIndex(newIndex);
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

module.exports = TypeaheadSelector;

},{"./option":7,"react/addons":"react/addons"}]},{},[3])(3)
});