
-- Update Universal Robots
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "UR3e", "price": 25000, "period": "one-time", "features": ["3kg payload", "500mm reach", "Tabletop automation", "Built-in force/torque sensor"]},
  {"name": "UR5e", "price": 35000, "period": "one-time", "features": ["5kg payload", "850mm reach", "Versatile deployment", "Collaborative safety"]},
  {"name": "UR10e", "price": 46000, "period": "one-time", "features": ["12.5kg payload", "1300mm reach", "Machine tending & palletizing", "Heavy-duty applications"]},
  {"name": "UR20", "price": 55000, "period": "one-time", "features": ["20kg payload", "1750mm reach", "Next-gen architecture", "High-payload automation"]}
]'::jsonb WHERE id = '311a4f43-b96a-40c7-a240-ad7a722009c5';

-- Update Autodesk Fusion 360
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Free Personal", "price": 0, "period": "forever", "features": ["Non-commercial use", "Basic CAD/CAM", "10 active documents", "Community support"]},
  {"name": "Standard", "price": 85, "period": "monthly", "features": ["Full CAD/CAM/CAE", "Unlimited documents", "Generative design", "Advanced simulation"]},
  {"name": "Team", "price": 245, "period": "monthly", "features": ["Everything in Standard", "Team collaboration", "PDM data management", "Admin controls & analytics"]}
]'::jsonb WHERE id = '411e9563-99e9-465f-ab6f-d9e1433c9593';

-- Update NVIDIA Isaac Sim
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Free / Open Source", "price": 0, "period": "forever", "features": ["Full simulation framework", "OpenUSD-based workflows", "ROS 2 integration", "Synthetic data generation"]},
  {"name": "Enterprise (Omniverse)", "price": 0, "period": "one-time", "features": ["Contact NVIDIA for pricing", "Priority enterprise support", "Fleet management tools", "Custom deployment options"]}
]'::jsonb WHERE id = '81e8365c-7575-4603-aaa4-bdaa1e834e2f';

-- Update RoboDK
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Free Trial", "price": 0, "period": "forever", "features": ["30-day full access", "50 instruction limit after trial", "Unlimited robot library", "Basic functionality"]},
  {"name": "Professional", "price": 3995, "period": "one-time", "features": ["Permanent license", "Simulation & offline programming", "Post-processor generation", "Free updates for 1 year"]},
  {"name": "Premium", "price": 7495, "period": "one-time", "features": ["Everything in Professional", "CAM features", "Multi-robot simulation", "Priority support"]}
]'::jsonb WHERE id = '1f6665c8-c957-41e4-bf4d-6c3802898c68';

-- Update Clearpath Robotics
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Dingo (Indoor)", "price": 15000, "period": "one-time", "features": ["Indoor mobile robot", "Compact form factor", "ROS integration", "Research & development"]},
  {"name": "Jackal (All-terrain)", "price": 22000, "period": "one-time", "features": ["All-terrain UGV", "Weatherproof IP62", "GPS/IMU navigation", "20kg payload"]},
  {"name": "Husky (Heavy-duty)", "price": 30000, "period": "one-time", "features": ["Large payload capacity", "Rugged outdoor design", "Autonomous navigation ready", "Modular sensor mounting"]}
]'::jsonb WHERE id = 'cd73ca22-e943-450b-a5d4-ae8f0d5885b2';

-- Update SolidWorks
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Standard", "price": 2820, "period": "yearly", "features": ["3D CAD modeling", "Part & assembly design", "2D drawings", "Cloud services included"]},
  {"name": "Professional", "price": 5490, "period": "yearly", "features": ["Everything in Standard", "Advanced simulation", "Routing & piping", "ECAD/MCAD collaboration"]},
  {"name": "Premium", "price": 7890, "period": "yearly", "features": ["Everything in Professional", "Structural analysis", "Tolerance analysis", "Full simulation suite"]}
]'::jsonb WHERE id = '5657efa5-ca68-45d1-9b8f-94462aa40dff';

-- Update MathWorks MATLAB & Simulink
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "MATLAB Standard", "price": 940, "period": "yearly", "features": ["MATLAB desktop", "Live editor", "App designer", "Parallel computing"]},
  {"name": "MATLAB + Simulink", "price": 2350, "period": "yearly", "features": ["MATLAB + Simulink bundle", "Model-based design", "Simulation & code generation", "System-level modeling"]},
  {"name": "Student", "price": 49, "period": "yearly", "features": ["MATLAB + Simulink", "10+ add-on products", "Academic use only", "Full functionality"]}
]'::jsonb WHERE id = '06224b16-0e21-4ed7-a2df-536f38ebfc49';

