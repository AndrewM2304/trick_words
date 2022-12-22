import React from 'react';
import { render, screen } from '@testing-library/react';
import AvatarWidget from './AvatarWidget';
describe('AvatarWidget Component', () => {
  test('it should exist', () => {
    render(<AvatarWidget />);
    expect(screen.getByTestId('AvatarWidget-wrapper')).toBeInTheDocument();
  });
});
