import React, { useEffect, useState } from "react";
import styles from "./Layout.module.css";
import { useGamesStore, useUserProfileStore } from "@components/store";
import {
  useUser,
  useSupabaseClient,
  useSession,
} from "@supabase/auth-helpers-react";
import { Database } from "@utilities/supabase";
import { default_avatar } from "@utilities/constants";
import Link from "next/link";
import { useRouter } from "next/router";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import { AccountSettings } from "@components/account/AccountSettings";
import { useDownloadImages } from "@hooks/useDownloadImages";

type Profiles = Database["public"]["Tables"]["profiles"]["Row"];
type Games = Database["public"]["Tables"]["games"]["Row"];

export type LayoutProps = {
  children: React.ReactNode;
};
const Layout = ({ children }: LayoutProps) => {
  const { userProfile, setUserProfile, userAvatarUrl, setUserAvatarUrl } =
    useUserProfileStore();
  const { games, addGame, deleteGame, updateGame } = useGamesStore();
  const user = useUser();
  const supabaseProfiles = useSupabaseClient<Profiles>();
  const supabaseGames = useSupabaseClient<Games>();
  const router = useRouter();
  const session = useSession();
  const supabase = useSupabaseClient();
  const { downloadImagesFromUrls, playerOneImage } = useDownloadImages();

  async function getProfile(): Promise<Profiles | undefined> {
    try {
      if (!user) throw new Error("No user");
      let { data, error, status } = await supabaseProfiles
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        return data as Profiles;
      }
    } catch (error) {
      console.log("Error loading user data!");
      console.log(error);
    }
  }

  useEffect(() => {
    if (!user) return;
    if (!userProfile) {
      getProfile().then((profile) => {
        if (profile) {
          setUserProfile(profile);
          downloadImagesFromUrls([profile.avatar_url ?? default_avatar, ""]);
          setUserAvatarUrl(playerOneImage);
        }
      });
    }
  }, [userProfile, user]);

  useEffect(() => {
    if (!user) return;
    const gamesData = supabaseGames
      .channel("user-games")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "games",
          filter: `player_one_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newItem: Games = payload.new as Games;
            addGame(newItem);
          }
          if (payload.eventType === "DELETE") {
            const gameToRemove: Games = payload.old as Games;
            deleteGame(gameToRemove);
          }
          if (payload.eventType === "UPDATE") {
            const gameToUpdate: Games = payload.new as Games;
            updateGame(gameToUpdate);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "games",
          filter: `player_two_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newItem: Games = payload.new as Games;
            addGame(newItem);
          }
          if (payload.eventType === "DELETE") {
            const gameToRemove: Games = payload.old as Games;
            deleteGame(gameToRemove);
          }
          if (payload.eventType === "UPDATE") {
            const gameToUpdate: Games = payload.new as Games;
            updateGame(gameToUpdate);
          }
          console.log("Change received plyer two!", payload);
        }
      )
      .subscribe();

    return () => {
      gamesData.unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    if (!user || games.length > 0) return;
    const retrieveAllGames = async () => {
      let { data, error } = await supabaseGames
        .from("games")
        .select("*")
        .or(`player_one_id.eq.${user.id},player_two_id.eq.${user.id}`);
      if (data) {
        const gameGata: Games[] = data;
        gameGata.forEach((game) => addGame(game));
      }
      if (error) {
        console.log(error);
      }
    };

    retrieveAllGames();
  }, [user]);

  return (
    <div data-testid="Layout-wrapper" className={styles.layout}>
      {!session && (
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
          providers={["google", "facebook", "twitter"]}
        />
      )}
      {session && (
        <>
          <nav className={styles.header}>
            {router.pathname === "/game/[game]" && (
              <>
                <Link href="/games" className={styles.backLink}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Games
                </Link>
              </>
            )}
          </nav>

          <main className={styles.main}>
            <>
              {userAvatarUrl !== "" && <>{children}</>}
              {userAvatarUrl === "" && <AccountSettings session={session} />}
            </>
          </main>
        </>
      )}
    </div>
  );
};
export default Layout;
