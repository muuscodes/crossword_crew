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
  date: string;
  completed: boolean;
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
  mapClues: (
    prevState: React.ReactElement<
      unknown,
      string | React.JSXElementConstructor<any>
    >[]
  ) => React.ReactNode;
}
