import React, { useEffect, useRef, useState } from "react";
import styles from "./Dialog.module.css";

export type DialogProps = {
  children: React.ReactNode;
  display: boolean;
  setDisplay: () => void;
  animate?: boolean;
};
const Dialog = ({
  children,
  display,
  setDisplay,
  animate = false,
}: DialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [exitAnimation, setExitAnimation] = useState(false);
  useEffect(() => {
    if (!dialogRef.current) return;
    dialogRef.current.removeAttribute("open");
    if (display && !dialogRef.current.open) dialogRef.current.showModal();
  }, [display]);

  return (
    <>
      {display && (
        <dialog
          data-animate={animate}
          data-exit={exitAnimation}
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
