import React from 'react';
import { Check, Sparkles } from 'lucide-react';

interface FeatureHighlightsProps {
  features: string[];
  tags: string[];
  title: string;
}

export const FeatureHighlights: React.FC<FeatureHighlightsProps> = ({
  features,
  tags,
  title,
}) => {
  const displayFeatures = features.length > 0 ? features : tags.slice(0, 6);

  if (displayFeatures.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
        Why Choose {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {displayFeatures.map((feature, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border/40 hover:border-primary/30 hover:bg-muted/60 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium leading-snug">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
