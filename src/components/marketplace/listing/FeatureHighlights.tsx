import React from 'react';
import { Check } from 'lucide-react';

interface FeatureHighlightsProps {
  features: string[];
  tags: string[];
  title: string;
}

export const FeatureHighlights: React.FC<FeatureHighlightsProps> = ({
  features, tags, title,
}) => {
  const displayFeatures = features.length > 0 ? features : tags.slice(0, 6);
  if (displayFeatures.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Key Features</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {displayFeatures.map((feature, index) => (
          <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/40">
            <div className="w-5 h-5 rounded bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-green-600" />
            </div>
            <span className="text-xs font-medium leading-snug">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
