import React from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import styles from "./AccountSettings.module.css";
import { Database } from "@utilities/supabase";
import { useDeleteModal, useUserProfileStore } from "@components/store";
import { SetupProfile } from "@components/SetupProfile";
import { Button } from "@components/Button";
import { useRouter } from "next/router";
import { HowItWorks } from "@components/HowItWorks";
import { OutlineText } from "@components/OutlineText";
import { motion, Transition, Variants } from "framer-motion";
import Link from "next/link";

const AccountSettings = () => {
  const supabase = useSupabaseClient<Database>();
  const session = useSession();
  const { userProfile } = useUserProfileStore();
  const router = useRouter();
  const { setDisplayDeleteModal, setButtonText, setDeleteType } =
    useDeleteModal();

  const deleteGames = () => {
    setButtonText("Delete All Games");
    setDeleteType("all");
    setDisplayDeleteModal();
  };

  const central: Variants = {
    initialState: {
      opacity: 0,
    },
    animateState: {
      opacity: 1,
    },
    exitState: {
      opacity: 0,
    },
  };

  const trans: Transition = {
    type: "tween",
    ease: "backInOut",
    duration: 0.4,
  };

  return (
    <motion.div
      data-testid="AccountSettings-wrapper"
      className={styles.central}
      variants={central}
      initial="initialState"
      animate="animateState"
      exit="exitState"
      transition={trans}
      key={router.route}
    >
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
            <SetupProfile firstUsage={false} />
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
            text={"Terms and Conditions"}
            sizeInRem={1}
            upperCase={false}
            alignment={"left"}
          />
        </summary>
        <TandC />
      </details>
      <div className={styles.buttons}>
        {userProfile?.avatar_url && userProfile?.full_name && session && (
          <Button
            type={"secondary"}
            text={"Sign Out"}
            action={() => {
              supabase.auth.signOut().then(() => {
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
    </motion.div>
  );
};
export default AccountSettings;

const TandC = () => {
  return (
    <div className={styles.tandc}>
      <p>
        Trick Words is a free to play multiplayer word game. The website makes
        use of{" "}
        <Link href={"https://supabase.com"} target={"_blank"}>
          Supabase
        </Link>{" "}
        for user authentication and multiplayer game storage, and device storage
        for any local games.
      </p>
      <p>
        <Link href={"https://vercel.com/analytics"} target={"_blank"}>
          Vercel analytics
        </Link>{" "}
        are used to track page views and location at country level, but no user
        details are tracked as part of this.
      </p>
      <p>
        Social media login is used to enable sharing of multiplayer games - user
        profile pictures, name, and emails are stored but not shared to any
        third party services outside of Supabase.
      </p>
      <p>
        Users are free to post any aspects of the game to social media
        platforms.
      </p>
      <p>
        Users are able to delete any in-progress or completed games, and can opt
        to remove their profile. Should a user request their profile be deleted
        the developer will comply by removing all details stored within 30 days.
        If the user opts to sign up post-deletion all previous game progress
        will not have been saved.
      </p>
    </div>
  );
};
