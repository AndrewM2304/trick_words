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
import Image from "next/image";

export type SetupProfileProps = {
  photoFromUserProfile?: string;
  nameFromUserProfile?: string;
};
const SetupProfile = ({
  photoFromUserProfile,
  nameFromUserProfile,
}: SetupProfileProps) => {
  const user = useUser();
  const { setImage } = useDownloadImages();
  const [buttonTitle, setButtonTitle] = useState("");
  const [saving, setSaving] = useState(false);
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
    setUpImageForStorage,
    setPhotoFile,
    name,
    setName,
    upload,
  } = useCropPhoto();

  useEffect(() => {
    setButtonTitle(nameFromUserProfile ? "Update" : "Save");
    if (nameFromUserProfile) {
      setName(nameFromUserProfile);
    } else {
      setName(user?.user_metadata.name.split(" ")[0] ?? "");
    }
    if (photoFromUserProfile) {
      setImage(photoFromUserProfile).then((i) => setPhoto(i));
    } else {
      setPhoto(user?.user_metadata.avatar_url);
    }
  }, [photoFromUserProfile]);

  // default userprofile name to splitting out first name from user profile
  // if user doesnt select to upload photo save their userprofile avatar as the detail

  const selectPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e === undefined) return;
    const photo = e.target.files[0];
    if (photo) {
      const url = URL.createObjectURL(photo);
      setPhoto(url);
      setPhotoFile(photo);
      setDisplayCropperDialog(true);
    }
  };

  const cancelPhoto = () => {
    if (photoFromUserProfile) {
      setImage(photoFromUserProfile).then((i) => setPhoto(i));
    } else {
      setPhoto(photo ?? default_avatar);
    }

    setDisplayCropperDialog(false);
  };

  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
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
              {!photoFromUserProfile && (
                <>
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
                </>
              )}
              <label className={styles.profileButton}>
                <input
                  tabIndex={0}
                  type="file"
                  id="single"
                  accept="image/*"
                  onChange={selectPhoto}
                />
                {photo && (
                  <Image
                    src={photo}
                    alt="user profile"
                    className={styles.imageFromSocial}
                    width={200}
                    height={200}
                  />
                )}
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
              <label className={styles.nameInput}>
                <OutlineText
                  text={"Enter a name"}
                  sizeInRem={1}
                  upperCase={false}
                  alignment={"left"}
                />
                <input
                  className={styles.input}
                  maxLength={12}
                  type="text"
                  name="userName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              {photo !== null && name !== "" && (
                <>
                  <Button
                    type={"primary"}
                    text={buttonTitle}
                    disabled={saving}
                    action={() => {
                      setSaving(true);
                      setButtonTitle("Saving...");
                      upload(user.id).then((res) => {
                        if (res === "success") {
                          setButtonTitle("Updated!");
                        }
                        if (res === "fail") {
                          setButtonTitle("Error, try again!");
                        }
                        setTimeout(() => {
                          setButtonTitle(
                            nameFromUserProfile ? "Update" : "Save"
                          );
                          setSaving(false);
                        }, 1500);
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
                  setUpImageForStorage(user.id);
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
