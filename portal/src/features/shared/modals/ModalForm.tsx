import React, { useState } from 'react';
import { Icon } from '../components/Icon';
import type { FormModalConfig, FormFieldConfig } from '../../../types/portal.types';

export interface ModalFormProps {
  modal: FormModalConfig;
  onClose: () => void;
}

export const ModalForm: React.FC<ModalFormProps> = ({ modal, onClose }) => {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      modal.fields.map((field) => {
        const rawVal = field.value ?? '';
        const valStr =
          typeof rawVal === 'string'
            ? rawVal
            : typeof rawVal === 'object' && rawVal !== null
            ? (rawVal.en || rawVal.eng || (Object.values(rawVal)[0] as string) || '')
            : String(rawVal);
        return [field.name, valStr];
      })
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
          <h2>{typeof modal.title === 'string' ? modal.title : ''}</h2>
          {modal.description && <p>{typeof modal.description === 'string' ? modal.description : ''}</p>}
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
        {visibleFields.map((field: FormFieldConfig) => {
          const fieldLabel = typeof field.label === 'string' ? field.label : '';
          return (
            <label
              className={`modal-field${field.full ? ' full' : ''}`}
              key={field.name}
            >
              <span>
                {fieldLabel}
                {field.required && <i> *</i>}
              </span>
              {field.type === 'select' ? (
                <select
                  required={field.required}
                  value={values[field.name]}
                  onChange={(e) => update(field.name, e.target.value)}
                >
                  <option value="" disabled>
                    Select {fieldLabel.toLowerCase()}
                  </option>
                  {field.options?.map((option) => {
                    const value =
                      typeof option === 'string' ? option : option.value;
                    const rawOptLabel =
                      typeof option === 'string' ? option : option.label;
                    const label = typeof rawOptLabel === 'string' ? rawOptLabel : '';
                    return (
                      <option key={String(value)} value={String(value)}>
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
                    field.placeholder || (fieldLabel ? `Enter ${fieldLabel.toLowerCase()}` : '')
                  }
                  value={values[field.name]}
                  onChange={(e) => update(field.name, e.target.value)}
                />
              ) : (
                <input
                  required={field.required}
                  type={field.type || 'text'}
                  placeholder={
                    field.placeholder || (fieldLabel ? `Enter ${fieldLabel.toLowerCase()}` : '')
                  }
                  value={values[field.name]}
                  onChange={(e) => update(field.name, e.target.value)}
                />
              )}
            </label>
          );
        })}
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
