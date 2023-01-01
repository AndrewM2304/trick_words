import { useUserProfileStore } from "@components/store";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import React, { useState, useRef, FormEvent } from "react";
import styles from "./HomeScreen.module.css";
import { Database } from "@utilities/supabase";
import { default_avatar, local_game } from "@utilities/constants";
import { useEffect } from "react";
import { GameType } from "@utilities/game";
import { useDownloadImages } from "src/hooks/useDownloadImages";
import Image from "next/image";

type Games = Database["public"]["Tables"]["games"]["Row"];
export type HomeScreenProps = {};
const HomeScreen = ({}: HomeScreenProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const user = useUser();
  const { userProfile } = useUserProfileStore();
  const [secondPlayer, setSecondPlayer] = useState("");
  const [loading, setLoading] = useState(false);
  const [gameType, setGameType] = useState<GameType>(GameType.COMPUTER);
  const supabase = useSupabaseClient<Games>();
  const router = useRouter();

  const openDialog = () => {
    dialogRef.current?.showModal();
  };

  const createGame = async () => {
    console.log(gameType);
    if (!user) throw new Error("No user");
    const newGame: Partial<Games> = {
      current_word: "a",
      current_letter_index: 0,
      player_one_id: user.id,
      player_one_name: user.user_metadata.full_name,
      player_one_avatar:
        userProfile?.avatar_url ?? user.user_metadata.avatar_url,
      game_type: gameType,
      current_player_index: 0,
    };
    if (gameType === "computer" || gameType === "local_multiplayer") {
      const savedItems = window.localStorage.getItem(local_game);
      newGame.player_two_id = crypto.randomUUID();
      newGame.player_two_name =
        gameType === "computer" ? "Computer" : secondPlayer;
      newGame.player_two_avatar = default_avatar;
      newGame.player_one_score = 0;
      newGame.player_two_score = 0;
      const arrayOfGames: Games[] = [];
      if (savedItems) {
        arrayOfGames.push(...JSON.parse(savedItems));
      }
      newGame.id = arrayOfGames.length + 1;
      window.localStorage.setItem(
        local_game,
        JSON.stringify([...arrayOfGames, newGame])
      );
      dialogRef.current?.close();
      router.push(`/game/${newGame.id}?gametype=local`);
    }

    if (gameType === "online_multiplayer") {
      try {
        const { data, error } = await supabase
          .from("games")
          .insert(newGame)
          .select();
        if (data) {
          router.push(`/game/${data[0].id}`);
          console.log(data);
        }
        if (error) throw new Error(error.message);
      } catch (error) {
        console.log("Error loading user data!");
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div data-testid="HomeScreen-wrapper" className={styles.homeScreenWrapper}>
      <button onClick={() => openDialog()} className={"primary-button"}>
        {loading ? "loading" : "New Game"}
      </button>
      <button onClick={() => openDialog()} className={"secondary-button"}>
        How to Play
      </button>
      <dialog
        ref={dialogRef}
        className={styles.dialogBox}
        onClose={() => setSecondPlayer("")}
        onCancel={() => setSecondPlayer("")}
      >
        <fieldset className={styles.radioWrapper}>
          <legend>Select Game Type</legend>
          <label>
            <input
              type="radio"
              name="game-type"
              value="computer"
              checked={gameType === "computer"}
              onChange={(e) => setGameType(GameType.COMPUTER)}
            />
            <div className={styles.any}>Computer</div> Play against the computer
          </label>
          <label>
            <input
              type="radio"
              name="game-type"
              value="local_multiplayer"
              checked={gameType === "local_multiplayer"}
              onChange={(e) => setGameType(GameType.LOCAL_MULTIPLAYER)}
            />
            <div className={styles.any}>Pass and Play</div> Play with friends on
            the same device
          </label>

          <label>
            <input
              type="radio"
              name="game-type"
              value="online_multiplayer"
              checked={gameType === "online_multiplayer"}
              onChange={(e) => setGameType(GameType.ONLINE_MULTIPLAYER)}
            />{" "}
            <div className={styles.any}>Online Multiplayer</div> Play with
            friends online
          </label>
        </fieldset>
        {gameType === GameType.LOCAL_MULTIPLAYER && (
          <>
            <label htmlFor="player_name">Enter Second Player Name</label>
            <input
              type="text"
              name="player_name"
              id="player_name"
              value={secondPlayer}
              onChange={(e) => setSecondPlayer(e.target.value)}
            />
          </>
        )}
        <button onClick={() => createGame()}>create game</button>
      </dialog>
    </div>
  );
};
export default HomeScreen;
