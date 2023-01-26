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

beforeAll(() => {
  HTMLDialogElement.prototype.show = jest.fn();
  HTMLDialogElement.prototype.showModal = jest.fn();
  HTMLDialogElement.prototype.close = jest.fn();
});

describe("SetupProfile Component", () => {
  test("it should exist", () => {
    render(<SetupProfile />);
    expect(screen.getAllByText("Welcome").length).toBe(2);
    expect(screen.getAllByText("Save").length).toBe(2);
  });

  test("it displays the name and photo from usermetadata", async () => {
    render(<SetupProfile />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("value", "Ajm");
    const image = await screen.findByRole("img");
    expect(image).toHaveAttribute("alt", "Ajm user profile");
  });

  test("it displays the name and photo from passed from parent", async () => {
    render(
      <SetupProfile
        photoFromUserProfile={default_avatar}
        nameFromUserProfile="joe bloggs"
      />
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("value", "joe bloggs");
    const image = await screen.findByRole("img");
    expect(image).toHaveAttribute("alt", "joe bloggs user profile");
  });

  test("displays a modal after user has selected a photo", async () => {
    const file = new File(["test"], "testFile.png", { type: "image/png" });

    render(<SetupProfile />);
    const fileInput = screen.getByTestId("file-upload");
    userEvent.upload(fileInput, file);
    const buttonText = await screen.findAllByText("Select Photo");
    expect(buttonText.length).toBe(2);
  });
});
