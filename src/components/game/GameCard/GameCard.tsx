import React, { useEffect, useState } from "react";
import styles from "./GameCard.module.css";
import Image from "next/image";
import { User, useUser } from "@supabase/auth-helpers-react";
import { GameType } from "@utilities/game";
import { useDownloadImages } from "@hooks/useDownloadImages";
import { ProfileImage } from "@components/ProfileImage";
import { default_avatar } from "@utilities/constants";
import { OutlineText } from "@components/OutlineText";
import { Button } from "@components/Button";
import { Database } from "@utilities/supabase";
import { useDeleteGame } from "@hooks/useDeleteGame";

type Games = Database["public"]["Tables"]["games"]["Row"];

export type GameCardProps = {
  game: Games;
};
const GameCard = ({ game }: GameCardProps) => {
  const [shareButtonText, setShareButtonText] = useState("Invite Player");
  const [playerImage, setPlayerImage] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>("");

  const { setImage } = useDownloadImages();
  const user = useUser();
  const { deleteGame } = useDeleteGame();

  useEffect(() => {
    const playerToDisplayImage =
      user?.id === game.player_one_id
        ? game.player_two_avatar
        : game.player_one_avatar;
    const playerToDisplayName =
      user?.id === game.player_one_id
        ? game.player_two_name
        : game.player_one_name;
    setImage(playerToDisplayImage).then((i) => setPlayerImage(i));
    setPlayerName(playerToDisplayName);
  }, []);

  const setColor = () => {
    switch (game.game_type) {
      case GameType.COMPUTER:
        return "red";
      case GameType.LOCAL_MULTIPLAYER:
        return "green";
      case GameType.ONLINE_MULTIPLAYER:
        return "blue";
    }
  };
  const renderScore = () => {
    const currentPlayerScore =
      game.player_one_id === user?.id
        ? game.player_one_score
        : game.player_two_score;
    const opponentScore =
      game.player_one_id === user?.id
        ? game.player_two_score
        : game.player_one_score;

    return { currentPlayerScore, opponentScore };
  };

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

  const playerTurnNotification = (): boolean => {
    if (game.game_type !== GameType.ONLINE_MULTIPLAYER) return false;
    if (
      (user?.id === game.player_one_id && game.current_player_index === 0) ||
      (user?.id === game.player_two_id && game.current_player_index === 1)
    ) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <>
      {playerImage && (
        <div data-testid="GameCard-wrapper" className={styles.gameCardWrapper}>
          <div className={styles.gradient}></div>
          <div
            className={styles.profileWrapper}
            data-testid={`${game.game_type}-game`}
          >
            <ProfileImage
              color={setColor() ?? "blue"}
              text={playerName}
              url={playerImage}
              notification={playerTurnNotification() ? "!" : null}
            />
          </div>

          <div className={styles.cardContent} data-testid="score">
            <OutlineText
              alignment="left"
              text={`${renderScore().currentPlayerScore} - ${
                renderScore().opponentScore
              }`}
              sizeInRem={1.2}
              upperCase
            />
            <OutlineText
              alignment="left"
              text={game.current_word}
              sizeInRem={1.2}
              upperCase
            />
          </div>

          {!game.player_two_id &&
            game.game_type === GameType.ONLINE_MULTIPLAYER && (
              <div className={styles.waitOverlay} data-testid="waiting-overlay">
                <OutlineText
                  text="Waiting for player to accept"
                  sizeInRem={1.2}
                  upperCase
                  alignment={"center"}
                />
                <div className={styles.buttonRow}>
                  {navigator.canShare! && (
                    <Button
                      text="share game"
                      action={() => inviteGame()}
                      type={"primary"}
                    />
                  )}

                  {!navigator.canShare && (
                    <Button
                      text={shareButtonText}
                      action={() => inviteGame()}
                      type={"primary"}
                    />
                  )}

                  <Button
                    text="cancel game"
                    action={() => deleteGame(game)}
                    type={"delete"}
                  />
                </div>
              </div>
            )}

          {game.winner !== null && game.winner !== undefined && (
            <div className={styles.waitOverlay} data-testid="waiting-overlay">
              <OutlineText
                text={`Winner is ${game.winner}`}
                sizeInRem={1.2}
                upperCase
                alignment={"center"}
              />
              <div className={styles.buttonRow}>
                <Button
                  text="delete game"
                  action={() => deleteGame(game)}
                  type={"delete"}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
export default GameCard;
