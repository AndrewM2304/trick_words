import { Keyboard } from "@components/keyboard/Keyboard";
import React, { useState, useEffect, useCallback } from "react";
import styles from "../../styles/Game.module.css";
import {
  KeyboardSensor,
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensors,
  useSensor,
  Announcements,
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
import { motion, Variants } from "framer-motion";
import { useGetGameData } from "@hooks/useGetGameData";
import { useDownloadImages } from "@hooks/useDownloadImages";
import {
  useDeleteModal,
  useOnlineUsers,
  useUserProfileStore,
} from "@components/store";
import { usePlayerTurn } from "@hooks/usePlayerTurn";
import { useRouter } from "next/router";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import { HowItWorks } from "@components/HowItWorks";

export default function Game() {
  const [displayHomeLink, setDisplayHomeLink] = useState(false);
  const [shareButtonText, setShareButtonText] = useState("Invite Player");
  const [help, setHelp] = useState(false);
  const { setImage } = useDownloadImages();
  const { userProfile } = useUserProfileStore();
  const [displayKeyboard, setDisplayKeyboard] = useState(false);
  const {
    gameData,
    status,
    error: gameError,
    loading,
  } = useGetGameData(userProfile);
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
    error: turnError,
  } = usePlayerTurn();
  const supabasedefault = useSupabaseClient();
  const { setGameToDelete, setDisplayDeleteModal, setButtonText } =
    useDeleteModal();

  const deleteGame = (text: string, gameToDelete: Game) => {
    setButtonText(text);
    setGameToDelete(gameToDelete);
    setDisplayDeleteModal();
  };
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
    // remove accidental swipe to previous page safari
    document?.addEventListener("touchstart", (e) => {
      if (
        e.touches[0].pageX > 20 &&
        e.touches[0].pageX < window?.innerWidth - 20
      )
        return;
      e.preventDefault();
    });
  }, []);

  useEffect(() => {
    setGame(gameData);
    if (gameData && !gameError) {
      setDisplayHomeLink(false);
      setImage(gameData.player_one_avatar).then((i) => setp1Image(i));
      setImage(gameData.player_two_avatar).then((i) => setp2Image(i));
    }

    if (gameData && gameData.winner) {
      setShowDialog(true);
      setDialogMessage(`winner is ${gameData.winner}`);
      setDisplayHomeLink(true);
    }
  }, [gameData, userProfile, gameError]);

  useEffect(() => {
    if (gameError) {
      setDialogMessage("game error " + gameError.message);
      setDisplayHomeLink(true);
    }
    if (turnError) {
      setDialogMessage("turn error " + turnError.message);
      setDisplayHomeLink(true);
    }
  }, [gameError, turnError]);

  useEffect(() => {
    if (!gameData || !game) return;
    if (gameData?.current_player_index === 0 && !userProfile) {
      setPlayerTurnName("Your turn");
    } else {
      gameData?.current_player_index === 0
        ? setPlayerTurnName(`${gameData?.player_one_name}'s turn`)
        : setPlayerTurnName(`${gameData?.player_two_name}'s turn`);
    }
    if (gameData?.game_type !== GameType.ONLINE_MULTIPLAYER) {
      setDisplayKeyboard(true);
    } else {
      game?.current_player_id === userProfile?.id
        ? setDisplayKeyboard(true)
        : setDisplayKeyboard(false);
    }
  }, [gameData, game]);

  const displayGame = (): boolean => {
    if (gameData?.game_type !== GameType.ONLINE_MULTIPLAYER) {
      return true;
    }
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

  const keyboardVariations: Variants = {
    initialState: {
      opacity: 0,
      translateY: "600px",
    },
    animateState: {
      opacity: 1,
      translateY: "0px",
    },
    exitState: {
      opacity: 0,
      translateY: "600px",
    },
  };

  const wrapperVariants = {
    initial: {
      clipPath: "polygon(52% 0%, 52% 0%, 53% 100%, 53% 100%)",
      transition: { duration: 0.3 },
    },
    animate: {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      transition: { duration: 0.3 },
    },
  };

  const defaultAnnouncements: Announcements = {
    onDragStart({ active }) {
      return `Picked up tile ${active.id}.`;
    },
    onDragOver({ active, over }) {
      if (over && over.id === "left") {
        return `Add ${active.id} to the start to make  ${game?.current_word}${active.id}.`;
      }
      if (over && over.id === "right") {
        return `Add ${active.id} to the end to make ${active.id}${game?.current_word}.`;
      }

      return `Tile ${active.id} is no longer over a droppable area.`;
    },
    onDragEnd({ active, over }) {
      if (over) {
        return `checking word...`;
      }

      return `Tile ${active.id} was dropped.`;
    },
    onDragCancel({ active }) {
      return `Dragging was cancelled. Tile ${active.id} was dropped.`;
    },
  };

  return (
    <>
      {!displayAuth() && !loading && gameData && (
        <motion.div
          className={styles.gameWrapper}
          data-testid="Game-wrapper"
          key={router.route}
          variants={wrapperVariants}
          initial="initial"
          animate="animate"
        >
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
                      <Button
                        type={"tertiary"}
                        text={"Help"}
                        action={() => setHelp(true)}
                      />
                    </nav>
                    {!game.winner && (
                      <>
                        <main className={styles.gameBody}>
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
                                disabled={
                                  game.game_type ===
                                    GameType.ONLINE_MULTIPLAYER &&
                                  userProfile?.id !== game.current_player_id
                                }
                              />
                            )}

                            <Button
                              text="End Game"
                              type={"delete"}
                              action={() => {
                                deleteGame("End Game", game);
                              }}
                            />
                          </div>

                          <DndContext
                            onDragStart={(e) => handleDragStart(e)}
                            onDragEnd={(e) => handleDragEnd(e)}
                            modifiers={[restrictToWindowEdges]}
                            sensors={sensors}
                            accessibility={{
                              announcements: defaultAnnouncements,
                              screenReaderInstructions: {
                                draggable: `Current word: ${game.current_word}, select a letter, to start dragging press space and use the arrow keys to move it up and left or right to add the letter to the start of the end of the word. Press space to release the tile or escape to cancel `,
                              },
                            }}
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
                            {displayKeyboard && (
                              <motion.div
                                variants={keyboardVariations}
                                key={"keyboard"}
                                initial="initialState"
                                animate="animateState"
                                exit="exitState"
                                transition={{
                                  type: "spring",
                                  bounce: 0.2,
                                  duration: 0.6,
                                  delay: 0.2,
                                }}
                              >
                                <Keyboard />
                              </motion.div>
                            )}
                            {!displayKeyboard && (
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
                          <section className={styles.gameInfo}>
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
                                    animateDelay={`${idx * 0.1}s`}
                                  />
                                );
                              })}
                              <li className={styles.emptyTile}></li>
                            </ul>
                          </section>
                        </main>
                      </>
                    )}
                  </>
                )}
              </div>
              <Dialog
                setDisplay={() => setShowDialog(false)}
                display={showDialog}
              >
                <div className="ds" aria-live={"assertive"}>
                  <OutlineText
                    text={dialogMessage}
                    sizeInRem={1.4}
                    upperCase={false}
                    alignment={"center"}
                    focus={true}
                  />
                </div>
                {displayHomeLink && (
                  <>
                    <br />
                    <Button
                      text={gameError || turnError ? "Reload Game" : "Go Home"}
                      action={() =>
                        gameError || turnError
                          ? router.reload()
                          : router.push("/")
                      }
                      type="primary"
                    />{" "}
                  </>
                )}
              </Dialog>
              <Dialog setDisplay={() => setHelp(false)} display={help}>
                <HowItWorks closeDialog={() => setHelp(false)} />
              </Dialog>
            </div>
          )}
        </motion.div>
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
      {!gameData && !loading && (
        <div className={styles.gameWrapper} data-testid="Game-wrapper">
          <div className={styles.auth}>
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
        </div>
      )}
    </>
  );
}

