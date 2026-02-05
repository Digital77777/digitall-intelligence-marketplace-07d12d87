 // Module 1: Introduction to AI - Quiz Questions
 // Aligned with lessons fp-1-1 through fp-1-7
 
 export interface QuizQuestion {
   id: string;
   lessonId: string; // Which lesson this question relates to
   question: string;
   options: string[];
   correctIndex: number;
   explanation: string;
   difficulty: 'easy' | 'medium' | 'hard';
 }
 
 export interface ModuleQuizData {
   moduleId: number;
   moduleTitle: string;
   description: string;
   passingScore: number;
   questions: QuizQuestion[];
 }
 
 export const module1QuizData: ModuleQuizData = {
   moduleId: 1,
   moduleTitle: 'Introduction to AI',
   description: 'Test your understanding of AI fundamentals, history, types, and ethical considerations.',
   passingScore: 70,
   questions: [
     // Lesson 1: What is Artificial Intelligence?
     {
       id: 'm1-q1',
       lessonId: 'fp-1-1',
       question: 'What is the primary goal of Artificial Intelligence?',
       options: [
         'To replace all human workers',
         'To create systems that can perform tasks requiring human-like intelligence',
         'To build faster computers',
         'To store large amounts of data'
       ],
       correctIndex: 1,
       explanation: 'AI aims to create systems capable of performing tasks that typically require human intelligence, such as understanding language, recognizing patterns, and making decisions.',
       difficulty: 'easy'
     },
     {
       id: 'm1-q2',
       lessonId: 'fp-1-1',
       question: 'Which of the following is NOT a characteristic of AI systems?',
       options: [
         'Learning from data',
         'Making predictions',
         'Having consciousness and emotions',
         'Recognizing patterns'
       ],
       correctIndex: 2,
       explanation: 'Current AI systems do not have consciousness or emotions. They simulate intelligent behavior through algorithms but lack true understanding or feelings.',
       difficulty: 'medium'
     },
     
     // Lesson 2: The Fascinating History of AI
     {
       id: 'm1-q3',
       lessonId: 'fp-1-2',
       question: 'In what decade was the term "Artificial Intelligence" first coined?',
       options: [
         '1940s',
         '1950s',
         '1970s',
         '1990s'
       ],
       correctIndex: 1,
       explanation: 'The term "Artificial Intelligence" was coined in 1956 at the Dartmouth Conference, marking the official birth of AI as a field of study.',
       difficulty: 'easy'
     },
     {
       id: 'm1-q4',
       lessonId: 'fp-1-2',
       question: 'What event is considered the "birth" of AI as a formal academic field?',
       options: [
         'The invention of the first computer',
         'The Dartmouth Conference in 1956',
         'The creation of the internet',
         'Deep Blue beating Kasparov in chess'
       ],
       correctIndex: 1,
       explanation: 'The 1956 Dartmouth Conference brought together researchers who established AI as an independent field of study, defining its goals and approaches.',
       difficulty: 'medium'
     },
     
     // Lesson 3: Types of AI - Narrow vs General vs Super
     {
       id: 'm1-q5',
       lessonId: 'fp-1-3',
       question: 'What type of AI are all current AI systems?',
       options: [
         'Artificial General Intelligence (AGI)',
         'Artificial Super Intelligence (ASI)',
         'Artificial Narrow Intelligence (ANI)',
         'Universal Intelligence'
       ],
       correctIndex: 2,
       explanation: 'All existing AI systems are Narrow AI (ANI), designed for specific tasks. AGI (human-level intelligence) and ASI (beyond human) remain theoretical.',
       difficulty: 'easy'
     },
     {
       id: 'm1-q6',
       lessonId: 'fp-1-3',
       question: 'Which statement best describes Artificial General Intelligence (AGI)?',
       options: [
         'AI that can only play chess',
         'AI with human-level intelligence across all domains',
         'AI that controls robots',
         'AI that processes natural language only'
       ],
       correctIndex: 1,
       explanation: 'AGI would be able to understand, learn, and apply intelligence across any domain—just like humans—rather than being limited to specific tasks.',
       difficulty: 'medium'
     },
     
     // Lesson 4: AI vs Machine Learning vs Deep Learning
     {
       id: 'm1-q7',
       lessonId: 'fp-1-4',
       question: 'What is the relationship between AI, Machine Learning, and Deep Learning?',
       options: [
         'They are all the same thing',
         'Machine Learning is a subset of AI, and Deep Learning is a subset of ML',
         'AI is a subset of Machine Learning',
         'They are completely unrelated fields'
       ],
       correctIndex: 1,
       explanation: 'AI is the broadest field, Machine Learning is a subset of AI that learns from data, and Deep Learning is a subset of ML using neural networks.',
       difficulty: 'easy'
     },
     {
       id: 'm1-q8',
       lessonId: 'fp-1-4',
       question: 'What distinguishes Deep Learning from traditional Machine Learning?',
       options: [
         'Deep Learning requires no data',
         'Deep Learning uses multi-layered neural networks',
         'Deep Learning is always faster',
         'Deep Learning only works on text'
       ],
       correctIndex: 1,
       explanation: 'Deep Learning uses artificial neural networks with multiple layers (hence "deep") that can learn complex patterns and representations from raw data.',
       difficulty: 'medium'
     },
     
     // Lesson 5: Real-World AI Applications Today
     {
       id: 'm1-q9',
       lessonId: 'fp-1-5',
       question: 'Which of the following is an example of AI in everyday life?',
       options: [
         'A basic calculator',
         'Netflix recommendation system',
         'A traditional light switch',
         'An analog clock'
       ],
       correctIndex: 1,
       explanation: 'Netflix uses AI algorithms to analyze your viewing history and preferences to recommend shows and movies you might enjoy.',
       difficulty: 'easy'
     },
     {
       id: 'm1-q10',
       lessonId: 'fp-1-5',
       question: 'How do virtual assistants like Siri or Alexa use AI?',
       options: [
         'They use pre-recorded responses only',
         'They use natural language processing to understand and respond to speech',
         'They connect directly to human operators',
         'They only recognize keywords'
       ],
       correctIndex: 1,
       explanation: 'Virtual assistants use AI for speech recognition, natural language understanding, and generating appropriate responses to user queries.',
       difficulty: 'medium'
     },
     
     // Lesson 6: Ethical Considerations in AI
     {
       id: 'm1-q11',
       lessonId: 'fp-1-6',
       question: 'What is "AI bias"?',
       options: [
         'When AI systems prefer certain programming languages',
         'When AI produces unfair outcomes due to biased training data or design',
         'When AI runs too slowly',
         'When users prefer one AI over another'
       ],
       correctIndex: 1,
       explanation: 'AI bias occurs when algorithms produce systematically unfair results, often because the training data reflects historical discrimination or lacks diversity.',
       difficulty: 'easy'
     },
     {
       id: 'm1-q12',
       lessonId: 'fp-1-6',
       question: 'Which ethical principle suggests AI systems should be understandable to humans?',
       options: [
         'Efficiency',
         'Transparency (Explainability)',
         'Speed',
         'Automation'
       ],
       correctIndex: 1,
       explanation: 'Transparency or explainability means AI systems should be able to explain their decisions in ways humans can understand, especially for high-stakes applications.',
       difficulty: 'medium'
     },
     {
       id: 'm1-q13',
       lessonId: 'fp-1-6',
       question: 'Why is accountability important in AI development?',
       options: [
         'It makes AI faster',
         'It ensures someone is responsible when AI causes harm',
         'It reduces development costs',
         'It eliminates the need for testing'
       ],
       correctIndex: 1,
       explanation: 'Accountability ensures that when AI systems make mistakes or cause harm, there are clear lines of responsibility and mechanisms for redress.',
       difficulty: 'hard'
     },
     
     // Lesson 7: The Future of AI Technology
     {
       id: 'm1-q14',
       lessonId: 'fp-1-7',
       question: 'What is one of the most discussed potential impacts of AI on employment?',
       options: [
         'AI will never affect jobs',
         'AI may automate certain jobs while creating new ones',
         'AI will only affect manufacturing',
         'AI cannot perform any human tasks'
       ],
       correctIndex: 1,
       explanation: 'While AI may automate certain routine tasks, it\'s also expected to create new job categories and augment human capabilities in many fields.',
       difficulty: 'medium'
     },
     {
       id: 'm1-q15',
       lessonId: 'fp-1-7',
       question: 'Which emerging AI trend involves AI systems that can create new content?',
       options: [
         'Generative AI',
         'Defensive AI',
         'Static AI',
         'Analytical AI'
       ],
       correctIndex: 0,
       explanation: 'Generative AI refers to systems like ChatGPT and DALL-E that can create new text, images, code, and other content based on patterns learned from training data.',
       difficulty: 'easy'
     }
   ]
 };
 
 // Helper function to shuffle questions
 export const shuffleQuestions = (questions: QuizQuestion[]): QuizQuestion[] => {
   const shuffled = [...questions];
   for (let i = shuffled.length - 1; i > 0; i--) {
     const j = Math.floor(Math.random() * (i + 1));
     [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
   }
   return shuffled;
 };
 
 // Helper to get questions by difficulty
 export const getQuestionsByDifficulty = (
   questions: QuizQuestion[],
   difficulty: 'easy' | 'medium' | 'hard'
 ): QuizQuestion[] => {
   return questions.filter(q => q.difficulty === difficulty);
 };