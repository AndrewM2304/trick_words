import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  useUser,
  useSupabaseClient,
  useSession,
} from "@supabase/auth-helpers-react";
import styles from "./AccountSettings.module.css";
import { Database } from "@utilities/supabase";
import { useUserProfileStore } from "@components/store";
type Profiles = Database["public"]["Tables"]["profiles"]["Row"];
import Cropper from "react-easy-crop";
import getCroppedImg from "./helper";
import Image from "next/image";
import { useDownloadImages } from "@hooks/useDownloadImages";
import { default_avatar } from "@utilities/constants";
import { SetupProfile } from "@components/SetupProfile";
import { Button } from "@components/Button";

const AccountSettings = () => {
  const supabase = useSupabaseClient<Database>();
  const session = useSession();
  const { userProfile } = useUserProfileStore();

  return (
    <div data-testid="AccountSettings-wrapper">
      {userProfile?.avatar_url && session && (
        <>
          <SetupProfile photoFromParent={userProfile.avatar_url} />
          <Button
            type={"delete"}
            text={"Sign Out"}
            action={() => supabase.auth.signOut}
          />
        </>
      )}
    </div>
  );
};
export default AccountSettings;
