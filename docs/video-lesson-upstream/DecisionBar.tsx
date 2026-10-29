import { motion } from "framer-motion";
import { PillButton } from "./PillButton";

interface DecisionBarProps {
  onContinue: () => void;
  onRetry: () => void;
}

/** Two pill buttons shown after the correct video or the 3rd wrong video. */
export function DecisionBar({ onContinue, onRetry }: DecisionBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3 }}
      className="flex flex-wrap items-center justify-center gap-3"
    >
      <PillButton onClick={onContinue} ariaLabel="Continue the lesson">Continue</PillButton>
      <PillButton variant="secondary" onClick={onRetry} ariaLabel="Retry this checkpoint">Retry</PillButton>
    </motion.div>
  );
}
