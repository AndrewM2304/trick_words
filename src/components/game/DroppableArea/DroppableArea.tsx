import React, { useEffect } from "react";
import styles from "./DroppableArea.module.css";
import { useDroppable } from "@dnd-kit/core";
export type DroppableAreaProps = { area: "left" | "right"; word: string };
const DroppableArea = ({ area, word }: DroppableAreaProps) => {
  const { isOver, setNodeRef, active } = useDroppable({
    id: area,
  });

  return (
    <div
      className={styles.droppable}
      data-testid="DroppableArea-wrapper"
      ref={setNodeRef}
    >
      <div
        data-is-highlight={isOver}
        data-active-dragging={active !== null ? true : false}
      >
        drag here to make {word}
      </div>
    </div>
  );
};
export default DroppableArea;
