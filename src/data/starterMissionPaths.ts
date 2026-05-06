// Starter Tier — 6 Learning Paths × 5 Courses × Missions
// Each mission: Learn → Do (AI input) → Output → Reward (10 XP) → Next

export interface Mission {
  id: string;
  title: string;
  learn: string; // short explanation shown in "Learn"
  videoUrl?: string; // optional youtube embed url
  inputLabel: string; // label for the user's input field
  inputPlaceholder: string;
  systemPrompt: string; // sent to the AI
  xp: number;
}

export interface Course {
  id: string;
  title: string;
  missions: Mission[];
  opportunity: string; // "Real Opportunity" card at end of course
}

export interface Path {
  id: string;
  title: string;
  description: string;
  outcome: string;
  emoji: string;
  gradient: string; // tailwind gradient
  courses: Course[];
}

const m = (
  id: string,
  title: string,
  learn: string,
  inputLabel: string,
  inputPlaceholder: string,
  systemPrompt: string
): Mission => ({ id, title, learn, inputLabel, inputPlaceholder, systemPrompt, xp: 10 });

export const STARTER_PATHS: Path[] = [
  // ───────────── PATH 1 ─────────────
  {
    id: "ai-operator",
    title: "AI User → AI Operator",
    description: "Use AI daily for real value in life and freelance work.",
    outcome: "You can use AI tools confidently for productivity and freelance tasks.",
    emoji: "⚡",
    gradient: "from-blue-500 to-indigo-600",
    courses: [
      {
        id: "ai-for-everyone",
        title: "AI for Everyone",
        opportunity: "Offer 'AI assistant setup' to 3 friends or coworkers for R150 each.",
        missions: [
          m("aie-1", "What AI Actually Does", "AI predicts the next best output from patterns. It is not magic — it is statistics + scale. Today: define how AI helps YOU.", "Describe one task you do weekly", "e.g. plan my week, write emails, study notes...", "You are an AI productivity coach. Give the user 3 concrete ways AI can save them time on the task they describe. Use bullet points and a friendly tone."),
          m("aie-2", "Pick Your AI Stack", "Choose the right tool for the job: ChatGPT (general), Claude (writing), Gemini (research), Midjourney (images).", "Your main goal this month", "e.g. earn extra income from writing", "Recommend a personalized AI tool stack (3-5 tools) for the user's goal. For each tool: name, why it helps, free vs paid."),
          m("aie-3", "Your First Power Prompt", "A great prompt = Role + Task + Context + Format. Today you write yours.", "What you want AI to help you do today", "Write a LinkedIn post about my new skill", "Rewrite the user's request as a power prompt using Role/Task/Context/Format. Then run that prompt and produce the output."),
          m("aie-4", "AI Daily Habit", "Win the day: 1 AI task before lunch. Build a habit, not a hobby.", "Pick one daily task to automate", "drafting client replies", "Create a 7-day AI habit plan: each day a 5-minute AI task tied to the user's goal."),
        ],
      },
      {
        id: "prompt-engineering",
        title: "Prompt Engineering Mastery",
        opportunity: "Sell a 'Custom Prompt Pack' (10 prompts) to a small business for R300.",
        missions: [
          m("pe-1", "Anatomy of a Prompt", "Role + Goal + Context + Constraints + Format = great output.", "Topic you want a prompt for", "writing cold sales emails", "Write 3 expert-level prompts for the user's topic. Label each prompt's Role, Goal, Context, Constraints, Format."),
          m("pe-2", "Chain-of-Thought", "Ask AI to think step-by-step. Better answers, less hallucination.", "A complex question", "How do I price my freelance services?", "Answer the user's question using chain-of-thought reasoning. Show your steps, then give the final recommendation."),
          m("pe-3", "Few-Shot Prompting", "Show AI 2-3 examples and it copies your style.", "Style of writing you want to clone", "punchy Twitter posts about AI", "Generate a few-shot prompt template for the user's style with 3 example inputs/outputs, then produce one new sample."),
          m("pe-4", "Build a Prompt Library", "10 reusable prompts for your work = a real asset.", "Your job or hustle", "freelance copywriter", "Build a library of 10 ready-to-use prompts for the user's work. Group by use case. Format as a numbered list."),
        ],
      },
      {
        id: "ai-tools-stack",
        title: "AI Tools Stack",
        opportunity: "Set up an AI workflow for one local business and charge R500.",
        missions: [
          m("ats-1", "Writing Stack", "ChatGPT + Grammarly + Notion AI = professional writer in 1 hour.", "What you write most", "client proposals", "Recommend a 3-tool writing stack for the user, with the exact workflow (step 1, 2, 3) to produce the user's content."),
          m("ats-2", "Visual Stack", "Canva AI + Midjourney + Remove.bg = full design studio.", "What visuals you need", "Instagram posts for my brand", "Recommend a visual stack and a 5-step workflow to produce the user's visuals weekly."),
          m("ats-3", "Audio & Video Stack", "ElevenLabs + Descript + CapCut. Make content while you sleep.", "Type of video you want", "30-sec AI explainer reels", "Give a step-by-step tool stack and workflow for the user's video format."),
          m("ats-4", "Your Personal Stack", "Combine writing + visual + audio into ONE workflow.", "What you want to publish weekly", "1 LinkedIn post + 1 reel", "Design the user's personal weekly content workflow combining writing, visual and audio tools. Output as a checklist."),
        ],
      },
      {
        id: "ai-productivity",
        title: "AI Productivity Systems",
        opportunity: "Sell a '1-hour AI productivity audit' to a small business for R400.",
        missions: [
          m("aip-1", "Inbox Zero with AI", "Use AI to triage, draft and reply.", "How many emails per day?", "around 40 emails", "Build the user a 15-minute daily AI email routine with exact prompts to use."),
          m("aip-2", "AI Calendar Coach", "Let AI plan your week around your goals.", "Your top 3 priorities this week", "ship project, gym, study", "Produce an AI-optimised weekly schedule with time blocks and the prompt to regenerate it weekly."),
          m("aip-3", "Auto-Summarize Everything", "Articles, meetings, PDFs — never read raw again.", "Paste a long text or topic to summarise", "long article on AI in education...", "Summarise the user's text in 5 bullet points + 1 key takeaway + 3 follow-up questions."),
          m("aip-4", "Personal AI Brief", "Wake up to a daily AI briefing tailored to YOU.", "Topics you care about", "AI news, fitness, fintech", "Create a daily personal AI brief template + the exact prompt to run each morning."),
        ],
      },
      {
        id: "ai-for-students",
        title: "AI for Students",
        opportunity: "Offer 'AI study coaching' to 3 classmates at R100 each.",
        missions: [
          m("afs-1", "AI Study Buddy", "Turn any topic into flashcards, quizzes, and analogies.", "Subject you're studying", "calculus derivatives", "Generate 10 flashcards + 5 quiz questions + 1 simple analogy for the user's subject."),
          m("afs-2", "Essay Brainstormer", "From blank page to outline in 60 seconds.", "Essay topic / brief", "AI ethics in healthcare", "Produce a 5-section essay outline with thesis, key arguments, and 3 sources to research."),
          m("afs-3", "Exam Cracker", "Practice with AI-generated past-paper style questions.", "Subject + level", "Grade 12 economics", "Generate 5 exam-style questions with full memo answers."),
          m("afs-4", "Career Path with AI", "AI maps your skills to real careers.", "Your interests + 2 strong subjects", "tech + maths + design", "Recommend 5 career paths matching the user's profile, each with first-step actions."),
        ],
      },
    ],
  },

  // ───────────── PATH 2 ─────────────
  {
    id: "genai-creator",
    title: "Generative AI Creator",
    description: "Create and monetize AI content across platforms.",
    outcome: "You can create and sell AI-generated content.",
    emoji: "🎨",
    gradient: "from-pink-500 to-purple-600",
    courses: [
      {
        id: "genai-fundamentals",
        title: "Generative AI Fundamentals",
        opportunity: "Sell 5 AI-generated illustrations to a small brand for R250 each.",
        missions: [
          m("gf-1", "Text vs Image vs Video AI", "Different models for different jobs.", "What you want to create", "social media posts with images", "Recommend the right generative AI model + tool for the user's goal, with reasons."),
          m("gf-2", "Style Anchors", "AI obeys style words: 'editorial photo, soft light, Fuji film'.", "Vibe you want", "premium minimalist black & white", "Build a style anchor library (8 phrases) the user can paste into any AI tool."),
          m("gf-3", "Iteration Game", "Generate → critique → refine. Quality lives in iteration.", "Initial idea", "logo for an AI tutoring brand", "Produce 3 progressively-refined creative briefs for the user's idea + prompts for each."),
          m("gf-4", "Pricing AI Work", "Charge for outcome, not minutes.", "What you'd sell", "Instagram carousels", "Suggest 3 pricing models for the user's offer with example packages and rates in ZAR."),
        ],
      },
      {
        id: "ai-content-creation",
        title: "AI Content Creation",
        opportunity: "Post 5 AI-generated content pieces this week, gain 100 followers.",
        missions: [
          m("acc-1", "Content Pillars", "3-5 themes that own your niche.", "Your niche", "AI tools for African students", "Suggest 5 content pillars for the user's niche with example post titles for each."),
          m("acc-2", "Hook Library", "Stop the scroll in 3 seconds.", "Your topic", "AI side hustles", "Generate 15 scroll-stopping hooks for the user's topic. Mix questions, stats and bold claims."),
          m("acc-3", "Carousel Factory", "10-slide carousels = saves + reach.", "Topic for your next carousel", "5 ChatGPT prompts for students", "Write a 10-slide carousel: slide 1 hook, 8 value slides, slide 10 CTA."),
          m("acc-4", "Repurpose Engine", "1 idea → 5 formats.", "Paste an idea or post", "AI is replacing boring tasks not jobs", "Repurpose the user's idea into: tweet, LinkedIn post, IG caption, YouTube short script, blog intro."),
        ],
      },
      {
        id: "ai-design-canva",
        title: "AI Design with Canva",
        opportunity: "Sell a 5-template Canva pack to small businesses for R200.",
        missions: [
          m("adc-1", "Brand Kit in 5 min", "Colors + fonts + logo = ready to design.", "Brand name + vibe", "Lumi — calm, soft, premium", "Generate a brand kit: 5 hex colors, 2 fonts, logo concept, mood words."),
          m("adc-2", "Magic Write Posts", "Use Canva's AI for captions + visuals together.", "Your post topic", "tips for first-time freelancers", "Write 3 IG post designs (visual idea + caption + hashtags) for the user's topic."),
          m("adc-3", "Templates That Sell", "Make once, sell forever.", "Niche you'd serve", "real estate agents", "Suggest 5 high-demand Canva template ideas for the user's niche with selling angles."),
          m("adc-4", "Launch Your Pack", "Price, list, promote.", "Where you'd sell", "Gumroad / WhatsApp status", "Write a launch plan: pricing, listing copy, 3 promo posts."),
        ],
      },
      {
        id: "ai-copywriting",
        title: "AI Copywriting & Marketing",
        opportunity: "Write 3 ad campaigns for a local biz and charge R600 total.",
        missions: [
          m("ac-1", "AIDA Formula", "Attention-Interest-Desire-Action. Old, still working.", "Product/service to sell", "online tutoring service", "Write a 4-paragraph AIDA ad copy for the user's offer."),
          m("ac-2", "Email Sequence", "Welcome → Value → Pitch → Close.", "What you sell + audience", "prompt pack for marketers", "Write a 4-email welcome sequence with subject lines + body for the user's offer."),
          m("ac-3", "Landing Page Copy", "Hero + benefits + proof + CTA.", "Your product", "AI resume builder for grads", "Draft full landing page sections for the user's product."),
          m("ac-4", "Ad Variants", "5 ads, find the winner.", "Offer + audience", "AI course for freelancers", "Generate 5 short ad variants (Facebook style) testing different angles."),
        ],
      },
      {
        id: "ai-content-systems",
        title: "AI Content Systems",
        opportunity: "Set up a content system for a small brand and charge R800/month.",
        missions: [
          m("acs-1", "Content Calendar", "30 days planned in 30 minutes.", "Niche + posts/week", "fitness coach, 4 posts/week", "Generate a 30-day content calendar with topic + format for each day."),
          m("acs-2", "Batch Day Workflow", "Create a week in one sitting.", "Content type", "Reels for skincare brand", "Design a 3-hour batch workflow producing 7 pieces with exact AI prompts at each step."),
          m("acs-3", "AI Editor", "Polish every post before publishing.", "A draft caption", "post about productivity hacks", "Edit the user's draft for hook, clarity, and CTA. Show before/after."),
          m("acs-4", "Track What Works", "Numbers tell the truth.", "Your top metric", "saves on Instagram", "Build a simple weekly tracking sheet template + 3 questions to ask each week."),
        ],
      },
    ],
  },

  // ───────────── PATH 3 ─────────────
  {
    id: "ai-builder",
    title: "AI Builder (No-Code)",
    description: "Build and ship simple AI tools without writing code.",
    outcome: "You can build and sell automation tools.",
    emoji: "🛠️",
    gradient: "from-emerald-500 to-teal-600",
    courses: [
      {
        id: "no-code-ai",
        title: "No-Code AI Tools",
        opportunity: "Build one no-code app and sell access to 5 users at R100 each.",
        missions: [
          m("nc-1", "Pick Your No-Code Stack", "Lovable, Bubble, Glide, Zapier — what fits you?", "Idea you want to build", "AI CV reviewer for students", "Recommend the best no-code stack for the user's idea + a 5-step build plan."),
          m("nc-2", "Map User Flow", "Screen by screen, button by button.", "Your app idea", "appointment booking with AI reminders", "Map the user's app as a 6-screen user flow with one CTA per screen."),
          m("nc-3", "Add the AI Layer", "Where exactly does AI add value?", "Your app", "AI gym workout planner", "Identify 3 places to embed AI in the user's app + the prompt for each."),
          m("nc-4", "Ship MVP in 1 Day", "Imperfect + live > perfect + waiting.", "Your launch date", "this Saturday", "Produce a 1-day shipping checklist with hourly tasks."),
        ],
      },
      {
        id: "build-chatbots",
        title: "Build AI Chatbots",
        opportunity: "Build a WhatsApp AI bot for one business and charge R1500.",
        missions: [
          m("bc-1", "Chatbot Use Cases", "Lead capture, FAQ, booking, support.", "Your client's business", "small dental clinic", "Suggest top 3 chatbot use cases for the business with ROI estimates."),
          m("bc-2", "Bot Persona", "Voice, tone, fallback rules.", "Brand vibe", "warm, professional, simple English", "Write the bot persona: name, voice rules, opening, fallback, escalation script."),
          m("bc-3", "Conversation Flows", "Map every path the user can take.", "Main task the bot handles", "book a cleaning appointment", "Design a full conversation flow tree with branches and AI prompts."),
          m("bc-4", "Test & Launch", "Edge cases break bots. Find them first.", "Your bot's main job", "answering FAQs about pricing", "Generate 10 edge-case test conversations + how the bot should respond."),
        ],
      },
      {
        id: "ai-automations",
        title: "AI Automations",
        opportunity: "Automate one workflow for a freelancer and charge R500.",
        missions: [
          m("aa-1", "Spot the Repetition", "If you do it twice a week, automate it.", "Boring task you do often", "manually replying to leads", "Audit the user's task and design an automation: trigger → steps → output."),
          m("aa-2", "Connect with Zapier/Make", "Trigger → AI step → action.", "Tools you already use", "Gmail + Sheets + Slack", "Design a 4-step Zap using the user's tools with an AI step in the middle."),
          m("aa-3", "AI Inside Sheets", "Spreadsheets + GPT = magic.", "What your sheet does", "tracks freelance leads", "Suggest 3 AI formulas/automations to add to the user's sheet."),
          m("aa-4", "Sell Automations", "Productize the workflow.", "Niche to serve", "small e-commerce stores", "Package the user's automation as a service offer: name, deliverable, price, 1-line pitch."),
        ],
      },
      {
        id: "ai-agents",
        title: "AI Agents Basics",
        opportunity: "Build a research agent for one client and charge R900.",
        missions: [
          m("ag-1", "What's an Agent?", "An AI that plans, acts, and uses tools — not just chats.", "Task you'd hand to an agent", "research my competitors weekly", "Explain in 4 lines what makes the user's task agent-worthy + which tools the agent needs."),
          m("ag-2", "Agent Roles", "Researcher, writer, reviewer — split the work.", "Your project", "weekly newsletter on AI in Africa", "Define a 3-agent team (role, goal, tool) for the user's project."),
          m("ag-3", "Memory & Context", "Agents need short-term + long-term memory.", "Your agent's job", "personal finance assistant", "Describe the memory model + which data the user must store for their agent."),
          m("ag-4", "Build & Run", "Use Lovable/Make/CrewAI to ship.", "Tool you'll use", "Lovable + Supabase", "Give a 5-step build plan to ship the user's first agent today."),
        ],
      },
      {
        id: "launch-ai-product",
        title: "Launch AI Product",
        opportunity: "Get your first 10 paying users this week.",
        missions: [
          m("lap-1", "Find Your First 10", "Hunt one-by-one. Don't market — talk.", "Your product + audience", "AI cover-letter tool for grads", "Make a list of 10 places to find first users + the exact DM script to send."),
          m("lap-2", "Pricing 101", "Free vs freemium vs paid.", "Your product", "AI study planner", "Recommend a pricing model with 3 tiers and ZAR pricing."),
          m("lap-3", "Launch Post", "One viral post = 100 free users.", "Your platform", "WhatsApp + LinkedIn", "Write a launch post for each platform with hook, story, CTA."),
          m("lap-4", "Iterate from Feedback", "What users say > what you think.", "What you launched", "AI bot that summarises voice notes", "Design a 5-question feedback form + a weekly review ritual to ship updates."),
        ],
      },
    ],
  },

  // ───────────── PATH 4 ─────────────
  {
    id: "data-decisions",
    title: "Data & Decision Making",
    description: "Use data + AI to make smarter decisions in life and business.",
    outcome: "You can analyze and present data confidently.",
    emoji: "📊",
    gradient: "from-orange-500 to-red-600",
    courses: [
      {
        id: "excel-ai",
        title: "Excel + AI",
        opportunity: "Clean and analyse data for one business and charge R400.",
        missions: [
          m("ex-1", "Talk to Your Spreadsheet", "Ask GPT to write the formula for you.", "Describe your data", "sales by month for 12 months", "Write 5 useful formulas + 1 chart suggestion for the user's data."),
          m("ex-2", "Auto-Clean Data", "Messy data → clean rows.", "Type of mess", "duplicates and bad date formats", "Give the exact AI prompt + Excel/Sheets steps to clean the user's data."),
          m("ex-3", "Pivot Like a Pro", "Group, summarise, decide.", "Question you want answered", "which product sells best in Q3", "Show how to build the pivot table to answer the user's question."),
          m("ex-4", "Insight Report", "Data → 3 bullet decisions.", "Your dataset topic", "monthly customer churn", "Produce a 1-page decision brief: what the data says, why, and 3 actions."),
        ],
      },
      {
        id: "data-projects",
        title: "Data Science Projects",
        opportunity: "Add 1 data project to your portfolio + post on LinkedIn.",
        missions: [
          m("ds-1", "Pick a Real Dataset", "Kaggle, gov data, your own life.", "Topic you'd analyse", "Spotify listening history", "Suggest 3 dataset sources + 1 analysis question per source for the user's topic."),
          m("ds-2", "Frame the Question", "A vague question = vague answer.", "Your initial question", "what makes a song popular", "Reframe the user's question into 3 sharper, testable questions."),
          m("ds-3", "Tell the Story", "Charts that explain, not impress.", "Data point you'll show", "average song length over time", "Recommend the right chart type + the headline + caption for the user's data point."),
          m("ds-4", "Portfolio Post", "Post or it didn't happen.", "Where you'd post", "LinkedIn", "Write a 5-paragraph LinkedIn case study: problem, data, method, finding, takeaway."),
        ],
      },
      {
        id: "dashboards",
        title: "Dashboards",
        opportunity: "Build 1 dashboard for a small business at R600.",
        missions: [
          m("dash-1", "What Belongs on a Dashboard", "Less is more. 5 KPIs max.", "Business + goal", "café — increase weekend sales", "Pick 5 KPIs and explain why each matters for the user's goal."),
          m("dash-2", "Tool Pick", "Looker Studio, Sheets, Power BI.", "Your skill level + budget", "beginner, free", "Recommend the best tool with a 4-step setup plan."),
          m("dash-3", "Layout & Hierarchy", "Top-left = most important. Always.", "Your KPIs", "revenue, orders, AOV, returning %, NPS", "Sketch the dashboard layout in text (rows/columns/widgets) for the user's KPIs."),
          m("dash-4", "Weekly Review Ritual", "A dashboard nobody opens is dead.", "Who'll review", "owner + manager Monday 9am", "Design a 15-minute weekly review agenda using the user's dashboard."),
        ],
      },
      {
        id: "business-intelligence",
        title: "Business Intelligence",
        opportunity: "Run a 'data audit' for 1 business and charge R700.",
        missions: [
          m("bi-1", "Where's the Data Hiding?", "Sales, ads, support, ops — map sources.", "Business type", "small e-commerce shop", "Map the typical data sources for the business + which is highest-leverage."),
          m("bi-2", "Single Source of Truth", "Connect, dedupe, trust.", "Tools they use", "Shopify + Meta Ads + Sheets", "Suggest a stack to unify data + a 4-week migration plan."),
          m("bi-3", "Decisions, Not Reports", "Every report → 1 decision.", "Recurring report you'd build", "weekly ad performance", "Convert that report into a 'decision template' (insight → action → owner)."),
          m("bi-4", "Sell the BI Service", "Productize.", "Your offer", "monthly BI for small shops", "Write a 1-page service page: outcome, deliverables, price, FAQ."),
        ],
      },
      {
        id: "ai-decision-making",
        title: "AI Decision Making",
        opportunity: "Coach 2 friends through one AI-powered life decision.",
        missions: [
          m("dm-1", "Frame the Decision", "Decision = options + criteria + weights.", "Decision you face", "take new job vs freelance full-time", "Frame the user's decision with options, criteria, weights, and a scored matrix."),
          m("dm-2", "AI as Devil's Advocate", "Use AI to attack your own plan.", "Plan you're considering", "launch online course in 4 weeks", "Critique the user's plan: 5 risks, 3 wrong assumptions, 1 stronger alternative."),
          m("dm-3", "Pre-Mortem", "Imagine the failure first.", "Project you'll start", "open a small bakery", "Run a pre-mortem: 'It's 6 months later and we failed' — list reasons + how to prevent each."),
          m("dm-4", "Decision Journal", "Track decisions to get smarter.", "Decision to log", "switching laptops", "Generate a decision journal entry template + how to review monthly."),
        ],
      },
    ],
  },

  // ───────────── PATH 5 ─────────────
  {
    id: "digital-transformation",
    title: "Digital Transformation",
    description: "Understand how AI changes business and apply it.",
    outcome: "You understand business applications of AI.",
    emoji: "🏢",
    gradient: "from-cyan-500 to-blue-600",
    courses: [
      {
        id: "digital-basics",
        title: "Digital Transformation Basics",
        opportunity: "Pitch a 'digital roadmap' to one local business — R500 review.",
        missions: [
          m("dt-1", "What 'Digital' Really Means", "It's not apps. It's how decisions get made.", "Business you know", "your family's shop", "Identify 5 manual processes in the business that should be digital first."),
          m("dt-2", "Maturity Map", "Levels 1-5: where is the business?", "Same business", "your family's shop", "Score the business 1-5 on tech maturity in 4 dimensions and explain each score."),
          m("dt-3", "Pick One Quick Win", "Don't transform everything. Pick ONE.", "Top pain point", "tracking customer orders", "Recommend the single quick-win project + its 2-week plan."),
          m("dt-4", "Roadmap 90-Day", "Vision + milestones + owners.", "Business name + goal", "café, faster service", "Produce a 90-day digital roadmap: 6 milestones, owners, success metrics."),
        ],
      },
      {
        id: "ai-in-business",
        title: "AI in Business",
        opportunity: "Run a 'where AI fits' audit for 1 SME and charge R600.",
        missions: [
          m("aib-1", "AI Use Case Map", "Marketing, ops, support, finance, HR.", "Industry", "real estate agency", "List 8 high-ROI AI use cases for the industry, ranked by ease + impact."),
          m("aib-2", "Build vs Buy", "Often, buying off-the-shelf wins.", "Use case", "AI for lead replies", "Compare 3 buy options vs 1 build option for the use case with pros/cons + cost."),
          m("aib-3", "Pilot Plan", "30 days. One team. One KPI.", "Use case + team", "AI assistant for sales team", "Write a 30-day pilot plan: scope, KPI, weekly tasks, decision criteria."),
          m("aib-4", "ROI Story", "Numbers convince leaders.", "Pilot expected savings", "10 hours/week", "Translate the savings into ZAR ROI + a 1-slide story to pitch the CEO."),
        ],
      },
      {
        id: "automation-companies",
        title: "Automation in Companies",
        opportunity: "Automate one process for a SME and charge R900.",
        missions: [
          m("ac2-1", "Process Audit", "Map every step. Find waste.", "Process to audit", "client onboarding", "Map the process step-by-step and tag each step (keep / automate / kill)."),
          m("ac2-2", "Choose the Tool", "Zapier, Make, Power Automate, custom.", "Volume + tech level", "low volume, no devs", "Recommend the best tool + reason + setup time."),
          m("ac2-3", "Design the Flow", "Trigger → conditions → actions.", "Process", "send welcome pack to new clients", "Design the flow as numbered steps with conditions and a fallback path."),
          m("ac2-4", "Measure & Improve", "Time saved = money earned.", "Baseline minutes/case", "30 min per onboarding", "Build a measurement plan + monthly improvement ritual."),
        ],
      },
      {
        id: "ai-operations",
        title: "AI Operations Efficiency",
        opportunity: "Improve 1 ops metric for a small business by 20%.",
        missions: [
          m("ao-1", "Find the Bottleneck", "The system is only as fast as its slowest step.", "Operation", "kitchen-to-table time in restaurant", "Identify likely bottlenecks + 3 questions to diagnose the real one."),
          m("ao-2", "AI for Forecasting", "Predict demand, staff, stock.", "What you'd forecast", "weekly footfall", "Recommend a simple AI forecasting approach + the data the user must collect for 4 weeks."),
          m("ao-3", "AI for Quality", "Catch errors before customers do.", "Quality issue", "bad packaging in deliveries", "Suggest 3 AI quality-check ideas (vision, logs, alerts) for the user's issue."),
          m("ao-4", "Ops Dashboard", "One screen. Whole business.", "Top 4 ops KPIs", "service time, error rate, cost, customer score", "Design the ops dashboard layout + how each KPI is calculated."),
        ],
      },
      {
        id: "digital-systems",
        title: "Digital Systems",
        opportunity: "Document 1 client's digital system and charge R500.",
        missions: [
          m("ds2-1", "System Inventory", "Tools, owners, integrations, costs.", "Business type", "marketing agency 8 staff", "Generate a starter inventory of typical tools + columns to track for each."),
          m("ds2-2", "Integration Map", "Data flows between tools.", "Their main 3 tools", "HubSpot + Slack + Sheets", "Sketch how data should flow between the tools + 2 integrations to add."),
          m("ds2-3", "Access & Security", "Who can do what — write it down.", "Risk concern", "ex-employees still have access", "Produce a simple access control policy + audit checklist."),
          m("ds2-4", "Living Documentation", "Docs that stay updated.", "Where docs will live", "Notion", "Design a Notion structure (4 pages) + update rules + owner."),
        ],
      },
    ],
  },

  // ───────────── PATH 6 ─────────────
  {
    id: "ai-developer",
    title: "AI Developer (Advanced)",
    description: "Build real AI models with code. Foundations that lead to a job.",
    outcome: "You can build basic AI models and ship a project.",
    emoji: "🧠",
    gradient: "from-violet-500 to-fuchsia-600",
    courses: [
      {
        id: "python-for-ai",
        title: "Python for AI",
        opportunity: "Code 1 small AI script for a peer and post the repo on GitHub.",
        missions: [
          m("py-1", "Why Python", "Readable, libraries, community.", "Your coding background", "I know HTML and a bit of JS", "Plan a 14-day Python-for-AI roadmap tailored to the user's background."),
          m("py-2", "Notebooks Workflow", "Jupyter + Colab = lab + free GPU.", "What you'd experiment with", "text classification on tweets", "Outline a starter Colab notebook (cells in order) for the user's experiment."),
          m("py-3", "Numpy & Pandas Basics", "Vectors and tables = data.", "Dataset you'd use", "Iris dataset", "Write a 10-line pandas + numpy script for the dataset + explain each line."),
          m("py-4", "First Mini Project", "Read CSV → analyse → print insight.", "Your data idea", "my YouTube watch history", "Design the mini-project: steps, libraries, expected output."),
        ],
      },
      {
        id: "ml-basics",
        title: "Machine Learning Basics",
        opportunity: "Train 1 model on a real dataset and post results on LinkedIn.",
        missions: [
          m("ml-1", "Supervised vs Unsupervised", "Labels or not — that's the split.", "Problem you'd solve", "predict student exam pass/fail", "Classify the problem and recommend the right family of models with reasons."),
          m("ml-2", "Train/Test Split", "Never test on training data.", "Dataset size", "1200 rows", "Recommend split ratios + why + 1 risk to watch."),
          m("ml-3", "Pick a Baseline", "Simple model first. Always.", "Problem type", "classification with 2 classes", "Recommend a baseline model + the metric to track + a code-free explanation."),
          m("ml-4", "Evaluate Honestly", "Accuracy lies. Look deeper.", "Your metric concern", "imbalanced classes", "Recommend 3 better metrics + how to compute them + how to present results."),
        ],
      },
      {
        id: "deep-learning",
        title: "Deep Learning",
        opportunity: "Train 1 small neural net and write a beginner tutorial.",
        missions: [
          m("dl-1", "What's a Neural Net", "Layers of math that learn patterns.", "What you want it to do", "classify dog vs cat images", "Explain the user's task as a neural net: input shape, layers, output, loss."),
          m("dl-2", "Frameworks", "PyTorch vs TensorFlow vs Keras.", "Beginner or builder?", "absolute beginner", "Recommend a framework + a 1-week learning plan."),
          m("dl-3", "Transfer Learning", "Don't train from scratch.", "Your image task", "leaf disease detection", "Recommend a pretrained model + a 6-step transfer-learning recipe."),
          m("dl-4", "Overfitting Fix", "Memorising ≠ learning.", "Symptom you see", "train acc 99%, test 60%", "Suggest 5 anti-overfitting techniques ranked by ease."),
        ],
      },
      {
        id: "neural-networks",
        title: "Neural Networks",
        opportunity: "Showcase a working neural net demo to a recruiter.",
        missions: [
          m("nn-1", "Activation Functions", "ReLU, sigmoid, softmax — when to use what.", "Layer position", "hidden layer", "Recommend an activation + why + an alternative."),
          m("nn-2", "Loss Functions", "What the network is trying to minimise.", "Your task", "multi-class classification", "Recommend the loss function + a 2-line explanation."),
          m("nn-3", "Optimisers", "Adam, SGD, RMSProp.", "Dataset size", "small (~5k rows)", "Recommend an optimiser + learning rate to start with."),
          m("nn-4", "Tune Without Tears", "Change one thing at a time.", "Hyperparam to tune", "learning rate", "Design a 5-experiment tuning plan + how to log results."),
        ],
      },
      {
        id: "ml-project",
        title: "ML Project",
        opportunity: "Ship 1 ML project on GitHub + write a 1-page case study.",
        missions: [
          m("mlp-1", "Pick the Right Problem", "Real, small, measurable.", "Idea you have", "predict house prices in my city", "Refine the user's idea into a tight project scope + dataset suggestion + success metric."),
          m("mlp-2", "Data Pipeline", "Get → clean → split → save.", "Your dataset", "scraped property listings", "Outline the data pipeline as 6 steps + 1 tool per step."),
          m("mlp-3", "Train & Compare", "3 models. Pick the winner.", "Models you'd try", "linear, tree, neural net", "Plan the comparison: what to log, how to choose, what to report."),
          m("mlp-4", "Ship & Tell", "GitHub + README + post.", "Where you'll share", "GitHub + LinkedIn", "Write a project README outline + a 3-paragraph LinkedIn launch post."),
        ],
      },
    ],
  },
];

export const findPath = (id: string) => STARTER_PATHS.find((p) => p.id === id);
export const findCourse = (pathId: string, courseId: string) =>
  findPath(pathId)?.courses.find((c) => c.id === courseId);
export const findMission = (pathId: string, courseId: string, missionId: string) =>
  findCourse(pathId, courseId)?.missions.find((m) => m.id === missionId);
