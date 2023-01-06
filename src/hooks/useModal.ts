import React, { useState, useRef, useEffect, RefObject } from "react";

export const useModal = () => {
  const [dialog, setDialog] =
    useState<React.RefObject<HTMLDialogElement> | null>(null);

  const toggleDialog = () => {
    if (!dialog) return;
    dialog.current?.showModal();
  };
  return { toggleDialog, setDialog, dialog };
};
