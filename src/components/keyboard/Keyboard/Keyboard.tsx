import React from "react";
import { KeyboardTile } from "../KeyboardTile";
import styles from "./Keyboard.module.css";

const Keyboard = () => {
  const topRow: string[] = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"];
  const middleRow: string[] = ["a", "s", "d", "f", "g", "h", "j", "k", "l"];
  const bottomRow: string[] = ["z", "x", "c", "v", "b", "n", "m"];

  return (
    <div data-testid="Keyboard-wrapper" className={styles.keyboardWrapper}>
      <ul className={styles.row}>
        {topRow.map((letter: string) => {
          return <KeyboardTile letter={letter} key={letter} />;
        })}
      </ul>

      <ul className={styles.row}>
        {middleRow.map((letter: string) => {
          return <KeyboardTile letter={letter} key={letter} />;
        })}
      </ul>
      <ul className={styles.row}>
        {bottomRow.map((letter: string) => {
          return <KeyboardTile letter={letter} key={letter} />;
        })}
      </ul>
    </div>
  );
};
export default Keyboard;
