import React from 'react';
import { render, screen } from '@testing-library/react';
import {DroppableArea} from './index';
describe('DroppableArea Component', () => {
  test('it should exist', () => {
    render(<DroppableArea />);
    expect(screen.getByTestId('DroppableArea-wrapper')).toBeInTheDocument();
  });
});
