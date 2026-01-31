// AI Basics for Everyone - Foundation Path Course Data
// 44 lessons across 4 modules

export interface Lesson {
  id: string;
  courseId: string;
  moduleId: number;
  lessonOrder: number;
  title: string;
  description: string;
  videoDurationSeconds: number;
  contentType: 'video' | 'article' | 'quiz' | 'project';
  isPreview: boolean;
  resources: { title: string; type: string; url: string }[];
}

export interface Module {
  id: number;
  title: string;
  description: string;
  lessons: Lesson[];
}

export const FOUNDATION_PATH_ID = 'foundation-path';
export const FOUNDATION_PATH_TITLE = 'AI Basics for Everyone';

export const foundationPathModules: Module[] = [
  {
    id: 1,
    title: 'Introduction to AI',
    description: 'Understand the fundamentals of artificial intelligence, its history, and impact on society.',
    lessons: [
      {
        id: 'fp-1-1',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 1,
        lessonOrder: 1,
        title: 'What is Artificial Intelligence?',
        description: 'Discover what AI really means, how it works at a high level, and why it matters for everyone in today\'s world.',
        videoDurationSeconds: 480,
        contentType: 'video',
        isPreview: true,
        resources: [
          { title: 'AI Terminology Cheat Sheet', type: 'pdf', url: '' },
          { title: 'Lesson Notes', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'fp-1-2',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 1,
        lessonOrder: 2,
        title: 'The Fascinating History of AI',
        description: 'Journey through the evolution of AI from the 1950s Dartmouth Conference to modern deep learning breakthroughs.',
        videoDurationSeconds: 600,
        contentType: 'video',
        isPreview: false,
        resources: [
          { title: 'AI Timeline Infographic', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'fp-1-3',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 1,
        lessonOrder: 3,
        title: 'Types of AI: Narrow vs General vs Super',
        description: 'Learn the differences between ANI, AGI, and ASI, and understand where current AI systems fall on this spectrum.',
        videoDurationSeconds: 720,
        contentType: 'video',
        isPreview: false,
        resources: [
          { title: 'AI Types Comparison Chart', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'fp-1-4',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 1,
        lessonOrder: 4,
        title: 'AI vs Machine Learning vs Deep Learning',
        description: 'Understand the relationship between AI, ML, and DL, and when each term applies.',
        videoDurationSeconds: 900,
        contentType: 'video',
        isPreview: false,
        resources: [
          { title: 'AI/ML/DL Venn Diagram', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'fp-1-5',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 1,
        lessonOrder: 5,
        title: 'Real-World AI Applications Today',
        description: 'Explore how AI powers everyday technologies from voice assistants to recommendation systems.',
        videoDurationSeconds: 600,
        contentType: 'video',
        isPreview: false,
        resources: [
          { title: 'AI Applications Guide', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'fp-1-6',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 1,
        lessonOrder: 6,
        title: 'Ethical Considerations in AI',
        description: 'Examine the ethical challenges of AI including bias, privacy, and accountability.',
        videoDurationSeconds: 720,
        contentType: 'video',
        isPreview: false,
        resources: [
          { title: 'AI Ethics Framework', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'fp-1-7',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 1,
        lessonOrder: 7,
        title: 'The Future of AI Technology',
        description: 'Look ahead at emerging AI trends and what to expect in the coming years.',
        videoDurationSeconds: 480,
        contentType: 'video',
        isPreview: false,
        resources: [
          { title: 'Future AI Trends Report', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'fp-1-8',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 1,
        lessonOrder: 8,
        title: 'Module Quiz & Hands-on Exercise',
        description: 'Test your understanding and complete a practical exercise identifying AI in your daily life.',
        videoDurationSeconds: 1200,
        contentType: 'quiz',
        isPreview: false,
        resources: [
          { title: 'Exercise Worksheet', type: 'pdf', url: '' }
        ]
      }
    ]
  },
  {
    id: 2,
    title: 'Mathematics for AI',
    description: 'Build essential math foundations for understanding how AI algorithms work.',
    lessons: [
      {
        id: 'fp-2-1',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 2,
        lessonOrder: 1,
        title: 'Why Math Matters for AI',
        description: 'Understand why mathematical concepts are the building blocks of intelligent systems.',
        videoDurationSeconds: 300,
        contentType: 'video',
        isPreview: true,
        resources: []
      },
      {
        id: 'fp-2-2',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 2,
        lessonOrder: 2,
        title: 'Statistics Fundamentals',
        description: 'Learn mean, median, mode, standard deviation, and their role in AI.',
        videoDurationSeconds: 900,
        contentType: 'video',
        isPreview: false,
        resources: [
          { title: 'Statistics Formula Sheet', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'fp-2-3',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 2,
        lessonOrder: 3,
        title: 'Probability Made Simple',
        description: 'Master probability concepts essential for machine learning algorithms.',
        videoDurationSeconds: 900,
        contentType: 'video',
        isPreview: false,
        resources: [
          { title: 'Probability Cheat Sheet', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'fp-2-4',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 2,
        lessonOrder: 4,
        title: 'Understanding Data Distributions',
        description: 'Explore normal distributions, histograms, and how data shapes AI decisions.',
        videoDurationSeconds: 720,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'fp-2-5',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 2,
        lessonOrder: 5,
        title: 'Correlation vs Causation',
        description: 'Learn to distinguish between correlation and causation in data analysis.',
        videoDurationSeconds: 600,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'fp-2-6',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 2,
        lessonOrder: 6,
        title: 'Introduction to Linear Algebra',
        description: 'Understand why linear algebra is the language of machine learning.',
        videoDurationSeconds: 900,
        contentType: 'video',
        isPreview: false,
        resources: [
          { title: 'Linear Algebra Basics', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'fp-2-7',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 2,
        lessonOrder: 7,
        title: 'Vectors and Their Applications',
        description: 'Learn about vectors and how they represent data in AI systems.',
        videoDurationSeconds: 720,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'fp-2-8',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 2,
        lessonOrder: 8,
        title: 'Matrices Basics',
        description: 'Understand matrices and their role in neural network computations.',
        videoDurationSeconds: 900,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'fp-2-9',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 2,
        lessonOrder: 9,
        title: 'Mathematical Thinking for AI',
        description: 'Develop the problem-solving mindset needed for AI development.',
        videoDurationSeconds: 600,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'fp-2-10',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 2,
        lessonOrder: 10,
        title: 'Practical Math Examples',
        description: 'Apply mathematical concepts to real AI scenarios.',
        videoDurationSeconds: 720,
        contentType: 'video',
        isPreview: false,
        resources: [
          { title: 'Practice Problems', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'fp-2-11',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 2,
        lessonOrder: 11,
        title: 'Tools: Calculator vs Understanding',
        description: 'Learn when to use computational tools and when to understand the math.',
        videoDurationSeconds: 480,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'fp-2-12',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 2,
        lessonOrder: 12,
        title: 'Module Quiz & Practice Problems',
        description: 'Test your mathematical knowledge and solve AI-related problems.',
        videoDurationSeconds: 1500,
        contentType: 'quiz',
        isPreview: false,
        resources: [
          { title: 'Practice Problem Set', type: 'pdf', url: '' }
        ]
      }
    ]
  },
  {
    id: 3,
    title: 'Python Programming',
    description: 'Learn Python programming from scratch and apply it to AI development.',
    lessons: [
      {
        id: 'fp-3-1',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 3,
        lessonOrder: 1,
        title: 'Setting Up Python Environment',
        description: 'Install Python and set up your development environment for AI work.',
        videoDurationSeconds: 600,
        contentType: 'video',
        isPreview: true,
        resources: [
          { title: 'Setup Guide', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'fp-3-2',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 3,
        lessonOrder: 2,
        title: 'Variables and Data Types',
        description: 'Master Python variables, strings, numbers, and boolean types.',
        videoDurationSeconds: 720,
        contentType: 'video',
        isPreview: false,
        resources: [
          { title: 'Python Data Types Reference', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'fp-3-3',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 3,
        lessonOrder: 3,
        title: 'Control Flow: If/Else Statements',
        description: 'Learn conditional logic to make your programs smart.',
        videoDurationSeconds: 900,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'fp-3-4',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 3,
        lessonOrder: 4,
        title: 'Loops: For and While',
        description: 'Master iteration patterns essential for data processing.',
        videoDurationSeconds: 900,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'fp-3-5',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 3,
        lessonOrder: 5,
        title: 'Functions and Methods',
        description: 'Write reusable code with functions and understand methods.',
        videoDurationSeconds: 1080,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'fp-3-6',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 3,
        lessonOrder: 6,
        title: 'Working with Lists',
        description: 'Master Python lists for storing and manipulating collections of data.',
        videoDurationSeconds: 720,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'fp-3-7',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 3,
        lessonOrder: 7,
        title: 'Dictionaries and Sets',
        description: 'Learn key-value data structures essential for AI applications.',
        videoDurationSeconds: 720,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'fp-3-8',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 3,
        lessonOrder: 8,
        title: 'File Handling Basics',
        description: 'Read and write files to work with datasets.',
        videoDurationSeconds: 600,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'fp-3-9',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 3,
        lessonOrder: 9,
        title: 'Introduction to Libraries',
        description: 'Understand Python packages and how to use them.',
        videoDurationSeconds: 480,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'fp-3-10',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 3,
        lessonOrder: 10,
        title: 'Pandas for Data Analysis',
        description: 'Master the most important library for data manipulation in AI.',
        videoDurationSeconds: 1200,
        contentType: 'video',
        isPreview: false,
        resources: [
          { title: 'Pandas Cheat Sheet', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'fp-3-11',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 3,
        lessonOrder: 11,
        title: 'NumPy for Numerical Computing',
        description: 'Learn NumPy for efficient numerical operations in AI.',
        videoDurationSeconds: 1080,
        contentType: 'video',
        isPreview: false,
        resources: [
          { title: 'NumPy Quick Reference', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'fp-3-12',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 3,
        lessonOrder: 12,
        title: 'Matplotlib for Visualization',
        description: 'Create visualizations to understand and present data.',
        videoDurationSeconds: 900,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'fp-3-13',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 3,
        lessonOrder: 13,
        title: 'Building Your First AI Script',
        description: 'Combine everything to create a simple AI-powered script.',
        videoDurationSeconds: 1200,
        contentType: 'video',
        isPreview: false,
        resources: [
          { title: 'Starter Code Template', type: 'code', url: '' }
        ]
      },
      {
        id: 'fp-3-14',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 3,
        lessonOrder: 14,
        title: 'Error Handling & Debugging',
        description: 'Learn to identify and fix bugs in your Python code.',
        videoDurationSeconds: 720,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'fp-3-15',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 3,
        lessonOrder: 15,
        title: 'Project: Data Analysis Tool',
        description: 'Build a complete data analysis tool from scratch.',
        videoDurationSeconds: 1800,
        contentType: 'project',
        isPreview: false,
        resources: [
          { title: 'Project Starter Files', type: 'zip', url: '' },
          { title: 'Sample Dataset', type: 'csv', url: '' }
        ]
      },
      {
        id: 'fp-3-16',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 3,
        lessonOrder: 16,
        title: 'Module Assessment',
        description: 'Test your Python programming skills.',
        videoDurationSeconds: 1200,
        contentType: 'quiz',
        isPreview: false,
        resources: []
      }
    ]
  },
  {
    id: 4,
    title: 'AI in Industries',
    description: 'Explore how AI is transforming various industries and career opportunities.',
    lessons: [
      {
        id: 'fp-4-1',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 4,
        lessonOrder: 1,
        title: 'AI in Healthcare',
        description: 'Discover how AI is revolutionizing diagnostics, drug discovery, and patient care.',
        videoDurationSeconds: 720,
        contentType: 'video',
        isPreview: true,
        resources: [
          { title: 'Healthcare AI Case Studies', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'fp-4-2',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 4,
        lessonOrder: 2,
        title: 'AI in Finance & Banking',
        description: 'Learn about AI in fraud detection, trading, and risk assessment.',
        videoDurationSeconds: 720,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'fp-4-3',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 4,
        lessonOrder: 3,
        title: 'AI in Retail & E-commerce',
        description: 'Explore personalization, inventory management, and customer service AI.',
        videoDurationSeconds: 600,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'fp-4-4',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 4,
        lessonOrder: 4,
        title: 'AI in Manufacturing',
        description: 'Understand predictive maintenance and quality control with AI.',
        videoDurationSeconds: 600,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'fp-4-5',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 4,
        lessonOrder: 5,
        title: 'AI in Education',
        description: 'See how AI is personalizing learning and supporting educators.',
        videoDurationSeconds: 600,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'fp-4-6',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 4,
        lessonOrder: 6,
        title: 'AI in Transportation',
        description: 'From autonomous vehicles to route optimization - AI in transit.',
        videoDurationSeconds: 600,
        contentType: 'video',
        isPreview: false,
        resources: []
      },
      {
        id: 'fp-4-7',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 4,
        lessonOrder: 7,
        title: 'AI Career Opportunities',
        description: 'Explore career paths in the AI industry and required skills.',
        videoDurationSeconds: 900,
        contentType: 'video',
        isPreview: false,
        resources: [
          { title: 'AI Career Guide', type: 'pdf', url: '' }
        ]
      },
      {
        id: 'fp-4-8',
        courseId: FOUNDATION_PATH_ID,
        moduleId: 4,
        lessonOrder: 8,
        title: 'Building Your AI Portfolio',
        description: 'Create a portfolio that showcases your AI skills to employers.',
        videoDurationSeconds: 1200,
        contentType: 'project',
        isPreview: false,
        resources: [
          { title: 'Portfolio Template', type: 'zip', url: '' }
        ]
      }
    ]
  }
];

// Helper functions
export const getTotalLessons = (): number => {
  return foundationPathModules.reduce((total, module) => total + module.lessons.length, 0);
};

export const getTotalDuration = (): number => {
  return foundationPathModules.reduce((total, module) => 
    total + module.lessons.reduce((modTotal, lesson) => modTotal + lesson.videoDurationSeconds, 0), 0
  );
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const getLessonById = (lessonId: string): Lesson | undefined => {
  for (const module of foundationPathModules) {
    const lesson = module.lessons.find(l => l.id === lessonId);
    if (lesson) return lesson;
  }
  return undefined;
};

export const getNextLesson = (currentLessonId: string): Lesson | undefined => {
  const allLessons = foundationPathModules.flatMap(m => m.lessons);
  const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
  if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
    return allLessons[currentIndex + 1];
  }
  return undefined;
};

export const getPreviousLesson = (currentLessonId: string): Lesson | undefined => {
  const allLessons = foundationPathModules.flatMap(m => m.lessons);
  const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
  if (currentIndex > 0) {
    return allLessons[currentIndex - 1];
  }
  return undefined;
};
