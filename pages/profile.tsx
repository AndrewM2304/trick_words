import { AccountSettings } from "@components/account/AccountSettings";
import { Layout } from "@components/Layout";
import { TabWrapper } from "@components/TabWrapper";
import React from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";

function Profile() {
  const { session } = useSessionContext();
  return (
    <Layout>
      {session && (
        <>
          <TabWrapper>
            <AccountSettings />
          </TabWrapper>
        </>
      )}
    </Layout>
  );
}

export default Profile;
