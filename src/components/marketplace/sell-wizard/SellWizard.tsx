import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ArrowLeft, ArrowRight, Check, Loader2, Sparkles, Upload, Store, Image as ImageIcon,
  Video, FileText, Globe, Briefcase, Heart, Mail, MessageCircle, DollarSign, Cpu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MediaUploader } from '@/components/media/MediaUploader';
import { ChipMultiSelect } from './ChipMultiSelect';
import {
  SellWizardData, defaultWizardData, STEPS,
  EXPERTISE_OPTIONS, PRODUCT_CATEGORIES, INDUSTRIES, AUDIENCES,
  PLATFORMS, AI_MODELS, LOOKING_FOR,
} from './types';

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
  'Netherlands', 'India', 'Nigeria', 'South Africa', 'Kenya', 'Ghana', 'Egypt',
  'Brazil', 'Mexico', 'Argentina', 'Japan', 'Singapore', 'UAE', 'Other',
];

interface SellWizardProps {
  initialData?: Partial<SellWizardData>;
}

export const SellWizard: React.FC<SellWizardProps> = ({ initialData }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<SellWizardData>({ ...defaultWizardData, ...initialData });

  // Pre-fill from profile
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: p } = await supabase
        .from('profiles')
        .select('full_name, email, headline, bio')
        .eq('user_id', user.id)
        .maybeSingle();
      if (p) {
        setData((d) => ({
          ...d,
          fullName: d.fullName || p.full_name || '',
          email: d.email || p.email || user.email || '',
          headline: d.headline || p.headline || '',
          bio: d.bio || p.bio || '',
          supportEmail: d.supportEmail || p.email || user.email || '',
        }));
      }
    })();
  }, [user]);

  const update = <K extends keyof SellWizardData>(key: K, value: SellWizardData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const progress = (step / STEPS.length) * 100;

  // Per-step validation
  const stepValid = useMemo(() => {
    switch (step) {
      case 1:
        return !!(data.fullName.trim() && data.email.trim() && data.country);
      case 2:
        return !!(data.headline.trim() && data.bio.trim() && data.expertise.length > 0);
      case 3:
        return !!(data.productName.trim() && data.tagline.trim() && data.description.trim()
          && data.productCategories.length > 0 && data.industry);
      case 4:
        return !!data.logo; // logo required, rest optional
      case 5:
        return !!(data.problemSolved.trim() && data.features.some((f) => f.trim())
          && data.targetAudience.length > 0 && data.platforms.length > 0);
      case 6:
        if (data.pricingModel === 'free' || data.pricingModel === 'custom') return true;
        return data.price >= 0 && !!data.currency;
      case 7:
        if (!data.usesAi) return true;
        return data.aiModels.length > 0 && data.aiUsage.trim().length > 0;
      case 8:
        return data.lookingFor.length > 0 && data.impact.trim().length > 0;
      case 9:
        return !!(data.supportEmail.trim() && data.responseTime);
      case 10:
        return true;
      default:
        return true;
    }
  }, [step, data]);

  const next = () => {
    if (!stepValid) {
      toast.error('Please fill in the required fields to continue.');
      return;
    }
    setStep((s) => Math.min(STEPS.length, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to publish your product.');
      navigate('/auth');
      return;
    }
    setSubmitting(true);
    try {
      const images = [data.logo, data.cover, ...data.screenshots].filter(Boolean) as string[];
      const videos = data.demoVideo ? [data.demoVideo] : [];

      const payload = {
        user_id: user.id,
        title: data.productName,
        tagline: data.tagline,
        description: data.description,
        listing_type: 'product' as const,
        status: 'draft', // pending admin review
        price: data.pricingModel === 'free' ? 0 : data.price,
        currency: data.currency,
        images,
        videos,
        creation_link: data.website,
        tags: [...data.productCategories, ...data.expertise].slice(0, 20),
        requirements: data.problemSolved,
        industry: data.industry,
        metadata: {
          review_status: 'pending_review',
          creator: {
            full_name: data.fullName,
            email: data.email,
            phone: data.phone,
            whatsapp: data.whatsapp,
            country: data.country,
            linkedin: data.linkedin,
            website: data.website,
            dim_username: data.dimUsername,
            account_type: data.accountType,
          },
          profile: {
            headline: data.headline,
            bio: data.bio,
            experience: data.experience,
            expertise: data.expertise,
          },
          product: {
            categories: data.productCategories,
            documents: data.documents,
          },
          details: {
            problem_solved: data.problemSolved,
            features: data.features.filter((f) => f.trim()),
            audience: data.targetAudience,
            platforms: data.platforms,
          },
          pricing: {
            model: data.pricingModel,
            member_offer: data.memberOffer,
          },
          ai: {
            uses_ai: data.usesAi,
            models: data.aiModels,
            usage: data.aiUsage,
          },
          growth: {
            looking_for: data.lookingFor,
            revenue_stage: data.revenueStage,
            impact: data.impact,
          },
          support: {
            email: data.supportEmail,
            whatsapp: data.supportWhatsapp,
            website: data.supportWebsite,
            response_time: data.responseTime,
          },
        },
      };

      const { error } = await supabase.from('marketplace_listings').insert([payload as any]);
      if (error) throw error;
      toast.success('Submitted! Your product is now pending review.');
      navigate('/marketplace/my-listings');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 pt-20 pb-16 max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-3 gap-1.5">
            <Sparkles className="h-3 w-3" /> Digital Intelligence Marketplace
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
            Sell Your Product on{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Digital Intelligence Marketplace
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
            Turn your ideas into opportunities. List your product, reach a global audience,
            gain visibility, receive feedback, find customers, attract collaborators, and grow within DIM.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6 sticky top-16 z-10 bg-background/80 backdrop-blur-md py-3 -mx-4 px-4 rounded-md border border-border/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-foreground">
              Step {step} of {STEPS.length} — {STEPS[step - 1].title}
            </span>
            <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
          <div className="hidden md:flex justify-between mt-3 gap-1">
            {STEPS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => s.id < step && setStep(s.id)}
                disabled={s.id > step}
                className={`flex-1 text-[10px] font-medium px-1.5 py-1 rounded transition-colors ${
                  s.id === step ? 'bg-primary text-primary-foreground'
                  : s.id < step ? 'text-primary hover:bg-primary/10 cursor-pointer'
                  : 'text-muted-foreground/60'
                }`}
              >
                {s.id}. {s.title}
              </button>
            ))}
          </div>
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-5 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {step === 1 && <Step1 data={data} update={update} />}
                {step === 2 && <Step2 data={data} update={update} />}
                {step === 3 && <Step3 data={data} update={update} />}
                {step === 4 && <Step4 data={data} update={update} />}
                {step === 5 && <Step5 data={data} update={update} />}
                {step === 6 && <Step6 data={data} update={update} />}
                {step === 7 && <Step7 data={data} update={update} />}
                {step === 8 && <Step8 data={data} update={update} />}
                {step === 9 && <Step9 data={data} update={update} />}
                {step === 10 && <Step10 data={data} goToStep={setStep} />}
              </motion.div>
            </AnimatePresence>

            <Separator className="my-6" />

            <div className="flex items-center justify-between gap-3">
              <Button
                type="button" variant="outline" onClick={back} disabled={step === 1 || submitting}
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              {step < STEPS.length ? (
                <Button type="button" onClick={next} disabled={!stepValid}>
                  Continue <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                  Submit for Review
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          By submitting, you agree your product follows DIM community & marketplace guidelines.
        </p>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// Step Components
// ────────────────────────────────────────────────────────────────────────────

interface StepProps {
  data: SellWizardData;
  update: <K extends keyof SellWizardData>(key: K, value: SellWizardData[K]) => void;
}

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({
  icon, title, desc,
}) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-1.5">
      <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
        {icon}
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
    <p className="text-sm text-muted-foreground">{desc}</p>
  </div>
);

const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode; hint?: string }> = ({
  label, required, children, hint,
}) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">
      {label}{required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

// Step 1 — Creator Information
const Step1: React.FC<StepProps> = ({ data, update }) => (
  <div>
    <SectionHeader icon={<Briefcase className="h-4 w-4" />} title="Creator Information" desc="Help us know who's behind the product." />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Full Name" required>
        <Input value={data.fullName} onChange={(e) => update('fullName', e.target.value)} placeholder="Jane Doe" />
      </Field>
      <Field label="Email Address" required>
        <Input type="email" value={data.email} onChange={(e) => update('email', e.target.value)} placeholder="you@email.com" />
      </Field>
      <Field label="Phone Number">
        <Input value={data.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+1 555 0100" />
      </Field>
      <Field label="WhatsApp Number">
        <Input value={data.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} placeholder="+1 555 0100" />
      </Field>
      <Field label="Country" required>
        <Select value={data.country} onValueChange={(v) => update('country', v)}>
          <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>
      <Field label="LinkedIn Profile">
        <Input value={data.linkedin} onChange={(e) => update('linkedin', e.target.value)} placeholder="https://linkedin.com/in/..." />
      </Field>
      <Field label="Website / Portfolio">
        <Input value={data.website} onChange={(e) => update('website', e.target.value)} placeholder="https://yoursite.com" />
      </Field>
      <Field label="DIM Username">
        <Input value={data.dimUsername} onChange={(e) => update('dimUsername', e.target.value)} placeholder="@yourhandle" />
      </Field>
    </div>
    <div className="mt-6">
      <Label className="text-sm font-medium mb-3 block">Account Type</Label>
      <RadioGroup
        value={data.accountType}
        onValueChange={(v) => update('accountType', v as any)}
        className="grid grid-cols-2 md:grid-cols-4 gap-2"
      >
        {[
          { v: 'individual', l: 'Individual Creator' },
          { v: 'startup', l: 'Startup' },
          { v: 'agency', l: 'Agency' },
          { v: 'organization', l: 'Organization' },
        ].map((o) => (
          <label
            key={o.v}
            className={`flex items-center gap-2 p-3 rounded-md border cursor-pointer transition-colors text-sm ${
              data.accountType === o.v ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
            }`}
          >
            <RadioGroupItem value={o.v} />
            {o.l}
          </label>
        ))}
      </RadioGroup>
    </div>
  </div>
);

// Step 2 — Creator Profile
const Step2: React.FC<StepProps> = ({ data, update }) => (
  <div>
    <SectionHeader icon={<Sparkles className="h-4 w-4" />} title="Creator Profile" desc="Share your background and skills." />
    <div className="grid grid-cols-1 gap-4">
      <Field label="Professional Headline" required>
        <Input value={data.headline} onChange={(e) => update('headline', e.target.value)} placeholder="AI Product Designer & Founder" />
      </Field>
      <Field label="Short Bio" required>
        <Textarea value={data.bio} onChange={(e) => update('bio', e.target.value)} rows={4}
          placeholder="A few sentences about your journey, expertise, and what you build." />
      </Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Years of Experience" required>
          <RadioGroup
            value={data.experience}
            onValueChange={(v) => update('experience', v as any)}
            className="grid grid-cols-3 gap-2"
          >
            {[
              { v: 'beginner', l: 'Beginner' },
              { v: 'intermediate', l: 'Intermediate' },
              { v: 'advanced', l: 'Advanced' },
            ].map((o) => (
              <label key={o.v} className={`flex items-center justify-center gap-1.5 p-2.5 rounded-md border cursor-pointer text-sm ${
                data.experience === o.v ? 'border-primary bg-primary/5' : 'border-border'
              }`}>
                <RadioGroupItem value={o.v} className="sr-only" />
                {o.l}
              </label>
            ))}
          </RadioGroup>
        </Field>
      </div>
      <Field label="Areas of Expertise" required hint="Select all that apply">
        <ChipMultiSelect options={EXPERTISE_OPTIONS} selected={data.expertise}
          onChange={(v) => update('expertise', v)} />
      </Field>
    </div>
  </div>
);

// Step 3 — Product Information
const Step3: React.FC<StepProps> = ({ data, update }) => (
  <div>
    <SectionHeader icon={<Store className="h-4 w-4" />} title="Product Information" desc="Describe what you're listing." />
    <div className="grid grid-cols-1 gap-4">
      <Field label="Product Name" required>
        <Input value={data.productName} onChange={(e) => update('productName', e.target.value)} placeholder="Your product name" />
      </Field>
      <Field label="Product Tagline" required hint="One sentence that hooks people in">
        <Input value={data.tagline} onChange={(e) => update('tagline', e.target.value)} placeholder="The fastest way to ship AI agents" maxLength={120} />
      </Field>
      <Field label="Product Description" required>
        <Textarea value={data.description} onChange={(e) => update('description', e.target.value)} rows={5}
          placeholder="Tell the world what your product does and why it matters." />
      </Field>
      <Field label="Product Categories" required>
        <ChipMultiSelect options={PRODUCT_CATEGORIES} selected={data.productCategories}
          onChange={(v) => update('productCategories', v)} max={5} />
      </Field>
      <Field label="Industry" required>
        <Select value={data.industry} onValueChange={(v) => update('industry', v)}>
          <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
          <SelectContent>
            {INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>
    </div>
  </div>
);

// Step 4 — Product Media
const Step4: React.FC<StepProps> = ({ data, update }) => (
  <div>
    <SectionHeader icon={<ImageIcon className="h-4 w-4" />} title="Product Media" desc="Upload visuals that showcase your product." />
    <div className="space-y-6">
      <Field label="Product Logo" required hint="Square image works best (PNG/SVG)">
        <MediaUploader
          images={data.logo ? [data.logo] : []}
          videos={[]}
          onImagesChange={(imgs) => update('logo', imgs[0] || null)}
          onVideosChange={() => {}}
          maxImages={1}
          maxVideos={0}
          bucket="marketplace-listings"
        />
      </Field>
      <Field label="Cover Image" hint="Wide banner (1600×900 ideal)">
        <MediaUploader
          images={data.cover ? [data.cover] : []}
          videos={[]}
          onImagesChange={(imgs) => update('cover', imgs[0] || null)}
          onVideosChange={() => {}}
          maxImages={1}
          maxVideos={0}
          bucket="marketplace-listings"
        />
      </Field>
      <Field label="Screenshots" hint="Up to 6 screenshots">
        <MediaUploader
          images={data.screenshots}
          videos={[]}
          onImagesChange={(imgs) => update('screenshots', imgs)}
          onVideosChange={() => {}}
          maxImages={6}
          maxVideos={0}
          bucket="marketplace-listings"
        />
      </Field>
      <Field label="Demo Video" hint="One short demo (≤ 50MB)">
        <MediaUploader
          images={[]}
          videos={data.demoVideo ? [data.demoVideo] : []}
          onImagesChange={() => {}}
          onVideosChange={(vids) => update('demoVideo', vids[0] || null)}
          maxImages={0}
          maxVideos={1}
          bucket="marketplace-listings"
        />
      </Field>
    </div>
  </div>
);

// Step 5 — Product Details
const Step5: React.FC<StepProps> = ({ data, update }) => (
  <div>
    <SectionHeader icon={<FileText className="h-4 w-4" />} title="Product Details" desc="What makes your product valuable?" />
    <div className="space-y-4">
      <Field label="Problem Solved" required>
        <Textarea value={data.problemSolved} onChange={(e) => update('problemSolved', e.target.value)} rows={3}
          placeholder="What painful problem does your product solve?" />
      </Field>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Top 3 Features <span className="text-destructive">*</span></Label>
        {data.features.map((f, i) => (
          <Input
            key={i}
            value={f}
            onChange={(e) => {
              const next = [...data.features] as [string, string, string];
              next[i] = e.target.value;
              update('features', next);
            }}
            placeholder={`Feature ${i + 1}`}
          />
        ))}
      </div>
      <Field label="Target Audience" required>
        <ChipMultiSelect options={AUDIENCES} selected={data.targetAudience} onChange={(v) => update('targetAudience', v)} />
      </Field>
      <Field label="Platforms" required>
        <ChipMultiSelect options={PLATFORMS} selected={data.platforms} onChange={(v) => update('platforms', v)} />
      </Field>
    </div>
  </div>
);

// Step 6 — Pricing
const Step6: React.FC<StepProps> = ({ data, update }) => {
  const showPrice = data.pricingModel !== 'free' && data.pricingModel !== 'custom';
  return (
    <div>
      <SectionHeader icon={<DollarSign className="h-4 w-4" />} title="Pricing" desc="Choose how customers pay." />
      <div className="space-y-5">
        <Field label="Pricing Model" required>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[
              { v: 'free', l: 'Free' },
              { v: 'freemium', l: 'Freemium' },
              { v: 'one_time', l: 'One-Time' },
              { v: 'subscription', l: 'Subscription' },
              { v: 'custom', l: 'Custom' },
            ].map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => update('pricingModel', o.v as any)}
                className={`p-3 rounded-md border text-sm font-medium transition-colors ${
                  data.pricingModel === o.v ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/40'
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>
        </Field>
        {showPrice && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price" required>
              <Input type="number" min={0} step="0.01" value={data.price}
                onChange={(e) => update('price', parseFloat(e.target.value) || 0)} />
            </Field>
            <Field label="Currency" required>
              <Select value={data.currency} onValueChange={(v) => update('currency', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['USD', 'EUR', 'GBP', 'NGN', 'ZAR', 'KES'].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        )}
        <Field label="Special Offer for DIM Members" hint="Optional — e.g. 20% off the first month">
          <Input value={data.memberOffer} onChange={(e) => update('memberOffer', e.target.value)}
            placeholder="20% off for verified DIM members" />
        </Field>
      </div>
    </div>
  );
};

// Step 7 — AI Information
const Step7: React.FC<StepProps> = ({ data, update }) => (
  <div>
    <SectionHeader icon={<Cpu className="h-4 w-4" />} title="AI Information" desc="Tell us about the AI inside your product." />
    <div className="space-y-5">
      <div className="flex items-center justify-between p-4 rounded-md border border-border">
        <div>
          <Label className="text-sm font-medium">Does your product use AI?</Label>
          <p className="text-xs text-muted-foreground mt-0.5">Toggle off if this is a non-AI digital product.</p>
        </div>
        <Switch checked={data.usesAi} onCheckedChange={(v) => update('usesAi', v)} />
      </div>
      {data.usesAi && (
        <>
          <Field label="AI Models / Providers Used" required>
            <ChipMultiSelect options={AI_MODELS} selected={data.aiModels} onChange={(v) => update('aiModels', v)} />
          </Field>
          <Field label="How is AI used in your product?" required>
            <Textarea value={data.aiUsage} onChange={(e) => update('aiUsage', e.target.value)} rows={4}
              placeholder="e.g. We fine-tune GPT-4 to generate personalized study plans for students." />
          </Field>
        </>
      )}
    </div>
  </div>
);

// Step 8 — Growth & Opportunities
const Step8: React.FC<StepProps> = ({ data, update }) => (
  <div>
    <SectionHeader icon={<Heart className="h-4 w-4" />} title="Growth & Opportunities" desc="What do you need from the community?" />
    <div className="space-y-5">
      <Field label="What are you looking for?" required>
        <ChipMultiSelect options={LOOKING_FOR} selected={data.lookingFor} onChange={(v) => update('lookingFor', v)} />
      </Field>
      <Field label="Revenue Stage" required>
        <RadioGroup
          value={data.revenueStage}
          onValueChange={(v) => update('revenueStage', v as any)}
          className="grid grid-cols-2 md:grid-cols-5 gap-2"
        >
          {[
            { v: 'pre', l: 'Pre-Revenue' },
            { v: '0_1k', l: '$1–$1k' },
            { v: '1k_10k', l: '$1k–$10k' },
            { v: '10k_100k', l: '$10k–$100k' },
            { v: '100k_plus', l: '$100k+' },
          ].map((o) => (
            <label key={o.v} className={`p-2.5 rounded-md border text-center text-sm cursor-pointer ${
              data.revenueStage === o.v ? 'border-primary bg-primary/5' : 'border-border'
            }`}>
              <RadioGroupItem value={o.v} className="sr-only" /> {o.l}
            </label>
          ))}
        </RadioGroup>
      </Field>
      <Field label="Impact Statement" required hint="How does your product create value or impact?">
        <Textarea value={data.impact} onChange={(e) => update('impact', e.target.value)} rows={4}
          placeholder="Our product helps 10,000+ students access affordable AI-powered tutoring globally." />
      </Field>
    </div>
  </div>
);

// Step 9 — Support Information
const Step9: React.FC<StepProps> = ({ data, update }) => (
  <div>
    <SectionHeader icon={<MessageCircle className="h-4 w-4" />} title="Support Information" desc="How customers reach you for help." />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Support Email" required>
        <Input type="email" value={data.supportEmail} onChange={(e) => update('supportEmail', e.target.value)} placeholder="support@yourdomain.com" />
      </Field>
      <Field label="WhatsApp Number">
        <Input value={data.supportWhatsapp} onChange={(e) => update('supportWhatsapp', e.target.value)} placeholder="+1 555 0100" />
      </Field>
      <Field label="Support Website">
        <Input value={data.supportWebsite} onChange={(e) => update('supportWebsite', e.target.value)} placeholder="https://yourdomain.com/help" />
      </Field>
      <Field label="Average Response Time" required>
        <Select value={data.responseTime} onValueChange={(v) => update('responseTime', v as any)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Within 24 Hours</SelectItem>
            <SelectItem value="48h">Within 48 Hours</SelectItem>
            <SelectItem value="72h">Within 72 Hours</SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </div>
  </div>
);

// Step 10 — Review & Submit
const Step10: React.FC<{ data: SellWizardData; goToStep: (n: number) => void }> = ({ data, goToStep }) => {
  const EditBtn: React.FC<{ to: number }> = ({ to }) => (
    <Button type="button" variant="ghost" size="sm" onClick={() => goToStep(to)} className="text-xs">Edit</Button>
  );
  const Row: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value || <span className="text-muted-foreground/60">—</span>}</span>
    </div>
  );
  return (
    <div>
      <SectionHeader icon={<Check className="h-4 w-4" />} title="Review & Submit" desc="Confirm everything looks right before submitting for review." />
      <div className="space-y-4">
        <SectionCard title="Creator" onEdit={() => goToStep(1)}>
          <Row label="Name" value={data.fullName} />
          <Row label="Email" value={data.email} />
          <Row label="Country" value={data.country} />
          <Row label="Account Type" value={data.accountType} />
        </SectionCard>
        <SectionCard title="Profile" onEdit={() => goToStep(2)}>
          <Row label="Headline" value={data.headline} />
          <Row label="Experience" value={data.experience} />
          <Row label="Expertise" value={data.expertise.join(', ')} />
        </SectionCard>
        <SectionCard title="Product" onEdit={() => goToStep(3)}>
          <Row label="Name" value={data.productName} />
          <Row label="Tagline" value={data.tagline} />
          <Row label="Categories" value={data.productCategories.join(', ')} />
          <Row label="Industry" value={data.industry} />
        </SectionCard>
        <SectionCard title="Media" onEdit={() => goToStep(4)}>
          <div className="flex gap-2 flex-wrap py-2">
            {data.logo && <img src={data.logo} alt="logo" className="h-14 w-14 rounded-md object-cover border" />}
            {data.cover && <img src={data.cover} alt="cover" className="h-14 w-28 rounded-md object-cover border" />}
            {data.screenshots.slice(0, 4).map((s, i) => (
              <img key={i} src={s} alt={`screenshot-${i}`} className="h-14 w-14 rounded-md object-cover border" />
            ))}
            {data.demoVideo && (
              <div className="h-14 w-14 rounded-md border flex items-center justify-center bg-muted">
                <Video className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>
        </SectionCard>
        <SectionCard title="Pricing" onEdit={() => goToStep(6)}>
          <Row label="Model" value={data.pricingModel} />
          {data.pricingModel !== 'free' && data.pricingModel !== 'custom' && (
            <Row label="Price" value={`${data.currency} ${data.price}`} />
          )}
          {data.memberOffer && <Row label="Member Offer" value={data.memberOffer} />}
        </SectionCard>
        <SectionCard title="AI" onEdit={() => goToStep(7)}>
          <Row label="Uses AI" value={data.usesAi ? 'Yes' : 'No'} />
          {data.usesAi && <Row label="Models" value={data.aiModels.join(', ')} />}
        </SectionCard>
        <SectionCard title="Support" onEdit={() => goToStep(9)}>
          <Row label="Email" value={data.supportEmail} />
          <Row label="Response Time" value={data.responseTime} />
        </SectionCard>
      </div>
      <div className="mt-6 p-4 rounded-md bg-primary/5 border border-primary/20 text-sm flex items-start gap-3">
        <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="font-medium text-foreground">Smart Marketplace Intelligence</p>
          <p className="text-muted-foreground text-xs mt-0.5">
            We'll auto-generate your Product Score, Trust Score, Discovery Score, SEO description,
            tags and recommended categories once your listing is approved.
          </p>
        </div>
      </div>
    </div>
  );
};

const SectionCard: React.FC<{ title: string; onEdit: () => void; children: React.ReactNode }> = ({
  title, onEdit, children,
}) => (
  <div className="border border-border rounded-md p-4">
    <div className="flex items-center justify-between mb-1">
      <h3 className="text-sm font-semibold">{title}</h3>
      <Button type="button" variant="ghost" size="sm" onClick={onEdit} className="text-xs h-7">Edit</Button>
    </div>
    <Separator className="mb-1" />
    {children}
  </div>
);
