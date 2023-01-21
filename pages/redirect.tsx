import { GameScreen } from "@components/GameScreen";
import { TabWrapper } from "@components/TabWrapper";
import { Layout } from "@components/Layout";

import React, { useEffect } from "react";
import { OutlineText } from "@components/OutlineText";
import { redirect_key } from "@utilities/constants";
import { useRouter } from "next/router";

export default function AuthenticationRedirect() {
  const router = useRouter();
  useEffect(() => {
    const urlRedirect = window.localStorage.getItem(redirect_key);
    router.push(urlRedirect ?? "/");
    window.localStorage.removeItem(redirect_key);
  }, []);
  return <div className="ds">loading</div>;
}
