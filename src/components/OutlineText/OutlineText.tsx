import React from "react";
import styles from "./OutlineText.module.css";

export type OutlineTextProps = {
  text: string;
  sizeInRem: number;
  upperCase: boolean;
  alignment?: "left" | "center" | "right";
};
const OutlineText = ({
  text,
  sizeInRem,
  upperCase,
  alignment = "center",
}: OutlineTextProps) => {
  return (
    <>
      <div
        data-testid="OutlineText-wrapper"
        className={styles.OutlineText}
        data-alignment={alignment}
      >
        <div
          className={styles.whiteText}
          data-black-background
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
