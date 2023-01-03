import React from 'react';
import { render, screen } from '@testing-library/react';
import {OutlineText} from './index';
describe('OutlineText Component', () => {
  test('it should exist', () => {
    render(<OutlineText />);
    expect(screen.getByTestId('OutlineText-wrapper')).toBeInTheDocument();
  });
});
