import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import React, { useState } from "react";
import { Database } from "@utilities/supabase";
import { useGamesStore, useUserProfileStore } from "@components/store";
import { local_game } from "@utilities/constants";
type Profiles = Database["public"]["Tables"]["profiles"]["Row"];
type GameDB = Database["public"]["Tables"]["games"]["Row"];

export const useCropPhoto = () => {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [displayCropperDialog, setDisplayCropperDialog] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [filePath, setFilepath] = useState<string | null>(null);
  const user = useUser();
  const { games } = useGamesStore();

  const supabaseDB = useSupabaseClient<Database>();
  const supabase = useSupabaseClient();
  const supabaseGame = useSupabaseClient<GameDB>();

  const { setUserProfile } = useUserProfileStore();

  const createImage = (url: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });

  function getRadianAngle(degreeValue: number) {
    return (degreeValue * Math.PI) / 180;
  }

  /**
   * Returns the new bounding area of a rotated rectangle.
   */
  function rotateSize(width: number, height: number, rotation: number) {
    const rotRad = getRadianAngle(rotation);

    return {
      width:
        Math.abs(Math.cos(rotRad) * width) +
        Math.abs(Math.sin(rotRad) * height),
      height:
        Math.abs(Math.sin(rotRad) * width) +
        Math.abs(Math.cos(rotRad) * height),
    };
  }

  /**
   * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
   */
  async function getCroppedImg(
    imageSrc: string,
    pixelCrop: any,
    rotation = 0,
    id: string,
    type: File["type"],
    flip = { horizontal: false, vertical: false }
  ): Promise<File | void> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    const rotRad = getRadianAngle(rotation);

    // calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
      image.width,
      image.height,
      rotation
    );

    // set canvas size to match the bounding box
    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    // translate canvas context to a central location to allow rotating and flipping around the center
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
    ctx.translate(-image.width / 2, -image.height / 2);

    // draw rotated image
    ctx.drawImage(image, 0, 0);

    // croppedAreaPixels values are bounding box relative
    // extract the cropped image using these values
    const data = ctx.getImageData(
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height
    );

    // set canvas width to final desired crop size - this will clear existing context
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // paste generated rotate image at the top left corner
    ctx.putImageData(data, 0, 0);

    // As Base64 string
    // return canvas.toDataURL('image/jpeg');

    // As a blob
    return new Promise((resolve, reject) => {
      canvas.toBlob((file) => {
        if (!file) return;
        const fileFromBlob = new File([file], id, {
          type: type,
        });
        resolve(fileFromBlob);
      });
    });
  }

  const setUpImageForStorage = async (userID: string) => {
    getCroppedImg(
      photo,
      croppedAreaPixels,
      rotation,
      userID,
      photoFile?.type ?? "image/png"
    ).then(async (cropped) => {
      if (!cropped || !photoFile) return;

      setPhotoFile(cropped);
      const fileExt = photoFile?.name.split(".").pop();
      setFilepath(`${userID}.${fileExt}`);
      setDisplayCropperDialog(false);
    });
  };

  const upload = async (
    userID: string
  ): Promise<"success" | "fail" | undefined> => {
    if (photoFile && filePath) {
      let { data, error } = await supabaseDB.storage
        .from("avatars")
        .upload(filePath, photoFile, { upsert: true });
      if (error) {
        console.error("uploading error");
        console.error(error);
        return "fail";
      }
    }
    const nameUpdate = {
      id: userID,
      updated_at: new Date().toISOString(),
      full_name: name,
    };

    const photoUpdates = {
      id: userID,
      updated_at: new Date().toISOString(),
      full_name: name,
      avatar_url: filePath,
    };
    const { data: uploadData, error: uploadError } = await supabase
      .from("profiles")
      .upsert(filePath ? photoUpdates : nameUpdate)
      .select();

    if (uploadData) {
      setUserProfile(uploadData[0] as Profiles);
      filePath
        ? updateLocalStoreWithNewDetails(
            photoUpdates.full_name,
            photoUpdates.avatar_url
          )
        : updateLocalStoreWithNewDetails(nameUpdate.full_name, null);
      if (user && games) {
        const p1WithPhoto = {
          player_one_name: photoUpdates.full_name,
          player_one_avatar: photoUpdates.avatar_url,
        };
        const p2WithPhoto = {
          player_two_name: photoUpdates.full_name,
          player_two_avatar: photoUpdates.avatar_url,
        };
        const p1WithOutPhoto = {
          player_one_name: nameUpdate.full_name,
        };
        const p2WithOutPhoto = {
          player_two_name: nameUpdate.full_name,
        };

        const { data: p1data, error: p1error } = await supabaseGame
          .from("games")
          .update(filePath ? p1WithPhoto : p1WithOutPhoto)
          .eq("player_one_id", user.id)
          .select();
        if (p1data?.length !== 0) {
          console.log("p1d");
          console.log(filePath ? p1WithPhoto : p1WithOutPhoto);
          console.log(p1data);
        }
        if (p1error) {
          console.log(p1error);
        }

        const { data: p2data, error: p2error } = await supabaseGame
          .from("games")
          .update(filePath ? p2WithPhoto : p2WithOutPhoto)
          .eq("player_two_id", user.id)
          .select();
        if (p2data?.length !== 0) {
          console.log(filePath ? p2WithPhoto : p2WithOutPhoto);
          console.log("p2d");

          console.log(p2data);
        }
        if (p2error) {
          console.log(p2error);
        }
      }

      return "success";
    }

    if (uploadError) {
      console.error(uploadError);
      return "fail";
    }
  };

  const updateLocalStoreWithNewDetails = (
    name: string,
    avatar: string | null
  ) => {
    const gamesFromLocalStorage = window.localStorage.getItem(local_game);
    if (gamesFromLocalStorage) {
      const games: GameDB[] = JSON.parse(gamesFromLocalStorage);
      const updatedGames = games.map((g: GameDB) => {
        return avatar
          ? { ...g, player_one_name: name, player_one_avatar: avatar }
          : { ...g, player_one_name: name };
      });
      window.localStorage.setItem(local_game, JSON.stringify(updatedGames));
    }
  };

  return {
    getCroppedImg,
    crop,
    setCrop,
    zoom,
    setZoom,
    rotation,
    setRotation,
    rotateSize,
    croppedAreaPixels,
    setCroppedAreaPixels,
    displayCropperDialog,
    setDisplayCropperDialog,
    photo,
    setPhoto,
    setUpImageForStorage,
    setPhotoFile,
    name,
    setName,
    upload,
  };
};
