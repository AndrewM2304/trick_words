import React, { useEffect } from "react";
import styles from "./KeyboardTile.module.css";
import { useDraggable } from "@dnd-kit/core";
import { OutlineText } from "@components/OutlineText";
import { Button } from "@components/Button";

export type KeyboardTileProps = {
  letter: string;
};
const KeyboardTile = ({ letter }: KeyboardTileProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging, active } =
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
      <div
        className={styles.keyboardTileBottom}
        data-not-dragging={active && active.id !== letter}
      >
        <OutlineText text={letter} sizeInRem={1.2} upperCase={true} />
      </div>
      <div
        data-testid="top-tile"
        className={styles.keyboardTileTop}
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        data-dragging={isDragging}
        data-not-dragging={active && active.id !== letter}
      >
        <OutlineText text={letter} sizeInRem={1.2} upperCase={true} />
      </div>
    </li>
  );
};
export default KeyboardTile;
