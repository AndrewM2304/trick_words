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
  const supabase = useSupabaseClient();
  const { downloadImagesFromUrls, playerOneImage } = useDownloadImages();

  const session = useSession();

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
            console.log(payload);
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
        <main className={styles.main} style={{ margin: 15 }}>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="dark"
            providers={["facebook", "google"]}
            redirectTo={"https://word-game-2-5jouxygjw-andrewm2304.vercel.app"}
          />
        </main>
      )}
      {session && (
        <main className={styles.main}>
          <>
            {userAvatarUrl !== "" && <>{children}</>}
            {userAvatarUrl === "" && <AccountSettings />}
          </>
        </main>
      )}
    </div>
  );
};
export default Layout;
