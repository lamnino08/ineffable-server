import { Status } from "../Enum/Status";

export interface Rule {
  rule_id: number;
  title: string;
  boardgame_id: string;
  user_id: number;
  username: string;
  rule_url: string;
  language: string;
  type: "file" | "link";
  description: string;
  status: RuleStatus;
  vote: number;
}

export type RuleStatus = "pending" | "public" | "hide";

export interface Contributor {
  id: number;
  name: string;
  role: string;
  bio: string;
  country: string;
  founded_year: number | null;
}

export interface VideoTutorial {
  video_id: number;
  boardgame_id: number;
  title: string;
  user_id: number;
  language: string;
  url: string;
  description?: string;
  status: ImageStatus;
  vote: number;
}

export type VideoStatus = "pending" | "public" | "hide";

export interface Image {
  image_id: number;
  boardgame_id: number;
  user_id: number;
  image_url: string;
  status: VideoStatus;
}

export type ImageStatus = "pending" | "public" | "hide";

export interface BoardgameDetails {
  isOwner: boolean;
  boardgame_id: number;
  name: string;
  shortcut: string;
  description: string;
  age: number;
  min_players: number;
  max_players: number;
  min_play_time: number;
  max_play_time: number;
  weight: number;
  avatar_url: string;
  background_image_url: string;
  boardgamegeek_url: string;
  is_approved: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  categories: BoardgameCategory[];
  mechanics: BoardgameMechanic[];
}

export interface BoardgameCategory {
  category_id: number;
  user_id: number;
  name: string;
  img_url: string;
  description: string;
  game_count: number;
  like_count: number;
  liked: boolean;
  status: Status;
  create_at: Date;
  user_name: string;
}

export interface BoardgameMechanic {
  mechanic_id: number;
  user_id: number;
  name: string;
  img_url: string;
  description: string;
  game_count: number;
  like_count: number;
  liked: boolean;
  status: Status;
  create_at: Date;
  user_name: string;
}

export type BoardgameMechanicStatus = "pending" | "public" | "hidden";