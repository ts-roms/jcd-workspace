'use client';

import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { cn } from '@/lib/utils';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  multiline?: boolean;
  rows?: number;
}

export function FormField({
  label,
  error,
  helperText,
  multiline = false,
  rows = 4,
  className,
  id,
  ...props
}: FormFieldProps) {
  const inputId = id || props.name || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className={error ? 'text-destructive' : ''}>
        {label}
        {props.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {multiline ? (
        <Textarea
          id={inputId}
          className={cn(error && 'border-destructive', className)}
          rows={rows}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <Input
          id={inputId}
          className={cn(error && 'border-destructive', className)}
          {...props}
        />
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {helperText && !error && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}
