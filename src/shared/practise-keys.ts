// The practise "Your working" keypad: one key per job, grouped as number pad, letters, then symbols.
// "/" covers ÷ and the cursor replaces the arrow keys (a real keyboard still types them).
export const PRACTISE_NUM_KEYS = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", "."] as const;
export const PRACTISE_SYM_KEYS = ["x", "y", "m", "c", "(", ")", "−", "/", "=", "×", "+", "a/b", "^", "√", "±", ","] as const;
export const PRACTISE_KEYS = [...PRACTISE_NUM_KEYS, ...PRACTISE_SYM_KEYS];

const WORDS: Record<string, string> = {
  "0": "zero", "1": "one", "2": "two", "3": "three", "4": "four", "5": "five", "6": "six", "7": "seven", "8": "eight", "9": "nine",
  ".": "decimal point", "(": "open bracket", ")": "close bracket", "−": "minus", "/": "divide", "=": "equals", "×": "times",
  "+": "plus", "a/b": "fraction", "^": "power", "√": "square root", "±": "plus or minus", ",": "comma",
};
/** The spoken name of a key for screen readers, e.g. "seven" or "x". */
export const keyLabel = (k: string) => WORDS[k] ?? k;
