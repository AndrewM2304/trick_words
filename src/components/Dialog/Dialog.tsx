import React, { useEffect, useRef } from "react";
import styles from "./Dialog.module.css";

export type DialogProps = {
  children: React.ReactNode;
};
const Dialog = ({ children }: DialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!dialogRef.current) return;
    dialogRef.current.showModal();
    return () => {
      if (!dialogRef.current) return;
      dialogRef.current.close();
    };
  }, []);

  return (
    <>
      <dialog
        data-testid="Dialog-wrapper"
        className={styles.Dialog}
        ref={dialogRef}
      >
        {children}
      </dialog>
    </>
  );
};
export default Dialog;
