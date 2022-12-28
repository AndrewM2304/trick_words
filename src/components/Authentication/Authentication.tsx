import React from "react";
import styles from "./Authentication.module.css";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { AccountSettings } from "@components/account/AccountSettings";
import { Keyboard } from "@components/keyboard/Keyboard";
import { useUserProfileStore } from "@components/store";
import { HomeScreen } from "@components/HomeScreen";

const Authentication = () => {
  const session = useSession();
  const supabase = useSupabaseClient();
  const { userAvatarUrl } = useUserProfileStore();

  return (
    <div
      className="container"
      style={{ padding: "50px 0 100px 0" }}
      data-testid="Authentication-wrapper"
    >
      {!session && (
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
          providers={["google", "facebook", "twitter"]}
        />
      )}
      {session && userAvatarUrl !== "" && <HomeScreen />}
      {session && userAvatarUrl === "" && <AccountSettings session={session} />}
    </div>
  );
};
export default Authentication;