-- Update Formlabs
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Form 4 (SLA)", "price": 3999, "period": "one-time", "features": ["Fast SLA 3D printer", "Sub-25 micron accuracy", "200+ validated materials", "Automated resin system"]},
  {"name": "Form 4L (Large SLA)", "price": 9999, "period": "one-time", "features": ["5x larger build volume", "Same speed as Form 4", "Production-grade parts", "Automated post-processing"]},
  {"name": "Fuse 1+ 30W (SLS)", "price": 27999, "period": "one-time", "features": ["SLS 3D printing", "Nylon PA 11/12 & TPU", "Industrial-quality parts", "No support structures needed"]}
]'::jsonb WHERE id = '2fcc0363-3bee-4d71-be2d-d71a4f2e4b7c';

-- Update Siemens NX
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Free Trial", "price": 0, "period": "forever", "features": ["30-day full access", "Complete CAD/CAM/CAE", "Explore all features", "No commitment"]},
  {"name": "NX CAD Standard", "price": 247, "period": "monthly", "features": ["Full 3D CAD modeling", "Assembly design", "Drafting & documentation", "Sheet metal design"]},
  {"name": "NX CAD Premium", "price": 2964, "period": "yearly", "features": ["Advanced surfacing", "Generative design", "Integrated simulation", "Manufacturing preparation"]}
]'::jsonb WHERE id = 'a62a63ab-34e7-473d-83c2-76a64b1c8bbe';

-- Update Webots (Free/Open-source)
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Open Source", "price": 0, "period": "forever", "features": ["Full 3D robot simulation", "C/C++, Python, Java, MATLAB APIs", "ROS/ROS 2 integration", "100+ robot models included"]},
  {"name": "Professional Support", "price": 0, "period": "one-time", "features": ["Contact Cyberbotics for pricing", "Custom robot modeling", "Priority technical support", "Training & consulting"]}
]'::jsonb WHERE id = '50107d73-5ed1-4d6a-9dd2-9abbc4bc7956';

-- Update ROS
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "ROS 2 (Open Source)", "price": 0, "period": "forever", "features": ["Full robotics middleware", "Community support", "Thousands of packages", "Multi-platform support"]},
  {"name": "ROS 2 Enterprise (via partners)", "price": 0, "period": "one-time", "features": ["Contact partner for pricing", "Enterprise support SLAs", "Custom integrations", "Training & certification"]}
]'::jsonb WHERE id = '7a30f7c9-0740-47b2-8225-c8c558449ce8';

-- Update OnRobot
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "2FG7 Gripper", "price": 3200, "period": "one-time", "features": ["7kg grip force", "Flexible finger design", "Plug & produce", "Compatible with all cobots"]},
  {"name": "RG6 Gripper", "price": 4500, "period": "one-time", "features": ["6kg grip force", "Wide stroke range", "Built-in depth compensation", "Dual gripper option"]},
  {"name": "Gecko Gripper", "price": 6540, "period": "one-time", "features": ["No compressed air needed", "Gecko adhesion technology", "Flat surface handling", "Clean room compatible"]}
]'::jsonb WHERE id = '6a90e61d-0df0-488c-9b54-a51911fbe357';

-- Update ABB Robotics
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "RobotStudio Free", "price": 0, "period": "forever", "features": ["Basic offline programming", "Virtual controller", "3D visualization", "Community support"]},
  {"name": "RobotStudio Premium", "price": 150, "period": "monthly", "features": ["Full simulation suite", "VR support", "Advanced path planning", "Multi-robot coordination"]},
  {"name": "Industrial Robots", "price": 0, "period": "one-time", "features": ["Starting from $25,000", "Contact ABB for quote", "Complete automation cells", "24/7 global service"]}
]'::jsonb WHERE id = 'd641902b-d9dd-40bd-b3ae-69fe4c4efa9d';

-- Update KUKA Robotics
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "KUKA.Sim Basic", "price": 0, "period": "forever", "features": ["Basic robot simulation", "Layout planning", "Robot model library", "Collision detection"]},
  {"name": "KUKA.Sim Pro", "price": 200, "period": "monthly", "features": ["Full offline programming", "PLC connectivity", "Advanced simulation", "Weld & paint modules"]},
  {"name": "Industrial Robots", "price": 0, "period": "one-time", "features": ["Starting from $25,000", "Contact KUKA for quote", "Custom cell design", "Global service network"]}
]'::jsonb WHERE id = 'd71bf95a-83ac-4757-8ded-077fa1eb190e';

-- Update Neura Robotics
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "LARA (Lightweight)", "price": 18000, "period": "one-time", "features": ["Lightweight cobot", "High precision", "Easy programming", "Cognitive AI features"]},
  {"name": "MAiRA (Cognitive)", "price": 25000, "period": "one-time", "features": ["Cognitive cobot", "Built-in vision & sensors", "Natural interaction", "Self-learning capabilities"]},
  {"name": "4NE-1 (Humanoid)", "price": 22000, "period": "one-time", "features": ["170cm humanoid robot", "25 DOF", "5hr runtime", "LLM-powered intelligence"]}
]'::jsonb WHERE id = 'bf081f10-8304-4243-bfc2-ec1dd80c1f48';

