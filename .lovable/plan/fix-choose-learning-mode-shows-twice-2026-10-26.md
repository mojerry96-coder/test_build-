# Fix: "Choose learning mode" shows twice

## Cause
Google sign-in leaves a "show Choose learning mode first" note in the browser. When sign-in finishes without leaving the page (popup/preview), it goes straight to Choose learning mode but never clears that note. Then tapping Solo Mode opens Ask Fiti, which sees the note and sends her back to Choose learning mode, so the page appears a second time.

## Fix
- Clear the note as soon as Choose learning mode opens, so Ask Fiti never bounces her back.
- Also clear it when sign-in sends her on directly.
- Tapping Solo Mode then goes to Ask Fiti once.

## Technical details
- `src/routes/_authenticated/choose.tsx`: on mount, `sessionStorage.removeItem("ul.choosePath")`.
- `src/routes/sign-in.tsx` `goBack()`: also remove `ul.choosePath`.
- The Google full-redirect path (lands on `/`, index redirects to `/choose` and removes the note) keeps working.
