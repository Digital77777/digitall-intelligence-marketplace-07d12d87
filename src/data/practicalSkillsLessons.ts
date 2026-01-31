// From Zero to Builder - Practical Skills Path Course Data
// 44 lessons across 4 modules

import { Lesson, Module, formatDuration } from './foundationPathLessons';

export const PRACTICAL_SKILLS_ID = 'practical-skills';
export const PRACTICAL_SKILLS_TITLE = 'From Zero to Builder';

export const practicalSkillsModules: Module[] = [
  {
    id: 1,
    title: 'Master Prompt Engineering',
    description: 'Learn to communicate effectively with AI systems through expert prompting techniques.',
    lessons: [
      {
        id: 'ps-1-1',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 1,
        lessonOrder: 1,
        title: 'Introduction to Prompt Engineering',
        description: 'Understand why prompt engineering is the most valuable AI skill you can develop.',
        videoDurationSeconds: 480,
        contentType: 'video',
        isPreview: true,
        resources: [
          { title: 'Prompt Engineering Fundamentals', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'ps-1-2',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 1,
        lessonOrder: 2,
        title: 'Anatomy of a Great Prompt',
        description: 'Break down the components that make prompts effective and reliable.',
        videoDurationSeconds: 900,
        contentType: 'video',
        isPreview: false,
        resources: [
          { title: 'Prompt Structure Template', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'ps-1-3',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 1,
        lessonOrder: 3,
        title: 'Prompt Frameworks & Templates',
        description: 'Master proven frameworks like CRISPE, APE, and custom templates.',
        videoDurationSeconds: 1080,
        contentType: 'video',
        isPreview: false,
        resources: [
          { title: 'Framework Collection', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'ps-1-4',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 1,
        lessonOrder: 4,
        title: 'Context Setting Techniques',
        description: 'Learn to provide the right context for optimal AI responses.',
        videoDurationSeconds: 720,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'ps-1-5',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 1,
        lessonOrder: 5,
        title: 'Chain of Thought Prompting',
        description: 'Use step-by-step reasoning to get more accurate outputs.',
        videoDurationSeconds: 900,
        contentType: 'video',
        isPreview: false,
        resources: [
          { title: 'CoT Examples', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'ps-1-6',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 1,
        lessonOrder: 6,
        title: 'Role-based Prompting Mastery',
        description: 'Assign roles to AI for specialized expertise and perspectives.',
        videoDurationSeconds: 720,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'ps-1-7',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 1,
        lessonOrder: 7,
        title: 'Advanced Prompt Strategies',
        description: 'Explore few-shot learning, self-consistency, and meta-prompting.',
        videoDurationSeconds: 1080,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'ps-1-8',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 1,
        lessonOrder: 8,
        title: 'Prompt Optimization & Testing',
        description: 'Learn to iterate and improve prompts systematically.',
        videoDurationSeconds: 900,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'ps-1-9',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 1,
        lessonOrder: 9,
        title: 'Building Your Prompt Library',
        description: 'Create a personal collection of reusable, optimized prompts.',
        videoDurationSeconds: 720,
        contentType: 'project',
        isPreview: false,
        resources: [
          { title: 'Prompt Library Template', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'ps-1-10',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 1,
        lessonOrder: 10,
        title: 'Module Assessment',
        description: 'Test your prompt engineering skills with real-world scenarios.',
        videoDurationSeconds: 1200,
        contentType: 'quiz',
        isPreview: false,
        resources: []
      }
    ]
  },
  {
    id: 2,
    title: 'AI Tools Mastery',
    description: 'Become proficient with the most powerful AI tools available today.',
    lessons: [
      {
        id: 'ps-2-1',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 2,
        lessonOrder: 1,
        title: 'The AI Tools Landscape',
        description: 'Navigate the ecosystem of AI tools and choose the right ones for your needs.',
        videoDurationSeconds: 600,
        contentType: 'video',
        isPreview: true,
        resources: [
          { title: 'AI Tools Directory', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'ps-2-2',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 2,
        lessonOrder: 2,
        title: 'ChatGPT Advanced Techniques',
        description: 'Master ChatGPT with custom instructions, plugins, and advanced features.',
        videoDurationSeconds: 1200,
        contentType: 'video',
        isPreview: false,
        resources: [
          { title: 'ChatGPT Power User Guide', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'ps-2-3',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 2,
        lessonOrder: 3,
        title: 'Claude for Research & Analysis',
        description: 'Leverage Claude\'s strengths for research, writing, and analysis tasks.',
        videoDurationSeconds: 1080,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'ps-2-4',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 2,
        lessonOrder: 4,
        title: 'Midjourney & AI Art Generation',
        description: 'Create stunning visuals with Midjourney and other image AI tools.',
        videoDurationSeconds: 1500,
        contentType: 'video',
        isPreview: false,
        resources: [
          { title: 'Midjourney Prompt Guide', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'ps-2-5',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 2,
        lessonOrder: 5,
        title: 'AI Writing & Content Tools',
        description: 'Explore tools for content creation, copywriting, and editing.',
        videoDurationSeconds: 900,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'ps-2-6',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 2,
        lessonOrder: 6,
        title: 'AI Video & Audio Creation',
        description: 'Create videos, voiceovers, and audio content with AI.',
        videoDurationSeconds: 1200,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'ps-2-7',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 2,
        lessonOrder: 7,
        title: 'AI Code Generation Tools',
        description: 'Use GitHub Copilot, Cursor, and other coding assistants effectively.',
        videoDurationSeconds: 1080,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'ps-2-8',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 2,
        lessonOrder: 8,
        title: 'AI Presentation & Design',
        description: 'Create presentations and designs with AI tools like Canva AI and Gamma.',
        videoDurationSeconds: 900,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'ps-2-9',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 2,
        lessonOrder: 9,
        title: 'AI Data Analysis Platforms',
        description: 'Analyze data with AI-powered platforms and tools.',
        videoDurationSeconds: 900,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'ps-2-10',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 2,
        lessonOrder: 10,
        title: 'Workflow Automation with AI',
        description: 'Combine multiple AI tools into automated workflows.',
        videoDurationSeconds: 1080,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'ps-2-11',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 2,
        lessonOrder: 11,
        title: 'Building AI Tool Stacks',
        description: 'Design your personal AI toolkit for maximum productivity.',
        videoDurationSeconds: 900,
        contentType: 'project',
        isPreview: false,
        resources: [
          { title: 'Tool Stack Planner', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'ps-2-12',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 2,
        lessonOrder: 12,
        title: 'Module Assessment',
        description: 'Demonstrate your AI tools proficiency.',
        videoDurationSeconds: 1200,
        contentType: 'quiz',
        isPreview: false,
        resources: []
      }
    ]
  },
  {
    id: 3,
    title: 'No-Code AI Building',
    description: 'Build AI-powered applications without writing code using modern no-code platforms.',
    lessons: [
      {
        id: 'ps-3-1',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 3,
        lessonOrder: 1,
        title: 'Introduction to No-Code AI',
        description: 'Understand the power of no-code platforms for building AI solutions.',
        videoDurationSeconds: 600,
        contentType: 'video',
        isPreview: true,
        resources: []
      },
      {
        id: 'ps-3-2',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 3,
        lessonOrder: 2,
        title: 'Zapier AI Automation',
        description: 'Build powerful automations connecting AI to your favorite apps.',
        videoDurationSeconds: 1200,
        contentType: 'video',
        isPreview: false,
        resources: [
          { title: 'Zapier Workflow Templates', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'ps-3-3',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 3,
        lessonOrder: 3,
        title: 'Bubble AI App Development',
        description: 'Create full-featured web applications with AI capabilities.',
        videoDurationSeconds: 1500,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'ps-3-4',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 3,
        lessonOrder: 4,
        title: 'Airtable AI Workflows',
        description: 'Build smart databases and workflows with Airtable AI.',
        videoDurationSeconds: 1080,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'ps-3-5',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 3,
        lessonOrder: 5,
        title: 'Notion AI Databases',
        description: 'Create intelligent knowledge bases and project management systems.',
        videoDurationSeconds: 900,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'ps-3-6',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 3,
        lessonOrder: 6,
        title: 'Make (Integromat) AI Scenarios',
        description: 'Build complex AI automation scenarios with visual workflows.',
        videoDurationSeconds: 1200,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'ps-3-7',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 3,
        lessonOrder: 7,
        title: 'Building AI Chatbots',
        description: 'Create intelligent chatbots for customer service and engagement.',
        videoDurationSeconds: 1500,
        contentType: 'video',
        isPreview: false,
        resources: [
          { title: 'Chatbot Design Guide', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'ps-3-8',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 3,
        lessonOrder: 8,
        title: 'Voice AI Applications',
        description: 'Build voice-enabled applications and assistants.',
        videoDurationSeconds: 1080,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'ps-3-9',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 3,
        lessonOrder: 9,
        title: 'AI Form & Survey Builders',
        description: 'Create smart forms that adapt and analyze responses.',
        videoDurationSeconds: 720,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'ps-3-10',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 3,
        lessonOrder: 10,
        title: 'AI E-commerce Solutions',
        description: 'Build AI-powered online stores and product recommendations.',
        videoDurationSeconds: 900,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'ps-3-11',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 3,
        lessonOrder: 11,
        title: 'Custom AI Dashboards',
        description: 'Create data dashboards powered by AI insights.',
        videoDurationSeconds: 1200,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'ps-3-12',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 3,
        lessonOrder: 12,
        title: 'AI Mobile App Creation',
        description: 'Build mobile applications with AI features using no-code tools.',
        videoDurationSeconds: 1080,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'ps-3-13',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 3,
        lessonOrder: 13,
        title: 'Deployment & Scaling',
        description: 'Launch your no-code AI applications to production.',
        videoDurationSeconds: 900,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'ps-3-14',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 3,
        lessonOrder: 14,
        title: 'Capstone: Complete AI App',
        description: 'Build a complete AI-powered application from concept to launch.',
        videoDurationSeconds: 2700,
        contentType: 'project',
        isPreview: false,
        resources: [
          { title: 'Capstone Project Guide', type: 'pdf', url: '' },
          { title: 'Project Requirements', type: 'pdf', url: '' }
        ]
      }
    ]
  },
  {
    id: 4,
    title: 'Data Handling & Analysis',
    description: 'Learn to collect, clean, and analyze data for AI applications.',
    lessons: [
      {
        id: 'ps-4-1',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 4,
        lessonOrder: 1,
        title: 'Data Types & Sources',
        description: 'Understand different data types and where to find valuable data.',
        videoDurationSeconds: 600,
        contentType: 'video',
        isPreview: true,
        resources: [
          { title: 'Data Sources Directory', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'ps-4-2',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 4,
        lessonOrder: 2,
        title: 'Web Scraping Basics',
        description: 'Extract data from websites using no-code and low-code tools.',
        videoDurationSeconds: 1200,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'ps-4-3',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 4,
        lessonOrder: 3,
        title: 'API Data Collection',
        description: 'Collect data from APIs without coding expertise.',
        videoDurationSeconds: 1080,
        contentType: 'video',
        isPreview: false,
        resources: [
          { title: 'API Integration Guide', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'ps-4-4',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 4,
        lessonOrder: 4,
        title: 'Data Cleaning Techniques',
        description: 'Prepare raw data for AI analysis and model training.',
        videoDurationSeconds: 900,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'ps-4-5',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 4,
        lessonOrder: 5,
        title: 'Excel & Google Sheets AI',
        description: 'Use AI features in spreadsheet tools for powerful analysis.',
        videoDurationSeconds: 900,
        contentType: 'video',
        isPreview: false,
        resources: [
          { title: 'Sheets AI Formulas', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'ps-4-6',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 4,
        lessonOrder: 6,
        title: 'Basic Data Visualization',
        description: 'Create compelling visualizations to communicate insights.',
        videoDurationSeconds: 1080,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'ps-4-7',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 4,
        lessonOrder: 7,
        title: 'AI-Powered Data Analysis',
        description: 'Use AI tools to uncover patterns and insights in your data.',
        videoDurationSeconds: 1200,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'ps-4-8',
        courseId: PRACTICAL_SKILLS_ID,
        moduleId: 4,
        lessonOrder: 8,
        title: 'Final Project: Data Pipeline',
        description: 'Build a complete data collection and analysis pipeline.',
        videoDurationSeconds: 2400,
        contentType: 'project',
        isPreview: false,
        resources: [
          { title: 'Pipeline Template', type: 'pdf', url: '' },
          { title: 'Sample Datasets', type: 'zip', url: '' }
        ]
      }
    ]
  }
];

// Helper functions
export const getPracticalSkillsTotalLessons = (): number => {
  return practicalSkillsModules.reduce((total, module) => total + module.lessons.length, 0);
};

export const getPracticalSkillsTotalDuration = (): number => {
  return practicalSkillsModules.reduce((total, module) => 
    total + module.lessons.reduce((modTotal, lesson) => modTotal + lesson.videoDurationSeconds, 0), 0
  );
};

export const getPracticalSkillsLessonById = (lessonId: string): Lesson | undefined => {
  for (const module of practicalSkillsModules) {
    const lesson = module.lessons.find(l => l.id === lessonId);
    if (lesson) return lesson;
  }
  return undefined;
};

export const getPracticalSkillsNextLesson = (currentLessonId: string): Lesson | undefined => {
  const allLessons = practicalSkillsModules.flatMap(m => m.lessons);
  const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
  if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
    return allLessons[currentIndex + 1];
  }
  return undefined;
};

export const getPracticalSkillsPreviousLesson = (currentLessonId: string): Lesson | undefined => {
  const allLessons = practicalSkillsModules.flatMap(m => m.lessons);
  const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
  if (currentIndex > 0) {
    return allLessons[currentIndex - 1];
  }
  return undefined;
};

export { formatDuration };
