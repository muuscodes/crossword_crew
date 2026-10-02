// Shapes of the data the API sends back.

export interface User {
  user_id: number;
  username: string;
}

export interface PuzzleRecord {
  grid_id: number;
  puzzle_title: string;
  grid_size: number;
  grid_values: (string | null)[] | null;
  black_squares: (boolean | null)[] | null;
  across_clues: (string | null)[] | null;
  down_clues: (string | null)[] | null;
}

export interface EditorPuzzle extends PuzzleRecord {
  created_at: string;
  is_shared: boolean;
}

export interface SolverPuzzle extends PuzzleRecord {
  completed_status: boolean;
  creator_username: string;
}

export interface Stats {
  total: number;
  created: number;
  received: number;
  solved: number;
}

export interface CreatedPuzzle {
  grid_id: number;
  puzzle_title: string;
  created_at: string;
}

export interface ReceivedPuzzle extends CreatedPuzzle {
  completed_status: boolean;
  creator_username: string;
}

export interface LibraryResponse {
  created: CreatedPuzzle[];
  received: ReceivedPuzzle[];
}

export interface Account {
  user_id: number;
  username: string;
  email: string;
  has_password: boolean;
  google_linked: boolean;
}

// Someone the user has traded puzzles with.
export interface Connection {
  username: string;
  sent: number;
  received: number;
  last_shared_at: string;
}
