import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, DollarSign, Plus, Trash2, Crown } from 'lucide-react';
import { ProductFormData, PricingTier } from './SellingModal';

interface PricingStepProps {
  data: ProductFormData;
  onChange: (data: Partial<ProductFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const DEFAULT_TIERS: PricingTier[] = [
  { name: 'Free', price: 0, period: 'forever', features: ['Basic access'] },
  { name: 'Starter', price: 9.99, period: 'monthly', features: ['Core features'] },
  { name: 'Pro', price: 29.99, period: 'monthly', features: ['All features', 'Priority support'] },
  { name: 'Enterprise', price: 99.99, period: 'monthly', features: ['Custom solutions', 'Dedicated support', 'API access'] },
];

const PERIOD_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'one-time', label: 'One-time' },
  { value: 'forever', label: 'Free forever' },
];

const currencies = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
];

export const PricingStep: React.FC<PricingStepProps> = ({
  data,
  onChange,
  onNext,
  onPrevious,
}) => {
  const tiers = data.pricing_tiers || [];
  const [newFeature, setNewFeature] = useState('');
  const currentCurrency = currencies.find(c => c.value === data.currency)?.symbol || '$';

  const addTier = () => {
    const newTier: PricingTier = {
      name: `Tier ${tiers.length + 1}`,
      price: 0,
      period: 'monthly',
      features: [],
    };
    onChange({ pricing_tiers: [...tiers, newTier] });
  };

  const addDefaultTiers = () => {
    onChange({ pricing_tiers: DEFAULT_TIERS, price: DEFAULT_TIERS[1]?.price });
  };

  const updateTier = (index: number, updates: Partial<PricingTier>) => {
    const updated = tiers.map((t, i) => i === index ? { ...t, ...updates } : t);
    onChange({ pricing_tiers: updated });
    // Set base price to lowest non-zero tier
    const lowestPrice = updated.filter(t => t.price > 0).sort((a, b) => a.price - b.price)[0];
    if (lowestPrice) {
      onChange({ pricing_tiers: updated, price: lowestPrice.price });
    }
  };

  const removeTier = (index: number) => {
    const updated = tiers.filter((_, i) => i !== index);
    onChange({ pricing_tiers: updated });
  };

  const addFeatureToTier = (tierIndex: number, feature: string) => {
    if (!feature.trim()) return;
    const tier = tiers[tierIndex];
    updateTier(tierIndex, { features: [...tier.features, feature.trim()] });
  };

  const removeFeatureFromTier = (tierIndex: number, featureIndex: number) => {
    const tier = tiers[tierIndex];
    updateTier(tierIndex, { features: tier.features.filter((_, i) => i !== featureIndex) });
  };

  const isValid = tiers.length > 0;

  const tierColors = [
    'border-muted',
    'border-blue-500/30 bg-blue-500/5',
    'border-primary/30 bg-primary/5',
    'border-amber-500/30 bg-amber-500/5',
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Set Your Pricing Tiers</h2>
        <p className="text-muted-foreground text-sm">
          Create subscription or one-time pricing tiers for your AI creation
        </p>
      </div>

      {/* Currency selector */}
      <div className="flex items-center gap-3">
        <Label>Currency</Label>
        <Select value={data.currency} onValueChange={(value) => onChange({ currency: value })}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quick start */}
      {tiers.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center space-y-4">
            <Crown className="h-10 w-10 mx-auto text-primary" />
            <div>
              <h3 className="font-semibold mb-1">No pricing tiers yet</h3>
              <p className="text-sm text-muted-foreground">Add custom tiers or use our recommended template</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={addDefaultTiers} variant="default">
                Use Template (Free/Starter/Pro/Enterprise)
              </Button>
              <Button onClick={addTier} variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Custom Tier
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tier cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tiers.map((tier, index) => (
          <Card key={index} className={tierColors[index % tierColors.length]}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Input
                  value={tier.name}
                  onChange={(e) => updateTier(index, { name: e.target.value })}
                  className="text-lg font-bold border-0 p-0 h-auto focus-visible:ring-0 bg-transparent"
                  placeholder="Tier name"
                />
                <Button variant="ghost" size="icon" onClick={() => removeTier(index)} className="h-8 w-8 text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Price</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{currentCurrency}</span>
                    <Input
                      type="number"
                      value={tier.price}
                      onChange={(e) => updateTier(index, { price: parseFloat(e.target.value) || 0 })}
                      className="pl-7"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Billing Period</Label>
                  <Select value={tier.period} onValueChange={(value: PricingTier['period']) => updateTier(index, { period: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERIOD_OPTIONS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Features */}
              <div>
                <Label className="text-xs">Features</Label>
                <div className="space-y-1 mt-1">
                  {tier.features.map((feature, fi) => (
                    <div key={fi} className="flex items-center gap-2 text-sm">
                      <span className="text-primary">✓</span>
                      <span className="flex-1">{feature}</span>
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => removeFeatureFromTier(index, fi)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add feature..."
                    className="text-sm h-8"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addFeatureToTier(index, (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add tier button */}
      {tiers.length > 0 && tiers.length < 6 && (
        <Button variant="outline" onClick={addTier} className="w-full border-dashed">
          <Plus className="h-4 w-4 mr-2" />
          Add Another Tier
        </Button>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button variant="outline" onClick={onPrevious}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <div className="text-sm text-muted-foreground">
          {isValid ? `✅ ${tiers.length} tier(s) configured` : '⏳ Add at least one tier'}
        </div>
        <Button onClick={onNext} disabled={!isValid}>
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
