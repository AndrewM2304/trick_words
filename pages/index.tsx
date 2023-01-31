import Head from "next/head";
import React from "react";
import { TabWrapper } from "@components/TabWrapper";
import { HomeScreen } from "@components/HomeScreen";

export default function Home() {
  return (
    <>
      <Head>
        <title>Trick Words</title>
        <meta
          name="description"
          content="Are you ready to test your spelling skills and outsmart your opponents?
        This game is perfect for word enthusiasts and tricksters alike. Whether
        you&#39;re playing against the computer, with friends locally, or with
        players from all over the world, you&#39;re in for a treat."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <TabWrapper>
        <HomeScreen />
      </TabWrapper>
    </>
  );
}
