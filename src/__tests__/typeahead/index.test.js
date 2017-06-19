import React from 'react';
import { mount, render } from 'enzyme';

import { Typeahead } from '../../';

describe('Typeahead component', () => {

  it('should generate an input field', () => {
    const typeahead = render(<Typeahead name='findme' />);
    expect(typeahead.find('input[name="findme"]').length).toBe(1);
  });

  it('should render a default value', () => {
    const typeahead = render(<Typeahead value='pringles' />);
    expect(typeahead.find('.typeahead input').prop('value')).toEqual('pringles');
  });

  it('should allow custom classes', () => {
    const typeahead = render(<Typeahead customClasses={{ input: 'kettle' }} />);
    expect(typeahead.find('.typeahead input').hasClass('kettle')).toBe(true);
  });

  it('should allow a placeholder', () => {
    const typeahead = render(<Typeahead placeholder='teaspoon' />);
    expect(typeahead.find('.typeahead input').attr('placeholder')).toEqual('teaspoon')
  });

  it('should be able to be disabled', () => {
    const typeahead = render(<Typeahead disabled={true} />);
    expect(typeahead.find('.typeahead input').attr('disabled')).toEqual('disabled')
  });

  it('should be able to be rendered as a textarea', () => {
    const typeahead = render(<Typeahead textarea={true} />);
    expect(typeahead.find('.typeahead textarea').length).toBe(1);
  });

  it('should allow default classNames to be removed', () => {
    const typeahead = render(<Typeahead defaultClassNames={false} />);
    expect(typeahead.find('div').hasClass('typeahead')).toBe(false);
  });
});