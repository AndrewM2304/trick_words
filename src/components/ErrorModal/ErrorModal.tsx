import { Button } from "@components/Button";
import { Dialog } from "@components/Dialog";
import { OutlineText } from "@components/OutlineText";
import { useErrorModal } from "@components/store";
import { PostgrestError } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import React from "react";
import styles from "./ErrorModal.module.css";

const ErrorModal = () => {
  const {
    displayErrorModal,
    setDisplayErrorModal,
    errorMessage,
    setErrorMessage,
  } = useErrorModal();
  const router = useRouter();
  return (
    <>
      <Dialog
        display={displayErrorModal}
        setDisplay={setDisplayErrorModal}
        animate={true}
      >
        <OutlineText
          text={"Something has gone wrong"}
          sizeInRem={1.1}
          upperCase={false}
          alignment={"center"}
        />
        {errorMessage !== "" && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}
        <Button
          type={"primary"}
          text={"Refresh page"}
          action={() => {
            setDisplayErrorModal();
            setErrorMessage("");
            router.reload();
          }}
        />
      </Dialog>
    </>
  );
};
export default ErrorModal;
