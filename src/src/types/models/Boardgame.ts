export interface Rule {
  rule_id: number;
  title: string;
  boardgame_id: string;
  user_id: string;
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
  shortcut: string | null;
  description: string | null;
  genre: string | null;
  age_group: string | null;
  min_players: number | null;
  max_players: number | null;
  min_play_time: number | null;
  max_play_time: number | null;
  complexity_rating: number | null;
  avatar_url: string | null;
  background_image_url: string | null;
  boardgamegeek_url: string | null;
  is_approved: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  categories: string[];
  mechanics: string[];
}

export interface BoardgameCategory {
  category_id: number;
  user_id: number;
  name: string;
  img_url: string;
  description: string;
  game_count: number;
  like_count: number;
  status: BoardgameCategoryStatus;
  create_at: Date;
}

export type BoardgameCategoryStatus = "pending" | "public" | "hidden";

export interface BoardgameMechanic {
  mechanic_id: number;
  user_id: number;
  name: string;
  img_url: string;
  description: string;
  game_count: number;
}

export type BoardgameMechanicStatus = "pending" | "public" | "hidden";