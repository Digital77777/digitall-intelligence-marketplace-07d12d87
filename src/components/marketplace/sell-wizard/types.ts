export type AccountType = 'individual' | 'startup' | 'agency' | 'organization';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type PricingModel = 'free' | 'freemium' | 'one_time' | 'subscription' | 'custom';
export type ResponseTime = '24h' | '48h' | '72h';
export type RevenueStage = 'pre' | '0_1k' | '1k_10k' | '10k_100k' | '100k_plus';

export interface SellWizardData {
  // Step 1 — Creator
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  country: string;
  linkedin: string;
  website: string;
  dimUsername: string;
  accountType: AccountType;

  // Step 2 — Profile
  headline: string;
  bio: string;
  experience: ExperienceLevel;
  expertise: string[];

  // Step 3 — Product
  productName: string;
  tagline: string;
  description: string;
  productCategories: string[];
  industry: string;

  // Step 4 — Media
  logo: string | null;
  cover: string | null;
  screenshots: string[];
  demoVideo: string | null;
  documents: string[];

  // Step 5 — Details
  problemSolved: string;
  features: [string, string, string];
  targetAudience: string[];
  platforms: string[];

  // Step 6 — Pricing
  pricingModel: PricingModel;
  price: number;
  currency: string;
  memberOffer: string;

  // Step 7 — AI
  usesAi: boolean;
  aiModels: string[];
  aiUsage: string;

  // Step 8 — Growth
  lookingFor: string[];
  revenueStage: RevenueStage;
  impact: string;

  // Step 9 — Support
  supportEmail: string;
  supportWhatsapp: string;
  supportWebsite: string;
  responseTime: ResponseTime;
}

export const EXPERTISE_OPTIONS = [
  'AI Agents', 'Automation', 'Machine Learning', 'Data Science',
  'Prompt Engineering', 'SaaS Development', 'Mobile Development',
  'Web Development', 'Design', 'Marketing', 'Other',
];

export const PRODUCT_CATEGORIES = [
  'AI Agent', 'AI Tool', 'SaaS', 'Automation Workflow', 'API',
  'Prompt Pack', 'Course', 'Template', 'Dataset', 'Mobile App',
  'Website', 'Service', 'Other',
];

export const INDUSTRIES = [
  'Education', 'Healthcare', 'Finance', 'Marketing', 'Sales',
  'HR', 'Customer Support', 'Real Estate', 'E-commerce', 'Other',
];

export const AUDIENCES = [
  'Students', 'Creators', 'Developers', 'Startups', 'Businesses',
  'Enterprises', 'Educators', 'Other',
];

export const PLATFORMS = ['Web', 'Android', 'iOS', 'Windows', 'Mac', 'API'];

export const AI_MODELS = [
  'OpenAI', 'Anthropic', 'Gemini', 'Llama', 'Mistral', 'Custom Models', 'Other',
];

export const LOOKING_FOR = [
  'Customers', 'Users', 'Feedback', 'Investors', 'Co-Founders',
  'Team Members', 'Partnerships', 'Beta Testers',
];

export const defaultWizardData: SellWizardData = {
  fullName: '', email: '', phone: '', whatsapp: '', country: '',
  linkedin: '', website: '', dimUsername: '', accountType: 'individual',
  headline: '', bio: '', experience: 'intermediate', expertise: [],
  productName: '', tagline: '', description: '', productCategories: [], industry: '',
  logo: null, cover: null, screenshots: [], demoVideo: null, documents: [],
  problemSolved: '', features: ['', '', ''],
  targetAudience: [], platforms: [],
  pricingModel: 'one_time', price: 0, currency: 'USD', memberOffer: '',
  usesAi: true, aiModels: [], aiUsage: '',
  lookingFor: [], revenueStage: 'pre', impact: '',
  supportEmail: '', supportWhatsapp: '', supportWebsite: '', responseTime: '24h',
};

export const STEPS = [
  { id: 1, title: 'Creator', desc: 'Tell us about you' },
  { id: 2, title: 'Profile', desc: 'Your expertise' },
  { id: 3, title: 'Product', desc: 'What you’re selling' },
  { id: 4, title: 'Media', desc: 'Visuals & assets' },
  { id: 5, title: 'Details', desc: 'Features & audience' },
  { id: 6, title: 'Pricing', desc: 'How you charge' },
  { id: 7, title: 'AI', desc: 'AI capabilities' },
  { id: 8, title: 'Growth', desc: 'What you need' },
  { id: 9, title: 'Support', desc: 'Customer care' },
  { id: 10, title: 'Review', desc: 'Confirm & submit' },
];
