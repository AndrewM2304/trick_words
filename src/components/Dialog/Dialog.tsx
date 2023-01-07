import React, { useEffect, useRef } from "react";
import styles from "./Dialog.module.css";

export type DialogProps = {
  children: React.ReactNode;
  display: boolean;
  setDisplay: () => void;
};
const Dialog = ({ children, display, setDisplay }: DialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!dialogRef.current) return;
    console.log(display);
    console.log(dialogRef.current.open);
    dialogRef.current.removeAttribute("open");
    console.log(dialogRef.current.open);

    if (display && !dialogRef.current.open) dialogRef.current.showModal();
  }, [display]);

  return (
    <>
      {display && (
        <dialog
          onClose={() => setDisplay()}
          data-testid="Dialog-wrapper"
          className={styles.Dialog}
          ref={dialogRef}
        >
          {children}
        </dialog>
      )}
    </>
  );
};
export default Dialog;
