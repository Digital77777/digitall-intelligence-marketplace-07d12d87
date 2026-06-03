import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  max?: number;
}

export const ChipMultiSelect: React.FC<Props> = ({ options, selected, onChange, max }) => {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else {
      if (max && selected.length >= max) return;
      onChange([...selected, opt]);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            type="button"
            key={opt}
            onClick={() => toggle(opt)}
            className={cn(
              'transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full',
            )}
          >
            <Badge
              variant={active ? 'default' : 'outline'}
              className={cn(
                'px-3 py-1.5 cursor-pointer text-xs font-medium border',
                active && 'shadow-sm',
              )}
            >
              {opt}
            </Badge>
          </button>
        );
      })}
    </div>
  );
};
