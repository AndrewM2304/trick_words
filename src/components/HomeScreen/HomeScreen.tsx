import { useUserProfileStore } from "@components/store";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import React, { useState, useRef, useEffect } from "react";
import styles from "./HomeScreen.module.css";
import { Database } from "@utilities/supabase";
import {
  default_avatar,
  default_computer,
  local_game,
} from "@utilities/constants";
import { GameType } from "@utilities/game";
import { Button } from "@components/Button";
import { Dialog } from "@components/Dialog";
import { OutlineText } from "@components/OutlineText";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";

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
  const supabasedefault = useSupabaseClient();

  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);

  const createGame = async () => {
    if (!user) throw new Error("No user");
    const newGame: Partial<Games> = {
      current_word: "a",
      current_letter_index: 0,
      player_one_id: user.id,
      player_one_name: user.user_metadata.full_name,
      player_one_avatar:
        userProfile?.avatar_url ?? user.user_metadata.avatar_url,
      game_type: gameType!,
      current_player_index: 0,
    };
    if (
      gameType === GameType.COMPUTER ||
      gameType === GameType.LOCAL_MULTIPLAYER
    ) {
      const savedItems = window.localStorage.getItem(local_game);
      newGame.player_two_id = crypto.randomUUID();
      newGame.player_two_name =
        gameType === GameType.COMPUTER ? "Computer" : secondPlayer;
      newGame.player_two_avatar =
        gameType === GameType.COMPUTER ? default_computer : default_avatar;
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
      router.push(`/game/${newGame.id}?gametype=local`);
    }

    if (gameType === GameType.ONLINE_MULTIPLAYER) {
      try {
        const { data, error } = await supabase
          .from("games")
          .insert(newGame)
          .select();
        if (data) {
          router.push(`/game/${data[0].id}`);
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

  const displayButton = () => {
    if (
      gameType === GameType.COMPUTER ||
      gameType === GameType.ONLINE_MULTIPLAYER
    )
      return true;
    if (gameType === GameType.LOCAL_MULTIPLAYER && secondPlayer !== "")
      return true;
    else return false;
  };

  const closeModal = () => {
    setShowDialog(false);
    setSecondPlayer("");
    setGameType(GameType.COMPUTER);
  };

  const redirect = () => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
  };

  return (
    <div data-testid="HomeScreen-wrapper" className={styles.homeScreenWrapper}>
      <div className={styles.central}>
        <OutlineText
          text={"Word Duel"}
          sizeInRem={2}
          upperCase={true}
          alignment={"center"}
        />
        <Button
          text="New Game"
          action={() => setShowDialog(true)}
          type="primary"
        />
        <Button
          text="how to play"
          action={() => setShowDialog(true)}
          type="secondary"
        />
        <div className={styles.auth}>
          <OutlineText
            text={"Sign in to play online"}
            sizeInRem={1.2}
            upperCase={false}
            alignment={"left"}
          />

          <Auth
            onlyThirdPartyProviders
            supabaseClient={supabasedefault}
            appearance={{
              theme: ThemeSupa,
              className: {
                button: "auth-button",
              },
            }}
            theme="dark"
            providers={["facebook", "google"]}
            redirectTo={redirect()}
          />
        </div>
      </div>

      <Dialog
        display={showDialog}
        setDisplay={() => closeModal()}
        animate={true}
      >
        <button
          aria-label="close"
          className={styles.close}
          onClick={() => closeModal()}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 15L15 3M3 3L15 15"
              stroke="black"
              stroke-width="5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M3 15L15 3M3 3L15 15"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <fieldset className={styles.fieldset}>
          <legend>
            <OutlineText
              text={"Select Game Type"}
              sizeInRem={1.1}
              upperCase={false}
              alignment={"left"}
              focus={false}
            />
          </legend>
          <label className={styles.radio}>
            <div
              className={styles.indicator}
              data-checked={gameType === GameType.COMPUTER}
            ></div>
            <div className={styles.title}>Computer</div>

            <div className={styles.smallText}>Play against the computer</div>

            <input
              type="radio"
              name="game-type"
              value="computer"
              checked={gameType === GameType.COMPUTER}
              onChange={(e) => setGameType(GameType.COMPUTER)}
            />
          </label>
          <label className={styles.radio}>
            <div
              className={styles.indicator}
              data-checked={gameType === GameType.LOCAL_MULTIPLAYER}
            ></div>

            <div className={styles.title}>Pass and Play</div>
            <div className={styles.smallText}>
              Play local game on your device with friends
            </div>

            <input
              type="radio"
              name="game-type"
              value="local_multiplayer"
              checked={gameType === GameType.LOCAL_MULTIPLAYER}
              onChange={(e) => setGameType(GameType.LOCAL_MULTIPLAYER)}
            />
          </label>
          <label className={styles.radio}>
            <div
              className={styles.indicator}
              data-checked={gameType === GameType.ONLINE_MULTIPLAYER}
            ></div>
            <div className={styles.title}>Online Multiplayer</div>
            <div className={styles.smallText}>Play online against friends</div>
            <input
              type="radio"
              name="game-type"
              value="online_multiplayer"
              checked={gameType === GameType.ONLINE_MULTIPLAYER}
              onChange={(e) => setGameType(GameType.ONLINE_MULTIPLAYER)}
            />
          </label>
        </fieldset>
        {gameType === GameType.LOCAL_MULTIPLAYER && (
          <>
            <label htmlFor="player_name" className={styles.inputLabel}>
              Enter Second Player Name
            </label>
            <input
              placeholder="Enter Name"
              type="text"
              name="player_name"
              id="player_name"
              className={styles.input}
              value={secondPlayer}
              onChange={(e) => setSecondPlayer(e.target.value)}
              autoComplete={"off"}
            />
          </>
        )}
        {displayButton() && (
          <Button
            action={() => createGame()}
            text={"Create Game"}
            type={"primary"}
          ></Button>
        )}
      </Dialog>
    </div>
  );
};
export default HomeScreen;