-- Update RobotShop
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Hobby Robots", "price": 50, "period": "one-time", "features": ["Starting from $50", "Educational kits", "Arduino/Raspberry Pi", "Beginner-friendly"]},
  {"name": "Professional Robots", "price": 5000, "period": "one-time", "features": ["Starting from $5,000", "Research-grade platforms", "ROS-compatible", "Sensor integration"]},
  {"name": "Industrial Cobots", "price": 20000, "period": "one-time", "features": ["Starting from $20,000", "Collaborative robots", "Production-ready", "Full support & warranty"]}
]'::jsonb WHERE id = '8da369b2-d72c-4847-bfd3-485c62eefa99';

-- Update Fetch Robotics (Zebra)
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "AMR Solutions", "price": 0, "period": "one-time", "features": ["Contact Zebra for pricing", "Autonomous mobile robots", "Warehouse automation", "Fleet management"]},
  {"name": "FetchCore Cloud", "price": 0, "period": "monthly", "features": ["Contact sales for pricing", "Cloud fleet management", "Real-time analytics", "Multi-site management"]}
]'::jsonb WHERE id = '9974cbc4-aef2-4790-9fb6-05e67440c72c';

-- Update Energid Actin SDK
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Actin SDK License", "price": 0, "period": "one-time", "features": ["Contact Universal Robots for pricing", "Real-time motion planning", "Collision avoidance", "Multi-robot coordination"]}
]'::jsonb WHERE id = '38ba5a47-3460-4e4d-bb3c-f4948d17685f';

-- Update Rethink Robotics
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Sawyer (Legacy)", "price": 0, "period": "one-time", "features": ["Company shut down late 2025", "Legacy support only", "Used market available", "Contact resellers for pricing"]}
]'::jsonb WHERE id = '70935a22-6f62-4f28-a052-31061ffae8a8';

-- Update AWS RoboMaker
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Service Discontinued", "price": 0, "period": "forever", "features": ["Discontinued as of 2025", "Migrate to NVIDIA Isaac or Gazebo", "AWS IoT Greengrass alternative", "Legacy documentation available"]}
]'::jsonb WHERE id = '3380e969-d6fc-4809-982e-08d546f107cb';

-- ===== AI TOOLS =====

-- Update ElevenLabs
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Free", "price": 0, "period": "forever", "features": ["10,000 characters/month", "3 custom voices", "Speech synthesis", "API access"]},
  {"name": "Starter", "price": 5, "period": "monthly", "features": ["30,000 characters/month", "10 custom voices", "Commercial license", "API access"]},
  {"name": "Creator", "price": 22, "period": "monthly", "features": ["100,000 characters/month", "30 custom voices", "Projects & dubbing", "Usage analytics"]},
  {"name": "Pro", "price": 99, "period": "monthly", "features": ["500,000 characters/month", "160 custom voices", "44.1 kHz audio", "Priority support"]}
]'::jsonb WHERE id = '726bfce3-5b89-40e5-a73c-27f31b4ae4fc';

-- Update ClickUp
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Free Forever", "price": 0, "period": "forever", "features": ["Unlimited tasks", "Collaborative docs", "Real-time chat", "100MB storage"]},
  {"name": "Unlimited", "price": 7, "period": "monthly", "features": ["Unlimited storage", "Unlimited integrations", "Unlimited dashboards", "Agile reporting"]},
  {"name": "Business", "price": 12, "period": "monthly", "features": ["Everything in Unlimited", "Google SSO", "Advanced automations", "Timelines & mind maps"]},
  {"name": "Enterprise", "price": 0, "period": "monthly", "features": ["Contact sales for pricing", "White labeling", "Advanced permissions", "Dedicated success manager"]}
]'::jsonb WHERE id = '022e051c-8ae9-4f2e-ae95-24a9e59975e3';

-- Update Descript
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Free", "price": 0, "period": "forever", "features": ["1 watermark-free export", "Limited transcription", "Basic editing tools", "720p export"]},
  {"name": "Hobbyist", "price": 24, "period": "monthly", "features": ["10 media hours/month", "400 AI credits/month", "1080p export", "AI video co-editor"]},
  {"name": "Creator", "price": 33, "period": "monthly", "features": ["30 media hours/month", "1000 AI credits/month", "4K export", "Green screen & captions"]},
  {"name": "Business", "price": 40, "period": "monthly", "features": ["40 media hours/month", "2000 AI credits/month", "Team collaboration", "Priority support"]}
]'::jsonb WHERE id = '82472f92-beb3-4bc7-9823-8c8ec1832889';

