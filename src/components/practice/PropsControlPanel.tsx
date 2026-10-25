import React from 'react';
import { SlidersHorizontal, RotateCcw, Code } from 'lucide-react';
import type { PropDefinition } from '../../lib/previewPropsConfig';

export interface PropsControlPanelProps {
  cardId?: string;
  propDefs: PropDefinition[];
  values: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
  onReset: () => void;
}

const JsonInput: React.FC<{
  name: string;
  value: unknown;
  placeholder?: string;
  onChange: (name: string, value: unknown) => void;
}> = ({ name, value, placeholder, onChange }) => {
  const [prevValue, setPrevValue] = React.useState(value);
  const [text, setText] = React.useState(() =>
    value !== undefined && value !== null ? JSON.stringify(value, null, 2) : ''
  );
  const [error, setError] = React.useState<string | null>(null);

  if (prevValue !== value) {
    setPrevValue(value);
    setText(value !== undefined && value !== null ? JSON.stringify(value, null, 2) : '');
    setError(null);
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const raw = e.target.value;
    setText(raw);
    if (raw.trim() === '') {
      setError(null);
      onChange(name, undefined);
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setError(null);
      onChange(name, parsed);
    } catch {
      setError('Invalid JSON');
    }
  };

  return (
    <div className="props-json-container">
      <textarea
        className={`props-input props-input-json ${error ? 'props-input-error' : ''}`}
        data-testid={`prop-input-${name}`}
        rows={4}
        value={text}
        placeholder={placeholder ?? 'JSON array or object'}
        onChange={handleChange}
        spellCheck={false}
      />
      {error && (
        <div className="props-json-error" data-testid={`prop-json-error-${name}`}>
          {error}
        </div>
      )}
    </div>
  );
};

export const PropsControlPanel: React.FC<PropsControlPanelProps> = ({
  propDefs,
  values,
  onChange,
  onReset,
}) => {
  const groupedProps = React.useMemo(() => {
    const map = new Map<string, PropDefinition[]>();
    for (const prop of propDefs) {
      const g = prop.group || '';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(prop);
    }
    return Array.from(map.entries());
  }, [propDefs]);

  const hasGroups = groupedProps.length > 1 || (groupedProps.length === 1 && groupedProps[0][0] !== '');

  const renderSlot = (prop: PropDefinition) => {
    const currentValue = values[prop.name];
    const displayName = prop.propName || prop.name;

    return (
      <div
        key={prop.name}
        className="props-slot-card"
        data-testid={`props-slot-${prop.name}`}
      >
        <div className="props-slot-header">
          <span className="props-slot-name" title={displayName}>
            {displayName}
          </span>
          <span className={`props-type-badge props-type-badge-${prop.type}`}>
            {prop.type}
          </span>
        </div>

        {prop.description && (
          <div className="props-description">{prop.description}</div>
        )}

        {prop.type === 'number' && (
          <input
            type="number"
            className="props-input props-input-number"
            data-testid={`prop-input-${prop.name}`}
            value={currentValue !== undefined && currentValue !== null ? String(currentValue) : ''}
            min={prop.min}
            max={prop.max}
            step={prop.step ?? 1}
            placeholder={prop.placeholder ?? 'number'}
            onChange={(e) => {
              const val = e.target.value.trim();
              onChange(prop.name, val === '' ? undefined : Number(val));
            }}
          />
        )}

        {prop.type === 'string' && (
          <input
            type="text"
            className="props-input props-input-text"
            data-testid={`prop-input-${prop.name}`}
            value={currentValue !== undefined && currentValue !== null ? String(currentValue) : ''}
            placeholder={prop.placeholder ?? 'string'}
            onChange={(e) => {
              const val = e.target.value;
              onChange(prop.name, val === '' ? undefined : val);
            }}
          />
        )}

        {prop.type === 'boolean' && (
          <div
            className="props-boolean-group"
            role="radiogroup"
            aria-label={displayName}
            data-testid={`prop-boolean-${prop.name}`}
          >
            <button
              type="button"
              className={`props-bool-btn ${currentValue === true ? 'active-true' : ''}`}
              data-testid={`prop-bool-true-${prop.name}`}
              onClick={() => onChange(prop.name, true)}
            >
              true
            </button>
            <button
              type="button"
              className={`props-bool-btn ${currentValue === false ? 'active-false' : ''}`}
              data-testid={`prop-bool-false-${prop.name}`}
              onClick={() => onChange(prop.name, false)}
            >
              false
            </button>
            <button
              type="button"
              className={`props-bool-btn ${currentValue === undefined ? 'active-undefined' : ''}`}
              data-testid={`prop-bool-undefined-${prop.name}`}
              onClick={() => onChange(prop.name, undefined)}
            >
              undefined
            </button>
          </div>
        )}

        {prop.type === 'enum' && (
          <select
            className="props-select"
            data-testid={`prop-select-${prop.name}`}
            value={currentValue !== undefined ? String(currentValue) : '__undefined__'}
            onChange={(e) => {
              const val = e.target.value;
              onChange(prop.name, val === '__undefined__' ? undefined : val);
            }}
          >
            <option value="__undefined__">(undefined)</option>
            {prop.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}

        {prop.type === 'json' && (
          <JsonInput
            name={prop.name}
            value={currentValue}
            placeholder={prop.placeholder}
            onChange={onChange}
          />
        )}

        {prop.type === 'function' && (
          <div
            className="props-function-badge"
            data-testid={`prop-function-${prop.name}`}
            title="Callback function is auto-wired and logs events to output"
          >
            <Code size={12} /> (callback) → auto-logged
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="react-preview-props-panel" data-testid="react-preview-props-panel">
      <div className="props-panel-header">
        <div className="props-panel-header-left">
          <SlidersHorizontal size={14} color="#06b6d4" />
          <span className="props-panel-title">Props</span>
          {propDefs.length > 0 && (
            <span className="props-panel-count-badge" data-testid="props-count-badge">
              {propDefs.length} {propDefs.length === 1 ? 'prop' : 'props'}
            </span>
          )}
        </div>

        {propDefs.length > 0 && (
          <button
            type="button"
            className="props-panel-reset-btn"
            data-testid="props-reset-btn"
            onClick={onReset}
            title="Reset props to suggested defaults"
          >
            <RotateCcw size={11} /> Reset Defaults
          </button>
        )}
      </div>

      {propDefs.length === 0 ? (
        <div className="props-empty-hint" data-testid="props-empty-hint">
          No configurable props defined for this component.
        </div>
      ) : hasGroups ? (
        <div className="props-groups-wrapper" data-testid="props-slots-grid">
          {groupedProps.map(([groupName, groupProps]) => (
            <div
              key={groupName}
              className="props-group-section"
              data-testid={`props-group-${groupName}`}
            >
              <div className="props-group-header">
                <span className="props-group-title">{groupName}</span>
                <span className="props-group-count">
                  {groupProps.length} {groupProps.length === 1 ? 'prop' : 'props'}
                </span>
              </div>
              <div className="props-slots-grid">
                {groupProps.map(renderSlot)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="props-slots-grid" data-testid="props-slots-grid">
          {propDefs.map(renderSlot)}
        </div>
      )}
    </div>
  );
};
