import { NotificationBadge } from "@components/ProfileImage/ProfileImage";
import { useGamesStore } from "@components/store";
import { useUser } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import styles from "./TabWrapper.module.css";

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
        (g.player_one_id === user?.id && g.current_player_index === 0) ||
        (g.player_two_id === user?.id && g.current_player_index === 1)
    );
    setGameNotifications(gamesWhereUserTurn.length);
  }, [games]);

  return (
    <div className={styles.tabsWrapper} data-testid="TabWrapper-wrapper">
      {children}

      <nav className={styles.tabs}>
        <Link
          href="/"
          className={styles.tab}
          data-active-tab={currentRoute === "/"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
          </svg>
          Home
        </Link>
        <Link
          href="/games"
          className={styles.tab}
          data-active-tab={currentRoute === "/games"}
        >
          {gameNotifications > 0 && (
            <div className={styles.notification}>
              <NotificationBadge text={gameNotifications.toString()} count />
            </div>
          )}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
            />
          </svg>
          Game
        </Link>

        <Link
          href="/profile"
          className={styles.tab}
          data-active-tab={currentRoute === "/profile"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
          Profile
        </Link>
      </nav>
    </div>
  );
};
export default TabWrapper;
