import React, { useState, useEffect } from "react";
import { Database } from "@utilities/supabase";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import userAvatar from "../../public/default_user_avatar.svg";
import computer from "../../public/default_computer_avatar.svg";

export const useDownloadImages = () => {
  const supabase = useSupabaseClient<Database>();

  const setImage = async (image: any): Promise<string> => {
    if (image.includes("default_user_avatar.svg")) {
      return Promise.resolve(userAvatar);
    }
    if (image.includes("default_computer_avatar.svg")) {
      return Promise.resolve(computer);
    }
    if (image.includes("googleusercontent" || "fbsbx.com")) {
      return Promise.resolve(image);
    }
    const im = await downloadImage(image);
    if (!im) {
      return image;
    } else {
      return im;
    }
  };

  async function downloadImage(path: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .download(path);
      if (error) {
        return null;
      }
      const url = URL.createObjectURL(data);
      return url;
    } catch (error) {
      console.error("Error downloading image: ", error);
      return userAvatar;
    }
  }

  return {
    setImage,
  };
};
