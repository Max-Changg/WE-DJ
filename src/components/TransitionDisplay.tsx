import React from "react";

interface TransitionDisplayProps {
  currentSong: string;
  transitionSong: string;
  currentThumbnail?: string;
  transitionThumbnail?: string;
  className?: string;
  isLoadingThumbnails?: boolean;
  isGeneratingTransition?: boolean;
}

export const TransitionDisplay: React.FC<TransitionDisplayProps> = ({
  currentSong,
  transitionSong,
  currentThumbnail,
  transitionThumbnail,
  className = "",
  isLoadingThumbnails = false,
  isGeneratingTransition = false,
}) => {
  return (
    <div
      className={`bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 ${className}`}
    >
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">
          Transitioning from
        </h3>
        {(isLoadingThumbnails || isGeneratingTransition) && (
          <div className="text-sm text-white/60">
            {isLoadingThumbnails && <div>Loading thumbnails...</div>}
            {isGeneratingTransition && <div>Generating transition...</div>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 items-center">
        {/* Current Song */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-800 mb-3">
            {currentThumbnail ? (
              <img
                src={currentThumbnail}
                alt={currentSong}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
          <div className="w-48 text-center">
            <p className="text-sm text-white/80 font-medium break-words">
              {currentSong.replace(".mp3", "")}
            </p>
          </div>
        </div>

        {/* Transition Arrow */}
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mb-2">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </div>
          <span className="text-xs text-white/60">to</span>
        </div>

        {/* Transition Song */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-800 mb-3">
            {transitionThumbnail ? (
              <img
                src={transitionThumbnail}
                alt={transitionSong}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
          <div className="w-48 text-center">
            <p className="text-sm text-white/80 font-medium break-words">
              {transitionSong.replace(".mp3", "")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
