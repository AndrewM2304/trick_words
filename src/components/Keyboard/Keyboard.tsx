import React from 'react';
import styles from './Keyboard.module.css'

export type KeyboardProps = {}
const Keyboard = ({}: KeyboardProps) => {
  return <div data-testid="Keyboard-wrapper">Hello 👋, I am a Keyboard component.</div>;
};
export default Keyboard;
