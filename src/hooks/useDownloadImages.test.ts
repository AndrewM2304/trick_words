import { act, renderHook, waitFor } from "@testing-library/react";
import { useDownloadImages } from "./useDownloadImages";
import userAvatar from "../../public/user.svg";

const mock = {
  storage: {
    from: jest.fn(() => ({
      download: jest.fn(() => new Promise((res) => res("hi"))),
    })),
    fetch: jest.fn(),
    headers: jest.fn(),
    url: "",
  },
};

jest.mock("@supabase/auth-helpers-react", () => ({
  useSupabaseClient: () => {
    return mock;
  },
}));

describe("usedownloadimages", () => {
  it("returns an image for each user", async () => {
    const { result } = renderHook(() => useDownloadImages());

    act(() =>
      result.current.downloadImagesFromUrls([
        "default_user_avatar.svg",
        "default_user_avatar.svg",
      ])
    );

    await waitFor(() => expect(result.current.playerOneImage).toBe(userAvatar));
  });
});
