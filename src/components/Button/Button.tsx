import { OutlineText } from "@components/OutlineText";
import React, { useEffect, useState, useRef } from "react";
import styles from "./Button.module.css";

export type ButtonProps = {
  type: "primary" | "secondary" | "delete" | "icon-only";
  text: string;
  action: () => void;
  iconUrl?: string;
};

const Button = ({ text, type, action, iconUrl }: ButtonProps) => {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      data-testid="Button-wrapper"
      className={styles.Button}
      data-button-type={type}
      onClick={() => action()}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      data-pressed={pressed}
    >
      <OutlineText upperCase text={text} sizeInRem={1} />
    </button>
  );
};
export default Button;
