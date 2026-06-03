import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { TierGate } from '@/components/tier/TierGate';
import { ListingLimitBanner } from '@/components/tier/ListingLimitBanner';
import { SellWizard } from '@/components/marketplace/sell-wizard/SellWizard';

const CreateListingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 pt-24 pb-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to create a marketplace listing.
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TierGate feature="marketplace_sell">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 pt-20">
          <ListingLimitBanner />
        </div>
        <SellWizard />
      </div>
    </TierGate>
  );
};

export default CreateListingPage;
