import { OutlineText } from "@components/OutlineText";
import { NotificationBadge } from "@components/ProfileImage/ProfileImage";
import { useGamesStore } from "@components/store";
import { useUser } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import styles from "./TabWrapper.module.css";
import { motion } from "framer-motion";

export type TabWrapperProps = {
  children: React.ReactNode;
};
const TabWrapper = ({ children }: TabWrapperProps) => {
  const [gameNotifications, setGameNotifications] = useState(0);
  const router = useRouter();
  const currentRoute = router.pathname;
  const { games } = useGamesStore();
  const user = useUser();

  useEffect(() => {
    const gamesWhereUserTurn = games.filter(
      (g) =>
        ((user?.id === g.player_one_id && g.current_player_index === 0) ||
          (user?.id === g.player_two_id && g.current_player_index === 1)) &&
        g.player_two_id !== null
    );
    setGameNotifications(gamesWhereUserTurn.length);
  }, [games]);

  return (
    <div className={styles.tabsWrapper} data-testid="TabWrapper-wrapper">
      <div className={styles.landscape}>
        <OutlineText
          text={"The game wont fit in landscape, please rotate your device"}
          sizeInRem={2}
          upperCase={true}
          alignment={"center"}
        />
      </div>
      <div className={styles.portrait}>{children}</div>
      <nav className={styles.tabs}>
        <Link
          href="/"
          className={styles.tab}
          data-active-tab={currentRoute === "/"}
        >
          <OutlineText
            text={"Home"}
            sizeInRem={0.875}
            upperCase={true}
            alignment={"center"}
          />
        </Link>
        <Link
          href="/games"
          className={styles.tab}
          data-active-tab={currentRoute === "/games"}
        >
          <OutlineText
            text={"My Games"}
            sizeInRem={0.875}
            upperCase={true}
            alignment={"center"}
          />
          {gameNotifications > 0 && (
            <div className={styles.notification}>
              <NotificationBadge text={gameNotifications.toString()} />
            </div>
          )}
        </Link>

        <Link
          href="/profile"
          className={styles.tab}
          data-active-tab={currentRoute === "/profile"}
        >
          <OutlineText
            text={"Profile"}
            sizeInRem={0.875}
            upperCase={true}
            alignment={"center"}
          />
        </Link>
      </nav>
    </div>
  );
};
export default TabWrapper;
