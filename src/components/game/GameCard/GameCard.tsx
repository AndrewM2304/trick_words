import React, { useEffect } from "react";
import styles from "./GameCard.module.css";
import Image from "next/image";
import { User } from "@supabase/auth-helpers-react";
import { GameType } from "@utilities/game";
import { useDownloadImages } from "@hooks/useDownloadImages";

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
}: GameCardProps) => {
  const { playerOneImage, playerTwoImage, downloadImagesFromUrls } =
    useDownloadImages();

  useEffect(() => {
    downloadImagesFromUrls([playerOneAvatar, playerTwoAvatar]);
  }, []);

  return (
    <li data-testid="GameCard-wrapper" className={styles.gameCardWrapper}>
      {!playerTwoId && <>not ral</>}
      {playerOneId && playerTwoId && (
        <>
          <div className={styles.playerOne}>
            <div
              className={styles.indicator}
              data-current-player={currentPlayerIndex === 0}
            >
              <Image
                width={6}
                height={14}
                src={"/indicator.svg"}
                alt={"player Indicator"}
              />
            </div>

            <Image
              className={styles.image}
              width={32}
              height={32}
              src={playerOneImage}
              alt={`${playerOneName} photo`}
              data-testid="player-one-avatar"
            />

            <div className={styles.playerName} data-testid="player-one-name">
              {playerOneName}
            </div>
            <div className={styles.playerScore} data-testid="player-one-score">
              {playerOneScore}
            </div>
          </div>
          <div className={styles.playerTwo}>
            <div
              className={styles.indicator}
              data-current-player={currentPlayerIndex === 1}
            >
              <Image
                width={6}
                height={14}
                src={"/indicator.svg"}
                alt={"player Indicator"}
              />
            </div>

            <div className={styles.image}>
              <Image
                width={32}
                height={32}
                src={playerTwoImage}
                alt={`${playerTwoName} photo`}
                data-testid="player-two-avatar"
              />
            </div>

            <div className={styles.playerName} data-testid="player-two-name">
              {playerTwoName}
            </div>
            <div className={styles.playerScore} data-testid="player-two-score">
              {playerTwoScore}
            </div>
          </div>
          <div className={styles.currentWord} data-testid="current-word">
            Current Word: {currentWord}
            <div className={styles.gameType}>{gameType}</div>
          </div>
        </>
      )}
    </li>
  );
};
export default GameCard;
