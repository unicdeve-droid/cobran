import { InputHTMLAttributes, forwardRef } from 'react';

interface ColorInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const ColorInput = forwardRef<HTMLInputElement, ColorInputProps>(
  ({ label, id, value, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="flex items-center gap-2">
          <input
            ref={ref}
            id={id}
            type="color"
            value={value}
            className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-gray-300 p-1"
            {...props}
          />
          <input
            type="text"
            value={value}
            readOnly
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-500"
          />
        </div>
      </div>
    );
  }
);
ColorInput.displayName = 'ColorInput';
