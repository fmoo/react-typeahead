import React from 'react';
import { mount, render } from 'enzyme';

import { Tokenizer } from '../../';

describe('Tokenizer component', () => {
  it('should generate an input field', () => {
    const tokenizer = render(<Tokenizer inputProps={{ name: 'findme' }} />);
    expect(tokenizer.find('input[name="findme"]').length).toBe(1);
  });

  it('should allow custom classes', () => {
    const tokenizer = render(<Tokenizer customClasses={{ input: 'kettle' }} />);
    expect(tokenizer.find('.typeahead-tokenizer input').hasClass('kettle')).toBe(true);
  });

  it('should allow a placeholder', () => {
    const tokenizer = render(<Tokenizer placeholder='teaspoon' />);
    expect(tokenizer.find('.typeahead-tokenizer input').attr('placeholder')).toEqual('teaspoon')
  });

  it('should be able to be disabled', () => {
    const tokenizer = render(<Tokenizer disabled={true} />);
    expect(tokenizer.find('.typeahead-tokenizer input').attr('disabled')).toEqual('disabled');
  });

  it('should render some tokens', () => {
    const tokenizer = render(<Tokenizer defaultSelected={['knife', 'fork', 'spoon']} />);
    expect(tokenizer.find('.typeahead-tokenizer .typeahead-token').length).toBe(3);
  });

  it('should allow default classNames to be removed', () => {
    const tokenizer = render(<Tokenizer defaultClassNames={false} />);
    expect(tokenizer.find('div').hasClass('typeahead')).toBe(false);
  });
});