-- Update AdCreative.ai
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Starter", "price": 29, "period": "monthly", "features": ["10 downloads/month", "1 brand", "Text & banner ads", "AI scoring"]},
  {"name": "Professional", "price": 209, "period": "monthly", "features": ["Unlimited downloads", "5 brands", "Video ads", "Competitor insights"]},
  {"name": "Agency", "price": 0, "period": "monthly", "features": ["Contact sales", "Unlimited brands", "White-label reports", "Dedicated account manager"]}
]'::jsonb WHERE id = '3dd39caf-ff0f-4c5b-b6b1-00d11a737c0c';

-- Update Gamma
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Free", "price": 0, "period": "forever", "features": ["400 AI credits", "Up to 10 cards per prompt", "Basic templates", "Public content only"]},
  {"name": "Plus", "price": 10, "period": "monthly", "features": ["Unlimited AI generation", "Remove Gamma branding", "Custom fonts", "PDF/PPT export"]},
  {"name": "Pro", "price": 20, "period": "monthly", "features": ["Everything in Plus", "Advanced analytics", "Custom domains", "Priority support"]}
]'::jsonb WHERE id = 'b26db1a8-ce1f-45a3-9f69-70363ba641a5';

-- Update Hume AI
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Free", "price": 0, "period": "forever", "features": ["10,000 characters/month", "Basic emotion detection", "API access", "Community support"]},
  {"name": "Starter", "price": 3, "period": "monthly", "features": ["50,000 characters/month", "Enhanced voices", "Emotion analysis", "Chat support"]},
  {"name": "Pro", "price": 70, "period": "monthly", "features": ["500,000 characters/month", "Custom voice cloning", "Advanced prosody", "Priority support"]},
  {"name": "Scale", "price": 200, "period": "monthly", "features": ["2M characters/month", "Enterprise features", "Dedicated infrastructure", "SLA guarantees"]}
]'::jsonb WHERE id = '65ee9f76-d1cb-4e5c-8913-4cb00173884e';

-- Update Browse AI
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Free", "price": 0, "period": "forever", "features": ["50 credits/month", "5 robots", "Basic web scraping", "Community support"]},
  {"name": "Starter", "price": 49, "period": "monthly", "features": ["2,000 credits/month", "25 robots", "Scheduled extraction", "Email notifications"]},
  {"name": "Professional", "price": 99, "period": "monthly", "features": ["5,000 credits/month", "100 robots", "API access", "Priority support"]},
  {"name": "Company", "price": 249, "period": "monthly", "features": ["15,000 credits/month", "250 robots", "Team collaboration", "Dedicated support"]}
]'::jsonb WHERE id = '2bb57290-e643-43b8-b19b-a32eea318e8f';

-- Update Brand24
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Individual", "price": 199, "period": "monthly", "features": ["3 keywords", "2K mentions/month", "1 user", "AI sentiment analysis"]},
  {"name": "Team", "price": 299, "period": "monthly", "features": ["7 keywords", "10K mentions/month", "Unlimited users", "Hourly updates"]},
  {"name": "Pro", "price": 399, "period": "monthly", "features": ["12 keywords", "40K mentions/month", "Real-time updates", "AI insights & reports"]},
  {"name": "Enterprise", "price": 499, "period": "monthly", "features": ["25 keywords", "100K mentions/month", "Dedicated account manager", "Custom reports"]}
]'::jsonb WHERE id = '6d292102-16bf-45ef-8178-2be73c352e11';

-- Update GetResponse
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Free", "price": 0, "period": "forever", "features": ["500 contacts", "2,500 newsletters/month", "1 landing page", "Website builder"]},
  {"name": "Starter", "price": 19, "period": "monthly", "features": ["1,000 contacts", "Unlimited emails", "AI email generator", "Basic automation"]},
  {"name": "Marketer", "price": 59, "period": "monthly", "features": ["1,000 contacts", "Marketing automation", "Webinars (100 attendees)", "Sales funnels"]},
  {"name": "Creator", "price": 69, "period": "monthly", "features": ["1,000 contacts", "AI product recommendations", "Web push notifications", "Promo codes"]}
]'::jsonb WHERE id = 'cac5196f-9911-45bf-8812-4a0b7f200066';

-- Update Castmagic
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Hobby", "price": 21, "period": "monthly", "features": ["10 hours upload/month", "AI transcription", "Content generation", "Basic exports"]},
  {"name": "Starter", "price": 79, "period": "monthly", "features": ["40 hours upload/month", "Custom prompts", "Multi-language", "Priority processing"]},
  {"name": "Business", "price": 790, "period": "monthly", "features": ["Unlimited uploads", "Team collaboration", "API access", "Dedicated support"]}
]'::jsonb WHERE id = 'f2c14c1a-be6b-4bd1-8cac-f26f99c772bd';

