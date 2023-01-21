import { AccountSettings } from "@components/account/AccountSettings";
import { Layout } from "@components/Layout";
import { TabWrapper } from "@components/TabWrapper";
import React from "react";
import { useSession } from "@supabase/auth-helpers-react";

function Profile() {
  const session = useSession();
  return (
    <TabWrapper>
      <AccountSettings />
    </TabWrapper>
  );
}

export default Profile;
