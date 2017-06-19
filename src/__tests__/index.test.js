import React from 'react';
import { render } from 'enzyme';

import { Typeahead, Tokenizer } from '../';

describe('Entry component mounting', () => {
  it('should mount <Typeahead /> component', () => {
    const typeahead = render(<Typeahead />);
    expect(typeahead.find('.typeahead').length).toBe(1);
  });

  it('should mount <Tokenizer /> component', () => {
    const tokenizer = render(<Tokenizer />);
    expect(tokenizer.find('.typeahead-tokenizer').length).toBe(1);
  });
});