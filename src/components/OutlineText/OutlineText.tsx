import React from "react";
import styles from "./OutlineText.module.css";

export type OutlineTextProps = {
  text: string;
  sizeInRem: number;
  upperCase: boolean;
  alignment: "left" | "center" | "right";
  focus?: boolean;
};
const OutlineText = ({
  text,
  sizeInRem,
  upperCase,
  alignment = "center",
  focus = false,
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
          tabIndex={focus ? 0 : -1}
        >
          {text}
        </div>
        <div
          className={styles.innerText}
          data-uppercase={upperCase}
          aria-hidden={true}
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
