import React, { useState, useEffect } from "react";
import styles from "./Tabs.module.css";

export type TabsProps = {
  HomeScreen: React.ReactNode;
  GameScreen: React.ReactNode;
  SettingsScreen: React.ReactNode;
};
type activeTabType = "home" | "game" | "settings";
const Tabs = ({ HomeScreen, GameScreen, SettingsScreen }: TabsProps) => {
  const [activeTab, setActiveTab] = useState<activeTabType>("home");

  return (
    <div data-testid="Tabs-wrapper">
      <div className={styles.component}>
        {activeTab === "home" && HomeScreen}
        {activeTab === "game" && GameScreen}
        {activeTab === "settings" && SettingsScreen}
      </div>
      <nav className={styles.tabs}>
        <button
          data-active-tab={activeTab === "home"}
          className={styles.tab}
          onClick={() => setActiveTab("home")}
        >
          Home
        </button>
        <button
          data-active-tab={activeTab === "game"}
          className={styles.tab}
          onClick={() => setActiveTab("game")}
        >
          Game
        </button>
        <button
          data-active-tab={activeTab === "settings"}
          className={styles.tab}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </button>
      </nav>
    </div>
  );
};
export default Tabs;
