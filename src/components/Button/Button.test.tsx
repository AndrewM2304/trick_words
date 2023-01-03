import React from 'react';
import { render, screen } from '@testing-library/react';
import {Button} from './index';
describe('Button Component', () => {
  test('it should exist', () => {
    render(<Button />);
    expect(screen.getByTestId('Button-wrapper')).toBeInTheDocument();
  });
});
