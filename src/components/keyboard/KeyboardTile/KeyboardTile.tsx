import React, { useEffect } from "react";
import styles from "./KeyboardTile.module.css";
import { useDraggable } from "@dnd-kit/core";
import { OutlineText } from "@components/OutlineText";

export type KeyboardTileProps = {
  letter: string;
  disabled?: boolean;
};
const KeyboardTile = ({ letter, disabled = false }: KeyboardTileProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging, active } =
    useDraggable({
      id: letter,
      disabled: disabled,
      attributes: {
        tabIndex: disabled ? -1 : 0,
      },
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
      tabIndex={-1}
    >
      <div
        className={styles.keyboardTileBottom}
        data-not-dragging={active && active.id !== letter}
      >
        <OutlineText
          text={letter}
          sizeInRem={1}
          upperCase={true}
          alignment={"center"}
        />
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
        <OutlineText
          text={letter}
          sizeInRem={1}
          upperCase={true}
          alignment={"center"}
        />
      </div>
    </li>
  );
};
export default KeyboardTile;
