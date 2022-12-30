import React from 'react';
import { render, screen } from '@testing-library/react';
import {Tabs} from './index';
describe('Tabs Component', () => {
  test('it should exist', () => {
    render(<Tabs />);
    expect(screen.getByTestId('Tabs-wrapper')).toBeInTheDocument();
  });
});
