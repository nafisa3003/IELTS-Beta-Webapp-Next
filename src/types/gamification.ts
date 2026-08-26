export interface XpEntry {
  entryid: string;
  userid: string;
  amount: number;
  reason: string;
  created_at: string;
}

export interface Streak {
  userid: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
}

export interface Achievement {
  achievementid: string;
  userid: string;
  code: string;
  earned_at: string;
}
