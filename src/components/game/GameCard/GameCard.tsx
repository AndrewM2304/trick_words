import React, { useEffect } from "react";
import styles from "./GameCard.module.css";
import Image from "next/image";
import { User, useUser } from "@supabase/auth-helpers-react";
import { GameType } from "@utilities/game";
import { useDownloadImages } from "@hooks/useDownloadImages";
import { ProfileImage } from "@components/ProfileImage";
import { default_avatar } from "@utilities/constants";
import { OutlineText } from "@components/OutlineText";
import { Button } from "@components/Button";

export type GameCardProps = {
  playerOneId: string;
  playerOneName: string;
  playerOneAvatar: string;
  playerOneScore: number;
  playerTwoId: string;
  playerTwoName: string;
  playerTwoAvatar: string;
  playerTwoScore: number;
  currentPlayerIndex: number;
  currentWord: string;
  gameType: GameType;
  gameId: number;
  roomKey: string;
};
const GameCard = ({
  playerOneId,
  playerOneScore,
  playerOneAvatar,
  playerOneName,
  playerTwoId,
  playerTwoScore,
  playerTwoAvatar,
  playerTwoName,
  currentPlayerIndex,
  currentWord,
  gameType,
  gameId,
  roomKey,
}: GameCardProps) => {
  const { playerOneImage, playerTwoImage, downloadImagesFromUrls } =
    useDownloadImages();
  const user = useUser();

  useEffect(() => {
    console.log([playerOneAvatar, playerTwoAvatar]);
    downloadImagesFromUrls([playerOneAvatar, playerTwoAvatar]);
  }, []);

  const setColor = () => {
    switch (gameType) {
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
      playerOneId === user?.id ? playerOneScore : playerTwoScore;
    const opponentScore =
      playerOneId === user?.id ? playerTwoScore : playerOneScore;

    return { currentPlayerScore, opponentScore };
  };

  const inviteGame = async () => {
    const shareData = {
      title: `Join the game`,
      text: "Follow the link to join the game",
      url: `https://localhost:3000/game/${gameId}?gameroom=${roomKey}`,
    };
    try {
      console.log(shareData);
      await navigator.share(shareData);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <li data-testid="GameCard-wrapper" className={styles.gameCardWrapper}>
        <div className={styles.clippy}></div>
        <ProfileImage
          color={setColor()}
          text={playerTwoName}
          url={playerTwoImage ?? default_avatar}
          notification={
            gameType === GameType.ONLINE_MULTIPLAYER && currentPlayerIndex === 1
              ? "!"
              : null
          }
        />

        <div className={styles.cardContent}>
          <OutlineText
            left
            text={`${renderScore().currentPlayerScore} - ${
              renderScore().opponentScore
            }`}
            sizeInRem={1.2}
            upperCase
          />
          <OutlineText left text={currentWord} sizeInRem={1.2} upperCase />
        </div>

        {!playerTwoId && gameType === GameType.ONLINE_MULTIPLAYER && (
          <div className={styles.waitOverlay}>
            <OutlineText
              text="Waiting for player to accept"
              sizeInRem={1.2}
              upperCase
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
                  text="copy game link"
                  action={() =>
                    navigator.clipboard.writeText(
                      `https://localhost:3000/game/${gameId}?gameroom=${roomKey}`
                    )
                  }
                  type={"primary"}
                />
              )}

              <Button
                text="cancel game"
                action={() => console.log("hello")}
                type={"secondary"}
              />
            </div>
          </div>
        )}
      </li>
    </>
  );
};
export default GameCard;
