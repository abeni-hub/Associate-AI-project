import React, { useState } from 'react';
import { Icon } from '../shared/Icon';
import type { FormModalConfig, FormFieldConfig } from '../../types/portal.types';

export interface ModalFormProps {
  modal: FormModalConfig;
  onClose: () => void;
}

export const ModalForm: React.FC<ModalFormProps> = ({ modal, onClose }) => {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      modal.fields.map((field) => [field.name, field.value ?? ''])
    )
  );

  const update = (name: string, value: string) =>
    setValues((current) => ({ ...current, [name]: value }));

  const visibleFields = modal.fields.filter(
    (field) => !field.visibleWhen || field.visibleWhen(values)
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        modal.onSubmit(values);
        onClose();
      }}
    >
      <div className="modal-header">
        <div>
          <span className="panel-eyebrow">
            {modal.eyebrow || 'WORKSPACE UPDATE'}
          </span>
          <h2>{modal.title}</h2>
          {modal.description && <p>{modal.description}</p>}
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
      <div className="modal-form-grid">
        {visibleFields.map((field: FormFieldConfig) => (
          <label
            className={`modal-field${field.full ? ' full' : ''}`}
            key={field.name}
          >
            <span>
              {field.label}
              {field.required && <i> *</i>}
            </span>
            {field.type === 'select' ? (
              <select
                required={field.required}
                value={values[field.name]}
                onChange={(e) => update(field.name, e.target.value)}
              >
                <option value="" disabled>
                  Select {field.label.toLowerCase()}
                </option>
                {field.options?.map((option) => {
                  const value =
                    typeof option === 'string' ? option : option.value;
                  const label =
                    typeof option === 'string' ? option : option.label;
                  return (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  );
                })}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                required={field.required}
                rows={field.rows || 3}
                placeholder={
                  field.placeholder || `Enter ${field.label.toLowerCase()}`
                }
                value={values[field.name]}
                onChange={(e) => update(field.name, e.target.value)}
              />
            ) : (
              <input
                required={field.required}
                type={field.type || 'text'}
                placeholder={
                  field.placeholder || `Enter ${field.label.toLowerCase()}`
                }
                value={values[field.name]}
                onChange={(e) => update(field.name, e.target.value)}
              />
            )}
          </label>
        ))}
      </div>
      <div className="modal-footer">
        <span>
          <Icon name="lock" size={14} />{' '}
          {modal.footerNote || 'Changes are limited to your workspace.'}
        </span>
        <div>
          <button
            type="button"
            className="button secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="button primary" type="submit">
            {modal.submit || 'Save changes'} <Icon name="arrow" size={15} />
          </button>
        </div>
      </div>
    </form>
  );
};

export default ModalForm;
