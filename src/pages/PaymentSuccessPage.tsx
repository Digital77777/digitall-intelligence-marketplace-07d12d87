import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Loader2, Crown, Zap, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { SEOHead } from '@/components/SEOHead';

const TIER_META: Record<string, { icon: JSX.Element; gradient: string; label: string }> = {
  starter: { icon: <Sparkles className="h-7 w-7" />, gradient: 'from-blue-500 to-cyan-500', label: 'Starter' },
  creator: { icon: <Zap className="h-7 w-7" />, gradient: 'from-purple-500 to-pink-500', label: 'Creator' },
  career: { icon: <Crown className="h-7 w-7" />, gradient: 'from-orange-500 to-red-500', label: 'Career' },
};

const POLL_INTERVAL_MS = 4000;
const MAX_POLL_MS = 90_000;

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const expectedTier = (params.get('tier') || '').toLowerCase();
  const { user } = useAuth();
  const { subscription, loading, refreshSubscription } = useSubscription();
  const [elapsed, setElapsed] = useState(0);
  const [manualRefreshing, setManualRefreshing] = useState(false);

  const currentTier = subscription?.tier?.name?.toLowerCase() || null;
  const matched = expectedTier ? currentTier === expectedTier : currentTier && currentTier !== 'starter';
  const timedOut = elapsed >= MAX_POLL_MS && !matched;

  useEffect(() => {
    if (!user) return;
    if (matched) return;
    if (timedOut) return;
    const interval = setInterval(() => {
      refreshSubscription();
      setElapsed((e) => e + POLL_INTERVAL_MS);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user, matched, timedOut, refreshSubscription]);

  const handleManualRefresh = async () => {
    setManualRefreshing(true);
    await refreshSubscription();
    setManualRefreshing(false);
  };

  const meta = TIER_META[currentTier || expectedTier || 'starter'] || TIER_META.starter;

  return (
    <div className="min-h-screen bg-background py-12 px-4 flex items-start justify-center">
      <SEOHead
        title="Payment Confirmation - Activating Your Plan"
        description="Confirming your subscription upgrade and unlocking your new tier benefits."
      />
      <Card className="w-full max-w-xl animate-fade-in">
        <CardHeader className="text-center space-y-3">
          <div className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-white shadow-lg`}>
            {matched ? <CheckCircle2 className="h-8 w-8" /> : meta.icon}
          </div>
          <CardTitle className="text-2xl">
            {matched ? 'Payment Confirmed!' : timedOut ? 'Still Processing' : 'Activating Your Plan...'}
          </CardTitle>
          <CardDescription>
            {matched
              ? `Your ${meta.label} tier is now active. Welcome aboard!`
              : timedOut
              ? "We haven't received your payment confirmation yet. It can take a few minutes — try refreshing, or contact support if it persists."
              : 'We are verifying your payment with Paystack. This usually takes a few seconds.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {!matched && !timedOut && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Checking subscription status...</span>
            </div>
          )}

          {subscription?.tier && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current plan</span>
                <Badge variant={matched ? 'default' : 'secondary'}>
                  {subscription.tier.display_name}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tools access</span>
                <span className="font-medium">
                  {subscription.tier.max_tools_access >= 999 ? 'Unlimited' : subscription.tier.max_tools_access}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Marketplace listings</span>
                <span className="font-medium">
                  {subscription.tier.max_listings >= 999 ? 'Unlimited' : subscription.tier.max_listings}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            {matched ? (
              <>
                <Button className="flex-1" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => navigate('/subscription')}>
                  View Plan
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleManualRefresh}
                  disabled={manualRefreshing || loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${manualRefreshing ? 'animate-spin' : ''}`} />
                  Refresh status
                </Button>
                <Button variant="ghost" className="flex-1" asChild>
                  <Link to="/support">Contact support</Link>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
