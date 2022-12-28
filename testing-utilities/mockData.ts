import { GameCardProps } from "@components/game/GameCard/GameCard";
import { Session, User } from "@supabase/supabase-js";
import { GamePlayer } from "../types/game";

export const mockPlayerOne: GamePlayer = { id: "mock-player-one", score: 0 };
export const mockPlayerTwo: GamePlayer = { id: "mock-player-two", score: 0 };

export const mockSession: Session = {
  expires_at: 9999999999,
  expires_in: 2817,
  token_type: "bearer",
  access_token: "test",
  refresh_token: "ref",
  provider_token: "provide",
  provider_refresh_token: null,
  user: {
    created_at: "a",
    id: "aaaa",
    aud: "authenticated",
    email: "hello@test.com",
    phone: "",
    app_metadata: {
      provider: "facebook",
      providers: ["facebook"],
    },
    user_metadata: {
      avatar_url: "/public/next.svg",
      email: "hello@test.com",
      email_verified: true,
      full_name: "Ajm Mill",
      iss: "https://graph.facebook.com/me?fields=email,first_name,last_name,name,picture",
      name: "Ajm Mill",
      nickname: "Ajm Mill",
      picture:
        "https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=113461594948554&height=50&width=50&ext=1674295612&hash=AeQ1vQX342ZlX5hgKGE",
      provider_id: "113461594948554",
      slug: "Ajm Mill",
      sub: "113461594948554",
    },
    role: "authenticated",
  },
};

export const mockUser: User = {
  created_at: "a",
  id: "d5bcd50f-4595-4d20-b940-1ac6f800dc13",
  aud: "authenticated",
  email: "crouch-trainee-0d@icloud.com",
  phone: "",
  app_metadata: {
    provider: "facebook",
    providers: ["facebook"],
  },
  user_metadata: {
    avatar_url:
      "https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=113461594948554&height=50&width=50&ext=1674295612&hash=AeQ1vQX342ZlX5hgKGE",
    email: "crouch-trainee-0d@icloud.com",
    email_verified: true,
    full_name: "Ajm Mill",
    iss: "https://graph.facebook.com/me?fields=email,first_name,last_name,name,picture",
    name: "Ajm Mill",
    nickname: "Ajm Mill",
    picture:
      "https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=113461594948554&height=50&width=50&ext=1674295612&hash=AeQ1vQX342ZlX5hgKGE",
    provider_id: "113461594948554",
    slug: "Ajm Mill",
    sub: "113461594948554",
  },
  role: "authenticated",
};

export const mockUserRow = {
  username: null,
  website: null,
  avatar_url: "d5bcd50f-4595-4d20-b940-1ac6f800dc13.png",
  id: "d5bcd50f-4595-4d20-b940-1ac6f800dc13",
};

const mockGameUser: User = {
  id: mockUser.id,
  app_metadata: mockUser.app_metadata,
  user_metadata: mockUser.user_metadata,
  aud: mockUser.aud,
  created_at: mockUser.created_at,
};
export const mockGameCard: GameCardProps = {
  user: mockGameUser,
  playerOneId: "1",
  playerOneName: "mock player one",
  playerOneAvatar: "a",
  playerOneScore: 0,
  playerTwoId: "2",
  playerTwoName: "mock player two",
  playerTwoAvatar: "b",
  playerTwoScore: 1,
  currentPlayerIndex: 0,
  currentWord: "a",
};