-- Update KrispCall
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Essential", "price": 15, "period": "monthly", "features": ["1 user", "Virtual phone number", "Call recording", "Voicemail"]},
  {"name": "Standard", "price": 40, "period": "monthly", "features": ["Everything in Essential", "IVR / call routing", "CRM integrations", "Call analytics"]},
  {"name": "Enterprise", "price": 0, "period": "monthly", "features": ["Contact sales", "Custom solutions", "Dedicated manager", "SLA guarantees"]}
]'::jsonb WHERE id = 'b8e1bd93-41a6-472d-8725-90d4ce0be766';

-- Update Databox
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Free", "price": 0, "period": "forever", "features": ["3 data sources", "3 databoards", "Unlimited users", "Basic metrics"]},
  {"name": "Professional", "price": 47, "period": "monthly", "features": ["10 data sources", "Unlimited databoards", "Custom metrics", "Automated reporting"]},
  {"name": "Growth", "price": 135, "period": "monthly", "features": ["50 data sources", "Forecasting", "Custom date ranges", "Priority support"]},
  {"name": "Premium", "price": 319, "period": "monthly", "features": ["Unlimited data sources", "Advanced analytics", "Data calculations", "Dedicated success manager"]}
]'::jsonb WHERE id = 'af4d1b25-4857-4418-8d61-2548c4988c31';

-- Update Flowith
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Starter (Free)", "price": 0, "period": "forever", "features": ["300 welcome credits", "Standard AI models", "5 concurrent tasks", "Basic canvas"]},
  {"name": "Professional", "price": 15, "period": "monthly", "features": ["1,200 credits/month", "Advanced AI models", "20 concurrent tasks", "Extended context memory"]},
  {"name": "Ultimate", "price": 30, "period": "monthly", "features": ["3,000 credits/month", "All AI models", "Unlimited tasks", "Team collaboration"]}
]'::jsonb WHERE id = '205343db-1ae1-4a2a-9d1f-8e0a7f516bce';

-- Update BLACKBOX AI
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Free", "price": 0, "period": "forever", "features": ["Basic code generation", "VSCode extension", "Limited AI completions", "Community support"]},
  {"name": "Pro", "price": 20, "period": "monthly", "features": ["Unlimited AI completions", "300+ AI models", "Voice coding", "Image-to-code"]},
  {"name": "Enterprise", "price": 0, "period": "monthly", "features": ["Contact sales", "Custom deployment", "Team management", "Priority support"]}
]'::jsonb WHERE id = '1fb4c886-3a4b-4f8f-bcc6-3b7528a56051';

-- Update Adwisely
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Standard", "price": 49, "period": "monthly", "features": ["AI-powered ad campaigns", "Meta & Google Ads", "10% fee on ad spend over $500/month", "Email & chat support"]},
  {"name": "Advanced", "price": 249, "period": "monthly", "features": ["Everything in Standard", "Expert ad management", "10% fee on spend over $2,500/month", "Dedicated strategist"]}
]'::jsonb WHERE id = '86c15d4f-1012-4491-b6da-3795790440fe';

-- Update Lindy AI
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Free", "price": 0, "period": "forever", "features": ["400 starter credits", "Basic AI agents", "Limited integrations", "Community support"]},
  {"name": "Pro", "price": 49, "period": "monthly", "features": ["Unlimited agents", "4,000+ integrations", "Advanced workflows", "Priority support"]},
  {"name": "Business", "price": 299, "period": "monthly", "features": ["Everything in Pro", "Team collaboration", "Custom AI training", "Dedicated success manager"]}
]'::jsonb WHERE id = '27b4efac-76d0-44fa-adc3-e62e8697dc5e';

-- Update Logome.ai
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Basic Logo Pack", "price": 29, "period": "one-time", "features": ["1 logo file", "Standard resolution", "VIP 24/7 chat support", "Basic customization"]},
  {"name": "Premium Logo Pack", "price": 99, "period": "one-time", "features": ["5 logo designs", "High-res file types", "Forever customization", "Full ownership"]},
  {"name": "Logo + Brand Kit", "price": 149, "period": "one-time", "features": ["Everything in Premium", "Complete brand identity", "Business card designs", "Social media assets"]}
]'::jsonb WHERE id = '9f323fa1-118a-4ff3-a94c-a8c739b294ae';

-- Update Looka
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Basic Logo", "price": 20, "period": "one-time", "features": ["1 logo file (PNG)", "Standard quality", "Basic customization", "Instant download"]},
  {"name": "Premium Logo", "price": 65, "period": "one-time", "features": ["Multiple file formats", "High-resolution files", "Full color variations", "Social media kit"]},
  {"name": "Brand Kit", "price": 96, "period": "yearly", "features": ["Everything in Premium", "300+ branded designs", "Business cards & merch", "Brand guidelines"]}
]'::jsonb WHERE id = '08de16bb-43d5-4cea-a245-498e64ee011d';

