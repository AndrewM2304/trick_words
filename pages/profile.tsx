import { AccountSettings } from "@components/account/AccountSettings";
import { Layout } from "@components/Layout";
import { TabWrapper } from "@components/TabWrapper";
import React from "react";
import { useSession } from "@supabase/auth-helpers-react";
import Head from "next/head";

function Profile() {
  const session = useSession();
  return (
    <>
      <Head>
        <title>Trick Words - Profile</title>
        <meta name="description" content="Trick words - profile screen" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TabWrapper>
        <AccountSettings />
      </TabWrapper>
    </>
  );
}

export default Profile;
