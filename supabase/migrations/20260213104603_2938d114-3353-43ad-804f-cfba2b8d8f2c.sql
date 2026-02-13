
-- Insert 20 South African / African AI tools under @DIM_Earn
INSERT INTO marketplace_listings (user_id, title, description, listing_type, status, category_id, currency, tags, creation_link, pricing_tiers) VALUES

-- 1. Aerobotics
('fce177b9-604d-4e7c-b904-5f18ccf1ec73',
'Aerobotics',
'AI + drone imagery platform for precision agriculture. Provides yield forecasting, fruit sizing, quality grading, and pest detection for citrus, avocado, macadamia, and other tree crops. Trusted by farms across South Africa, the US, and Australia.',
'product', 'active', 'b2c3d4e5-6789-abcd-ef01-222222222222', 'USD',
ARRAY['agriculture', 'precision-farming', 'drone', 'yield-forecasting', 'south-africa'],
'https://aerobotics.com',
'[
  {"name": "Custom Package", "price": 0, "period": "yearly", "features": ["Volume-based pricing per acre", "Choose your crops", "Select products you need", "Dedicated support"]},
  {"name": "TrueFruit Size", "price": 0, "period": "yearly", "features": ["Contact for pricing", "Automated fruit sizing", "Packhouse analytics", "Real-time grading"]},
  {"name": "Pest & Disease", "price": 0, "period": "yearly", "features": ["Contact for pricing", "Drone-based detection", "Per-tree analysis", "Early warning alerts"]}
]'::jsonb),

-- 2. DataProphet
('fce177b9-604d-4e7c-b904-5f18ccf1ec73',
'DataProphet',
'Prescriptive AI for manufacturing that predicts and prevents quality defects and downtime in real time. Uses machine learning on existing production data to identify process efficiencies and prescribe high-impact adjustments with guaranteed ROI in the first year.',
'product', 'active', 'b2c3d4e5-6789-abcd-ef01-222222222222', 'USD',
ARRAY['manufacturing', 'predictive-ai', 'quality-control', 'south-africa'],
'https://dataprophet.com',
'[
  {"name": "Enterprise License", "price": 0, "period": "yearly", "features": ["Contact sales for pricing", "Full managed platform", "Prescriptive analytics", "Guaranteed ROI in year 1"]},
  {"name": "Proof of Value", "price": 0, "period": "one-time", "features": ["Contact for pricing", "Pilot deployment", "Connect production data", "Measure impact before scaling"]}
]'::jsonb),

-- 3. Xineoh
('fce177b9-604d-4e7c-b904-5f18ccf1ec73',
'Xineoh',
'AI recommendation and pricing API that predicts consumer behaviour, recommends products, optimises inventory, pricing, and reduces churn from transaction data. Proven to outperform traditional pricing models.',
'product', 'active', 'b2c3d4e5-6789-abcd-ef01-222222222222', 'USD',
ARRAY['recommendation-engine', 'pricing-optimization', 'api', 'south-africa'],
'https://xineoh.com',
'[
  {"name": "Free", "price": 0, "period": "forever", "features": ["Up to 100K recommendation requests", "Up to 40K active users", "Up to 40K items in catalog", "API access"]},
  {"name": "Bronze", "price": 249, "period": "monthly", "features": ["100K–500K requests", "40K–100K active users", "40K–100K items", "Standard support"]},
  {"name": "Silver", "price": 499, "period": "monthly", "features": ["500K–2M requests", "100K–500K active users", "100K–500K items", "Priority support"]},
  {"name": "Gold", "price": 999, "period": "monthly", "features": ["2M–10M requests", "500K–2M active users", "500K–2M items", "Dedicated support"]}
]'::jsonb),

-- 4. Clevva
('fce177b9-604d-4e7c-b904-5f18ccf1ec73',
'Clevva',
'AI Virtual Agents (chat + voice) that automate customer service, sales, collections, and support with high accuracy and compliance. Failsafe AI ensures responses are always reliable and auditable.',
'product', 'active', 'b2c3d4e5-6789-abcd-ef01-222222222222', 'USD',
ARRAY['virtual-agent', 'customer-service', 'chatbot', 'south-africa'],
'https://clevva.com',
'[
  {"name": "Managed Service", "price": 0, "period": "monthly", "features": ["Contact sales for pricing", "Per-agent or per-conversation billing", "Failsafe AI accuracy", "Full compliance & audit trail"]},
  {"name": "Enterprise", "price": 0, "period": "monthly", "features": ["Contact sales", "Custom deployment", "Multi-channel (chat + voice)", "Dedicated success manager"]}
]'::jsonb),

