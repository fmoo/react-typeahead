(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"));
	else if(typeof define === 'function' && define.amd)
		define("Typeahead", [], factory);
	else if(typeof exports === 'object')
		exports["Typeahead"] = factory(require("react"));
	else
		root["Typeahead"] = factory(root["React"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
  Copyright (c) 2015 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/

function classNames() {
	var classes = '';
	var arg;

	for (var i = 0; i < arguments.length; i++) {
		arg = arguments[i];
		if (!arg) {
			continue;
		}

		if ('string' === typeof arg || 'number' === typeof arg) {
			classes += ' ' + arg;
		} else if (Object.prototype.toString.call(arg) === '[object Array]') {
			classes += ' ' + classNames.apply(null, arg);
		} else if ('object' === typeof arg) {
			for (var key in arg) {
				if (!arg.hasOwnProperty(key) || !arg[key]) {
					continue;
				}
				classes += ' ' + key;
			}
		}
	}
	return classes.substr(1);
}

// safely export classNames for node / browserify
if (typeof module !== 'undefined' && module.exports) {
	module.exports = classNames;
}

// safely export classNames for RequireJS
if (true) {
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
		return classNames;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
}


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var Accessor = __webpack_require__(3);
var React = __webpack_require__(1);
var TypeaheadSelector = __webpack_require__(7);
var KeyEvent = __webpack_require__(4);
var fuzzy = __webpack_require__(8);
var classNames = __webpack_require__(0);

/**
 * A "typeahead", an auto-completing text input
 *
 * Renders an text input that shows options nearby that you can use the
 * keyboard or mouse to select.  Requires CSS for MASSIVE DAMAGE.
 */
var Typeahead = React.createClass({
  displayName: 'Typeahead',

  propTypes: {
    name: React.PropTypes.string,
    customClasses: React.PropTypes.object,
    maxVisible: React.PropTypes.number,
    resultsTruncatedMessage: React.PropTypes.string,
    options: React.PropTypes.array,
    allowCustomValues: React.PropTypes.number,
    initialValue: React.PropTypes.string,
    value: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    textarea: React.PropTypes.bool,
    inputProps: React.PropTypes.object,
    onOptionSelected: React.PropTypes.func,
    onChange: React.PropTypes.func,
    onKeyDown: React.PropTypes.func,
    onKeyPress: React.PropTypes.func,
    onKeyUp: React.PropTypes.func,
    onFocus: React.PropTypes.func,
    onBlur: React.PropTypes.func,
    filterOption: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.func]),
    searchOptions: React.PropTypes.func,
    displayOption: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.func]),
    inputDisplayOption: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.func]),
    formInputOption: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.func]),
    defaultClassNames: React.PropTypes.bool,
    customListComponent: React.PropTypes.oneOfType([React.PropTypes.element, React.PropTypes.func]),
    showOptionsWhenEmpty: React.PropTypes.bool
  },

  getDefaultProps: function () {
    return {
      options: [],
      customClasses: {},
      allowCustomValues: 0,
      initialValue: "",
      value: "",
      placeholder: "",
      disabled: false,
      textarea: false,
      inputProps: {},
      onOptionSelected: function (option) {},
      onChange: function (event) {},
      onKeyDown: function (event) {},
      onKeyPress: function (event) {},
      onKeyUp: function (event) {},
      onFocus: function (event) {},
      onBlur: function (event) {},
      filterOption: null,
      searchOptions: null,
      inputDisplayOption: null,
      defaultClassNames: true,
      customListComponent: TypeaheadSelector,
      showOptionsWhenEmpty: false,
      resultsTruncatedMessage: null
    };
  },

  getInitialState: function () {
    return {
      // The options matching the entry value
      searchResults: this.getOptionsForValue(this.props.initialValue, this.props.options),

      // This should be called something else, "entryValue"
      entryValue: this.props.value || this.props.initialValue,

      // A valid typeahead value
      selection: this.props.value,

      // Index of the selection
      selectionIndex: null,

      // Keep track of the focus state of the input element, to determine
      // whether to show options when empty (if showOptionsWhenEmpty is true)
      isFocused: false,

      // true when focused, false onOptionSelected
      showResults: false
    };
  },

  _shouldSkipSearch: function (input) {
    var emptyValue = !input || input.trim().length == 0;

    // this.state must be checked because it may not be defined yet if this function
    // is called from within getInitialState
    var isFocused = this.state && this.state.isFocused;
    return !(this.props.showOptionsWhenEmpty && isFocused) && emptyValue;
  },

  getOptionsForValue: function (value, options) {
    if (this._shouldSkipSearch(value)) {
      return [];
    }

    var searchOptions = this._generateSearchFunction();
    return searchOptions(value, options);
  },

  setEntryText: function (value) {
    this.refs.entry.value = value;
    this._onTextEntryUpdated();
  },

  focus: function () {
    this.refs.entry.focus();
  },

  _hasCustomValue: function () {
    if (this.props.allowCustomValues > 0 && this.state.entryValue.length >= this.props.allowCustomValues && this.state.searchResults.indexOf(this.state.entryValue) < 0) {
      return true;
    }
    return false;
  },

  _getCustomValue: function () {
    if (this._hasCustomValue()) {
      return this.state.entryValue;
    }
    return null;
  },

  _renderIncrementalSearchResults: function () {
    // Nothing has been entered into the textbox
    if (this._shouldSkipSearch(this.state.entryValue)) {
      return "";
    }

    // Something was just selected
    if (this.state.selection) {
      return "";
    }

    return React.createElement(this.props.customListComponent, {
      ref: 'sel', options: this.props.maxVisible ? this.state.searchResults.slice(0, this.props.maxVisible) : this.state.searchResults,
      areResultsTruncated: this.props.maxVisible && this.state.searchResults.length > this.props.maxVisible,
      resultsTruncatedMessage: this.props.resultsTruncatedMessage,
      onOptionSelected: this._onOptionSelected,
      allowCustomValues: this.props.allowCustomValues,
      customValue: this._getCustomValue(),
      customClasses: this.props.customClasses,
      selectionIndex: this.state.selectionIndex,
      defaultClassNames: this.props.defaultClassNames,
      displayOption: Accessor.generateOptionToStringFor(this.props.displayOption) });
  },

  getSelection: function () {
    var index = this.state.selectionIndex;
    if (this._hasCustomValue()) {
      if (index === 0) {
        return this.state.entryValue;
      } else {
        index--;
      }
    }
    return this.state.searchResults[index];
  },

  _onOptionSelected: function (option, event) {
    var nEntry = this.refs.entry;
    //nEntry.focus();
    nEntry.blur();
    var displayOption = Accessor.generateOptionToStringFor(this.props.inputDisplayOption || this.props.displayOption);
    var optionString = displayOption(option, 0);

    var formInputOption = Accessor.generateOptionToStringFor(this.props.formInputOption || displayOption);
    var formInputOptionString = formInputOption(option);

    nEntry.value = optionString;
    this.setState({ searchResults: this.getOptionsForValue(optionString, this.props.options),
      selection: formInputOptionString,
      entryValue: optionString,
      showResults: false });
    return this.props.onOptionSelected(option, event);
  },

  _onTextEntryUpdated: function () {
    var value = this.refs.entry.value;
    this.setState({ searchResults: this.getOptionsForValue(value, this.props.options),
      selection: '',
      entryValue: value });
  },

  _onEnter: function (event) {
    var selection = this.getSelection();
    if (!selection) {
      this.refs.entry.blur();
      return this.props.onKeyDown(event);
    }
    return this._onOptionSelected(selection, event);
  },

  _onEscape: function () {
    this.setState({
      selectionIndex: null
    });
  },

  _onTab: function (event) {
    var selection = this.getSelection();
    var option = selection ? selection : this.state.searchResults.length > 0 ? this.state.searchResults[0] : null;

    if (option === null && this._hasCustomValue()) {
      option = this._getCustomValue();
    }

    if (option !== null) {
      return this._onOptionSelected(option, event);
    }
  },

  eventMap: function (event) {
    var events = {};

    events[KeyEvent.DOM_VK_UP] = this.navUp;
    events[KeyEvent.DOM_VK_DOWN] = this.navDown;
    events[KeyEvent.DOM_VK_RETURN] = events[KeyEvent.DOM_VK_ENTER] = this._onEnter;
    events[KeyEvent.DOM_VK_ESCAPE] = this._onEscape;
    events[KeyEvent.DOM_VK_TAB] = this._onTab;

    return events;
  },

  _nav: function (delta) {
    if (!this._hasHint()) {
      return;
    }
    var newIndex = this.state.selectionIndex === null ? delta == 1 ? 0 : delta : this.state.selectionIndex + delta;
    var length = this.props.maxVisible ? this.state.searchResults.slice(0, this.props.maxVisible).length : this.state.searchResults.length;
    if (this._hasCustomValue()) {
      length += 1;
    }

    if (newIndex < 0) {
      newIndex += length;
    } else if (newIndex >= length) {
      newIndex -= length;
    }

    this.setState({ selectionIndex: newIndex });
  },

  navDown: function () {
    this._nav(1);
  },

  navUp: function () {
    this._nav(-1);
  },

  _onChange: function (event) {
    if (this.props.onChange) {
      this.props.onChange(event);
    }

    this._onTextEntryUpdated();
  },

  _onKeyDown: function (event) {
    // If there are no visible elements, don't perform selector navigation.
    // Just pass this up to the upstream onKeydown handler.
    // Also skip if the user is pressing the shift key, since none of our handlers are looking for shift

    //if (!this._hasHint() || event.shiftKey) {
    if (event.shiftKey) {
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

  componentWillReceiveProps: function (nextProps) {
    this.setState({
      searchResults: this.getOptionsForValue(this.state.entryValue, nextProps.options)
    });
  },

  render: function () {
    var inputClasses = {};
    inputClasses[this.props.customClasses.input] = !!this.props.customClasses.input;
    var inputClassList = classNames(inputClasses);

    var classes = {
      typeahead: this.props.defaultClassNames
    };
    classes[this.props.className] = !!this.props.className;
    var classList = classNames(classes);

    var InputElement = this.props.textarea ? 'textarea' : 'input';
    return React.createElement(
      'div',
      { className: classList },
      this._renderHiddenInput(),
      React.createElement(InputElement, _extends({ ref: 'entry', type: 'text',
        disabled: this.props.disabled
      }, this.props.inputProps, {
        placeholder: this.props.placeholder,
        className: inputClassList,
        value: this.state.entryValue,
        onChange: this._onChange,
        onKeyDown: this._onKeyDown,
        onKeyPress: this.props.onKeyPress,
        onKeyUp: this.props.onKeyUp,
        onFocus: this._onFocus,
        onBlur: this._onBlur
      })),
      this.state.showResults && this._renderIncrementalSearchResults()
    );
  },

  _onFocus: function (event) {
    this.setState({ isFocused: true, showResults: true }, function () {
      this._onTextEntryUpdated();
    }.bind(this));
    if (this.props.onFocus) {
      return this.props.onFocus(event);
    }
  },

  _onBlur: function (event) {
    this.setState({ isFocused: false }, function () {
      this._onTextEntryUpdated();
    }.bind(this));
    if (this.props.onBlur) {
      return this.props.onBlur(event);
    }
  },

  _renderHiddenInput: function () {
    if (!this.props.name) {
      return null;
    }

    return React.createElement('input', {
      type: 'hidden',
      name: this.props.name,
      value: this.state.selection
    });
  },

  _generateSearchFunction: function () {
    var searchOptionsProp = this.props.searchOptions;
    var filterOptionProp = this.props.filterOption;
    if (typeof searchOptionsProp === 'function') {
      if (filterOptionProp !== null) {
        console.warn('searchOptions prop is being used, filterOption prop will be ignored');
      }
      return searchOptionsProp;
    } else if (typeof filterOptionProp === 'function') {
      return function (value, options) {
        return options.filter(function (o) {
          return filterOptionProp(value, o);
        });
      };
    } else {
      var mapper;
      if (typeof filterOptionProp === 'string') {
        mapper = Accessor.generateAccessor(filterOptionProp);
      } else {
        mapper = Accessor.IDENTITY_FN;
      }
      return function (value, options) {
        return fuzzy.filter(value, options, { extract: mapper }).map(function (res) {
          return options[res.index];
        });
      };
    }
  },

  _hasHint: function () {
    return this.state.searchResults.length > 0 || this._hasCustomValue();
  }
});

