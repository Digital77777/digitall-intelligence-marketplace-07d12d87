 // Module 1: Introduction to AI - Hands-on Exercise
 // "Identify AI in Your Daily Life" Interactive Exercise
 
 export interface ExerciseScenario {
   id: string;
   title: string;
   description: string;
   icon: string; // Lucide icon name
   isAI: boolean;
   aiExplanation: string;
   category: 'home' | 'work' | 'entertainment' | 'travel' | 'health' | 'shopping';
 }
 
 export interface ExerciseTask {
   id: string;
   title: string;
   description: string;
   type: 'identification' | 'classification' | 'reflection';
   instructions: string[];
 }
 
 export interface ModuleExerciseData {
   moduleId: number;
   moduleTitle: string;
   exerciseTitle: string;
   description: string;
   learningObjectives: string[];
   scenarios: ExerciseScenario[];
   tasks: ExerciseTask[];
   reflectionQuestions: string[];
 }
 
 export const module1ExerciseData: ModuleExerciseData = {
   moduleId: 1,
   moduleTitle: 'Introduction to AI',
   exerciseTitle: 'AI in Your Daily Life',
   description: 'Apply what you\'ve learned by identifying real AI applications in everyday scenarios. This hands-on exercise will help you recognize how AI already impacts your life.',
   learningObjectives: [
     'Identify AI applications in everyday technology',
     'Distinguish between AI and non-AI systems',
     'Classify AI by type (Narrow AI examples)',
     'Recognize ethical considerations in real-world AI'
   ],
   scenarios: [
     // HOME Category
     {
       id: 'scenario-1',
       title: 'Smart Thermostat',
       description: 'Your thermostat learns your schedule and preferences to automatically adjust temperature.',
       icon: 'Thermometer',
       isAI: true,
       aiExplanation: 'This uses machine learning to analyze patterns in your behavior and preferences, predicting when to heat or cool your home for optimal comfort and energy savings.',
       category: 'home'
     },
     {
       id: 'scenario-2',
       title: 'Traditional Light Switch',
       description: 'A basic on/off switch that controls your room lights.',
       icon: 'Lightbulb',
       isAI: false,
       aiExplanation: 'This is simple electrical circuitry with no learning, decision-making, or adaptive behavior. It only responds to manual input.',
       category: 'home'
     },
     {
       id: 'scenario-3',
       title: 'Robot Vacuum',
       description: 'A vacuum cleaner that maps your home and navigates around obstacles.',
       icon: 'Home',
       isAI: true,
       aiExplanation: 'Uses computer vision, SLAM (Simultaneous Localization and Mapping), and path-planning algorithms to navigate and clean efficiently.',
       category: 'home'
     },
     
     // ENTERTAINMENT Category
     {
       id: 'scenario-4',
       title: 'Spotify Discover Weekly',
       description: 'A personalized playlist created for you every week with new music recommendations.',
       icon: 'Music',
       isAI: true,
       aiExplanation: 'Spotify uses collaborative filtering and deep learning to analyze your listening habits and compare them with millions of other users to recommend music you might enjoy.',
       category: 'entertainment'
     },
     {
       id: 'scenario-5',
       title: 'FM Radio',
       description: 'A device that receives radio signals to play broadcast stations.',
       icon: 'Radio',
       isAI: false,
       aiExplanation: 'FM radio is purely analog signal processing. It receives electromagnetic waves and converts them to sound without any learning or intelligent decision-making.',
       category: 'entertainment'
     },
     {
       id: 'scenario-6',
       title: 'YouTube Video Suggestions',
       description: 'Videos recommended to you based on what you\'ve watched before.',
       icon: 'Video',
       isAI: true,
       aiExplanation: 'YouTube uses sophisticated recommendation algorithms that analyze your watch history, engagement patterns, and similar users\' behavior to suggest relevant content.',
       category: 'entertainment'
     },
     
     // WORK Category
     {
       id: 'scenario-7',
       title: 'Email Spam Filter',
       description: 'Your email automatically sorts spam messages into a separate folder.',
       icon: 'Mail',
       isAI: true,
       aiExplanation: 'Spam filters use machine learning to analyze email characteristics, learning from billions of examples to identify unwanted messages with high accuracy.',
       category: 'work'
     },
     {
       id: 'scenario-8',
       title: 'Basic Calculator App',
       description: 'An app that performs mathematical calculations when you enter numbers.',
       icon: 'Calculator',
       isAI: false,
       aiExplanation: 'Calculators execute predefined mathematical operations. They don\'t learn, adapt, or make decisions—they simply follow programmed rules.',
       category: 'work'
     },
     {
       id: 'scenario-9',
       title: 'Grammarly Writing Assistant',
       description: 'A tool that suggests corrections and improvements to your writing.',
       icon: 'FileText',
       isAI: true,
       aiExplanation: 'Grammarly uses natural language processing (NLP) and deep learning to understand context, detect errors, and suggest improvements in writing style and clarity.',
       category: 'work'
     },
     
     // TRAVEL Category
     {
       id: 'scenario-10',
       title: 'Google Maps Traffic Predictions',
       description: 'Real-time traffic updates and route suggestions to avoid congestion.',
       icon: 'Map',
       isAI: true,
       aiExplanation: 'Google Maps uses machine learning to predict traffic patterns based on historical data, current conditions from users\' phones, and events to optimize routes.',
       category: 'travel'
     },
     {
       id: 'scenario-11',
       title: 'Paper Road Atlas',
       description: 'A printed book of maps for navigation.',
       icon: 'BookOpen',
       isAI: false,
       aiExplanation: 'A paper atlas is static information with no computational or adaptive capabilities. It cannot update, learn, or respond to changing conditions.',
       category: 'travel'
     },
     {
       id: 'scenario-12',
       title: 'Uber Surge Pricing',
       description: 'Ride prices that change based on demand in your area.',
       icon: 'Car',
       isAI: true,
       aiExplanation: 'Uber uses machine learning to predict demand, optimize driver allocation, and dynamically adjust pricing based on real-time supply and demand patterns.',
       category: 'travel'
     },
     
     // SHOPPING Category
     {
       id: 'scenario-13',
       title: 'Amazon Product Recommendations',
       description: '"Customers who bought this also bought..." suggestions.',
       icon: 'ShoppingCart',
       isAI: true,
       aiExplanation: 'Amazon uses collaborative filtering, deep learning, and purchase pattern analysis to recommend products that are statistically likely to interest you.',
       category: 'shopping'
     },
     {
       id: 'scenario-14',
       title: 'Barcode Scanner',
       description: 'A device that reads product barcodes to look up prices.',
       icon: 'ScanLine',
       isAI: false,
       aiExplanation: 'Barcode scanners use optical pattern recognition with fixed rules. They don\'t learn or adapt—they simply decode standardized patterns to retrieve stored information.',
       category: 'shopping'
     },
     {
       id: 'scenario-15',
       title: 'Chatbot Customer Service',
       description: 'An automated chat assistant that answers your questions on a website.',
       icon: 'MessageSquare',
       isAI: true,
       aiExplanation: 'Modern chatbots use NLP and sometimes large language models to understand queries, maintain context, and generate helpful responses.',
       category: 'shopping'
     },
     
     // HEALTH Category
     {
       id: 'scenario-16',
       title: 'Fitness Tracker Sleep Analysis',
       description: 'Your watch analyzes sleep patterns and gives you a sleep score.',
       icon: 'Watch',
       isAI: true,
       aiExplanation: 'Fitness trackers use machine learning algorithms to classify sleep stages based on movement, heart rate, and other sensor data to provide insights.',
       category: 'health'
     },
     {
       id: 'scenario-17',
       title: 'Digital Thermometer',
       description: 'A device that measures and displays your body temperature.',
       icon: 'Activity',
       isAI: false,
       aiExplanation: 'Digital thermometers use sensors to measure temperature and display the reading. There\'s no learning, prediction, or intelligent decision-making involved.',
       category: 'health'
     },
     {
       id: 'scenario-18',
       title: 'AI Symptom Checker',
       description: 'An app that asks about symptoms and suggests possible conditions.',
       icon: 'Stethoscope',
       isAI: true,
       aiExplanation: 'AI symptom checkers use medical knowledge bases and machine learning to correlate symptoms with conditions, providing probability-based suggestions.',
       category: 'health'
     }
   ],
   tasks: [
     {
       id: 'task-1',
       title: 'AI Identification Challenge',
       description: 'Identify whether each scenario uses AI or not.',
       type: 'identification',
       instructions: [
         'Review each scenario carefully',
         'Consider: Does it learn? Does it adapt? Does it make intelligent decisions?',
         'Select whether you think it uses AI or not',
         'Read the explanation to understand why'
       ]
     },
     {
       id: 'task-2',
       title: 'AI Type Classification',
       description: 'Classify the AI examples by their capabilities.',
       type: 'classification',
       instructions: [
         'For each AI system identified, determine if it\'s Narrow AI',
         'Explain what specific task(s) each AI is designed for',
         'Consider: Could this AI do something completely different without reprogramming?'
       ]
     },
     {
       id: 'task-3',
       title: 'Ethical Reflection',
       description: 'Consider the ethical implications of AI in daily life.',
       type: 'reflection',
       instructions: [
         'Choose 3 AI examples that collect personal data',
         'Consider privacy implications for each',
         'Think about who is responsible if these systems make mistakes',
         'Write down your thoughts on the trade-offs between convenience and privacy'
       ]
     }
   ],
   reflectionQuestions: [
     'Were you surprised by how much AI is already in your daily life?',
     'Which AI application do you find most useful? Why?',
     'Are there any AI applications that concern you? What would make you more comfortable?',
     'Can you think of 3 more AI applications in your life that weren\'t listed?',
     'How do you think AI will change your daily routines in the next 5 years?'
   ]
 };
 
 // Helper to shuffle scenarios
 export const shuffleScenarios = (scenarios: ExerciseScenario[]): ExerciseScenario[] => {
   const shuffled = [...scenarios];
   for (let i = shuffled.length - 1; i > 0; i--) {
     const j = Math.floor(Math.random() * (i + 1));
     [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
   }
   return shuffled;
 };
 
 // Helper to get scenarios by category
 export const getScenariosByCategory = (
   scenarios: ExerciseScenario[],
   category: ExerciseScenario['category']
 ): ExerciseScenario[] => {
   return scenarios.filter(s => s.category === category);
 };