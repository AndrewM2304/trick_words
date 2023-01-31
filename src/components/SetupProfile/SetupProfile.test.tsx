import React from "react";
import { render, screen, act, getByTestId } from "@testing-library/react";
import { SetupProfile } from "./index";
import { mockUser, mockUserRow } from "@testing/mockData";
import { default_avatar } from "@utilities/constants";
import userAvatar from "../../public/user.svg";
import userEvent from "@testing-library/user-event";

jest.mock("@supabase/auth-helpers-react", () => ({
  useUser: jest.fn(() => mockUser),
  useSupabaseClient: jest.fn(() => mockUserRow),
}));

jest.mock("@hooks/useDownloadImages", () => ({
  useDownloadImages: jest.fn(() => ({
    setImage: (e: any) => Promise.resolve(userAvatar),
  })),
}));

jest.mock("@hooks/useHandleError", () => ({
  useHandleError: jest.fn(() => ({
    captureError: jest.fn(),
  })),
}));

beforeAll(() => {
  HTMLDialogElement.prototype.show = jest.fn();
  HTMLDialogElement.prototype.showModal = jest.fn();
  HTMLDialogElement.prototype.close = jest.fn();
});

describe("SetupProfile Component", () => {
  test("it should exist", () => {
    render(<SetupProfile firstUsage={true} />);
    expect(screen.getAllByText("Welcome").length).toBe(2);
    expect(screen.getAllByText("Save").length).toBe(2);
  });

  test("it displays the name and photo from usermetadata", async () => {
    render(<SetupProfile firstUsage={true} />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("value", "Ajm Mill");
    const image = await screen.findByRole("img");
    expect(image).toHaveAttribute("alt", "Ajm Mill user profile");
  });

  test("displays a modal after user has selected a photo", async () => {
    const file = new File(["test"], "testFile.png", { type: "image/png" });

    render(<SetupProfile firstUsage={true} />);
    const fileInput = screen.getByTestId("file-upload");
    userEvent.upload(fileInput, file);
    const buttonText = await screen.findAllByText("Select Photo");
    expect(buttonText.length).toBe(2);
  });
});