module.exports = Typeahead;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

var Accessor = {
  IDENTITY_FN: function (input) {
    return input;
  },

  generateAccessor: function (field) {
    return function (object) {
      return object[field];
    };
  },

  generateOptionToStringFor: function (prop) {
    if (typeof prop === 'string') {
      return this.generateAccessor(prop);
    } else if (typeof prop === 'function') {
      return prop;
    } else {
      return this.IDENTITY_FN;
    }
  },

  valueForOption: function (option, object) {
    if (typeof option === 'string') {
      return object[option];
    } else if (typeof option === 'function') {
      return option(object);
    } else {
      return object;
    }
  }
};

module.exports = Accessor;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

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

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var Typeahead = __webpack_require__(2);

// module.exports = {
//   Typeahead: Typeahead,
//   Tokenizer: Tokenizer
// };

module.exports = Typeahead;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var React = __webpack_require__(1);
var classNames = __webpack_require__(0);

/**
 * A single option within the TypeaheadSelector
 */
var TypeaheadOption = React.createClass({
  displayName: 'TypeaheadOption',

  propTypes: {
    customClasses: React.PropTypes.object,
    customValue: React.PropTypes.string,
    onClick: React.PropTypes.func,
    children: React.PropTypes.string,
    hover: React.PropTypes.bool
  },

  getDefaultProps: function () {
    return {
      customClasses: {},
      onClick: function (event) {
        event.preventDefault();
      }
    };
  },

  render: function () {
    var classes = {};
    classes[this.props.customClasses.hover || "hover"] = !!this.props.hover;
    classes[this.props.customClasses.listItem] = !!this.props.customClasses.listItem;

    if (this.props.customValue) {
      classes[this.props.customClasses.customAdd] = !!this.props.customClasses.customAdd;
    }

    var classList = classNames(classes);

    return React.createElement(
      'li',
      { className: classList, onClick: this._onClick, onMouseDown: this._onClick },
      React.createElement(
        'a',
        { href: 'javascript: void 0;', className: this._getClasses() },
        this.props.children
      )
    );
  },

  _getClasses: function () {
    var classes = {
      "typeahead-option": true
    };
    classes[this.props.customClasses.listAnchor] = !!this.props.customClasses.listAnchor;

    return classNames(classes);
  },

  _onClick: function (event) {
    event.preventDefault();
    return this.props.onClick(event);
  }
});

