// Phantomjs isn't es5 :(
require('es5-shim');
require('./react-typeahead-test');
require('./typeahead-test');
require('./tokenizer-test');
if (window.mochaPhantomJS) {
  window.mochaPhantomJS.run();
} else {
  window.mocha.run();
}
