import React from 'react';
import { FlaskConical, ChevronUp, ChevronDown } from 'lucide-react';
import { sanitizeCallSignature } from '../../lib/harnessContracts';
import type { TestCaseItem } from '../../lib/leitner';

export interface ContractTableProps {
  contractCases: TestCaseItem[];
  showHarness: boolean;
  onToggleShowHarness: () => void;
}

export const ContractTable: React.FC<ContractTableProps> = ({
  contractCases,
  showHarness,
  onToggleShowHarness,
}) => {
  if (!contractCases || contractCases.length === 0) return null;

  return (
    <div
      className="contract-table-container"
      data-tour="contract"
    >
      <div
        className={`contract-table-header ${!showHarness ? 'contract-table-header-collapsed' : ''}`}
      >
        <div className="contract-table-header-left">
          <FlaskConical size={14} color="var(--accent-cyan)" />
          <span className="contract-table-header-title">
            Target Contract: Input vs Expected Output
          </span>
          <span className="contract-table-count-badge">
            {contractCases.length} {contractCases.length === 1 ? 'case' : 'cases'}
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleShowHarness}
          className="contract-table-collapse-btn"
          title={showHarness ? 'Collapse contract table' : 'Expand contract table'}
          aria-label={showHarness ? 'Collapse contract table' : 'Expand contract table'}
        >
          <span>{showHarness ? 'Hide' : 'Show'}</span>
          {showHarness ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {showHarness && (
        <div className="contract-table-body">
          <table className="contract-table-elem">
            <thead>
              <tr className="contract-table-th">
                <th className="contract-th-scenario">Test Case / Scenario</th>
                <th className="contract-th-input">Target Input / Call Signature</th>
                <th className="contract-th-expected">Expected Output / Condition</th>
              </tr>
            </thead>
            <tbody>
              {contractCases.map((tc, idx) => {
                const isError =
                  tc.expected.toLowerCase().includes('throw') ||
                  tc.expected.toLowerCase().includes('error') ||
                  tc.expected.toLowerCase().includes('reject');

                return (
                  <tr key={idx}>
                    <td className="contract-table-td contract-td-scenario">
                      <div className="contract-scenario-wrapper">
                        <span className="contract-test-case-circle">
                          {idx + 1}
                        </span>
                        <span>{tc.description || `Case #${idx + 1}`}</span>
                      </div>
                    </td>
                    <td className="contract-table-td">
                      <pre className="contract-code-pre">
                        {sanitizeCallSignature(tc.callSignature || tc.input)}
                      </pre>
                    </td>
                    <td className="contract-table-td">
                      <code
                        className={`contract-expected-badge ${isError ? 'contract-expected-error' : ''}`}
                      >
                        {tc.expected}
                      </code>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
