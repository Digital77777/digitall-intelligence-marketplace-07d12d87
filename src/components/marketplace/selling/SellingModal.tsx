import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { SellerOnboardingStep } from './SellerOnboardingStep';
import { ProductCreationStep } from './ProductCreationStep';
import { PricingStep } from './PricingStep';
import { ReviewStep } from './ReviewStep';
import { useAuth } from '@/hooks/useAuth';
import { useMarketplace } from '@/hooks/useMarketplace';
import { toast } from 'sonner';

interface SellingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface PricingTier {
  name: string;
  price: number;
  period: 'monthly' | 'yearly' | 'one-time' | 'forever';
  features: string[];
}

export interface ProductFormData {
  title: string;
  description: string;
  listing_type: 'product' | 'service' | 'job';
  category_id?: string;
  price?: number;
  currency: string;
  images?: string[];
  videos?: string[];
  tags?: string[];
  requirements?: string;
  delivery_time?: number;
  productType?: string;
  creationLink?: string;
  pricing_tiers?: PricingTier[];
}

const STEPS = [
  { id: 'onboarding', title: 'Getting Started', description: 'Learn about selling on our platform' },
  { id: 'product', title: 'Product Details', description: 'Describe your AI creation' },
  { id: 'pricing', title: 'Pricing & Terms', description: 'Set your price and delivery terms' },
  { id: 'review', title: 'Review & Publish', description: 'Review and publish your listing' }
];

export const SellingModal: React.FC<SellingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    listing_type: 'product',
    currency: 'USD',
    tags: [],
    images: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { createListing } = useMarketplace();

  const updateFormData = (data: Partial<ProductFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to create a listing');
      return;
    }

    setIsSubmitting(true);
    try {
      await createListing({
        ...formData,
        user_id: user.id,
        status: 'active'
      });
      toast.success('Your listing has been created successfully!');
      onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        listing_type: 'product',
        currency: 'USD',
        tags: [],
        images: []
      });
      setCurrentStep(0);
    } catch (error) {
      toast.error('Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (STEPS[currentStep].id) {
      case 'onboarding':
        return <SellerOnboardingStep onNext={handleNext} />;
      case 'product':
        return (
          <ProductCreationStep
            data={formData}
            onChange={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 'pricing':
        return (
          <PricingStep
            data={formData}
            onChange={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 'review':
        return (
          <ReviewStep
            data={formData}
            onSubmit={handleSubmit}
            onPrevious={handlePrevious}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-2xl">Start Selling Your AI Creation</DialogTitle>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
                Step {currentStep + 1} of {STEPS.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="mb-4" />
            
            {/* Step Indicators */}
            <div className="flex justify-between">
              {STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex-1 text-center ${
                    index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <div className={`text-xs font-medium ${
                    index === currentStep ? 'text-primary' : ''
                  }`}>
                    {step.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6">
          {renderStepContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};