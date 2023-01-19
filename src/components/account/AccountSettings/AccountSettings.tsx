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

const AccountSettings = () => {
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const session = useSession();
  const { userProfile } = useUserProfileStore();
  const [fullName, setFullName] = useState<Profiles["full_name"]>("");
  const [avatar_url, setAvatarUrl] = useState<Profiles["avatar_url"]>(null);
  const { setImage } = useDownloadImages();
  const [userImage, setUserImage] = useState<string | null>(null);

  const [showCropper, setShowCropper] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);

  useEffect(() => {
    if (!userProfile) return;
    setFullName(userProfile.full_name);
    setImage(userProfile.avatar_url).then((i) => setUserImage(i));
  }, [userProfile]);

  async function updateProfile(name: string) {
    try {
      setLoading(true);
      if (!user) throw new Error("No user");

      const updates = {
        id: user.id,
        updated_at: new Date().toISOString(),
        full_name: name,
        avatar_url: userImage,
      };

      let { error, data } = await supabase.from("profiles").upsert(updates);
      if (error) throw error;
    } catch (error) {
      alert("Error updating the data!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const selectPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e);
    if (!e.target.files) return;
    const photo = e.target.files[0];
    console.log(photo);
    const url = URL.createObjectURL(photo);
    setAvatarUrl(url);
    setPhotoFile(photo);
    setShowCropper(true);
  };

  const closeCropper = async (save: boolean) => {
    if (!save) {
      setAvatarUrl(userProfile?.avatar_url ?? default_avatar);
      setPhotoFile(null);
    }
    if (save) {
      getCroppedImg(
        avatar_url,
        croppedAreaPixels,
        rotation,
        userProfile?.id,
        photoFile?.type ?? "image/png"
      ).then(async (cropped) => {
        if (!cropped) {
          setAvatarUrl(userProfile?.avatar_url ?? default_avatar);
          setPhotoFile(null);
        }
        const fileExt = photoFile?.name.split(".").pop();
        const fileName = `${userProfile?.id}.${fileExt}`;
        const filePath = `${fileName}`;

        let { data, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, cropped, { upsert: true });
        if (data) {
          console.log(data);
        }
        if (uploadError) {
          console.log(uploadError);
        }
      });
    }
    setShowCropper(false);
  };

  return (
    <>
      {userProfile && <>user</>}
      {session && <>session</>}
      {userProfile && session && userImage && (
        <>
          <div className="form-widget" data-testid="AccountSettings-wrapper">
            <div>
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={fullName || ""}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <label>
              <Image
                alt={`${userProfile?.full_name} avatar`}
                height={50}
                width={50}
                src={userImage}
              />

              <input
                tabIndex={0}
                type="file"
                id="single"
                accept="image/*"
                onChange={selectPhoto}
              />
            </label>
            {showCropper && avatar_url && (
              <div className={styles.photoModal}>
                <div className={styles.photoSelect}>
                  <Cropper
                    image={avatar_url}
                    crop={crop}
                    rotation={rotation}
                    zoom={zoom}
                    cropShape="round"
                    aspect={1 / 1}
                    onCropChange={setCrop}
                    onRotationChange={setRotation}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                </div>
                <div className={styles.buttonRow}>
                  <button onClick={() => closeCropper(false)}>cancel</button>
                  <button onClick={() => closeCropper(true)}>select</button>
                </div>
              </div>
            )}

            <div>
              <button
                className="button primary block"
                onClick={() => updateProfile(fullName ?? "player")}
              >
                {loading ? "Loading ..." : "Update"}
              </button>
            </div>

            <div>
              <button
                className="button block"
                onClick={() => supabase.auth.signOut()}
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
export default AccountSettings;
