'use client';
import React from 'react';

interface FormFieldProps {
  label: string;
  val: string;
  set: (v: string) => void;
  type?: string;
  opts?: readonly string[] | string[];
  ph?: string;
  span?: number;
  yellow?: boolean;
}

export function FormField({
  label,
  val,
  set,
  type = 'text',
  opts,
  ph = '',
  span = 1,
  yellow = false,
}: FormFieldProps) {
  return (
    <div style={{ gridColumn: span > 1 ? `span ${span}` : undefined }}>
      <label className="field-label">{label}</label>
      {opts ? (
        <select
          value={val}
          onChange={(e) => set(e.target.value)}
          className={`field-select ${yellow ? 'yellow' : ''}`}
        >
          {opts.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={val}
          onChange={(e) => set(e.target.value)}
          placeholder={ph}
          className={`field-input ${yellow ? 'yellow' : ''}`}
        />
      )}
    </div>
  );
}
