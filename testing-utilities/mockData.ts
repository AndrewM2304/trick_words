import { GameCardProps } from "@components/game/GameCard/GameCard";
import { Session, User } from "@supabase/supabase-js";
import { GamePlayer, GameType } from "../types/game";
import { Database } from "@utilities/supabase";

type Game = Database["public"]["Tables"]["games"]["Row"];

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

export const mockUserProfile = {
  id: "111",
  updated_at: "111",
  username: "Andrew M",
  full_name: "Andrew James",
  avatar_url:
    '{"src":"/_next/static/media/default_user_avatar.942977fa.svg","height":90,"width":90}',
  website: null,
  email: null,
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

export const mockGame: Game = {
  id: 1,
  created_at: "",
  current_word: "a",
  current_letter_index: 0,
  game_type: GameType.LOCAL_MULTIPLAYER,
  secret_key: "",
  current_player_index: 0,
  player_one_score: 0,
  player_two_score: 0,
  player_one_id: "d5bcd50f-4595-4d20-b940-1ac6f800dc13",
  player_two_id: "test 2",
  player_one_name: "p1",
  player_two_name: "p2",
  player_one_avatar: "",
  player_two_avatar: "",
  winner: null,
  difficulty: "easy",
  current_player_id: "d5bcd50f-4595-4d20-b940-1ac6f800dc13",
};

export const supabaseMockGame: Game = {
  id: 1,
  created_at: "",
  current_word: "b",
  current_letter_index: 0,
  game_type: GameType.ONLINE_MULTIPLAYER,
  secret_key: "",
  current_player_index: 0,
  player_one_score: 0,
  player_two_score: 0,
  player_one_id: "d5bcd50f-4595-4d20-b940-1ac6f800dc13",
  player_two_id: "test 2",
  player_one_name: "p1",
  player_two_name: "p2",
  player_one_avatar: "",
  player_two_avatar: "",
  winner: null,
  difficulty: "easy",
  current_player_id: "d5bcd50f-4595-4d20-b940-1ac6f800dc13",
};

export const wordPass = "ath";
export const wordfail = "artsz";
export const exactWord = "arm";