-- 5. iiDENTIFii
('fce177b9-604d-4e7c-b904-5f18ccf1ec73',
'iiDENTIFii',
'AI-powered biometric identity authentication and liveness detection platform. Provides KYC/AML compliance for fintech, banks, and enterprises with 4D liveness detection, facial recognition, and document verification.',
'product', 'active', 'b2c3d4e5-6789-abcd-ef01-222222222222', 'USD',
ARRAY['biometrics', 'identity-verification', 'kyc', 'fintech', 'south-africa'],
'https://iidentifii.com',
'[
  {"name": "Enterprise SaaS", "price": 0, "period": "monthly", "features": ["Contact sales for pricing", "Per-verification billing", "4D liveness detection", "Document verification"]},
  {"name": "Platform Integration", "price": 0, "period": "monthly", "features": ["Contact sales", "API & SDK integration", "White-label options", "24/7 support & SLA"]}
]'::jsonb),

-- 6. Cerebrium
('fce177b9-604d-4e7c-b904-5f18ccf1ec73',
'Cerebrium',
'Serverless GPU infrastructure for building, deploying, and scaling multimodal AI apps (text, audio, image, video). Pay-per-second billing with no idle costs. Supports all major ML frameworks with cold starts under 5 seconds.',
'product', 'active', 'b2c3d4e5-6789-abcd-ef01-222222222222', 'USD',
ARRAY['serverless', 'gpu', 'ml-infrastructure', 'south-africa'],
'https://cerebrium.ai',
'[
  {"name": "Hobby", "price": 0, "period": "monthly", "features": ["$30/month free credits", "Pay-per-second GPU billing", "T4/L4/A10 GPUs", "Community support"]},
  {"name": "Developer", "price": 49, "period": "monthly", "features": ["$49 credits + usage", "All GPU types (A100, H100, H200)", "Persistent storage", "Email support"]},
  {"name": "Team", "price": 199, "period": "monthly", "features": ["$199 credits + usage", "Team collaboration", "Advanced monitoring", "Priority support"]},
  {"name": "Enterprise", "price": 0, "period": "monthly", "features": ["Contact sales", "Volume discounts", "Dedicated infrastructure", "SLA guarantees"]}
]'::jsonb),

-- 7. Cortex Logic
('fce177b9-604d-4e7c-b904-5f18ccf1ec73',
'Cortex Logic',
'Predictive analytics and machine-learning platform focused on customer behaviour, risk assessment, and decision support across finance, insurance, and healthcare sectors in Africa.',
'product', 'active', 'b2c3d4e5-6789-abcd-ef01-222222222222', 'USD',
ARRAY['predictive-analytics', 'risk-management', 'finance', 'south-africa'],
'https://cortexlogic.com',
'[
  {"name": "Custom Enterprise", "price": 0, "period": "monthly", "features": ["Contact sales for pricing", "Predictive analytics suite", "IoT & big data integration", "Custom model development"]},
  {"name": "Managed AI Service", "price": 0, "period": "monthly", "features": ["Contact sales", "End-to-end data science", "Automated insights", "Dedicated support"]}
]'::jsonb),

-- 8. Lelapa AI
('fce177b9-604d-4e7c-b904-5f18ccf1ec73',
'Lelapa AI',
'African-centric AI company building large language models, voice, and NLP technology tailored for local African languages and contexts. Their VulaVula platform provides transcription and translation for the Global South.',
'product', 'active', 'b2c3d4e5-6789-abcd-ef01-222222222222', 'USD',
ARRAY['african-languages', 'nlp', 'voice-ai', 'transcription', 'south-africa'],
'https://lelapa.ai',
'[
  {"name": "Developer", "price": 10, "period": "monthly", "features": ["API access", "South African languages", "Transcription & translation", "Community support"]},
  {"name": "SMME", "price": 50, "period": "monthly", "features": ["Higher API limits", "Priority processing", "Multiple languages", "Email support"]},
  {"name": "Pro", "price": 200, "period": "monthly", "features": ["High-volume API", "All languages supported", "Advanced analytics", "Priority support"]},
  {"name": "Enterprise", "price": 0, "period": "monthly", "features": ["Contact sales", "Custom deployment", "Dedicated infrastructure", "SLA guarantees"]}
]'::jsonb),

