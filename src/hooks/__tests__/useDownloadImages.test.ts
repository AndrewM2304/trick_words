import { act, renderHook, waitFor } from "@testing-library/react";
import { useDownloadImages } from ".././useDownloadImages";
import userAvatar from "../../public/default_user_avatar.svg";
import computer from "../../public/default_computer_avatar.svg";
import { mockUser } from "@testing/mockData";
const mock = {
  storage: {
    from: jest.fn(() => ({
      download: jest.fn(() => new Promise((res) => res(computer))),
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
  useUser: () => {
    return mockUser;
  },
}));

describe("usedownloadimages", () => {
  it("returns an image for default user", async () => {
    const { result } = renderHook(() => useDownloadImages());

    const ar = await result.current.setImage("default_user_avatar.svg");
    expect(ar).toBe(userAvatar);
  });
  it("returns an image for computer", async () => {
    const { result } = renderHook(() => useDownloadImages());

    const ar = await result.current.setImage("default_computer_avatar.svg");
    expect(ar).toBe(computer);
  });

  it("obtains image from supabase storage", async () => {
    const { result } = renderHook(() => useDownloadImages());

    const ar = await result.current.setImage(
      "d5bcd50f-4595-4d20-b940-1ac6f800dc13"
    );
    expect(ar).toBe(computer);
  });
});
