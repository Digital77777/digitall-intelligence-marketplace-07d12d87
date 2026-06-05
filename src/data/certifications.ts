export type CertCategory = 'foundations' | 'agents' | 'business';
export type CertDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Certification {
  slug: string;
  title: string;
  provider: string;
  providerCode: string; // short tag for logo placeholder (e.g. AWS, MS, GCP)
  category: CertCategory;
  difficulty: CertDifficulty;
  duration: string;        // estimated prep
  examUrl: string;         // external official exam page
  skills: string[];
  outcomes: string[];      // career outcomes / roles
  salary: string;          // salary potential (range, USD)
  summary: string;
  modules: string[];       // prep checklist
}

export const CERT_CATEGORIES: { id: CertCategory; label: string; description: string }[] = [
  { id: 'foundations', label: 'AI Foundations', description: 'Cloud & vendor AI fundamentals — the credentials recruiters scan for.' },
  { id: 'agents',      label: 'AI Agents & Automation', description: 'Build agents, workflows, and prompt-driven systems.' },
  { id: 'business',    label: 'Business & Leadership', description: 'Lead AI strategy, transformation, and adoption.' },
];

export const CERTIFICATIONS: Certification[] = [
  {
    slug: 'aws-cloud-practitioner',
    title: 'AWS Certified Cloud Practitioner',
    provider: 'Amazon Web Services',
    providerCode: 'AWS',
    category: 'foundations',
    difficulty: 'Beginner',
    duration: '20–30 hrs',
    examUrl: 'https://aws.amazon.com/certification/certified-cloud-practitioner/',
    skills: ['Cloud Computing', 'AWS Core Services', 'Cloud Security', 'Billing & Pricing'],
    outcomes: ['Cloud Support Associate', 'Junior Cloud Engineer', 'Solutions Analyst'],
    salary: '$65k – $95k',
    summary: 'Foundational AWS credential. Validates overall understanding of the AWS Cloud.',
    modules: ['Cloud concepts', 'Security & compliance', 'Core AWS services', 'Billing, pricing & support'],
  },
  {
    slug: 'aws-ai-practitioner',
    title: 'AWS Certified AI Practitioner',
    provider: 'Amazon Web Services',
    providerCode: 'AWS',
    category: 'foundations',
    difficulty: 'Beginner',
    duration: '25–35 hrs',
    examUrl: 'https://aws.amazon.com/certification/certified-ai-practitioner/',
    skills: ['AI/ML Concepts', 'Generative AI', 'Amazon Bedrock', 'Responsible AI'],
    outcomes: ['AI Support Specialist', 'AI Business Analyst', 'Junior ML Engineer'],
    salary: '$75k – $110k',
    summary: 'Entry-level AWS AI/ML credential covering generative AI and Bedrock fundamentals.',
    modules: ['AI/ML fundamentals', 'Generative AI on AWS', 'Foundation models & Bedrock', 'Responsible AI'],
  },
  {
    slug: 'azure-ai-900',
    title: 'Microsoft Azure AI Fundamentals (AI-900)',
    provider: 'Microsoft',
    providerCode: 'MS',
    category: 'foundations',
    difficulty: 'Beginner',
    duration: '20–25 hrs',
    examUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/',
    skills: ['Azure AI Services', 'Machine Learning Basics', 'Computer Vision', 'NLP'],
    outcomes: ['Azure AI Associate', 'AI Solutions Analyst', 'Cloud AI Support'],
    salary: '$70k – $100k',
    summary: 'Microsoft\'s foundational AI certification on Azure AI services.',
    modules: ['AI workloads on Azure', 'ML fundamentals', 'Computer vision', 'NLP & generative AI'],
  },
  {
    slug: 'google-cloud-digital-leader',
    title: 'Google Cloud Digital Leader',
    provider: 'Google Cloud',
    providerCode: 'GCP',
    category: 'foundations',
    difficulty: 'Beginner',
    duration: '15–25 hrs',
    examUrl: 'https://cloud.google.com/learn/certification/cloud-digital-leader',
    skills: ['Cloud Strategy', 'GCP Services', 'Data & AI on GCP', 'Cloud Transformation'],
    outcomes: ['Cloud Consultant', 'Digital Transformation Lead', 'Solutions Analyst'],
    salary: '$70k – $105k',
    summary: 'Strategic GCP credential for digital-transformation and AI adoption.',
    modules: ['Digital transformation with GCP', 'Innovating with data & AI', 'Infrastructure & apps', 'Trust, security & support'],
  },
  {
    slug: 'oci-foundations',
    title: 'Oracle Cloud Infrastructure Foundations',
    provider: 'Oracle',
    providerCode: 'OCI',
    category: 'foundations',
    difficulty: 'Beginner',
    duration: '15–20 hrs',
    examUrl: 'https://education.oracle.com/oracle-cloud-infrastructure-foundations-associate/pexam_1Z0-1085-23',
    skills: ['OCI Core Services', 'Cloud Architecture', 'Identity & Access', 'OCI AI Services'],
    outcomes: ['OCI Associate', 'Cloud Support Engineer'],
    salary: '$65k – $95k',
    summary: 'Entry-level Oracle Cloud credential covering OCI core services.',
    modules: ['OCI overview', 'Compute & storage', 'Networking', 'Identity, security & AI services'],
  },
  {
    slug: 'cisco-ai-fundamentals',
    title: 'Cisco Certified AI Fundamentals',
    provider: 'Cisco',
    providerCode: 'CSCO',
    category: 'foundations',
    difficulty: 'Beginner',
    duration: '15–20 hrs',
    examUrl: 'https://learningnetwork.cisco.com/s/ai-fundamentals',
    skills: ['AI Concepts', 'Networking for AI', 'AI Use Cases', 'Ethics'],
    outcomes: ['AI Network Specialist', 'Infrastructure AI Analyst'],
    salary: '$70k – $100k',
    summary: 'Cisco foundational credential covering AI concepts and infrastructure.',
    modules: ['AI & ML basics', 'AI in networking', 'AI use cases', 'Responsible AI'],
  },
  {
    slug: 'salesforce-ai-associate',
    title: 'Salesforce AI Associate',
    provider: 'Salesforce',
    providerCode: 'SF',
    category: 'foundations',
    difficulty: 'Beginner',
    duration: '15–25 hrs',
    examUrl: 'https://trailhead.salesforce.com/credentials/aiassociate',
    skills: ['AI in CRM', 'Einstein AI', 'Data Quality', 'Ethical AI'],
    outcomes: ['CRM AI Specialist', 'AI Business Consultant', 'Salesforce Admin (AI)'],
    salary: '$70k – $110k',
    summary: 'Salesforce entry-level credential on applying AI in CRM with Einstein.',
    modules: ['AI fundamentals', 'Einstein AI', 'Data for AI', 'Ethical & responsible AI'],
  },
  {
    slug: 'create-an-ai-agent',
    title: 'Create an AI Agent (DIM)',
    provider: 'DIM Certified',
    providerCode: 'DIM',
    category: 'agents',
    difficulty: 'Intermediate',
    duration: '12–18 hrs',
    examUrl: 'https://digitalintelligencemarketplace.com',
    skills: ['Agent Design', 'Tool Use', 'Memory & State', 'Prompt Engineering'],
    outcomes: ['AI Agent Developer', 'Automation Engineer'],
    salary: '$80k – $130k',
    summary: 'Build production-ready AI agents with tools, memory, and guardrails.',
    modules: ['Agent fundamentals', 'Tool calling', 'Memory & RAG', 'Evaluation & deployment'],
  },
  {
    slug: 'ai-research-agents',
    title: 'AI Research Agents',
    provider: 'DIM Certified',
    providerCode: 'DIM',
    category: 'agents',
    difficulty: 'Advanced',
    duration: '15–20 hrs',
    examUrl: 'https://digitalintelligencemarketplace.com',
    skills: ['Research Workflows', 'Multi-step Reasoning', 'Source Verification'],
    outcomes: ['AI Research Engineer', 'Knowledge-ops Specialist'],
    salary: '$95k – $150k',
    summary: 'Design agents that conduct multi-step research and synthesize findings.',
    modules: ['Research planning', 'Source retrieval', 'Synthesis & citation', 'Quality controls'],
  },
  {
    slug: 'ai-workflow-automation',
    title: 'AI Workflow Automation',
    provider: 'DIM Certified',
    providerCode: 'DIM',
    category: 'agents',
    difficulty: 'Intermediate',
    duration: '10–15 hrs',
    examUrl: 'https://digitalintelligencemarketplace.com',
    skills: ['Workflow Design', 'API Integration', 'n8n/Zapier', 'AI Orchestration'],
    outcomes: ['Automation Specialist', 'Workflow Designer', 'AI Ops'],
    salary: '$70k – $115k',
    summary: 'Stitch AI into real business workflows that ship value.',
    modules: ['Workflow mapping', 'Triggers & actions', 'AI in the loop', 'Monitoring & cost'],
  },
  {
    slug: 'ai-business-professional',
    title: 'AI Business Professional',
    provider: 'DIM Certified',
    providerCode: 'DIM',
    category: 'business',
    difficulty: 'Intermediate',
    duration: '10–15 hrs',
    examUrl: 'https://digitalintelligencemarketplace.com',
    skills: ['AI Strategy', 'Use-case Discovery', 'ROI Modeling', 'Change Management'],
    outcomes: ['AI Business Consultant', 'AI Product Manager'],
    salary: '$90k – $140k',
    summary: 'Translate AI capabilities into measurable business outcomes.',
    modules: ['AI literacy for business', 'Identifying use cases', 'Building the business case', 'Driving adoption'],
  },
  {
    slug: 'ai-transformation-leader',
    title: 'AI Transformation Leader',
    provider: 'DIM Certified',
    providerCode: 'DIM',
    category: 'business',
    difficulty: 'Advanced',
    duration: '15–20 hrs',
    examUrl: 'https://digitalintelligencemarketplace.com',
    skills: ['Executive AI Strategy', 'Org Design', 'AI Governance', 'Portfolio Management'],
    outcomes: ['Head of AI', 'Director of Transformation', 'Chief AI Officer'],
    salary: '$140k – $250k',
    summary: 'Lead enterprise-wide AI transformation with governance and impact.',
    modules: ['AI vision & strategy', 'Operating model', 'Governance & risk', 'Scaling impact'],
  },
];

export const getCertBySlug = (slug: string) =>
  CERTIFICATIONS.find((c) => c.slug === slug);

export const getCertsByCategory = (cat: CertCategory) =>
  CERTIFICATIONS.filter((c) => c.category === cat);
