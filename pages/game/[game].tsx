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
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { local_game } from "@utilities/constants";
import { useDeleteGame } from "@hooks/useDeleteGame";

export default function Game() {
  const [displayHomeLink, setDisplayHomeLink] = useState(false);
  const [shareButtonText, setShareButtonText] = useState("Invite Player");
  const { playerOneImage, playerTwoImage, downloadImagesFromUrls } =
    useDownloadImages();
  const { gameData, status, error } = useGetGameData();
  const { userProfile } = useUserProfileStore();
  const router = useRouter();
  const supabase = useSupabaseClient<Game>();
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
    const shareData = {
      title: `${game?.player_one_name} invites you to a game`,
      text: "Follow the link to join the game",
      url: `https://localhost:3000/game/${game?.id}?gameroom=${game?.secret_key}`,
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
    // if (!userProfile) return;
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
      downloadImagesFromUrls([
        gameData.player_one_avatar,
        gameData.player_two_avatar,
      ]);
    }

    if (gameData && gameData.winner) {
      setShowDialog(true);
      setDialogMessage(`winner is ${gameData.winner}`);
      setDisplayHomeLink(true);
    }
  }, [gameData, userProfile, error]);

  const displayKeyboard = (): boolean => {
    if (!game) return false;
    if (game.game_type === GameType.LOCAL_MULTIPLAYER) return true;

    if (
      (game.player_one_id === userProfile?.id || "not-logged-in-user") &&
      game.current_player_index === 0
    ) {
      return true;
    }
    if (
      game.player_two_id === userProfile?.id &&
      game.current_player_index === 1
    ) {
      return true;
    }
    return false;
  };

  const renderPlayerName = (): string => {
    if (game?.current_player_index === 0 && !userProfile) {
      return "Your turn";
    } else {
      return game?.current_player_index === 0
        ? `${game?.player_one_name}'s turn`
        : `${game?.player_two_name}'s turn`;
    }
  };

  return (
    <Layout>
      <div className={styles.gameWrapper} data-testid="Game-wrapper">
        <div className="central-width-container " data-central>
          <div className={styles.landscape}>
            <OutlineText
              text={"The game wont fit in landscape, please rotate your device"}
              sizeInRem={2}
              upperCase={false}
              alignment={"center"}
            />
          </div>
          <div className={styles.portrait}>
            {game && (
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
                        playerOneAvatar={playerOneImage}
                        playerTwoAvatar={playerTwoImage}
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
                          action={() => deleteGame(game)}
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
                        {displayKeyboard() ? <Keyboard /> : "not yours"}
                      </DndContext>
                      <div className={styles.gameInfo}>
                        <OutlineText
                          alignment={"center"}
                          sizeInRem={2}
                          text={renderPlayerName()}
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
          <Dialog setDisplay={() => setShowDialog(false)} display={showDialog}>
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
      </div>
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
        height={28}
        width={28}
        alt={`${game.player_one_name} avatar`}
      />

      <div className={styles.playerOneName} data-testid="player-one-name">
        <OutlineText
          text={game.player_one_name}
          sizeInRem={1.4}
          alignment="left"
          upperCase={false}
        />
      </div>
      <div className={styles.playerOneScore} data-testid="player-one-score">
        <OutlineText
          text={game.player_one_score.toString()}
          sizeInRem={2}
          upperCase={false}
          alignment="left"
        />
      </div>
      <Image
        className={styles.playerTwoImage}
        src={playerTwoAvatar}
        height={28}
        width={28}
        alt={`${game.player_two_name} avatar`}
      />

      <div className={styles.playerTwoName}>
        <OutlineText
          text={game.player_two_name}
          sizeInRem={1.4}
          alignment="right"
          upperCase={false}
        />
      </div>
      <div className={styles.playerTwoScore}>
        <OutlineText
          text={game.player_two_score.toString()}
          sizeInRem={2}
          upperCase={false}
          alignment="right"
        />
      </div>
    </div>
  );
};
