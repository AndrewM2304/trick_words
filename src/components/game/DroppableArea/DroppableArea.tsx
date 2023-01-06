import React, { useEffect } from "react";
import styles from "./DroppableArea.module.css";
import { useDroppable } from "@dnd-kit/core";
import { OutlineText } from "@components/OutlineText";
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
        data-direction={area}
        data-is-highlight={isOver}
        data-active-dragging={active !== null ? true : false}
      >
        <OutlineText
          text={`${word}`}
          sizeInRem={1.4}
          alignment="center"
          upperCase={false}
        />
      </div>
    </div>
  );
};
export default DroppableArea;
