import React from 'react';
import {
  Terminal,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import type { ConsoleLogEntry } from './consoleFormat';

export interface ConsoleRunnerDrawerProps {
  isOutputOpen: boolean;
  setIsOutputOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  isRunning: boolean;
  executionStatus: 'idle' | 'running' | 'success' | 'error';
  outputLogs: ConsoleLogEntry[];
  onClearLogs: () => void;
  theme?: 'dark' | 'apple-gsos';
}

export const ConsoleRunnerDrawer: React.FC<ConsoleRunnerDrawerProps> = ({
  isOutputOpen,
  setIsOutputOpen,
  isRunning,
  executionStatus,
  outputLogs,
  onClearLogs,
}) => {
  const errorCount = outputLogs.filter((l) => l.failure || l.type === 'error').length;

  return (
    <div className="console-runner-container">
      {/* Terminal Title Bar */}
      <div
        className={`console-runner-header ${isOutputOpen ? 'console-runner-header-open' : ''}`}
        onClick={() => setIsOutputOpen((prev) => !prev)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOutputOpen((prev) => !prev);
          }
        }}
      >
        <div className="console-runner-header-left">
          <Terminal size={15} color="var(--accent-cyan)" />
          <span className="console-runner-header-title">
            Console & Test Runner
          </span>

          {/* Status Indicators (Green / Red / Running / Ready) */}
          {isRunning ? (
            <span className="console-status-pill console-status-running">
              <Loader2 size={11} className="animate-spin" /> Running...
            </span>
          ) : executionStatus === 'success' ? (
            <span className="console-status-pill console-status-success">
              <span className="console-status-dot console-status-dot-success" />
              Passed (0 Errors)
            </span>
          ) : executionStatus === 'error' ? (
            <span className="console-status-pill console-status-error">
              <span className="console-status-dot console-status-dot-error" />
              Failed ({errorCount} Error{errorCount === 1 ? '' : 's'})
            </span>
          ) : (
            <span className="console-status-pill console-status-ready">
              <span className="console-status-dot console-status-dot-ready" />
              Ready
            </span>
          )}

          {/* Log count badge */}
          {outputLogs.length > 0 && (
            <span
              className={`console-log-count-badge ${
                errorCount > 0 ? 'console-log-count-badge-err' : 'console-log-count-badge-ok'
              }`}
            >
              {outputLogs.length} {outputLogs.length === 1 ? 'entry' : 'entries'}
            </span>
          )}
        </div>

        <div className="console-runner-header-right">
          {outputLogs.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClearLogs();
              }}
              className="console-clear-logs-btn"
              title="Clear console output"
            >
              <Trash2 size={12} /> Clear
            </button>
          )}
          <span className="console-toggle-icon">
            {isOutputOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>
      </div>

      {/* Terminal Console Output Body */}
      {isOutputOpen && (
        <div className="console-runner-body">
          {outputLogs.length === 0 ? (
            <div className="console-empty-logs">
              No output yet. Click 'Run Code / Test' (or Cmd+Enter) above to execute your solution and view test assertions or console.log outputs.
            </div>
          ) : (
            <div className="console-log-list">
              {outputLogs.map((log, index) => {
                let badgeClass = 'console-log-badge-log';
                let textClass = 'console-log-text-log';
                let rowClass = '';
                let badgeLabel = 'LOG';
                let icon = null;

                if (log.content.includes('FAIL')) {
                  badgeClass = 'console-log-badge-fail';
                  textClass = 'console-log-text-fail';
                  rowClass = 'console-log-row-fail';
                  badgeLabel = 'FAIL';
                  icon = <XCircle size={13} color="var(--accent-rose)" className="console-log-icon" />;
                } else if (log.type === 'error') {
                  badgeClass = 'console-log-badge-error';
                  textClass = 'console-log-text-fail';
                  rowClass = 'console-log-row-fail';
                  badgeLabel = 'ERROR';
                  icon = <XCircle size={13} color="var(--accent-rose)" className="console-log-icon" />;
                } else if (log.type === 'warn') {
                  badgeClass = 'console-log-badge-warn';
                  textClass = 'console-log-text-warn';
                  rowClass = 'console-log-row-warn';
                  badgeLabel = 'WARN';
                  icon = <AlertTriangle size={13} color="var(--accent-amber)" className="console-log-icon" />;
                } else if (log.type === 'info') {
                  badgeClass = 'console-log-badge-info';
                  textClass = 'console-log-text-info';
                  badgeLabel = 'INFO';
                } else if (log.content.includes('PASS')) {
                  badgeClass = 'console-log-badge-pass';
                  textClass = 'console-log-text-pass';
                  badgeLabel = 'PASS';
                }

                return (
                  <div key={index} className={`console-log-row ${rowClass}`}>
                    <span className="console-log-timestamp">
                      [{log.timestamp}]
                    </span>
                    <span className={`console-log-badge ${badgeClass}`}>
                      {badgeLabel}
                    </span>
                    {icon}
                    <span className={`console-log-text ${textClass}`}>
                      {log.content.includes(' | Expected: ') && log.content.includes(' | Received: ') ? (
                        (() => {
                          const [header, rest] = log.content.split(' | Expected: ');
                          const [expectedPart, receivedPart] = (rest || '').split(' | Received: ');
                          return (
                            <span>
                              <span className="console-assertion-header">{header}</span>
                              <span className="console-assertion-sep"> | Expected: </span>
                              <span className="console-assertion-expected">{expectedPart}</span>
                              <span className="console-assertion-sep"> | Received: </span>
                              <span className="console-assertion-received">{receivedPart}</span>
                            </span>
                          );
                        })()
                      ) : (
                        log.content
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
