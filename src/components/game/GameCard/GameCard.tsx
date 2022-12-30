import React, { useState, useEffect } from "react";
import styles from "./GameCard.module.css";
import Image from "next/image";
import { Database } from "@utilities/supabase";
import { User, useSupabaseClient } from "@supabase/auth-helpers-react";
import { default_avatar } from "@utilities/constants";
import { GameType } from "@utilities/game";
type Profiles = Database["public"]["Tables"]["profiles"]["Row"];

export type GameCardProps = {
  user: User;
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
  user,
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
  const supabase = useSupabaseClient<Database>();
  const [playerOneAvatarUrl, setPlayerOneAvatarUrl] = useState("");
  const [playerTwoAvatarUrl, setPlayerTwoAvatarUrl] = useState("");

  const getImage = async (url: string, player: "one" | "two") => {
    const value = await downloadImage(url);
    if (player === "one") setPlayerOneAvatarUrl(value || "");
    if (player === "two") setPlayerTwoAvatarUrl(value || "");
  };

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .download(path);
      if (error) {
        throw error;
      }
      const url = URL.createObjectURL(data);
      return url;
    } catch (error) {
      console.log("Error downloading image: ", error);
    }
  }

  useEffect(() => {
    getImage(playerOneAvatar ?? default_avatar, "one");
    getImage(playerTwoAvatar ?? default_avatar, "two");
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
            {gameType}
            {playerOneAvatarUrl !== "" && (
              <Image
                className={styles.image}
                width={32}
                height={32}
                src={playerOneAvatarUrl}
                alt={`${playerOneName} photo`}
                data-testid="player-one-avatar"
              />
            )}

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
            {playerTwoAvatarUrl !== "" && (
              <div className={styles.image}>
                <Image
                  width={32}
                  height={32}
                  src={playerTwoAvatarUrl}
                  alt={`${playerTwoName} photo`}
                  data-testid="player-two-avatar"
                />
              </div>
            )}
            <div className={styles.playerName} data-testid="player-two-name">
              {playerTwoName}
            </div>
            <div className={styles.playerScore} data-testid="player-two-score">
              {playerTwoScore}
            </div>
          </div>
          <div className={styles.currentWord} data-testid="current-word">
            Current Word: {currentWord}
          </div>
        </>
      )}
    </li>
  );
};
export default GameCard;