-- Update Lusha
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Free", "price": 0, "period": "forever", "features": ["50 emails/month", "5 phone numbers/month", "Basic search", "Chrome extension"]},
  {"name": "Pro", "price": 49, "period": "monthly", "features": ["480 emails/year", "480 phones/year", "List management", "CSV export"]},
  {"name": "Premium", "price": 79, "period": "monthly", "features": ["960 credits/year", "Team management", "CRM integrations", "Bulk enrichment"]},
  {"name": "Scale", "price": 0, "period": "monthly", "features": ["Contact sales", "Unlimited credits", "Intent data", "Dedicated CSM"]}
]'::jsonb WHERE id = 'a211c197-2f9b-4aef-8fa0-9729a874f66b';

-- Update MeetGeek
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Free", "price": 0, "period": "forever", "features": ["5 meetings/month", "AI meeting notes", "Basic transcription", "Meeting summaries"]},
  {"name": "Pro", "price": 16, "period": "monthly", "features": ["Unlimited meetings", "Advanced AI summaries", "CRM integrations", "Custom vocabulary"]},
  {"name": "Business", "price": 29, "period": "monthly", "features": ["Everything in Pro", "Team analytics", "Admin controls", "Priority support"]}
]'::jsonb WHERE id = '5d16f28c-e572-41cb-bcff-69f217875685';

-- Update MindStudio
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Free", "price": 0, "period": "forever", "features": ["1 AI agent", "1,000 runs/month", "200+ AI models", "No API keys required"]},
  {"name": "Starter", "price": 23, "period": "monthly", "features": ["3 agents", "3,000 runs/month", "Custom branding", "Analytics dashboard"]},
  {"name": "Professional", "price": 79, "period": "monthly", "features": ["10 agents", "10,000 runs/month", "API access", "Team collaboration"]},
  {"name": "Business", "price": 249, "period": "monthly", "features": ["Unlimited agents", "50,000 runs/month", "White-label", "Dedicated support"]}
]'::jsonb WHERE id = '013a6249-a9a7-4037-8a3d-902eddd89d87';

-- Update Motion
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Pro AI", "price": 19, "period": "monthly", "features": ["AI task planner", "AI calendar & meetings", "AI docs & notes", "Unlimited storage"]},
  {"name": "Business AI", "price": 29, "period": "monthly", "features": ["Everything in Pro", "Team workflows", "Advanced analytics", "Admin controls"]},
  {"name": "Enterprise", "price": 0, "period": "monthly", "features": ["Contact sales", "Custom integrations", "SSO/SAML", "Dedicated CSM"]}
]'::jsonb WHERE id = '47fc7f68-f8e1-45fb-826b-4f24c8050d83';

-- Update Murf AI
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Free", "price": 0, "period": "forever", "features": ["10 minutes generation", "Limited voices", "Basic editing", "Trial access"]},
  {"name": "Creator", "price": 26, "period": "monthly", "features": ["2 hours/month", "120+ voices", "Commercial license", "Voice cloning"]},
  {"name": "Business", "price": 59, "period": "monthly", "features": ["4 hours/month", "All voices & styles", "API access", "Priority rendering"]},
  {"name": "Enterprise", "price": 125, "period": "monthly", "features": ["8 hours/month", "Dedicated account manager", "Custom voice development", "SLA guarantees"]}
]'::jsonb WHERE id = '02697b18-4856-4055-86e7-db7474c52208';

-- Update Pilim
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Free Trial", "price": 0, "period": "forever", "features": ["7-day free trial", "Basic features", "Limited users", "Explore the platform"]},
  {"name": "Starter", "price": 10, "period": "monthly", "features": ["Invoicing & payroll", "Cash flow management", "QuickBooks sync", "Email support"]},
  {"name": "Growth", "price": 25, "period": "monthly", "features": ["Everything in Starter", "Advanced reporting", "Multi-currency", "Team collaboration"]},
  {"name": "Enterprise", "price": 0, "period": "monthly", "features": ["Contact sales", "Custom integrations", "Dedicated support", "White-label options"]}
]'::jsonb WHERE id = '9b691419-080c-46d1-925b-ae0229002225';

-- Update Pinecone
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Free (Starter)", "price": 0, "period": "forever", "features": ["100K vectors", "Serverless architecture", "Community support", "Basic monitoring"]},
  {"name": "Standard", "price": 70, "period": "monthly", "features": ["1M+ vectors", "Serverless & pod-based", "Email support", "Advanced monitoring"]},
  {"name": "Enterprise", "price": 0, "period": "monthly", "features": ["Contact sales", "Unlimited vectors", "HIPAA compliance", "Dedicated support & SLAs"]}
]'::jsonb WHERE id = '9babd8ce-e0b3-47ff-a0b9-ad87fbc3ac04';

