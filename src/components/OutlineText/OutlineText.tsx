import React from "react";
import styles from "./OutlineText.module.css";

export type OutlineTextProps = {
  text: string;
  sizeInRem: number;
  upperCase: boolean;
  left?: boolean;
};
const OutlineText = ({
  text,
  sizeInRem,
  upperCase,
  left = false,
}: OutlineTextProps) => {
  return (
    <>
      <div
        data-testid="OutlineText-wrapper"
        className={styles.OutlineText}
        data-left={left}
      >
        <div
          className={styles.whiteText}
          data-uppercase={upperCase}
          style={{
            fontSize: `${sizeInRem}rem`,
          }}
        >
          {text}
        </div>
        <div
          className={styles.innerText}
          data-uppercase={upperCase}
          style={{
            fontSize: `${sizeInRem}rem`,
          }}
        >
          {text}
        </div>
      </div>
    </>
  );
};
export default OutlineText;
