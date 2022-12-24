import React, { useState, useRef } from "react";
import styles from "./KeyboardTile.module.css";
import { useDraggable } from "@dnd-kit/core";

export type KeyboardTileProps = {
  letter: string;
};
const KeyboardTile = ({ letter }: KeyboardTileProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: letter,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <li
      data-testid="KeyboardTile-wrapper"
      className={styles.keyboardTileWrapper}
    >
      <div className={styles.keyboardTileBottom}>{letter}</div>
      <div
        data-testid="top-tile"
        className={styles.keyboardTileTop}
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        data-dragging={isDragging}
      >
        {letter}
      </div>
    </li>
  );
};
export default KeyboardTile;
