import React from 'react';
import {
  Columns2,
  Rows2,
  ArrowUpDown,
  ArrowLeftRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface WorkspaceDividerProps {
  orientation: 'horizontal' | 'vertical';
  splitRatio: number;
  onSplitRatioChange: (newRatio: number) => void;
  isSwapped: boolean;
  onToggleSwap: () => void;
  onToggleOrientation?: () => void;
  onResetSplit: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isMobile?: boolean;
}

export const WorkspaceDivider: React.FC<WorkspaceDividerProps> = ({
  orientation,
  splitRatio,
  onSplitRatioChange,
  isSwapped,
  onToggleSwap,
  onToggleOrientation,
  onResetSplit,
  containerRef,
  isMobile = false,
}) => {
  const isVertical = orientation === 'vertical';

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const handlePointerMove = (moveEvent: PointerEvent) => {
      let ratio = 0.5;
      if (isVertical) {
        const y = moveEvent.clientY - rect.top;
        ratio = Math.min(Math.max(y / rect.height, 0.15), 0.85);
      } else {
        const x = moveEvent.clientX - rect.left;
        ratio = Math.min(Math.max(x / rect.width, 0.15), 0.85);
      }
      onSplitRatioChange(Math.round(ratio * 100) / 100);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const percentageFirst = Math.round(splitRatio * 100);
  const percentageSecond = 100 - percentageFirst;

  return (
    <div
      onPointerDown={handlePointerDown}
      className={`relative flex items-center justify-center bg-[#141414] hover:bg-[#1f1f1f] border-[#292929] transition-colors select-none z-20 group touch-none ${
        isVertical
          ? 'h-3.5 w-full cursor-row-resize border-y my-0'
          : 'w-3.5 h-full cursor-col-resize border-x mx-0'
      }`}
      title={
        isVertical
          ? `Drag to adjust heights (${percentageFirst}% / ${percentageSecond}%)`
          : `Drag to adjust widths (${percentageFirst}% / ${percentageSecond}%)`
      }
    >
      {/* Central Grip Indicator */}
      <div
        className={`flex items-center justify-center pointer-events-none ${
          isVertical ? 'flex-row space-x-1' : 'flex-col space-y-1'
        }`}
      >
        <span className="w-1 h-1 rounded-full bg-neutral-500 group-hover:bg-white transition" />
        <span className="w-1 h-1 rounded-full bg-neutral-500 group-hover:bg-white transition" />
        <span className="w-1 h-1 rounded-full bg-neutral-500 group-hover:bg-white transition" />
      </div>

      {/* Floating Action Controls on Hover / Focus */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        className={`absolute hidden group-hover:flex items-center bg-[#0e0e0e] border border-[#333] rounded-md px-1.5 py-0.5 shadow-xl space-x-1 text-[10px] text-neutral-300 z-30 transition-all ${
          isVertical
            ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
            : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex-col space-y-1 space-x-0'
        }`}
      >
        <button
          onClick={onResetSplit}
          className={`px-1 py-0.5 rounded hover:bg-[#222] transition ${
            percentageFirst === 50 ? 'text-white font-bold bg-[#262626]' : 'text-neutral-400'
          }`}
          title="50/50 Split"
        >
          50/50
        </button>

        <button
          onClick={() => onSplitRatioChange(0.6)}
          className={`px-1 py-0.5 rounded hover:bg-[#222] transition ${
            percentageFirst === 60 ? 'text-white font-bold bg-[#262626]' : 'text-neutral-400'
          }`}
          title="60/40 Split"
        >
          60/40
        </button>

        <button
          onClick={() => onSplitRatioChange(0.4)}
          className={`px-1 py-0.5 rounded hover:bg-[#222] transition ${
            percentageFirst === 40 ? 'text-white font-bold bg-[#262626]' : 'text-neutral-400'
          }`}
          title="40/60 Split"
        >
          40/60
        </button>

        <button
          onClick={onToggleSwap}
          className="p-1 rounded hover:bg-[#222] text-neutral-400 hover:text-white transition"
          title={isVertical ? 'Swap Top and Bottom Panels' : 'Swap Left and Right Panels'}
        >
          {isVertical ? (
            <ArrowUpDown className="w-3 h-3" />
          ) : (
            <ArrowLeftRight className="w-3 h-3" />
          )}
        </button>

        {onToggleOrientation && !isMobile && (
          <button
            onClick={onToggleOrientation}
            className="p-1 rounded hover:bg-[#222] text-neutral-400 hover:text-white transition"
            title={isVertical ? 'Switch to Horizontal Split' : 'Switch to Vertical Split'}
          >
            {isVertical ? <Columns2 className="w-3 h-3" /> : <Rows2 className="w-3 h-3" />}
          </button>
        )}
      </div>
    </div>
  );
};