type Score = {
  playerOneAvatar: string;
  playerTwoAvatar: string;
  game: Game;
};
const ScoreSection = ({ playerOneAvatar, playerTwoAvatar, game }: Score) => {
  const { users } = useOnlineUsers();

  const displayOnline = useCallback(
    (userId: string): boolean => {
      if (game.game_type !== GameType.ONLINE_MULTIPLAYER) return false;
      return users.includes(userId);
    },
    [users]
  );
  return (
    <section
      className={styles.playerScoreWrapper}
      data-testid="player-score-wrapper"
    >
      {playerOneAvatar && (
        <div className={styles.onlineWrapper}>
          {displayOnline(game.player_one_id ?? "") && (
            <div className={styles.online}></div>
          )}
          <Image
            priority
            className={styles.playerOneImage}
            src={playerOneAvatar}
            height={38}
            width={38}
            alt={`${game.player_one_name} avatar`}
          />
        </div>
      )}

      <div className={styles.playerOneName} data-testid="player-one-name">
        <OutlineText
          text={game.player_one_name.split(" ")[0]}
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
      {playerTwoAvatar && (
        <div className={styles.onlineWrapper}>
          {displayOnline(game.player_two_id ?? "") && (
            <div className={styles.online}></div>
          )}
          <Image
            priority
            className={styles.playerTwoImage}
            src={playerTwoAvatar}
            height={38}
            width={38}
            alt={`${game.player_two_name} avatar`}
          />
        </div>
      )}
      <div className={styles.playerTwoName}>
        <OutlineText
          text={game.player_two_name.split(" ")[0]}
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
    </section>
  );
};
