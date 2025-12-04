import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Clock, Users, Star, Play, CheckCircle, ArrowRight,
  GraduationCap, Target, Trophy, Download, Video, Cpu
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdvancedTechnicalAI = () => {
  const { toast } = useToast();

  const courseModules = [
    {
      id: 1,
      title: "Advanced Machine Learning",
      description: "Deep dive into sophisticated ML algorithms and architectures",
      duration: "4 weeks",
      lessons: 14,
      topics: [
        "Advanced Optimization Techniques",
        "Gradient Descent Variants",
        "Regularization Methods",
        "Ensemble Methods Deep Dive",
        "Boosting Algorithms (XGBoost, LightGBM)",
        "Bayesian Machine Learning",
        "Kernel Methods Advanced",
        "Feature Engineering at Scale",
        "AutoML Frameworks",
        "Model Selection Strategies",
        "Hyperparameter Optimization",
        "Cross-Validation Techniques",
        "Model Interpretability",
        "Project: Advanced ML Pipeline"
      ]
    },
    {
      id: 2,
      title: "Reinforcement Learning",
      description: "Master RL algorithms from basics to state-of-the-art",
      duration: "4 weeks",
      lessons: 12,
      topics: [
        "RL Foundations Refresher",
        "Markov Decision Processes",
        "Value-Based Methods",
        "Policy Gradient Methods",
        "Actor-Critic Algorithms",
        "Deep Q-Networks (DQN)",
        "Proximal Policy Optimization (PPO)",
        "Multi-Agent RL",
        "Hierarchical RL",
        "Inverse Reinforcement Learning",
        "RL in Production",
        "Project: RL Agent Development"
      ]
    },
    {
      id: 3,
      title: "Large Language Models",
      description: "Understand and work with transformer architectures and LLMs",
      duration: "4 weeks",
      lessons: 14,
      topics: [
        "Transformer Architecture Deep Dive",
        "Attention Mechanisms Explained",
        "Pre-training Objectives",
        "Fine-tuning Strategies",
        "Prompt Engineering Advanced",
        "Parameter-Efficient Fine-tuning",
        "LoRA and Adapters",
        "Instruction Tuning",
        "RLHF Implementation",
        "Evaluation Metrics for LLMs",
        "Efficient Inference",
        "LLM Deployment Strategies",
        "Retrieval-Augmented Generation",
        "Project: Custom LLM Application"
      ]
    },
    {
      id: 4,
      title: "Multimodal AI",
      description: "Build AI systems that understand multiple data modalities",
      duration: "3 weeks",
      lessons: 10,
      topics: [
        "Multimodal Learning Fundamentals",
        "Vision-Language Models",
        "CLIP and ALIGN",
        "Text-to-Image Generation",
        "Diffusion Models",
        "Audio-Visual Learning",
        "Cross-Modal Retrieval",
        "Multimodal Fusion Techniques",
        "Video Understanding",
        "Project: Multimodal AI System"
      ]
    },
    {
      id: 5,
      title: "Research Methods",
      description: "Conduct and publish AI research effectively",
      duration: "3 weeks",
      lessons: 10,
      topics: [
        "Research Methodology",
        "Literature Review Process",
        "Hypothesis Formulation",
        "Experiment Design",
        "Statistical Significance",
        "Ablation Studies",
        "Paper Writing for AI",
        "Peer Review Process",
        "Conference Submissions",
        "Capstone: Research Project"
      ]
    }
  ];

  const learningOutcomes = [
    "Implement advanced ML algorithms from scratch",
    "Build and train reinforcement learning agents",
    "Fine-tune and deploy large language models",
    "Create multimodal AI applications",
    "Conduct rigorous AI research",
    "Publish in top AI conferences",
    "Lead technical AI projects",
    "Contribute to cutting-edge AI development"
  ];

  const handleStartCourse = () => {
    toast({
      title: "Course started!",
      description: "Welcome to AI Research & Innovation. Let's push the boundaries!"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 pt-20 pb-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">Advanced Level</Badge>
                  <Badge variant="outline">Free Course</Badge>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold">
                  <span className="bg-gradient-earn bg-clip-text text-transparent">
                    AI Research & Innovation
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Go beyond using tools into AI research and innovation. Master advanced ML,
                  reinforcement learning, LLMs, and cutting-edge research methods.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">18-22 weeks</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">60 lessons</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Total Lessons</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">876</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium">4.9</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="h-9 px-4 text-sm md:h-11 md:px-8 md:text-base" onClick={handleStartCourse}>
                  <Play className="h-4 w-4 mr-1.5 md:h-5 md:w-5 md:mr-2" />
                  Start Learning Free
                </Button>
                <Button className="h-9 px-4 text-sm md:h-11 md:px-8 md:text-base" variant="outline" onClick={handleStartCourse}>
                  <GraduationCap className="h-4 w-4 mr-1.5 md:h-5 md:w-5 md:mr-2" />
                  Enroll Now
                </Button>
              </div>
            </div>

            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Course Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Cpu className="h-12 w-12 text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Research AI Preview</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">What you'll learn:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Advanced ML algorithms
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Reinforcement learning
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Large language models
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      AI research methods
                    </li>
                  </ul>
                </div>
                <Button className="w-full" onClick={handleStartCourse}>
                  Enroll for Free
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6">
          <Tabs defaultValue="curriculum" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="curriculum">
                <BookOpen className="h-4 w-4 md:hidden" />
                <span className="hidden md:inline">Curriculum</span>
              </TabsTrigger>
              <TabsTrigger value="outcomes">
                <Target className="h-4 w-4 md:hidden" />
                <span className="hidden md:inline">Learning Outcomes</span>
              </TabsTrigger>
              <TabsTrigger value="instructor">
                <GraduationCap className="h-4 w-4 md:hidden" />
                <span className="hidden md:inline">Instructor</span>
              </TabsTrigger>
              <TabsTrigger value="reviews">
                <Star className="h-4 w-4 md:hidden" />
                <span className="hidden md:inline">Reviews</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="curriculum" className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Course Curriculum</h2>
                <p className="text-muted-foreground">
                  Cutting-edge AI research curriculum designed for future innovators.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {courseModules.map((module, index) => (
                  <Card key={module.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{module.title}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {module.duration}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            {module.lessons} lessons
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {module.topics.map((topic, topicIndex) => (
                          <div key={topicIndex} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            {topic}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="outcomes" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {learningOutcomes.map((outcome, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                        <Target className="h-3 w-3 text-primary" />
                      </div>
                      <p className="text-sm">{outcome}</p>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  AI Research Certificate
                </h3>
                <p className="text-muted-foreground mb-4">
                  Earn an advanced certification recognized by research institutions.
                </p>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Preview Certificate
                  </Button>
                  <Badge variant="secondary">Research Grade</Badge>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="instructor" className="space-y-6">
              <Card className="p-6">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-earn flex items-center justify-center text-white text-2xl font-bold">
                    RL
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xl font-semibold">Research Lab Team</h3>
                      <p className="text-muted-foreground">AI Researchers & Scientists</p>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Learn from researchers who have published at NeurIPS, ICML, and ICLR.
                      Our team includes PhD-level experts from leading AI labs.
                    </p>
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-lg font-semibold">200+</div>
                        <div className="text-sm text-muted-foreground">Papers Published</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">25+</div>
                        <div className="text-sm text-muted-foreground">Years Research</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">4.9/5</div>
                        <div className="text-sm text-muted-foreground">Avg Rating</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <div className="grid gap-4">
                {[
                  { name: "Dr. Wei Zhang", rating: 5, comment: "The LLM module is the most comprehensive I've seen. I published my first paper after completing this course." },
                  { name: "Natasha Volkov", rating: 5, comment: "The RL section gave me the foundation to work on cutting-edge robotics research." },
                  { name: "Chris Martinez", rating: 5, comment: "World-class content. The research methods module transformed how I approach AI problems." }
                ].map((review, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-medium">
                        {review.name.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.name}</span>
                          <div className="flex">
                            {[1,2,3,4,5].map((star) => (
                              <Star key={star} className={`h-3 w-3 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default AdvancedTechnicalAI;