-- 9. RADIFY
('fce177b9-604d-4e7c-b904-5f18ccf1ec73',
'RADIFY',
'AI medical imaging software that assists radiologists with faster and more accurate diagnosis, specialising in chest X-ray analysis for tuberculosis and pneumonia detection. Developed by Envisionit Deep AI.',
'product', 'active', 'b2c3d4e5-6789-abcd-ef01-222222222222', 'USD',
ARRAY['medical-imaging', 'radiology', 'healthcare', 'ai-diagnostics', 'south-africa'],
'https://radify.ai',
'[
  {"name": "SaaS Per User", "price": 0, "period": "monthly", "features": ["Contact sales for pricing", "Per-radiologist licensing", "TB & pneumonia detection", "Priority case triaging"]},
  {"name": "Per Scan Volume", "price": 0, "period": "monthly", "features": ["Contact sales", "Volume-based pricing", "API integration", "Real-time analysis"]}
]'::jsonb),

-- 10. Carscan
('fce177b9-604d-4e7c-b904-5f18ccf1ec73',
'Carscan',
'AI + AR mobile app for instant vehicle condition assessment and valuation. Uses computer vision and machine learning to scan vehicle damages and provide real-time health condition reports and repair estimates for insurance, dealers, and fleet managers.',
'product', 'active', 'b2c3d4e5-6789-abcd-ef01-222222222222', 'USD',
ARRAY['automotive', 'computer-vision', 'vehicle-inspection', 'insurance', 'south-africa'],
'https://carscan.ai',
'[
  {"name": "Per Scan", "price": 0, "period": "one-time", "features": ["Contact sales for pricing", "Instant damage assessment", "AI repair estimates", "Photo-based inspection"]},
  {"name": "Fleet / Dealer Subscription", "price": 0, "period": "monthly", "features": ["Contact sales", "Unlimited scans", "Fleet management dashboard", "API integration"]}
]'::jsonb),

-- 11. NOSIBLE
('fce177b9-604d-4e7c-b904-5f18ccf1ec73',
'NOSIBLE',
'AI search API and asset-management agent for financial institutions. Provides real-time stock market research, sentiment analysis, and investment insights with massive cost savings over traditional research platforms.',
'product', 'active', 'b2c3d4e5-6789-abcd-ef01-222222222222', 'USD',
ARRAY['fintech', 'investment-research', 'search-api', 'asset-management', 'south-africa'],
'https://nosible.com',
'[
  {"name": "API Usage-Based", "price": 0, "period": "monthly", "features": ["Contact sales for pricing", "Real-time stock research", "AI sentiment analysis", "Search API access"]},
  {"name": "Enterprise", "price": 0, "period": "monthly", "features": ["Contact sales", "Custom integrations", "Agentic search (Cybernaut-1)", "Dedicated support"]}
]'::jsonb),

-- 12. Spatialedge
('fce177b9-604d-4e7c-b904-5f18ccf1ec73',
'Spatialedge',
'AI-powered business analytics and decision platform for consumer behaviour, risk assessment, demand forecasting, and price optimisation. Serves major retailers and financial institutions across South Africa.',
'product', 'active', 'b2c3d4e5-6789-abcd-ef01-222222222222', 'USD',
ARRAY['business-analytics', 'demand-forecasting', 'price-optimization', 'south-africa'],
'https://spatialedge.ai',
'[
  {"name": "Custom Enterprise", "price": 0, "period": "monthly", "features": ["Contact sales for pricing", "Price Planner platform", "Demand forecasting", "Credit decisioning"]},
  {"name": "Managed Analytics", "price": 0, "period": "monthly", "features": ["Contact sales", "Basket analysis", "Customer insights", "Dedicated data science team"]}
]'::jsonb),

