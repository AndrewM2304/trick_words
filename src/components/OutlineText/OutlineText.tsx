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
      <svg version="1.1" xmlns="//www.w3.org/2000/svg" className={styles.hide}>
        <defs>
          <filter id="stroke-text-svg-filter">
            <feMorphology operator="dilate" radius="1.5"></feMorphology>
            <feComposite operator="xor" in="SourceGraphic" />
          </filter>
        </defs>
      </svg>
    </>
  );
};
export default OutlineText;
