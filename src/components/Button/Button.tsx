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
  return (
    <button
      data-testid="Button-wrapper"
      className={styles.Button}
      data-button-type={type}
      onClick={() => action()}
    >
      <OutlineText upperCase text={text} sizeInRem={1} alignment={"center"} />
    </button>
  );
};
export default Button;
