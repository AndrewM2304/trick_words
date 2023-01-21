import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useState, useRef, useEffect } from "react";
import styles from "./HomeScreen.module.css";
import { GameType } from "@utilities/game";
import { Button } from "@components/Button";
import { Dialog } from "@components/Dialog";
import { OutlineText } from "@components/OutlineText";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import { useCreateGame } from "@hooks/useCreateGame";
import { HowItWorks } from "@components/HowItWorks";

export type HomeScreenProps = {};
const HomeScreen = ({}: HomeScreenProps) => {
  const {
    gameType,
    setGameType,
    createGame,
    gameDifficulty,
    setGameDifficulty,
    secondPlayer,
    setSecondPlayer,
  } = useCreateGame();
  const supabasedefault = useSupabaseClient();
  const [showDialog, setShowDialog] = useState(false);
  const session = useSession();
  const [modalType, setModalType] = useState<"game" | "info">("game");

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

  const selectDifficulty = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const option: any = e.target.value;
    setGameDifficulty(option);
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
          action={() => {
            setModalType("game");
            setShowDialog(true);
          }}
          type="primary"
        />
        <Button
          text="how to play"
          action={() => {
            setModalType("info");
            setShowDialog(true);
          }}
          type="secondary"
        />
        {!session && (
          <>
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
          </>
        )}
      </div>

      <Dialog
        display={showDialog}
        setDisplay={() => closeModal()}
        animate={true}
      >
        {modalType === "game" && (
          <>
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
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 15L15 3M3 3L15 15"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
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

                <div className={styles.smallText}>
                  Play against the computer
                </div>

                <input
                  type="radio"
                  name="game-type"
                  value="computer"
                  checked={gameType === GameType.COMPUTER}
                  onChange={() => setGameType(GameType.COMPUTER)}
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
                  onChange={() => setGameType(GameType.LOCAL_MULTIPLAYER)}
                />
              </label>

              <label className={styles.radio}>
                <div
                  className={styles.indicator}
                  data-checked={gameType === GameType.ONLINE_MULTIPLAYER}
                ></div>
                <div className={styles.title}>Online Multiplayer</div>
                <div className={styles.smallText}>
                  Play online against friends
                </div>
                <input
                  disabled={!session}
                  type="radio"
                  name="game-type"
                  value="online_multiplayer"
                  checked={gameType === GameType.ONLINE_MULTIPLAYER}
                  onChange={() => setGameType(GameType.ONLINE_MULTIPLAYER)}
                />
              </label>
            </fieldset>
            {gameType === GameType.COMPUTER && (
              <>
                <label htmlFor="difficulty" className={styles.inputLabel}>
                  Select game difficulty
                </label>
                <div className={styles.select}>
                  <select
                    name="difficulty"
                    id="difficulty"
                    className={styles.input}
                    value={gameDifficulty ?? ""}
                    placeholder="Select Difficulty"
                    onChange={(e) => selectDifficulty(e)}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                  <svg
                    width="18"
                    height="10"
                    viewBox="0 0 18 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16.5 1.25L9 8.75L1.5 1.25"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </>
            )}
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
          </>
        )}
        {modalType === "info" && (
          <HowItWorks closeDialog={() => setShowDialog(false)} />
        )}
      </Dialog>
    </div>
  );
};
export default HomeScreen;
