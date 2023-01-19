import { act, renderHook, waitFor } from "@testing-library/react";
import { useDownloadImages } from "./useDownloadImages";
import userAvatar from "../../public/default_user_avatar.svg";
import computer from "../../public/default_computer_avatar.svg";
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

    const ar = await result.current.setImage("fake-value-returns.vg");
    expect(ar).toBe(computer);
  });
});
