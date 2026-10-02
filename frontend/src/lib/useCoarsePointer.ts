import { useMediaQuery } from "./useMediaQuery";

// True when the main pointer is a finger (phones and tablets), so the grid uses the on-screen
// crossword keyboard instead of the device's own keyboard.
export function useCoarsePointer(): boolean {
  return useMediaQuery("(pointer: coarse)");
}