-- 13. ByteFuse (Quebit)
('fce177b9-604d-4e7c-b904-5f18ccf1ec73',
'ByteFuse (Quebit)',
'AI system for real-time adaptive traffic signal control and urban mobility optimisation. Reduces congestion, emissions, and travel times through intelligent traffic management for cities and municipalities.',
'product', 'active', 'b2c3d4e5-6789-abcd-ef01-222222222222', 'USD',
ARRAY['smart-city', 'traffic-management', 'urban-mobility', 'south-africa'],
'https://bytefuse.ai',
'[
  {"name": "City / Municipality License", "price": 0, "period": "yearly", "features": ["Contact sales for pricing", "Project-based deployment", "Real-time signal control", "Traffic analytics dashboard"]},
  {"name": "Pilot Program", "price": 0, "period": "one-time", "features": ["Contact sales", "Proof of concept", "Intersection-level deployment", "Impact measurement"]}
]'::jsonb),

-- 14. Envisionit Deep AI
('fce177b9-604d-4e7c-b904-5f18ccf1ec73',
'Envisionit Deep AI',
'AI radiology platform for faster, more accurate medical image analysis. Offers RADIFY for automated diagnosis and RATify for real-time AI model monitoring and validation. Partnered with Bayer for healthcare AI development.',
'product', 'active', 'b2c3d4e5-6789-abcd-ef01-222222222222', 'USD',
ARRAY['radiology', 'medical-ai', 'healthcare', 'ai-assurance', 'south-africa'],
'https://envisionit.ai',
'[
  {"name": "SaaS Per User", "price": 0, "period": "monthly", "features": ["Contact sales for pricing", "RADIFY AI diagnosis", "RATify AI assurance", "Per-radiologist license"]},
  {"name": "Enterprise", "price": 0, "period": "monthly", "features": ["Contact sales", "Hospital-wide deployment", "Custom model integration", "Vendor-agnostic monitoring"]}
]'::jsonb),

-- 15. Botlhale AI
('fce177b9-604d-4e7c-b904-5f18ccf1ec73',
'Botlhale AI',
'Voice and conversational AI for South African languages. Provides speech-to-text, text-to-speech, and speech analytics APIs for customer support and voice assistants in all 11 official South African languages.',
'product', 'active', 'b2c3d4e5-6789-abcd-ef01-222222222222', 'USD',
ARRAY['voice-ai', 'speech-analytics', 'african-languages', 'call-centre', 'south-africa'],
'https://botlhale.ai',
'[
  {"name": "API Subscription", "price": 0, "period": "monthly", "features": ["Contact sales for pricing", "Speech-to-text API", "Text-to-speech API", "11 SA languages"]},
  {"name": "Enterprise Deployment", "price": 0, "period": "monthly", "features": ["Contact sales", "Call centre integration", "Speech analytics", "Custom voice models"]}
]'::jsonb),

-- 16. Cape AI
('fce177b9-604d-4e7c-b904-5f18ccf1ec73',
'Cape AI',
'End-to-end custom machine-learning solutions including computer vision, NLP, and predictive models. Offers on-premise or VPC deployment with secure access to public and private LLMs.',
'product', 'active', 'b2c3d4e5-6789-abcd-ef01-222222222222', 'USD',
ARRAY['machine-learning', 'computer-vision', 'nlp', 'enterprise-ai', 'south-africa'],
'https://cape.ai',
'[
  {"name": "Discovery", "price": 100000, "period": "one-time", "features": ["Single use case", "Production-ready pilot", "On-premise or VPC deployment", "Secure LLM access"]},
  {"name": "Strategic", "price": 240000, "period": "one-time", "features": ["3 use cases", "Concierge support", "Production-ready pilot", "On-premise or VPC deployment"]},
  {"name": "Catalyst (Enterprise)", "price": 0, "period": "yearly", "features": ["Contact sales", "Unlimited use cases", "Tailored solutions", "Dedicated partnership"]}
]'::jsonb),

