import React, { useState } from 'react';
import { Icon } from '../shared/Icon';
import type { RouteItem, RouteStep, RouteModalConfig } from '../../types/portal.types';

export interface RouteEditorProps {
  route?: RouteItem;
  modal?: RouteModalConfig;
  onClose: () => void;
  onSave?: (steps: RouteStep[]) => void;
}

export const RouteEditor: React.FC<RouteEditorProps> = ({
  route: propRoute,
  modal,
  onClose,
  onSave: propOnSave,
}) => {
  const route = propRoute || modal?.route;
  const onSave = propOnSave || modal?.onSave || (() => {});

  const [steps, setSteps] = useState<RouteStep[]>(() =>
    route?.steps ? route.steps.map((step) => ({ ...step })) : []
  );

  const update = (index: number, key: keyof RouteStep, value: string) =>
    setSteps((items) =>
      items.map((step, i) => (i === index ? { ...step, [key]: value } : step))
    );

  if (!route) return null;

  return (
    <div>
      <div className="modal-header">
        <div>
          <span className="panel-eyebrow">
            ROOM-BY-ROOM GUIDE · {route.category.toUpperCase()}
          </span>
          <h2>Edit route</h2>
          <p>{route.service}</p>
        </div>
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <Icon name="close" />
        </button>
      </div>
      <div className="route-editor-list">
        {steps.map((step, index) => (
          <div className="route-editor-step" key={index}>
            <span className="route-editor-index">
              {String(index + 1).padStart(2, '0')}
            </span>
            <label>
              <span>Room number</span>
              <input
                value={step.room}
                onChange={(e) => update(index, 'room', e.target.value)}
                aria-label={`Room number for step ${index + 1}`}
              />
            </label>
            <label>
              <span>Step name</span>
              <input
                value={step.title}
                onChange={(e) => update(index, 'title', e.target.value)}
                aria-label={`Step name for step ${index + 1}`}
              />
            </label>
            <button
              type="button"
              className="remove-step"
              aria-label="Remove step"
              onClick={() =>
                setSteps((items) => items.filter((_, i) => i !== index))
              }
            >
              <Icon name="close" size={16} />
            </button>
            <label className="step-description">
              <span>Citizen instructions</span>
              <input
                value={step.detail}
                onChange={(e) => update(index, 'detail', e.target.value)}
                aria-label={`Instructions for step ${index + 1}`}
              />
            </label>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="add-step-button"
        onClick={() =>
          setSteps((items) => [...items, { room: '', title: '', detail: '' }])
        }
      >
        <Icon name="plus" size={15} /> Add another step
      </button>
      <div className="modal-footer">
        <span>
          <Icon name="globe" size={14} /> Published guides appear on the citizen page.
        </span>
        <div>
          <button
            type="button"
            className="button secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="button primary"
            onClick={() => {
              onSave(steps);
              onClose();
            }}
          >
            Save route <Icon name="arrow" size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteEditor;
