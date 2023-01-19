import React, { useState, useEffect } from "react";
import { Database } from "@utilities/supabase";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
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
    return await downloadImage(image);
  };

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
    setImage,
  };
};
