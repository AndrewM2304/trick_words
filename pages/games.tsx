import { GameScreen } from "@components/GameScreen";
import { TabWrapper } from "@components/TabWrapper";
import { Layout } from "@components/Layout";

import React from "react";
import Head from "next/head";

export default function Games() {
  return (
    <>
      <Head>
        <title>Trick Words - Games</title>
        <meta name="description" content="Trick Words - Game Screen" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TabWrapper>
        <GameScreen />
      </TabWrapper>
    </>
  );
}
