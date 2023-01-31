import React, { useEffect, useState } from "react";
import styles from "./Layout.module.css";
import { useGamesStore, useUserProfileStore } from "@components/store";
import {
  useUser,
  useSupabaseClient,
  useSessionContext,
} from "@supabase/auth-helpers-react";
import { Database } from "@utilities/supabase";
import { SetupProfile } from "@components/SetupProfile";
import { useWindowVisibilityState } from "@hooks/useWindowVisibilityState";
import { useHandleError } from "@hooks/useHandleError";
import { ErrorModal } from "@components/ErrorModal";
import { DeleteModal } from "@components/DeleteModal";

type Profiles = Database["public"]["Tables"]["profiles"]["Row"];
type Games = Database["public"]["Tables"]["games"]["Row"];

export type LayoutProps = {
  children: React.ReactNode;
};
const Layout = ({ children }: LayoutProps) => {
  const { userProfile, setUserProfile } = useUserProfileStore();
  const { games, addGame, deleteGame, updateGame } = useGamesStore();
  const user = useUser();
  const supabaseProfiles = useSupabaseClient<Profiles>();
  const supabaseGames = useSupabaseClient<Games>();
  const { session, isLoading } = useSessionContext();
  const [localLoad, setLocalLoad] = useState(false);
  const { captureError } = useHandleError();

  async function getProfile(): Promise<Profiles | undefined> {
    try {
      let { data, error, status } = await supabaseProfiles
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error && status !== 406) {
        captureError(error);
      }

      if (data) {
        return data as Profiles;
      }
    } catch (error) {
      console.error("Error loading user data!");
    }
  }

  useEffect(() => {
    if (!user) return;
    setLocalLoad(true);
    if (!userProfile) {
      getProfile().then((profile) => {
        if (profile) {
          setUserProfile(profile);
        }
        setTimeout(() => {
          setLocalLoad(false);
        }, 100);
      });
    } else {
      setLocalLoad(false);
    }
  }, [userProfile, user]);

  useEffect(() => {
    if (!user) return;
    supabaseGames
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
        }
      )
      .subscribe();
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
        captureError(error);
      }
    };

    retrieveAllGames();
  }, [user]);

  const setUpProfile = (): boolean => {
    return !userProfile?.avatar_url && session ? true : false;
  };

  return (
    <div data-testid="Layout-wrapper" className={styles.layout}>
      {!isLoading && !localLoad && (
        <>
          {setUpProfile() && <SetupProfile firstUsage={true} />}
          {!setUpProfile() && <> {children}</>}
          <ErrorModal />
          <DeleteModal />
        </>
      )}
    </div>
  );
};
export default Layout;
