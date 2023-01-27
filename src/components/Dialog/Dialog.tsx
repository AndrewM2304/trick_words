import React, { useEffect, useRef, useState } from "react";
import styles from "./Dialog.module.css";
import { motion, AnimatePresence, Variants, Transition } from "framer-motion";

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

  useEffect(() => {
    if (!dialogRef.current) return;
    dialogRef.current.removeAttribute("open");
    if (display && !dialogRef.current.open) dialogRef.current.showModal();
  }, [display]);

  const dialogVariants: Variants = {
    initialState: {
      opacity: 0,
      transformOrigin: "50% 100%",
      translateY: "-600px",
      rotateX: "-30deg",
      scale: 0,
    },
    animateState: {
      opacity: 1,
      transformOrigin: "50% 1400px",
      translateY: "0px",
      rotateX: "0deg",
      scale: 1,
    },
    exitState: {
      opacity: 0,
      transformOrigin: "10% 50%",
      translateY: "600px",
      rotateX: "30deg",
      scale: 0,
      transition: {
        type: "tween",
      },
    },
  };

  const infoDialog: Variants = {
    initialState: {
      opacity: 0,
      translateY: 50,
      scale: 0.8,
    },
    animateState: {
      opacity: 1,
      translateY: 0,
      scale: 1,
    },
    exitState: {
      opacity: 0,
      scale: 0.8,
      translateY: 50,
    },
  };
  const backdropVariants: Variants = {
    initialState: {
      opacity: 0,
    },
    animateState: {
      opacity: 1,
    },
    exitState: {
      opacity: 0,
    },
  };

  const trans: Transition = {
    type: animate ? "tween" : "spring",
    bounce: animate ? 0.3 : 0.4,
    duration: animate ? 0.4 : 0.6,
  };

  return (
    <AnimatePresence>
      {display && (
        <motion.div
          className={styles.backdrop}
          initial="initialState"
          animate="animateState"
          exit="exitState"
          transition={{
            duration: 0.2,
          }}
          key={"dialog-backdrop"}
          variants={backdropVariants}
        >
          <motion.dialog
            initial="initialState"
            animate="animateState"
            exit="exitState"
            transition={trans}
            data-display={display}
            variants={animate ? dialogVariants : infoDialog}
            onClose={() => setDisplay()}
            data-testid="Dialog-wrapper"
            className={styles.Dialog}
            ref={dialogRef}
            key={"dialog"}
          >
            {children}
          </motion.dialog>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default Dialog;
