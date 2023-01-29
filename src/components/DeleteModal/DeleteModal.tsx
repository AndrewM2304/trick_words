import { Dialog } from "@components/Dialog";
import React from "react";
import styles from "./DeleteModal.module.css";
import { useDeleteModal } from "@components/store";
import { OutlineText } from "@components/OutlineText";
import { Button } from "@components/Button";
import { useDeleteGame } from "@hooks/useDeleteGame";

const DeleteModal = () => {
  const {
    displayDeleteModal,
    setDisplayDeleteModal,
    buttonText,
    gameToDelete,
    deleteType,
  } = useDeleteModal();
  const { deleteGame, deleteAllGames } = useDeleteGame();
  return (
    <>
      <Dialog
        display={displayDeleteModal}
        setDisplay={setDisplayDeleteModal}
        animate={true}
      >
        <OutlineText
          focus
          text={"Are you sure?"}
          sizeInRem={1.4}
          upperCase={false}
          alignment={"center"}
        />
        <Button
          type={"delete"}
          text={buttonText === "" ? "Delete" : buttonText}
          action={() => {
            setDisplayDeleteModal();
            deleteType === "single"
              ? deleteGame(gameToDelete)
              : deleteAllGames();
          }}
        />
        <Button
          type={"cancel"}
          text={"Cancel"}
          action={() => {
            setDisplayDeleteModal();
          }}
        />
      </Dialog>
    </>
  );
};
export default DeleteModal;
