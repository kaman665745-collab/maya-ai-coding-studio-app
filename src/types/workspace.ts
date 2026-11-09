export type WorkspaceMode = 'split' | 'fullscreen';
export type FullscreenTarget = 'editor' | 'preview';
export type SplitOrientation = 'auto' | 'horizontal' | 'vertical';

export interface WorkspaceState {
  mode: WorkspaceMode;
  fullscreenTarget: FullscreenTarget;
  splitOrientation: SplitOrientation;
  splitRatio: number; // e.g. 0.5 for 50/50, 0.6 for 60/40, 0.4 for 40/60
  isSwapped: boolean; // Swap Editor and Preview positions
  mobileFocus: 'both' | 'editor' | 'preview';
}

export const DEFAULT_WORKSPACE_STATE: WorkspaceState = {
  mode: 'split',
  fullscreenTarget: 'editor',
  splitOrientation: 'auto',
  splitRatio: 0.5,
  isSwapped: false,
  mobileFocus: 'both',
};

export const WORKSPACE_STORAGE_KEY = 'maya_workspace_state_v2';
