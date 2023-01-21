import { GameScreen } from "@components/GameScreen";
import { TabWrapper } from "@components/TabWrapper";
import { Layout } from "@components/Layout";

import React from "react";

export default function Games() {
  return (
    <TabWrapper>
      <GameScreen />
    </TabWrapper>
  );
}
