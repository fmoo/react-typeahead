var jsdom = require("jsdom");
global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
global.window = document.defaultView;
global.navigator = window.navigator;


var Benchmark = require('benchmark');
var React = require('react');
var TestUtils = require("react/addons").addons.TestUtils;
global.assert = require('chai').assert;

// A super simple DOM ready for React to render into

var ReactTypeahead = require('./lib/react-typeahead').Typeahead;
var TypeaheadOption = require("./lib/typeahead/option");

global.simulateTextInput = function(component, value) {
  var node = component.refs.entry;
  node.value = value;
  TestUtils.Simulate.change(node);
  return TestUtils.scryRenderedComponentsWithType(component, TypeaheadOption);
};

var props = {
  options: [
    "a",
    "ab",
    "dfe",
  ],
};
global.component = TestUtils.renderIntoDocument(React.createElement(ReactTypeahead, props));

console.log("running benchmark");

var suite = new Benchmark.Suite();
suite.add("Filtering options", function() {
  var results = simulateTextInput(component, "a");
  assert.equal(results.length, 2);
  simulateTextInput(component, "");
}).on('complete', function() {
  console.log(this["0"].stats.mean);
}).run({async: false});

console.log("done");
