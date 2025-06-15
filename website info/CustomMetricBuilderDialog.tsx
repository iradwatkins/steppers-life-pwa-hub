import React, { useState } from 'react';

interface MetricConfig {
  name: string;
  type: 'counter' | 'timer' | 'percentage' | 'rating' | 'calculation';
  inputMethod: 'manual' | 'timer' | 'counter' | 'selection';
  calculation?: {
    formula: string;
    variables: string[];
  };
  target?: {
    value: number;
    type: 'daily' | 'weekly' | 'monthly';
  };
  unit?: string;
  description?: string;
  category?: string;
}

interface CustomMetricBuilderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (metricConfig: MetricConfig) => void;
}

const CustomMetricBuilderDialog: React.FC<CustomMetricBuilderDialogProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [metricName, setMetricName] = useState<string>('');
  const [metricType, setMetricType] = useState<MetricConfig['type']>('counter');
  const [inputMethod, setInputMethod] = useState<MetricConfig['inputMethod']>('manual');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [unit, setUnit] = useState<string>('');
  const [hasTarget, setHasTarget] = useState<boolean>(false);
  const [targetValue, setTargetValue] = useState<number>(0);
  const [targetType, setTargetType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [formula, setFormula] = useState<string>('');
  const [variables, setVariables] = useState<string>('');

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    const metricConfig: MetricConfig = {
      name: metricName,
      type: metricType,
      inputMethod,
      description: description || undefined,
      category: category || undefined,
      unit: unit || undefined,
      target: hasTarget ? {
        value: targetValue,
        type: targetType
      } : undefined,
      calculation: metricType === 'calculation' ? {
        formula,
        variables: variables.split(',').map(v => v.trim()).filter(v => v)
      } : undefined
    };
    
    onSave(metricConfig);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setMetricName('');
    setMetricType('counter');
    setInputMethod('manual');
    setDescription('');
    setCategory('');
    setUnit('');
    setHasTarget(false);
    setTargetValue(0);
    setTargetType('daily');
    setFormula('');
    setVariables('');
  };

  const handleCancel = () => {
    handleReset();
    onClose();
  };

  const isValid = metricName.trim() && 
    (metricType !== 'calculation' || (formula.trim() && variables.trim()));

  return (
    <div className="custom-metric-builder-dialog-overlay">
      <div className="custom-metric-builder-dialog">
        <h2>Create Custom Metric</h2>
        
        <div className="form-group">
          <label htmlFor="metricName">Metric Name *</label>
          <input
            type="text"
            id="metricName"
            value={metricName}
            onChange={(e) => setMetricName(e.target.value)}
            placeholder="e.g., Daily Steps, Focus Time"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of what this metric tracks"
            rows={2}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="metricType">Metric Type *</label>
            <select
              id="metricType"
              value={metricType}
              onChange={(e) => setMetricType(e.target.value as MetricConfig['type'])}
            >
              <option value="counter">Counter (e.g., steps, tasks)</option>
              <option value="timer">Timer (duration tracking)</option>
              <option value="percentage">Percentage (0-100%)</option>
              <option value="rating">Rating (1-10 scale)</option>
              <option value="calculation">Calculation (formula-based)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="inputMethod">Input Method</label>
            <select
              id="inputMethod"
              value={inputMethod}
              onChange={(e) => setInputMethod(e.target.value as MetricConfig['inputMethod'])}
            >
              <option value="manual">Manual Entry</option>
              <option value="timer">Built-in Timer</option>
              <option value="counter">Quick Counter</option>
              <option value="selection">Dropdown Selection</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              type="text"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Health, Productivity"
            />
          </div>

          <div className="form-group">
            <label htmlFor="unit">Unit</label>
            <input
              type="text"
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g., steps, minutes, %"
            />
          </div>
        </div>

        {metricType === 'calculation' && (
          <div className="calculation-section">
            <h3>Calculation Settings</h3>
            <div className="form-group">
              <label htmlFor="formula">Formula *</label>
              <input
                type="text"
                id="formula"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="e.g., (a + b) / c * 100"
              />
            </div>
            <div className="form-group">
              <label htmlFor="variables">Variables * (comma-separated)</label>
              <input
                type="text"
                id="variables"
                value={variables}
                onChange={(e) => setVariables(e.target.value)}
                placeholder="e.g., completed_tasks, total_tasks, efficiency"
              />
            </div>
          </div>
        )}

        <div className="target-section">
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={hasTarget}
                onChange={(e) => setHasTarget(e.target.checked)}
              />
              Set Target Goal
            </label>
          </div>

          {hasTarget && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="targetValue">Target Value</label>
                <input
                  type="number"
                  id="targetValue"
                  value={targetValue}
                  onChange={(e) => setTargetValue(Number(e.target.value))}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label htmlFor="targetType">Target Period</label>
                <select
                  id="targetType"
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value as 'daily' | 'weekly' | 'monthly')}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="dialog-actions">
          <button onClick={handleCancel}>Cancel</button>
          <button onClick={handleSave} disabled={!isValid}>
            Save Metric
          </button>
        </div>
      </div>

      <style jsx>{`
        .custom-metric-builder-dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .custom-metric-builder-dialog {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }
        h2 {
          margin: 0 0 20px 0;
          color: #333;
          font-size: 24px;
        }
        h3 {
          margin: 20px 0 12px 0;
          color: #555;
          font-size: 18px;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-row {
          display: flex;
          gap: 16px;
        }
        .form-row .form-group {
          flex: 1;
        }
        label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #555;
        }
        input[type="text"], input[type="number"], select, textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          box-sizing: border-box;
        }
        input[type="text"]:focus, input[type="number"]:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #4CAF50;
          box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
        }
        textarea {
          resize: vertical;
        }
        input[type="checkbox"] {
          margin-right: 8px;
        }
        .calculation-section, .target-section {
          background: #f9f9f9;
          padding: 16px;
          border-radius: 8px;
          margin: 16px 0;
        }
        .dialog-actions {
          margin-top: 24px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        button {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        button:first-child {
          background: #f5f5f5;
          color: #666;
        }
        button:first-child:hover {
          background: #e0e0e0;
        }
        button:last-child {
          background: #4CAF50;
          color: white;
        }
        button:last-child:hover:not(:disabled) {
          background: #45a049;
        }
        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default CustomMetricBuilderDialog; 