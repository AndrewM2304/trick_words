import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  useUser,
  useSupabaseClient,
  useSession,
} from "@supabase/auth-helpers-react";
import styles from "./AccountSettings.module.css";
import { Database } from "@utilities/supabase";
import { useUserProfileStore } from "@components/store";
type GamesDB = Database["public"]["Tables"]["games"]["Row"];
import { SetupProfile } from "@components/SetupProfile";
import { Button } from "@components/Button";
import { local_game } from "@utilities/constants";
import { useRouter } from "next/router";
import { HowItWorks } from "@components/HowItWorks";
import { OutlineText } from "@components/OutlineText";

const AccountSettings = () => {
  const supabase = useSupabaseClient<Database>();
  const supabaseGamesDB = useSupabaseClient<GamesDB>();

  const session = useSession();
  const { userProfile } = useUserProfileStore();
  const router = useRouter();

  const deleteGames = async () => {
    window.localStorage.removeItem(local_game);
    if (!userProfile) return;
    let { data, error } = await supabaseGamesDB
      .from("games")
      .delete()
      .or(
        `player_one_id.eq.${userProfile.id},player_two_id.eq.${userProfile.id}`
      );
    if (error) {
      console.error(error);
    }
  };

  return (
    <div data-testid="AccountSettings-wrapper" className={styles.central}>
      {userProfile?.avatar_url && userProfile?.full_name && session && (
        <details>
          <summary>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_217_4)">
                <path
                  d="M5.5 3L10.5 8L5.5 13"
                  stroke="black"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.5 3L10.5 8L5.5 13"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_217_4">
                  <rect width="16" height="16" fill="white" />
                </clipPath>
              </defs>
            </svg>

            <OutlineText
              text={"Update Profile"}
              sizeInRem={1}
              upperCase={false}
              alignment={"left"}
            />
          </summary>
          <div className={styles.content}>
            <SetupProfile
              photoFromUserProfile={userProfile.avatar_url}
              nameFromUserProfile={userProfile.full_name}
            />
          </div>
        </details>
      )}
      <details>
        <summary>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_217_4)">
              <path
                d="M5.5 3L10.5 8L5.5 13"
                stroke="black"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5.5 3L10.5 8L5.5 13"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_217_4">
                <rect width="16" height="16" fill="white" />
              </clipPath>
            </defs>
          </svg>

          <OutlineText
            text={"Rules"}
            sizeInRem={1}
            upperCase={false}
            alignment={"left"}
          />
        </summary>
        <div className={styles.content}>
          <HowItWorks />
        </div>
      </details>
      <div className={styles.buttons}>
        {userProfile?.avatar_url && userProfile?.full_name && session && (
          <Button
            type={"secondary"}
            text={"Sign Out"}
            action={() => {
              supabase.auth.signOut().then(() => {
                router.reload();
                router.push("/");
              });
            }}
          />
        )}
        <Button
          type={"delete"}
          text={"Delete all games"}
          action={() => deleteGames()}
        />
      </div>
    </div>
  );
};
export default AccountSettings;
