import React from 'react';
import { render, screen } from '@testing-library/react';
import {GameScreen} from './index';
describe('GameScreen Component', () => {
  test('it should exist', () => {
    render(<GameScreen />);
    expect(screen.getByTestId('GameScreen-wrapper')).toBeInTheDocument();
  });
});
