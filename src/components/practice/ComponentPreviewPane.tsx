import React from 'react';
import { createPortal } from 'react-dom';
import {
  Layers,
  RotateCcw,
  Minimize2,
  ExternalLink,
} from 'lucide-react';
import { ReactPreview } from '../ReactPreview';
import { ReactTestErrorBoundary } from './ReactTestErrorBoundary';
import type { TopicItem } from '../../lib/leitner';

export interface ComponentPreviewPaneProps {
  currentCard: TopicItem;
  code: string;
  executionMode: 'js' | 'ts';
  theme?: 'dark' | 'apple-gsos';
  isPreviewLive: boolean;
  previewRunTrigger: number;
  appendConsoleLog: (type: 'log' | 'warn' | 'error', message: string) => void;
  mountedComponent: { key: number; element: React.ReactElement } | null;
  isLegacyPoppedOut: boolean;
  legacyPopupWindow: Window | null;
  handleLegacyPopOut: () => void;
  handleLegacyDockBack: () => void;
  setMountedComponent: React.Dispatch<React.SetStateAction<{ key: number; element: React.ReactElement } | null>>;
  setIsOutputOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ComponentPreviewPane: React.FC<ComponentPreviewPaneProps> = ({
  currentCard,
  code,
  executionMode,
  theme = 'dark',
  isPreviewLive,
  previewRunTrigger,
  appendConsoleLog,
  mountedComponent,
  isLegacyPoppedOut,
  legacyPopupWindow,
  handleLegacyPopOut,
  handleLegacyDockBack,
  setMountedComponent,
  setIsOutputOpen,
}) => {
  if (currentCard?.previewCode) {
    return (
      <ReactPreview
        card={currentCard}
        code={code}
        executionMode={executionMode}
        theme={theme}
        isLive={isPreviewLive}
        runTrigger={previewRunTrigger}
      />
    );
  }

  return (
    <div className="legacy-component-preview-container">
      {/* Title Bar */}
      <div className="preview-title-bar">
        <div className="preview-title-left">
          <Layers size={15} color="var(--accent-cyan)" />
          <span className="preview-title-text">
            Component Preview / Hook Test {isLegacyPoppedOut ? '(Pop-out)' : ''}
          </span>
          {mountedComponent ? (
            <span className="preview-badge-live">
              <span className="preview-badge-dot-live" />
              Live Mounted
            </span>
          ) : (
            <span className="preview-badge-unmounted">
              <span className="preview-badge-dot-unmounted" />
              Unmounted
            </span>
          )}
        </div>

        <div className="preview-title-actions">
          {mountedComponent && (
            <button
              type="button"
              onClick={() => setMountedComponent(null)}
              className="preview-title-btn"
              title="Unmount and reset preview"
            >
              <RotateCcw size={12} /> Reset Mount
            </button>
          )}

          {isLegacyPoppedOut ? (
            <button
              type="button"
              onClick={handleLegacyDockBack}
              data-testid="legacy-preview-title-dock-btn"
              className="preview-title-btn"
              title="Dock preview back"
            >
              <Minimize2 size={12} /> Dock back
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLegacyPopOut}
              data-testid="legacy-preview-popout-btn"
              className="preview-title-btn"
              title="Pop out component preview into separate window"
            >
              <ExternalLink size={12} /> Pop out
            </button>
          )}
        </div>
      </div>

      {/* Preview Content Area */}
      <div className="preview-content-area">
        {isLegacyPoppedOut && legacyPopupWindow ? (
          <div className="preview-popped-out-placeholder">
            <Layers size={24} color="var(--accent-cyan)" />
            <div className="preview-popped-out-title">
              Live Component Preview (Pop-out Active)
            </div>
            <div className="preview-popped-out-desc">
              Component preview is currently rendering in an external window.
            </div>
            <button
              type="button"
              onClick={handleLegacyDockBack}
              data-testid="legacy-preview-main-dock-btn"
              className="btn btn-secondary preview-dock-btn-main"
            >
              <Minimize2 size={12} /> Dock back
            </button>
            {createPortal(
              <div className="preview-portal-wrapper">
                <div className="preview-portal-header">
                  <span className="preview-portal-title">
                    Live Component Preview / Hook Test (Pop-out)
                  </span>
                  <button
                    type="button"
                    onClick={handleLegacyDockBack}
                    data-testid="legacy-preview-popup-dock-btn"
                    className="btn btn-secondary preview-portal-dock-btn"
                  >
                    <Minimize2 size={11} /> Dock back
                  </button>
                </div>
                <ReactTestErrorBoundary
                  resetKey={mountedComponent?.key}
                  onError={(err) => {
                    appendConsoleLog('error', `React Render Exception: ${err.name}: ${err.message}`);
                    setIsOutputOpen(true);
                  }}
                >
                  {mountedComponent ? (
                    <div key={mountedComponent.key} className="preview-mounted-wrapper">
                      {mountedComponent.element}
                    </div>
                  ) : (
                    <div className="preview-empty-state">
                      <Layers size={26} className="preview-empty-icon" />
                      <div className="preview-empty-title">
                        Ready to Preview
                      </div>
                      <div className="preview-empty-desc">
                        Run code to start live component preview.
                      </div>
                    </div>
                  )}
                </ReactTestErrorBoundary>
              </div>,
              legacyPopupWindow.document.body
            )}
          </div>
        ) : (
          <ReactTestErrorBoundary
            resetKey={mountedComponent?.key}
            onError={(err) => {
              appendConsoleLog('error', `React Render Exception: ${err.name}: ${err.message}`);
              setIsOutputOpen(true);
            }}
          >
            {mountedComponent ? (
              <div key={mountedComponent.key} className="preview-mounted-wrapper">
                {mountedComponent.element}
              </div>
            ) : (
              <div className="preview-empty-state">
                <Layers size={26} className="preview-empty-icon" />
                <div className="preview-empty-title">
                  Ready to Preview
                </div>
                <div className="preview-empty-desc">
                  Run code to start live component preview.
                </div>
              </div>
            )}
          </ReactTestErrorBoundary>
        )}
      </div>
    </div>
  );
};