-- Update Prezi
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Free (Basic)", "price": 0, "period": "forever", "features": ["500 AI credits", "10 talking points", "Essential creation tools", "Public content"]},
  {"name": "Standard", "price": 7, "period": "monthly", "features": ["Unlimited AI generation", "Private content", "PDF/PPT export", "Presenter tools"]},
  {"name": "Plus", "price": 12, "period": "monthly", "features": ["Everything in Standard", "Custom branding", "Advanced analytics", "PowerPoint import"]},
  {"name": "Premium", "price": 16, "period": "monthly", "features": ["Everything in Plus", "Prezi Video", "Live collaboration", "Priority support"]}
]'::jsonb WHERE id = 'c8b273b3-3f89-4c79-bedf-59ac2044ea4b';

-- Update Reclaim.ai
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Free", "price": 0, "period": "forever", "features": ["Smart scheduling", "Calendar sync", "Habit tracking", "Basic analytics"]},
  {"name": "Starter", "price": 10, "period": "monthly", "features": ["Smart 1:1 meetings", "Task integration", "Slack status sync", "Buffer time controls"]},
  {"name": "Business", "price": 15, "period": "monthly", "features": ["Everything in Starter", "Team analytics", "No-meeting days", "Admin controls"]}
]'::jsonb WHERE id = '61477d1c-bf5a-4ef3-83af-d1a7faa1e71c';

-- Update Reply.io
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Email Volume", "price": 49, "period": "monthly", "features": ["1,000 active contacts", "Email sequences", "AI email writing", "Basic reporting"]},
  {"name": "Multichannel", "price": 89, "period": "monthly", "features": ["Unlimited contacts", "Email + LinkedIn + calls", "AI SDR agent", "CRM integrations"]},
  {"name": "Agency", "price": 166, "period": "monthly", "features": ["Unlimited clients", "White-label", "Client management", "Dedicated support"]}
]'::jsonb WHERE id = '5e67c82a-217e-463d-8fcc-65f664d1f0f2';

-- Update Recomaze AI
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Growth Launch", "price": 39, "period": "monthly", "features": ["AI product recommendations", "Visitor intent analysis", "Smart search", "7-day free trial"]},
  {"name": "Hyper-Scaling", "price": 99, "period": "monthly", "features": ["Everything in Growth", "AI sales agent", "Advanced analytics", "Custom training"]},
  {"name": "Enterprise", "price": 0, "period": "monthly", "features": ["Contact sales", "Dedicated support", "Custom integrations", "White-label options"]}
]'::jsonb WHERE id = '386dce4f-61af-47ff-a8a2-da1927aa8074';

-- Update SaneBox
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Snack", "price": 7, "period": "monthly", "features": ["1 email account", "2 SaneBox features", "AI email filtering", "SaneLater folder"]},
  {"name": "Lunch", "price": 12, "period": "monthly", "features": ["2 email accounts", "6 features", "SaneBlackHole", "Do Not Disturb"]},
  {"name": "Dinner", "price": 36, "period": "monthly", "features": ["4 email accounts", "All features", "SaneAttachments", "Priority support"]}
]'::jsonb WHERE id = '2a2cf0b2-0eae-4e31-a792-2432e69e362c';

-- Update Seamless.AI
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Free", "price": 0, "period": "forever", "features": ["50 credits", "Basic search", "Chrome extension", "Email finder"]},
  {"name": "Basic", "price": 147, "period": "monthly", "features": ["250 credits/month", "Email & phone lookup", "CRM integrations", "List building"]},
  {"name": "Pro", "price": 0, "period": "monthly", "features": ["Contact sales", "Unlimited credits", "Buyer intent data", "Dedicated CSM"]},
  {"name": "Enterprise", "price": 0, "period": "monthly", "features": ["Contact sales", "Custom credits", "Advanced filters", "API access"]}
]'::jsonb WHERE id = '8eb586c5-fe71-4fcf-a455-e9caa5790230';

-- Update SleekFlow
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Free", "price": 0, "period": "forever", "features": ["50 contacts/month", "Basic messaging", "1 user", "Limited AI"]},
  {"name": "Pro", "price": 79, "period": "monthly", "features": ["2,000 contacts", "WhatsApp Business API", "Automation flows", "Team inbox"]},
  {"name": "Premium", "price": 299, "period": "monthly", "features": ["10,000 contacts", "Unlimited AI usage", "Advanced analytics", "Priority support"]},
  {"name": "Enterprise", "price": 0, "period": "monthly", "features": ["Contact sales", "Custom limits", "Dedicated manager", "SLA guarantees"]}
]'::jsonb WHERE id = '30b80ab9-b48c-4822-b9f0-609615af0995';

