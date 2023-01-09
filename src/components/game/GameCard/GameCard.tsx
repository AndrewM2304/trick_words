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
import { Database } from "@utilities/supabase";

type Games = Database["public"]["Tables"]["games"]["Row"];

export type GameCardProps = {
  game: Games;
};
const GameCard = ({ game }: GameCardProps) => {
  const { playerOneImage, playerTwoImage, downloadImagesFromUrls } =
    useDownloadImages();
  const user = useUser();

  useEffect(() => {
    downloadImagesFromUrls([game.player_one_avatar, game.player_two_avatar]);
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
        : game.player_one_score;
    const opponentScore =
      game.player_one_id === user?.id
        ? game.player_one_score
        : game.player_one_score;

    return { currentPlayerScore, opponentScore };
  };

  const inviteGame = async () => {
    const shareData = {
      title: `Join the game`,
      text: "Follow the link to join the game",
      url: `https://localhost:3000/game/${game.id}?gameroom=${game.secret_key}`,
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
      <div data-testid="GameCard-wrapper" className={styles.gameCardWrapper}>
        <div className={styles.gradient}></div>
        <div
          className={styles.profileWrapper}
          data-testid={`${game.game_type}-game`}
        >
          <ProfileImage
            color={setColor() ?? "blue"}
            text={game.player_two_name}
            url={playerTwoImage ?? default_avatar}
            notification={
              game.game_type === GameType.ONLINE_MULTIPLAYER &&
              game.current_player_index === 1
                ? "!"
                : null
            }
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
                    text="copy game link"
                    action={() =>
                      navigator.clipboard.writeText(
                        `https://localhost:3000/game/${game.id}?gameroom=${game.secret_key}`
                      )
                    }
                    type={"primary"}
                  />
                )}

                <Button
                  text="cancel game"
                  action={() => console.log("hello")}
                  type={"delete"}
                />
              </div>
            </div>
          )}
      </div>
    </>
  );
};
export default GameCard;
