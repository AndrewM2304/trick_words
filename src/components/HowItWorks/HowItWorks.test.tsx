import React from 'react';
import { render, screen } from '@testing-library/react';
import {HowItWorks} from './index';
describe('HowItWorks Component', () => {
  test('it should exist', () => {
    render(<HowItWorks />);
    expect(screen.getByTestId('HowItWorks-wrapper')).toBeInTheDocument();
  });
});
