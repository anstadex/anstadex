
import React from 'react';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => {
  const id = `checkbox-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className="flex items-center">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
      />
      <label htmlFor={id} className="ml-3 block text-sm font-medium text-gray-300">{label}</label>
    </div>
  );
};
