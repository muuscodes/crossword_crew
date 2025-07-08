export interface LayoutProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

export interface NavbarProps {
  isAuthenticated: boolean;
  setShowModal: (value: boolean | ((prevState: boolean) => boolean)) => void;
}

export interface HomeCardProps {
  header: string;
  children: React.ReactNode;
}

export interface LibraryCardProps {
  author: string;
  name: string;
  date: string;
  completed: boolean;
  gridId: number;
}

export interface CrosswordGridProps {
  gridSize: number;
  gridDimensions: string;
  positionBlackSquares: boolean;
  addInputs: boolean;
  currentGridNumbers: number[];
  blackSquares: boolean[];
  isFocusedCell: boolean[];
  isSecondaryFocusedCell: boolean[];
  isHighlightAcross: boolean;
  clueNumDirection: string[][];
  clueToCellHighlight: number;
  isAcrossClueHighlight: boolean;
  isFocusedOnGrid: boolean;
  currentGridValues: string[];
  setCurrentGridNumbers: (
    value: number[] | ((prevState: number[]) => number[])
  ) => void;
  setBlackSquares: (
    value: boolean[] | ((prevState: boolean[]) => boolean[])
  ) => void;
  setIsFocusedCell: (
    value: boolean[] | ((prevState: boolean[]) => boolean[])
  ) => void;
  setIsFocusedClue: (
    value: boolean[] | ((prevState: boolean[]) => boolean[])
  ) => void;
  setIsSecondaryFocusedCell: (
    value: boolean[] | ((prevState: boolean[]) => boolean[])
  ) => void;
  setIsHighlightAcross: (
    value: boolean | ((prevState: boolean) => boolean)
  ) => void;
  setIsFocusedOnGrid: (
    value: boolean | ((prevState: boolean) => boolean)
  ) => void;
  setCurrentGridValues: (
    value: string[] | ((prevState: string[]) => string[])
  ) => void;
  handleClear: (prevState: void) => void;
  scrollToClue: (index: number, direction: string) => void;
  assignNumbers: (blackSquares: boolean[]) => number[];
}

export interface CrosswordClueProps {
  gridSize: number;
  currentGridNumbers: number[];
  blackSquares: boolean[];
  gridDimensions: string;
  isFocusedCell: boolean[];
  clueNumDirection: string[][];
  acrossClues: React.ReactElement[];
  downClues: React.ReactElement[];
  isFocusedClue: boolean[];
  setAcrossClues: (
    value:
      | React.ReactElement[]
      | ((prevState: React.ReactElement[]) => React.ReactElement[])
  ) => void;
  setDownClues: (
    value:
      | React.ReactElement[]
      | ((prevState: React.ReactElement[]) => React.ReactElement[])
  ) => void;
  setClueNumDirection: (
    value: string[][] | ((prevState: string[][]) => string[][])
  ) => void;
  handleFocusClue: (index: number, direction: string) => void;
  handleInputChangeClue: (
    event: React.ChangeEvent<HTMLTextAreaElement>,
    direction: string,
    index: number
  ) => void;
  mapClues: (
    prevState: React.ReactElement<
      unknown,
      string | React.JSXElementConstructor<any>
    >[]
  ) => React.ReactNode;
}

export interface SolverGridProps {
  gridSize: number;
  gridDimensions: string;
  addInputs: boolean;
  currentGridNumbers: number[];
  blackSquares: boolean[];
  isFocusedCell: boolean[];
  isSecondaryFocusedCell: boolean[];
  isHighlightAcross: boolean;
  clueNumDirection: string[][];
  clueToCellHighlight: number;
  isAcrossClueHighlight: boolean;
  isFocusedOnGrid: boolean;
  currentGridValues: string[];
  clueIndicatorRight: number;
  clueIndicatorDown: number;
  isAutocheck: boolean;
  autocheckGrid: boolean[];
  autocheckKey: string[];
  setIsFocusedCell: (
    value: boolean[] | ((prevState: boolean[]) => boolean[])
  ) => void;
  setIsFocusedClue: (
    value: boolean[] | ((prevState: boolean[]) => boolean[])
  ) => void;
  setIsSecondaryFocusedCell: (
    value: boolean[] | ((prevState: boolean[]) => boolean[])
  ) => void;
  setIsHighlightAcross: (
    value: boolean | ((prevState: boolean) => boolean)
  ) => void;
  setAutocheckGrid: (
    value: boolean[] | ((prevState: boolean[]) => boolean[])
  ) => void;
  setIsFocusedOnGrid: (
    value: boolean | ((prevState: boolean) => boolean)
  ) => void;
  setCurrentGridValues: (
    value: string[] | ((prevState: string[]) => string[])
  ) => void;
  scrollToClue: (index: number, direction: string) => void;
  setClueIndicatorRight: (
    value: number | ((prevState: number) => number)
  ) => void;
  setClueIndicatorDown: (
    value: number | ((prevState: number) => number)
  ) => void;
}

