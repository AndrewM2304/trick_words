import React from 'react';
import { render, screen } from '@testing-library/react';
import {HomeScreen} from './index';
describe('HomeScreen Component', () => {
  test('it should exist', () => {
    render(<HomeScreen />);
    expect(screen.getByTestId('HomeScreen-wrapper')).toBeInTheDocument();
  });
});
