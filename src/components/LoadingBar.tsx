import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

interface LoadingBarProps {
  isComplete: boolean;
}

export const LoadingBar = ({ isComplete }: LoadingBarProps) => {
  const [progress, setProgress] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const loadingTexts = [
    "Finding optimal song to transition to",
    "Extracting official audio",
    "Creating transition",
    "Mixing songs",
  ];

  useEffect(() => {
    if (isComplete) {
      setProgress(100);
      return;
    }

    // Total duration for first 3 texts: 15 seconds (5 seconds each)
    const textDuration = 8000;
    const totalTexts = loadingTexts.length;

    // Update text every 5 seconds for the first 3 texts
    const textInterval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => {
        if (prevIndex < totalTexts - 1) {
          return prevIndex + 1;
        }
        return prevIndex;
      });
    }, textDuration);

    // Update progress bar smoothly
    const progressInterval = setInterval(() => {
      setProgress((prevProgress) => {
        // If we're in the last text phase, keep progress between 75-95%
        if (currentTextIndex === totalTexts - 1) {
          return prevProgress < 95 ? prevProgress + 0.3 : prevProgress;
        }

        // Otherwise, progress up to 75% over 24 seconds (8 seconds per phase)
        const targetProgress = (currentTextIndex + 1) * (75 / (totalTexts - 1));
        return prevProgress < targetProgress
          ? prevProgress + 0.6
          : prevProgress;
      });
    }, 200);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, [isComplete, currentTextIndex]);

  return (
    <div className="w-full space-y-4">
      <Progress value={progress} className="w-full" />
      <p className="text-center text-sm text-muted-foreground animate-fade-in">
        {loadingTexts[currentTextIndex]}
      </p>
    </div>
  );
};
