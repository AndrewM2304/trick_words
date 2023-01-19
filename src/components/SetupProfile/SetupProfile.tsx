import { Button } from "@components/Button";
import { OutlineText } from "@components/OutlineText";
import { useDownloadImages } from "@hooks/useDownloadImages";
import { useUser } from "@supabase/auth-helpers-react";
import { default_avatar } from "@utilities/constants";
import React, { useCallback, useState, useEffect } from "react";
import styles from "./SetupProfile.module.css";
import Cropper from "react-easy-crop";
import { Dialog } from "@components/Dialog";
import { useCropPhoto } from "@hooks/useCropPhoto";

export type SetupProfileProps = {
  photoFromParent?: string;
};
const SetupProfile = ({ photoFromParent }: SetupProfileProps) => {
  const user = useUser();

  useEffect(() => {
    setName(user?.user_metadata.name ?? "");
    if (photoFromParent) {
      setPhoto(photoFromParent);
    } else {
      setPhoto(user?.user_metadata?.picture ?? default_avatar);
    }
  }, []);

  const {
    crop,
    rotation,
    zoom,
    setCrop,
    setRotation,
    setZoom,
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
  } = useCropPhoto();

  const selectPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e);
    if (!e.target.files || e === undefined) return;
    const photo = e.target.files[0];
    console.log(photo);
    if (photo) {
      const url = URL.createObjectURL(photo);
      setPhoto(url);
      setPhotoFile(photo);
      setDisplayCropperDialog(true);
    }
  };

  const cancelPhoto = () => {
    setPhoto(user?.user_metadata?.picture ?? default_avatar);
    setDisplayCropperDialog(false);
  };

  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      console.log(croppedAreaPixels);
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  return (
    <>
      {user && (
        <>
          <div
            data-testid="SetupProfile-wrapper"
            className={styles.SetupProfile}
          >
            <div className={styles.central}>
              <OutlineText
                text={"Welcome"}
                sizeInRem={2.5}
                upperCase={true}
                alignment={"center"}
              />
              <OutlineText
                text={"Choose a profile photo and name to get started"}
                sizeInRem={1.2}
                upperCase={false}
                alignment={"center"}
              />

              <label htmlFor="">
                <div className={styles.smallText}>
                  Enter your name (max 12 characters)
                </div>
                <input
                  className={styles.input}
                  maxLength={12}
                  type="text"
                  name="userName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className={styles.profileButton}>
                <input
                  tabIndex={0}
                  type="file"
                  id="single"
                  accept="image/*"
                  onChange={selectPhoto}
                />
                <img
                  src={photo}
                  alt="user profile"
                  className={styles.imageFromSocial}
                />
                <div className={styles.iconWrapper}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
                    <path
                      fillRule="evenodd"
                      d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3h-15a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0zm12-1.5a.75.75 0 100-1.5.75.75 0 000 1.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </label>

              {photo !== null && name !== "" && (
                <>
                  <Button
                    type={"primary"}
                    text={"Save"}
                    action={() => {
                      savePhotoAndUpload(user.id).then(() => {
                        upload(user.id);
                      });
                    }}
                  />
                </>
              )}
            </div>

            <Dialog
              display={displayCropperDialog}
              setDisplay={() => cancelPhoto()}
            >
              <div className={styles.photoSelect}>
                <Cropper
                  image={photo}
                  crop={crop}
                  rotation={rotation}
                  zoom={zoom}
                  cropShape="round"
                  aspect={1 / 1}
                  onCropChange={setCrop}
                  onRotationChange={setRotation}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  objectFit={"contain"}
                />
              </div>
              <Button
                type={"primary"}
                text={"Select Photo"}
                action={() => {
                  setDisplayCropperDialog(false);
                }}
              />
              <Button
                type={"delete"}
                text={"Cancel"}
                action={() => cancelPhoto()}
              />
            </Dialog>
          </div>
        </>
      )}
    </>
  );
};
export default SetupProfile;
