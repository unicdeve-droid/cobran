import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
}

const variantClasses: Record<string, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark',
  success: 'bg-success text-white hover:bg-success-dark',
  secondary: 'bg-white text-brand border border-brand hover:bg-brand-light',
  ghost: 'bg-transparent text-brand hover:bg-brand-light',
  danger: 'bg-white text-red-600 border border-red-300 hover:bg-red-50',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60',
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
