import { OutlineText } from "@components/OutlineText";
import React, { useEffect, useState, useRef } from "react";
import styles from "./Button.module.css";

export type ButtonProps = {
  type: "primary" | "secondary" | "delete" | "tertiary";
  text: string;
  action: () => void;
  iconUrl?: string;
  disabled?: boolean;
};

const Button = ({ text, type, action, disabled = false }: ButtonProps) => {
  return (
    <button
      data-testid="Button-wrapper"
      className={styles.Button}
      data-button-type={type}
      onClick={() => {
        disabled ? void 0 : action();
      }}
      aria-disabled={disabled}
      aria-label={text}
    >
      {type === "tertiary" && (
        <svg
          width="31"
          height="31"
          viewBox="0 0 31 31"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.5542 9.27639C14.1806 7.85278 16.8194 7.85278 18.4458 9.27639C20.0736 10.7 20.0736 13.0083 18.4458 14.4319C18.1639 14.6806 17.8486 14.8847 17.5153 15.0458C16.4806 15.5472 15.5014 16.4333 15.5014 17.5833V18.625M28 15.5C28 17.1415 27.6767 18.767 27.0485 20.2835C26.4203 21.8001 25.4996 23.1781 24.3388 24.3388C23.1781 25.4996 21.8001 26.4203 20.2835 27.0485C18.767 27.6767 17.1415 28 15.5 28C13.8585 28 12.233 27.6767 10.7165 27.0485C9.19989 26.4203 7.8219 25.4996 6.66116 24.3388C5.50043 23.1781 4.57969 21.8001 3.95151 20.2835C3.32332 18.767 3 17.1415 3 15.5C3 12.1848 4.31696 9.00537 6.66116 6.66117C9.00537 4.31696 12.1848 3 15.5 3C18.8152 3 21.9946 4.31696 24.3388 6.66117C26.683 9.00537 28 12.1848 28 15.5ZM15.5 22.7917H15.5111V22.8028H15.5V22.7917Z"
            stroke="black"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.5542 9.27639C14.1806 7.85278 16.8194 7.85278 18.4458 9.27639C20.0736 10.7 20.0736 13.0083 18.4458 14.4319C18.1639 14.6806 17.8486 14.8847 17.5153 15.0458C16.4806 15.5472 15.5014 16.4333 15.5014 17.5833V18.625M28 15.5C28 17.1415 27.6767 18.767 27.0485 20.2835C26.4203 21.8001 25.4996 23.1781 24.3388 24.3388C23.1781 25.4996 21.8001 26.4203 20.2835 27.0485C18.767 27.6767 17.1415 28 15.5 28C13.8585 28 12.233 27.6767 10.7165 27.0485C9.19989 26.4203 7.8219 25.4996 6.66116 24.3388C5.50043 23.1781 4.57969 21.8001 3.95151 20.2835C3.32332 18.767 3 17.1415 3 15.5C3 12.1848 4.31696 9.00537 6.66116 6.66117C9.00537 4.31696 12.1848 3 15.5 3C18.8152 3 21.9946 4.31696 24.3388 6.66117C26.683 9.00537 28 12.1848 28 15.5ZM15.5 22.7917H15.5111V22.8028H15.5V22.7917Z"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {type !== "tertiary" && (
        <OutlineText
          upperCase
          text={text}
          sizeInRem={1.1}
          alignment={"center"}
        />
      )}
    </button>
  );
};
export default Button;
