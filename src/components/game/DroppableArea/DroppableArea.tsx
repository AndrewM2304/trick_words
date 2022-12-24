import React from "react";
import styles from "./DroppableArea.module.css";
import { useDroppable } from "@dnd-kit/core";
export type DroppableAreaProps = { area: "left" | "right" };
const DroppableArea = ({ area }: DroppableAreaProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id: area,
  });
  const style = {
    color: isOver ? "green" : undefined,
  };

  return (
    <div data-testid="DroppableArea-wrapper" ref={setNodeRef} style={style}>
      drag here
    </div>
  );
};
export default DroppableArea;