-- 17. Gridmatic
('fce177b9-604d-4e7c-b904-5f18ccf1ec73',
'Gridmatic',
'AI energy optimisation and demand-response platform for utilities and large energy consumers. Uses AI load optimisation to reduce costs, boost revenue from flexible loads, and support grid reliability.',
'product', 'active', 'b2c3d4e5-6789-abcd-ef01-222222222222', 'USD',
ARRAY['energy', 'grid-optimization', 'demand-response', 'sustainability'],
'https://gridmatic.com',
'[
  {"name": "AI Load Optimizer", "price": 0, "period": "monthly", "features": ["Contact sales for pricing", "Savings-share model", "Real-time load optimization", "Market participation"]},
  {"name": "Enterprise", "price": 0, "period": "monthly", "features": ["Contact sales", "Custom deployment", "Fleet-level optimization", "Dedicated support"]}
]'::jsonb),

-- 18. AI Dialogue
('fce177b9-604d-4e7c-b904-5f18ccf1ec73',
'AI Dialogue',
'NLP platform for automated customer service, chatbots, and language understanding across multiple sectors. Provides conversational AI solutions for businesses seeking to automate customer interactions.',
'product', 'active', 'b2c3d4e5-6789-abcd-ef01-222222222222', 'USD',
ARRAY['nlp', 'chatbot', 'customer-service', 'conversational-ai', 'south-africa'],
'https://aidialogue.com',
'[
  {"name": "Per Conversation", "price": 0, "period": "monthly", "features": ["Contact sales for pricing", "Pay-per-conversation billing", "Multi-channel support", "NLP engine"]},
  {"name": "Monthly Subscription", "price": 0, "period": "monthly", "features": ["Contact sales", "Unlimited conversations", "Custom training", "Analytics dashboard"]}
]'::jsonb),

-- 19. Sage AI (Sage Business Cloud)
('fce177b9-604d-4e7c-b904-5f18ccf1ec73',
'Sage AI (Sage Business Cloud)',
'Embedded AI for accounting automation, invoice processing, anomaly detection, and real-time business insights. Widely used by South African SMEs and enterprises. Features include automated bank reconciliation, cash flow forecasting, and tax compliance.',
'product', 'active', 'b2c3d4e5-6789-abcd-ef01-222222222222', 'ZAR',
ARRAY['accounting', 'business-intelligence', 'automation', 'sme', 'south-africa'],
'https://www.sage.com/en-za/',
'[
  {"name": "Accounting Start", "price": 240, "period": "monthly", "features": ["Online invoicing", "Expense tracking", "VAT returns", "Mobile app (ZAR pricing)"]},
  {"name": "Accounting Standard", "price": 520, "period": "monthly", "features": ["Everything in Start", "Multi-currency", "Quotes & estimates", "Project tracking (ZAR pricing)"]},
  {"name": "Accounting Plus", "price": 900, "period": "monthly", "features": ["Everything in Standard", "Purchase orders", "Advanced reporting", "Multi-user (ZAR pricing)"]},
  {"name": "Intacct (Enterprise)", "price": 2000, "period": "monthly", "features": ["Contact sales for exact pricing", "Full ERP", "AI-powered insights", "Custom dashboards (ZAR pricing)"]}
]'::jsonb),

-- 20. Lexis+ AI (LexisNexis SA)
('fce177b9-604d-4e7c-b904-5f18ccf1ec73',
'Lexis+ AI (LexisNexis SA)',
'Generative AI legal research, drafting, summarisation, and analysis tool for South African lawyers and firms. Powered by LexisNexis Protégé AI assistant with access to authoritative South African legal sources and case law.',
'product', 'active', 'b2c3d4e5-6789-abcd-ef01-222222222222', 'USD',
ARRAY['legal-tech', 'legal-research', 'ai-drafting', 'law', 'south-africa'],
'https://www.lexisnexis.com/en-za/lexis-plus-ai',
'[
  {"name": "Free Trial", "price": 0, "period": "one-time", "features": ["30-day free trial", "Lexis+ AI assistant", "Legal research", "Document analysis"]},
  {"name": "Per User / Firm License", "price": 0, "period": "monthly", "features": ["Contact LexisNexis SA for quote", "AI-powered legal drafting", "Summarisation & analysis", "Authoritative SA case law"]},
  {"name": "Enterprise", "price": 0, "period": "monthly", "features": ["Contact sales", "Firm-wide deployment", "Custom integrations", "Protégé AI workflows"]}
]'::jsonb);
