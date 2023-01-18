import { useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useState } from "react";
import { Database } from "@utilities/supabase";
import { useUserProfileStore } from "@components/store";
type Profiles = Database["public"]["Tables"]["profiles"]["Row"];

export const useCropPhoto = () => {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [displayCropperDialog, setDisplayCropperDialog] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [filePath, setFilepath] = useState("");

  const supabaseDB = useSupabaseClient<Database>();
  const supabase = useSupabaseClient();
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

  const savePhotoAndUpload = async (userID: string) => {
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
      const fileName = `${userID}.${fileExt}`;
      setFilepath(fileName);
      setDisplayCropperDialog(false);
    });
  };

  const upload = async (userID: string) => {
    if (!photoFile) return;
    let { data, error } = await supabaseDB.storage
      .from("avatars")
      .upload(filePath, photoFile, { upsert: true });
    if (data) {
      const updates = {
        id: userID,
        updated_at: new Date().toISOString(),
        full_name: name,
        avatar_url: filePath,
      };
      const { data: uploadData, error: uploadError } = await supabase
        .from("profiles")
        .upsert(updates)
        .select();

      if (uploadData) {
        setUserProfile(uploadData[0] as Profiles);
      }

      if (uploadError) {
        console.log(uploadError);
      }
    }
    if (error) {
      console.log("uploading error");
      console.log(error);
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
    savePhotoAndUpload,
    setPhotoFile,
    name,
    setName,
    upload,
  };
};
