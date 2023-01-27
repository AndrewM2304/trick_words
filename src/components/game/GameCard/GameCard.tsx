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
import { KeyboardTile } from "@components/keyboard/KeyboardTile";

type Games = Database["public"]["Tables"]["games"]["Row"];

export type GameCardProps = {
  game: Games;
  id: number;
};
const GameCard = ({ game, id }: GameCardProps) => {
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
    setImage(
      game.game_type === GameType.ONLINE_MULTIPLAYER
        ? playerToDisplayImage
        : game.player_two_avatar
    ).then((i) => setPlayerImage(i));
    setPlayerName(
      game.game_type === GameType.ONLINE_MULTIPLAYER
        ? playerToDisplayName
        : game.player_two_name
    );
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
        <div
          data-testid="GameCard-wrapper"
          className={styles.gameCardWrapper}
          style={{ animationDelay: `${id * 0.2}s` }}
        >
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
            <svg
              width="27"
              height="27"
              viewBox="0 0 27 27"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ animationDelay: `${id * 0.3}s` }}
            >
              <path
                opacity="0.2"
                d="M18.033 9.63729L16.4021 4.61803C15.8034 2.77542 13.1966 2.77541 12.5979 4.61803L10.967 9.63729H5.68948C3.75204 9.63729 2.94647 12.1165 4.51391 13.2553L8.78354 16.3574L7.15268 21.3766C6.55398 23.2193 8.66294 24.7515 10.2304 23.6127L14.5 20.5106L18.7696 23.6127C20.3371 24.7515 22.446 23.2193 21.8473 21.3766L20.2165 16.3574L24.4861 13.2553C26.0535 12.1165 25.248 9.63729 23.3105 9.63729L18.033 9.63729Z"
                fill="black"
                stroke="black"
                strokeWidth="2"
              />
              <path
                d="M16.033 7.63729L14.4021 2.61803C13.8034 0.775417 11.1966 0.775406 10.5979 2.61803L8.96703 7.63729H3.68948C1.75204 7.63729 0.946474 10.1165 2.51391 11.2553L6.78354 14.3574L5.15268 19.3766C4.55398 21.2193 6.66294 22.7515 8.23037 21.6127L12.5 18.5106L16.7696 21.6127C18.3371 22.7515 20.446 21.2193 19.8473 19.3766L18.2165 14.3574L22.4861 11.2553C24.0535 10.1165 23.248 7.63729 21.3105 7.63729L16.033 7.63729Z"
                fill="#D6D87D"
                stroke="black"
                strokeWidth="2"
              />
              <path
                d="M13.8045 16.0669L7.51691 17.9532C6.74866 18.1836 6.19242 18.8508 6.10384 19.6479L5.83325 22.0833L12.9166 18.3333L19.1666 21.6666L17.9166 14.5833L23.7499 8.74992L19.3935 8.38688C19.0017 8.35424 18.6272 8.55415 18.4363 8.89779L14.9781 15.1225C14.7249 15.5782 14.3038 15.9171 13.8045 16.0669Z"
                fill="black"
                className={styles.lightBlend}
              />
              <path
                d="M0.833252 8.75008L2.91659 10.8334L7.49992 13.7501L5.86968 11.3047C5.46416 10.6964 5.82711 9.87282 6.54968 9.76166L9.81306 9.2596C10.1836 9.20259 10.4911 8.94312 10.6097 8.58745L11.502 5.91056C11.7526 5.15873 12.7365 4.98326 13.2315 5.6021L15.4166 8.33341L16.6666 7.91675L12.4999 0.416748L9.16658 6.66675L0.833252 8.75008Z"
                fill="white"
                className={styles.lightBlend}
              />
            </svg>

            <OutlineText
              alignment="left"
              text={`${renderScore().currentPlayerScore} - ${
                renderScore().opponentScore
              }`}
              sizeInRem={1.4}
              upperCase
            />

            <ul className={styles.tiles}>
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
            </ul>
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
