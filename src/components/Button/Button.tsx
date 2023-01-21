import { OutlineText } from "@components/OutlineText";
import React, { useEffect, useState, useRef } from "react";
import styles from "./Button.module.css";

export type ButtonProps = {
  type: "primary" | "secondary" | "delete" | "icon-only";
  text: string;
  action: () => void;
  iconUrl?: string;
  disabled?: boolean;
};

const Button = ({
  text,
  type,
  action,
  iconUrl,
  disabled = false,
}: ButtonProps) => {
  return (
    <button
      data-testid="Button-wrapper"
      className={styles.Button}
      data-button-type={type}
      onClick={() => {
        disabled ? void 0 : action();
      }}
      aria-disabled={disabled}
    >
      <OutlineText upperCase text={text} sizeInRem={1} alignment={"center"} />
    </button>
  );
};
export default Button;
