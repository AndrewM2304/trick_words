import { Button } from "@components/Button";
import React from "react";
import styles from "./HowItWorks.module.css";

export type HowItWorksProps = {
  closeDialog?: () => void;
};
const HowItWorks = ({ closeDialog }: HowItWorksProps) => {
  return (
    <div className={styles.howToPlayContainer} data-testid="HowItWorks-wrapper">
      <p tabIndex={closeDialog ? 0 : -1}>Welcome to Trick Words!</p>
      <p>
        Are you ready to test your spelling skills and outsmart your opponents?
        This game is perfect for word enthusiasts and tricksters alike. Whether
        you&#39;re playing against the computer, with friends locally, or with
        players from all over the world, you&#39;re in for a treat.
      </p>
      <p>How to play:</p>
      <ol>
        <li>Each round is dedicated to a different letter of the alphabet.</li>
        <li>
          Players take turns adding a letter to the start or end of the initial
          letter by dragging a tile from the bottom of the screen. The catch?
          Each letter added must form part of a word, but if you spell a word,
          you lose the round (for example, &#39;TA&#39; is contained in many
          words so would pass, &#39;QTA&#39; you would not be accepted, and
          &#39;TAG&#39; would lose you the round).
        </li>
        <li>
          Play through all 26 rounds, and the player with the most points wins
          the game.
        </li>
        <li>
          Want to play with friends online? No problem! Just log in with
          Facebook or Google and share the invite link within the game.
        </li>
      </ol>
      {closeDialog && (
        <Button text="Got it!" action={() => closeDialog()} type="primary" />
      )}
    </div>
  );
};
export default HowItWorks;