export interface SolverClueProps {
  gridSize: number;
  currentGridNumbers: number[];
  gridDimensions: string;
  isFocusedCell: boolean[];
  clueNumDirection: string[][];
  acrossClueValues: string[];
  downClueValues: string[];
  isFocusedClue: boolean[];
  handleFocusClue: (index: number, direction: string) => void;
  mapClues: (
    prevState: React.ReactElement<
      unknown,
      string | React.JSXElementConstructor<any>
    >[]
  ) => React.ReactNode;
}

export interface EditorGridProps {
  gridSize: number;
  gridDimensions: string;
  positionBlackSquares: boolean;
  addInputs: boolean;
  currentGridNumbers: number[];
  blackSquares: boolean[];
  isFocusedCell: boolean[];
  isSecondaryFocusedCell: boolean[];
  isHighlightAcross: boolean;
  clueNumDirection: string[][];
  clueToCellHighlight: number;
  isAcrossClueHighlight: boolean;
  isFocusedOnGrid: boolean;
  currentGridValues: string[];
  setCurrentGridNumbers: (
    value: number[] | ((prevState: number[]) => number[])
  ) => void;
  setBlackSquares: (
    value: boolean[] | ((prevState: boolean[]) => boolean[])
  ) => void;
  setIsFocusedCell: (
    value: boolean[] | ((prevState: boolean[]) => boolean[])
  ) => void;
  setIsFocusedClue: (
    value: boolean[] | ((prevState: boolean[]) => boolean[])
  ) => void;
  setIsSecondaryFocusedCell: (
    value: boolean[] | ((prevState: boolean[]) => boolean[])
  ) => void;
  setIsHighlightAcross: (
    value: boolean | ((prevState: boolean) => boolean)
  ) => void;
  setIsFocusedOnGrid: (
    value: boolean | ((prevState: boolean) => boolean)
  ) => void;
  setCurrentGridValues: (
    value: string[] | ((prevState: string[]) => string[])
  ) => void;
  handleClear: (prevState: void) => void;
  scrollToClue: (index: number, direction: string) => void;
  assignNumbers: (blackSquares: boolean[]) => number[];
}

export interface EditorClueProps {
  gridSize: number;
  currentGridNumbers: number[];
  blackSquares: boolean[];
  gridDimensions: string;
  isFocusedClue: boolean[];
  isFocusedCell: boolean[];
  clueNumDirection: string[][];
  acrossClueValues: string[];
  downClueValues: string[];
  isClear: boolean;
  setAcrossClueValues: React.Dispatch<React.SetStateAction<string[]>>;
  setDownClueValues: React.Dispatch<React.SetStateAction<string[]>>;
  setClueNumDirection: (
    value: string[][] | ((prevState: string[][]) => string[][])
  ) => void;
  handleFocusClue: (index: number, direction: string) => void;
  handleUserInputClue: (
    event: React.ChangeEvent<HTMLTextAreaElement>,
    direction: string,
    index: number
  ) => void;
  handleInputChangeClue: (
    event: React.ChangeEvent<HTMLTextAreaElement>,
    direction: string,
    index: number
  ) => void;
  setIsClear: (value: boolean | ((prevState: boolean) => boolean)) => void;
  mapClues: (
    prevState: React.ReactElement<
      unknown,
      string | React.JSXElementConstructor<any>
    >[]
  ) => React.ReactNode;
}

export interface AuthContextType {
  globalUser: any;
  setGlobalUser: React.Dispatch<React.SetStateAction<any>>;
  isLoading: boolean;
  signup: (email: string, username: string, password: string) => Promise<void>;
  login: (username_email: string, password: string) => Promise<void>;
  logout?: () => Promise<void>;
}

export interface globalUserType {
  username: string;
  userId: number;
}
