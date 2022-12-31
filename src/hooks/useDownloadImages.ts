import React, { useState, useEffect } from "react";
import { Database } from "@utilities/supabase";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { GameType } from "@utilities/game";
import userAvatar from "../../public/user.svg";

export const useDownloadImages = () => {
  const supabase = useSupabaseClient<Database>();

  const [playerOneAvatar, setPlayerOneAvatar] = useState(userAvatar);
  const [playerTwoAvatar, setPlayerTwoAvatar] = useState(userAvatar);
  const [urlsToDownload, setUrlsToDownload] = useState<[string, string] | null>(
    null
  );

  useEffect(() => {
    if (!urlsToDownload) return;
    downloadImage(urlsToDownload[0]).then((image: string) =>
      setPlayerOneAvatar(image)
    );
    downloadImage(urlsToDownload[1]).then((image: string) =>
      setPlayerTwoAvatar(image)
    );
  }, [urlsToDownload]);

  async function downloadImage(path: string): Promise<string> {
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
      return userAvatar;
    }
  }

  return {
    playerOneImage: playerOneAvatar,
    playerTwoImage: playerTwoAvatar,
    downloadImagesFromUrls: (vals: [string, string]) => setUrlsToDownload(vals),
  };
};