-- Update soona
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Studio Pass", "price": 149, "period": "one-time", "features": ["Per booking fee", "$39 per photo", "Live shoot collaboration", "72hr edit delivery"]},
  {"name": "Basic Membership", "price": 249, "period": "monthly", "features": ["No studio pass fee", "$39 per photo", "Discounted models & upgrades", "48hr edit delivery"]},
  {"name": "Standard Membership", "price": 399, "period": "monthly", "features": ["No studio pass fee", "$33 per photo", "Free premium edits", "24hr edit delivery"]}
]'::jsonb WHERE id = 'c2065896-9bda-4575-8141-6bec837a93d7';

-- Update Synthflow AI
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Starter", "price": 29, "period": "monthly", "features": ["50 minutes/month", "1 AI voice agent", "Basic call handling", "14-day free trial"]},
  {"name": "Pro", "price": 375, "period": "monthly", "features": ["2,000 minutes/month", "5 agents", "Call transfer & booking", "CRM integrations"]},
  {"name": "Growth", "price": 900, "period": "monthly", "features": ["6,000 minutes/month", "20 agents", "Custom voices", "Priority support"]},
  {"name": "Agency", "price": 1400, "period": "monthly", "features": ["10,000 minutes/month", "Unlimited agents", "White-label", "Dedicated support"]}
]'::jsonb WHERE id = '2ad9c977-58c9-4b10-aff7-91ceae61a73d';

-- Update Tidio
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Free", "price": 0, "period": "forever", "features": ["50 conversations/month", "Live chat", "Basic chatbot", "Email support"]},
  {"name": "Starter", "price": 29, "period": "monthly", "features": ["100 conversations/month", "Live chat + chatbots", "Visitor analytics", "Email integration"]},
  {"name": "Growth", "price": 59, "period": "monthly", "features": ["250 conversations/month", "Advanced analytics", "Permissions", "Operating hours"]},
  {"name": "Lyro AI Agent", "price": 39, "period": "monthly", "features": ["AI-powered responses", "50 conversations/month", "Auto-learning", "Add to any plan"]}
]'::jsonb WHERE id = 'cbccd77a-5ac7-4534-9af5-10e7aea974e4';

-- Update Tiki
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Free to Use", "price": 0, "period": "forever", "features": ["Social shopping platform", "Create & share short videos", "Community features", "Free to join"]},
  {"name": "Creator Program", "price": 0, "period": "forever", "features": ["Earn from content", "Brand partnerships", "Analytics dashboard", "Apply to join"]}
]'::jsonb WHERE id = '5de4cf07-ee15-4d5c-82c7-9927be68349c';

-- Update Turbotic
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Starter", "price": 0, "period": "forever", "features": ["Contact for pricing", "AI-powered automations", "Natural language workflows", "Basic integrations"]},
  {"name": "Professional", "price": 0, "period": "monthly", "features": ["Contact for pricing", "Advanced AI agents", "Process mining", "Team collaboration"]},
  {"name": "Enterprise", "price": 0, "period": "monthly", "features": ["Contact sales", "Custom deployment", "Dedicated support", "SLA guarantees"]}
]'::jsonb WHERE id = '25ead44e-e18f-4864-8b45-8cebe8a45a11';

-- Update Unbounce
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Starter", "price": 29, "period": "monthly", "features": ["1 user", "Unlimited landing pages", "Up to 20,000 visitors", "100+ templates"]},
  {"name": "Build", "price": 99, "period": "monthly", "features": ["Unlimited users", "Unlimited pages", "Up to 40,000 visitors", "A/B testing"]},
  {"name": "Experiment", "price": 149, "period": "monthly", "features": ["Everything in Build", "Smart Traffic AI", "Up to 50,000 visitors", "Advanced targeting"]},
  {"name": "Optimize", "price": 249, "period": "monthly", "features": ["Everything in Experiment", "Audience targeting", "Scheduled publishing", "Audit logs"]}
]'::jsonb WHERE id = 'faabbb7e-01f2-43f9-b2eb-c5ac6c1fc292';

-- Update Vista Social
UPDATE marketplace_listings SET pricing_tiers = '[
  {"name": "Free", "price": 0, "period": "forever", "features": ["3 social profiles", "Basic publishing", "Content calendar", "Community features"]},
  {"name": "Professional", "price": 79, "period": "monthly", "features": ["15 social profiles", "Advanced scheduling", "Analytics & reports", "AI assistant"]},
  {"name": "Advanced", "price": 149, "period": "monthly", "features": ["25 profiles", "Team collaboration", "Approval workflows", "White-label reports"]},
  {"name": "Scale", "price": 379, "period": "monthly", "features": ["Unlimited profiles", "Agency features", "Client management", "API access"]}
]'::jsonb WHERE id = '1b2627f3-96ef-4ffc-b198-2ce7d5274fdf';
