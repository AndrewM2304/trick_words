import React from "react";
import styles from "./Authentication.module.css";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { AccountSettings } from "@components/AccountSettings";

const Authentication = () => {
  const session = useSession();
  const supabase = useSupabaseClient();

  return (
    <div
      className="container"
      style={{ padding: "50px 0 100px 0" }}
      data-testid="Authentication-wrapper"
    >
      {!session ? (
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
          providers={["google", "facebook", "twitter"]}
        />
      ) : (
        <AccountSettings session={session} />
      )}
    </div>
  );
};
export default Authentication;
