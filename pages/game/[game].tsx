import { Keyboard } from "@components/keyboard/Keyboard";
import React, { useState, useEffect } from "react";
import styles from "../../styles/Game.module.css";
import {
  KeyboardSensor,
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensors,
  useSensor,
} from "@dnd-kit/core";
import { DroppableArea } from "@components/game/DroppableArea";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { Database } from "@utilities/supabase";
type Game = Database["public"]["Tables"]["games"]["Row"];
import Link from "next/link";
import { Layout } from "@components/Layout";
import Image from "next/image";
import { Button } from "@components/Button";
import { OutlineText } from "@components/OutlineText";
import { KeyboardTile } from "@components/keyboard/KeyboardTile";
import { Dialog } from "@components/Dialog";
import { GameType } from "@utilities/game";

import { useGetGameData } from "@hooks/useGetGameData";
import { useDownloadImages } from "@hooks/useDownloadImages";
import { useUserProfileStore } from "@components/store";
import { usePlayerTurn } from "@hooks/usePlayerTurn";
import { useRouter } from "next/router";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useDeleteGame } from "@hooks/useDeleteGame";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";

export default function Game() {
  const [displayHomeLink, setDisplayHomeLink] = useState(false);
  const [shareButtonText, setShareButtonText] = useState("Invite Player");
  const { setImage } = useDownloadImages();
  const { userProfile } = useUserProfileStore();

  const { gameData, status, error, loading } = useGetGameData(userProfile);
  const router = useRouter();
  const [p1image, setp1Image] = useState<string | null>(null);
  const [p2image, setp2Image] = useState<string | null>(null);
  const [playerTurnName, setPlayerTurnName] = useState("");
  const user = useUser();
  const {
    handleDragStart,
    handleDragEnd,
    setGame,
    forfeitGame,
    setShowDialog,
    game,
    selectedLetter,
    dialogMessage,
    showDialog,
    setDialogMessage,
  } = usePlayerTurn();
  const supabasedefault = useSupabaseClient();

  const { deleteGame } = useDeleteGame();

  // sensor setup for droppable area
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      delay: 50,
      tolerance: 5,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 5,
      tolerance: 5,
    },
  });
  const keyboardSensor = useSensor(KeyboardSensor, {});
  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  const inviteGame = async () => {
    if (typeof window === undefined) return;
    const shareData = {
      title: `${game?.player_one_name} invites you to a game`,
      text: "Follow the link to join the game",
      url: `${window.location.origin}/game/${game?.id}?gameroom=${
        game?.secret_key
      }&gametype=${
        game?.game_type === GameType.ONLINE_MULTIPLAYER ? "online" : "local"
      }`,
    };

    if (navigator.canShare!) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error(err);
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      setShareButtonText("URL Copied!");
      setTimeout(() => {
        setShareButtonText("Invite Player");
      }, 2000);
    }
  };

  useEffect(() => {
    if (!gameData && !error) {
      setShowDialog(true);
      setDialogMessage("Loading Game");
    }
    if (error) {
      setDialogMessage(error.message.toString());
      setDisplayHomeLink(true);
    }

    setGame(gameData);

    if (gameData && !error) {
      setShowDialog(false);

      setDialogMessage("Checking word...");
      setDisplayHomeLink(false);
      setImage(gameData.player_one_avatar).then((i) => setp1Image(i));
      setImage(gameData.player_two_avatar).then((i) => setp2Image(i));
    }

    if (gameData && gameData.winner) {
      setShowDialog(true);
      setDialogMessage(`winner is ${gameData.winner}`);
      setDisplayHomeLink(true);
    }
  }, [gameData, userProfile, error]);

  useEffect(() => {
    if (game?.current_player_index === 0 && !userProfile) {
      return setPlayerTurnName("Your turn");
    } else {
      game?.current_player_index === 0
        ? setPlayerTurnName(`${game?.player_one_name}'s turn`)
        : setPlayerTurnName(`${game?.player_two_name}'s turn`);
    }
  }, [game?.current_player_index]);

  const displayKeyboard = (): boolean => {
    if (!game) return false;
    if (game.game_type !== GameType.ONLINE_MULTIPLAYER) return true;
    if (playerTurnName.includes(userProfile?.full_name!)) {
      return true;
    } else {
      return false;
    }
  };

  const displayGame = (): boolean => {
    return (
      user?.id === gameData?.player_one_id ||
      user?.id === gameData?.player_two_id
    );
  };

  const displayAuth = (): boolean => {
    return gameData?.game_type === GameType.ONLINE_MULTIPLAYER && !user;
  };
  const redirect = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/redirect`;
    }
  };

  return (
    <Layout>
      {gameData && !displayAuth() && !loading && (
        <div className={styles.gameWrapper} data-testid="Game-wrapper">
          {displayGame() && (
            <div className="central-width-container " data-central>
              <div className={styles.landscape}>
                <OutlineText
                  text={
                    "The game wont fit in landscape, please rotate your device"
                  }
                  sizeInRem={2}
                  upperCase={false}
                  alignment={"center"}
                />
              </div>
              <div className={styles.portrait}>
                {game && p1image && p2image && (
                  <>
                    <nav className={styles.nav}>
                      <Link href="/games" className={styles.backLink}>
                        <svg
                          width="14"
                          height="20"
                          viewBox="0 0 14 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M11 4L3.95522 9.72389C3.46267 10.1241 3.46267 10.8759 3.95522 11.2761L11 17"
                            stroke="black"
                            strokeWidth="5"
                            strokeLinecap="round"
                          />
                          <path
                            d="M10 3L2.95522 8.72389C2.46267 9.12408 2.46267 9.87592 2.95522 10.2761L10 16"
                            stroke="black"
                            strokeWidth="5"
                            strokeLinecap="round"
                          />
                          <path
                            d="M10 3L2.95522 8.72389C2.46267 9.12408 2.46267 9.87592 2.95522 10.2761L10 16"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                        <OutlineText
                          text={"Back"}
                          sizeInRem={1.1}
                          upperCase={true}
                          alignment={"left"}
                        />
                      </Link>
                    </nav>
                    {!game.winner && (
                      <>
                        <div className={styles.gameBody}>
                          <ScoreSection
                            playerOneAvatar={p1image}
                            playerTwoAvatar={p2image}
                            game={game}
                          />
                          <div className={styles.buttonRow}>
                            {game.game_type === GameType.ONLINE_MULTIPLAYER &&
                              game.player_two_id === null && (
                                <>
                                  <Button
                                    text={shareButtonText}
                                    type={"primary"}
                                    action={() => inviteGame()}
                                  />
                                </>
                              )}

                            {game.player_two_id && (
                              <Button
                                text="forfeit round"
                                type={"secondary"}
                                action={() => forfeitGame()}
                              />
                            )}

                            <Button
                              text="End Game"
                              type={"delete"}
                              action={() => {
                                deleteGame(game).then(() =>
                                  router.push("/games")
                                );
                              }}
                            />
                          </div>

                          <DndContext
                            onDragStart={(e) => handleDragStart(e)}
                            onDragEnd={(e) => handleDragEnd(e)}
                            modifiers={[restrictToWindowEdges]}
                            sensors={sensors}
                          >
                            <div className={styles.dropArea}>
                              <DroppableArea
                                area={"left"}
                                word={`${selectedLetter}${game.current_word}`}
                              />

                              <DroppableArea
                                area={"right"}
                                word={`${game.current_word}${selectedLetter}`}
                              />
                            </div>
                            {displayKeyboard() ? (
                              <Keyboard />
                            ) : (
                              <div className={styles.noKeyboard}>
                                <OutlineText
                                  alignment={"center"}
                                  sizeInRem={2}
                                  text={"Not your turn"}
                                  upperCase={false}
                                />
                              </div>
                            )}
                          </DndContext>
                          <div className={styles.gameInfo}>
                            <OutlineText
                              alignment={"center"}
                              sizeInRem={2}
                              text={playerTurnName}
                              upperCase={false}
                            />
                            <ul className={styles.wordWrapper}>
                              <li className={styles.emptyTile}></li>
                              {game.current_word.split("").map((w, idx) => {
                                return (
                                  <KeyboardTile
                                    letter={w}
                                    key={idx}
                                    disabled={true}
                                  />
                                );
                              })}
                              <li className={styles.emptyTile}></li>
                            </ul>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
              <Dialog
                setDisplay={() => setShowDialog(false)}
                display={showDialog}
              >
                <OutlineText
                  text={dialogMessage}
                  sizeInRem={1.4}
                  upperCase={false}
                  alignment={"center"}
                  focus={true}
                />
                {displayHomeLink && (
                  <>
                    <br />
                    <Button
                      text="Go Home"
                      action={() => router.push("/")}
                      type="primary"
                    />{" "}
                  </>
                )}
              </Dialog>
            </div>
          )}

          {!displayGame() && (
            <div className={styles.noDisplay}>
              <OutlineText
                text={"No game found, return home"}
                sizeInRem={2}
                upperCase={false}
                alignment={"center"}
              />{" "}
              <Button
                text="Go Home"
                action={() => router.push("/")}
                type="primary"
              />
            </div>
          )}
        </div>
      )}
      {displayAuth() && !loading && (
        <div className={styles.gameWrapper}>
          <div className={styles.auth}>
            <OutlineText
              text={
                "Looks like you are trying to access an online game, sign in to play online"
              }
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
            <Button
              type={"primary"}
              text={"Return to home"}
              action={() => router.push("/")}
            />
          </div>
        </div>
      )}
    </Layout>
  );
}

type Score = {
  playerOneAvatar: string;
  playerTwoAvatar: string;
  game: Game;
};
const ScoreSection = ({ playerOneAvatar, playerTwoAvatar, game }: Score) => {
  return (
    <div
      className={styles.playerScoreWrapper}
      data-testid="player-score-wrapper"
    >
      <Image
        className={styles.playerOneImage}
        src={playerOneAvatar}
        height={38}
        width={38}
        alt={`${game.player_one_name} avatar`}
      />

      <div className={styles.playerOneName} data-testid="player-one-name">
        <OutlineText
          text={game.player_one_name}
          sizeInRem={1.2}
          alignment="left"
          upperCase={false}
        />
      </div>
      <div className={styles.playerOneScore} data-testid="player-one-score">
        <OutlineText
          text={game.player_one_score.toString()}
          sizeInRem={1.4}
          upperCase={false}
          alignment="left"
        />
      </div>
      <Image
        className={styles.playerTwoImage}
        src={playerTwoAvatar}
        height={38}
        width={38}
        alt={`${game.player_two_name} avatar`}
      />

      <div className={styles.playerTwoName}>
        <OutlineText
          text={game.player_two_name}
          sizeInRem={1.2}
          alignment="right"
          upperCase={false}
        />
      </div>
      <div className={styles.playerTwoScore}>
        <OutlineText
          text={game.player_two_score.toString()}
          sizeInRem={1.4}
          upperCase={false}
          alignment="right"
        />
      </div>
    </div>
  );
};
