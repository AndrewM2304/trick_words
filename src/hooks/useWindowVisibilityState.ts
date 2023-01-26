import React, { useState, useEffect, useMemo } from "react";

export const useWindowVisibilityState = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof document !== undefined) {
      document.addEventListener("visibilitychange", () => {
        setVisible(document.visibilityState === "hidden" ? false : true);
      });
    }
  }, []);
  return { visible };
};