module.exports = TypeaheadOption;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var React = __webpack_require__(1);
var TypeaheadOption = __webpack_require__(6);
var classNames = __webpack_require__(0);

/**
 * Container for the options rendered as part of the autocompletion process
 * of the typeahead
 */
var TypeaheadSelector = React.createClass({
  displayName: 'TypeaheadSelector',

  propTypes: {
    options: React.PropTypes.array,
    allowCustomValues: React.PropTypes.number,
    customClasses: React.PropTypes.object,
    customValue: React.PropTypes.string,
    selectionIndex: React.PropTypes.number,
    onOptionSelected: React.PropTypes.func,
    displayOption: React.PropTypes.func.isRequired,
    defaultClassNames: React.PropTypes.bool,
    areResultsTruncated: React.PropTypes.bool,
    resultsTruncatedMessage: React.PropTypes.string
  },

  getDefaultProps: function () {
    return {
      selectionIndex: null,
      customClasses: {},
      allowCustomValues: 0,
      customValue: null,
      onOptionSelected: function (option) {},
      defaultClassNames: true
    };
  },

  render: function () {
    // Don't render if there are no options to display
    if (!this.props.options.length && this.props.allowCustomValues <= 0) {
      return false;
    }

    var classes = {
      "typeahead-selector": this.props.defaultClassNames
    };
    classes[this.props.customClasses.results] = this.props.customClasses.results;
    var classList = classNames(classes);

    // CustomValue should be added to top of results list with different class name
    var customValue = null;
    var customValueOffset = 0;
    if (this.props.customValue !== null) {
      customValueOffset++;
      customValue = React.createElement(
        TypeaheadOption,
        { key: this.props.customValue,
          hover: this.props.selectionIndex === 0,
          customClasses: this.props.customClasses,
          customValue: this.props.customValue,
          onClick: this._onClick.bind(this, this.props.customValue) },
        this.props.customValue
      );
    }

    var results = this.props.options.map(function (result, i) {
      var displayString = this.props.displayOption(result, i);
      var uniqueKey = displayString + '_' + i;
      return React.createElement(
        TypeaheadOption,
        { key: uniqueKey,
          hover: this.props.selectionIndex === i + customValueOffset,
          customClasses: this.props.customClasses,
          onClick: this._onClick.bind(this, result) },
        displayString
      );
    }, this);

    if (this.props.areResultsTruncated && this.props.resultsTruncatedMessage !== null) {
      var resultsTruncatedClasses = {
        "results-truncated": this.props.defaultClassNames
      };
      resultsTruncatedClasses[this.props.customClasses.resultsTruncated] = this.props.customClasses.resultsTruncated;
      var resultsTruncatedClassList = classNames(resultsTruncatedClasses);

      results.push(React.createElement(
        'li',
        { key: 'results-truncated', className: resultsTruncatedClassList },
        this.props.resultsTruncatedMessage
      ));
    }

    return React.createElement(
      'ul',
      { className: classList },
      customValue,
      results
    );
  },

  _onClick: function (result, event) {
    return this.props.onOptionSelected(result, event);
  }

});

