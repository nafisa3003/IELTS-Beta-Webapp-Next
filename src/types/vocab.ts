export type VocabDifficulty = "easy" | "medium" | "hard";

export interface VocabWord {
  wordid: string;
  word: string;
  definition: string;
  example: string | null;
  difficulty: VocabDifficulty;
}

export interface SavedWord {
  userid: string;
  wordid: string;
  saved_at: string;
}

export interface CustomCard {
  cardid: string;
  userid: string;
  front: string;
  back: string;
  example: string | null;
  difficulty: VocabDifficulty | null;
  created_at: string;
}