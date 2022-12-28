import React from 'react';
import { render, screen } from '@testing-library/react';
import {Layout} from './index';
describe('Layout Component', () => {
  test('it should exist', () => {
    render(<Layout />);
    expect(screen.getByTestId('Layout-wrapper')).toBeInTheDocument();
  });
});