module.exports = TypeaheadSelector;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

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
if (true) {
  module.exports = fuzzy;
} else {
  root.fuzzy = fuzzy;
}

// Return all elements of `array` that have a fuzzy
// match against `pattern`.
fuzzy.simpleFilter = function(pattern, array) {
  return array.filter(function(str) {
    return fuzzy.test(pattern, str);
  });
};

// Does `pattern` fuzzy match `str`?
fuzzy.test = function(pattern, str) {
  return fuzzy.match(pattern, str) !== null;
};

// If `pattern` matches `str`, wrap each matching character
// in `opts.pre` and `opts.post`. If no match, return null
fuzzy.match = function(pattern, str, opts) {
  opts = opts || {};
  var patternIdx = 0
    , result = []
    , len = str.length
    , totalScore = 0
    , currScore = 0
    // prefix
    , pre = opts.pre || ''
    // suffix
    , post = opts.post || ''
    // String to compare against. This might be a lowercase version of the
    // raw string
    , compareString =  opts.caseSensitive && str || str.toLowerCase()
    , ch;

  pattern = opts.caseSensitive && pattern || pattern.toLowerCase();

  // For each character in the string, either add it to the result
  // or wrap in template if it's the next string in the pattern
  for(var idx = 0; idx < len; idx++) {
    ch = str[idx];
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
    // if the string is an exact match with pattern, totalScore should be maxed
    totalScore = (compareString === pattern) ? Infinity : totalScore;
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
//        // Optional function. Input is an entry in the given arr`,
//        // output should be the string to test `pattern` against.
//        // In this example, if `arr = [{crying: 'koala'}]` we would return
//        // 'koala'.
//      , extract: function(arg) { return arg.crying; }
//    }
fuzzy.filter = function(pattern, arr, opts) {
  if(!arr || arr.length === 0) {
    return [];
  }
  if (typeof pattern !== 'string') {
    return arr;
  }
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



/***/ })
/******/ ]);
});