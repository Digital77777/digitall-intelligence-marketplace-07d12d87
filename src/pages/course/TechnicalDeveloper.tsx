import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Play, 
  CheckCircle,
  ArrowRight,
  GraduationCap,
  Target,
  Trophy,
  Download,
  Video,
  Code,
  Cpu,
  Brain
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const TechnicalDeveloper = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const courseModules = [
    {
      id: 1,
      title: "Machine Learning Foundations",
      description: "Core ML algorithms, supervised/unsupervised learning, model evaluation and optimization",
      duration: "4 weeks",
      lessons: 12,
      completed: false,
      route: "/course/advanced-technical-ai",
      topics: [
        "Introduction to Machine Learning",
        "Supervised Learning Algorithms",
        "Unsupervised Learning Methods",
        "Model Selection & Validation",
        "Feature Engineering Techniques",
        "Cross-Validation & Hyperparameter Tuning",
        "Ensemble Methods (Random Forest, XGBoost)",
        "Model Evaluation Metrics",
        "Overfitting & Regularization",
        "Scikit-learn Mastery",
        "Real-world ML Pipeline",
        "Project: Predictive Analytics System"
      ]
    },
    {
      id: 2,
      title: "Deep Learning & Neural Networks",
      description: "TensorFlow, PyTorch, CNNs, RNNs, and modern architectures like Transformers",
      duration: "5 weeks",
      lessons: 15,
      completed: false,
      route: "/course/ai-research-leadership",
      topics: [
        "Neural Network Fundamentals",
        "TensorFlow & Keras Setup",
        "Building Your First Neural Network",
        "Backpropagation & Optimization",
        "Convolutional Neural Networks (CNNs)",
        "Image Classification Projects",
        "Recurrent Neural Networks (RNNs)",
        "LSTM & GRU Networks",
        "Attention Mechanisms",
        "Transformer Architecture",
        "Transfer Learning Techniques",
        "PyTorch Fundamentals",
        "Model Deployment Strategies",
        "GPU Computing & Performance",
        "Project: Image Recognition System"
      ]
    },
    {
      id: 3,
      title: "Natural Language Processing",
      description: "Text processing, sentiment analysis, language models, and conversational AI",
      duration: "4 weeks",
      lessons: 12,
      completed: false,
      route: "/course/ai-human-augmentation",
      topics: [
        "Text Preprocessing & Tokenization",
        "Bag of Words & TF-IDF",
        "Word Embeddings (Word2Vec, GloVe)",
        "Named Entity Recognition (NER)",
        "Sentiment Analysis Implementation",
        "Topic Modeling with LDA",
        "Language Model Basics",
        "BERT & Transformer Models",
        "Fine-tuning Pre-trained Models",
        "Chatbot Development",
        "Text Generation Techniques",
        "Project: Intelligent Document Analysis"
      ]
    },
    {
      id: 4,
      title: "Computer Vision",
      description: "Image processing, object detection, facial recognition, and advanced CV techniques",
      duration: "4 weeks",
      lessons: 11,
      completed: false,
      route: "/course/robotics-autonomous",
      topics: [
        "Image Processing Fundamentals",
        "OpenCV Library Mastery",
        "Feature Detection & Matching",
        "Object Detection (YOLO, R-CNN)",
        "Facial Recognition Systems",
        "Image Segmentation Techniques",
        "Optical Character Recognition (OCR)",
        "Real-time Video Processing",
        "Advanced CNN Architectures",
        "GANs for Image Generation",
        "Project: Intelligent Surveillance System"
      ]
    },
    {
      id: 5,
      title: "Model Deployment & MLOps",
      description: "Production deployment, monitoring, CI/CD for ML, and scalable AI systems",
      duration: "3 weeks",
      lessons: 10,
      completed: false,
      route: "/course/ai-global-impact",
      topics: [
        "Model Serialization & Versioning",
        "Docker for ML Applications",
        "Flask & FastAPI for Model APIs",
        "Cloud Deployment (AWS, GCP, Azure)",
        "Model Monitoring & Logging",
        "A/B Testing for ML Models",
        "CI/CD Pipelines for ML",
        "Kubernetes for ML Workloads",
        "Model Performance Monitoring",
        "Project: Production ML System"
      ]
    }
  ];

  const learningOutcomes = [
    "Build and deploy machine learning models from scratch",
    "Develop deep learning applications using TensorFlow and PyTorch",
    "Create NLP systems for text analysis and chatbot development",
    "Implement computer vision solutions for real-world problems",
    "Design and maintain production-ready AI systems",
    "Optimize model performance and handle large-scale data",
    "Apply MLOps best practices for model lifecycle management",
    "Lead technical AI projects and mentor other developers"
  ];

  const handleStartCourse = () => {
    toast({
      title: "Course started!",
      description: "Welcome to Future AI Engineer. Ready to build cutting-edge AI?"
    });
  };

  const handleEnrollNow = () => {
    toast({
      title: "Enrollment successful!",
      description: "You're now enrolled in Future AI Engineer"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 pt-20 pb-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">Intermediate Level</Badge>
                  <Badge variant="outline">Free Course</Badge>
                  <Badge className="bg-gradient-earn text-white">High Demand</Badge>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold">
                  <span className="bg-gradient-earn bg-clip-text text-transparent">
                    Future AI Engineer
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Complete technical development path covering machine learning, deep learning, NLP, and computer vision. 
                  Build production-ready AI systems and launch your career as an AI engineer.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">16-20 weeks</span>
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
                    <span className="text-sm font-medium">1,834</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium">4.7</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button size="lg" onClick={handleStartCourse}>
                  <Play className="h-5 w-5 mr-2" />
                  Start Engineering
                </Button>
                <Button size="lg" variant="outline" onClick={handleEnrollNow}>
                  <Code className="h-5 w-5 mr-2" />
                  Enroll Now
                </Button>
              </div>
            </div>

            {/* Course Preview Card */}
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
                    <Brain className="h-12 w-12 text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Deep Learning in Action</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">You'll master:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Machine Learning algorithms
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Deep neural networks
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      NLP & Computer Vision
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Production deployment
                    </li>
                  </ul>
                </div>
                <div className="p-3 bg-success/10 rounded-lg">
                  <div className="text-sm font-medium text-success mb-1">Career Impact</div>
                  <div className="text-lg font-bold">$80k-150k/year</div>
                  <div className="text-xs text-muted-foreground">AI Engineer salary range</div>
                </div>
                <Button className="w-full" onClick={handleEnrollNow}>
                  Launch Your AI Career
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <Tabs defaultValue="curriculum" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="career">Career Path</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="curriculum" className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Comprehensive Technical Curriculum</h2>
                <p className="text-muted-foreground">
                  60 in-depth lessons covering the complete AI engineering stack. From fundamental algorithms 
                  to production deployment and MLOps.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {courseModules.map((module, index) => (
                  <Card key={module.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-earn flex items-center justify-center text-sm font-medium text-white">
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
                            <Code className="h-4 w-4" />
                            {module.lessons} lessons
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {module.topics.map((topic, topicIndex) => (
                          <div key={topicIndex} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            {topic}
                          </div>
                        ))}
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full md:w-auto"
                        onClick={() => navigate(module.route)}
                      >
                        View Full Course
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Advanced AI Projects</h2>
                <p className="text-muted-foreground">
                  Build portfolio-worthy projects that demonstrate your expertise to employers and clients.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    title: "Intelligent Recommendation Engine",
                    description: "Build a production-ready recommendation system using collaborative filtering and deep learning",
                    tech: ["PyTorch", "Redis", "FastAPI", "Docker"],
                    complexity: "Advanced",
                    duration: "3 weeks"
                  },
                  {
                    title: "Computer Vision Security System", 
                    description: "Real-time object detection and facial recognition system for security applications",
                    tech: ["OpenCV", "YOLO", "TensorFlow", "Flask"],
                    complexity: "Expert",
                    duration: "4 weeks"
                  },
                  {
                    title: "Natural Language Analytics Platform",
                    description: "Comprehensive NLP system for document analysis, sentiment tracking, and insights",
                    tech: ["BERT", "spaCy", "Elasticsearch", "React"],
                    complexity: "Advanced",
                    duration: "3 weeks"
                  },
                  {
                    title: "MLOps Pipeline & Monitoring",
                    description: "Complete ML pipeline with automated training, deployment, and performance monitoring",
                    tech: ["MLflow", "Kubernetes", "Prometheus", "AWS"],
                    complexity: "Expert",
                    duration: "4 weeks"
                  }
                ].map((project, index) => (
                  <Card key={index} className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-lg">{project.title}</h3>
                        <Badge variant={project.complexity === 'Advanced' ? 'default' : 'destructive'}>
                          {project.complexity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Duration:</span>
                          <span className="text-muted-foreground">{project.duration}</span>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium">Tech Stack:</h4>
                          <div className="flex flex-wrap gap-2">
                            {project.tech.map((tech, techIndex) => (
                              <Badge key={techIndex} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        <Cpu className="h-4 w-4 mr-2" />
                        View Project Specs
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="career" className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">AI Engineering Career Path</h2>
                <p className="text-muted-foreground">
                  This course prepares you for high-demand AI engineering roles across industries.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Junior AI Engineer</h3>
                  <div className="text-2xl font-bold text-primary mb-2">$70k-90k</div>
                  <p className="text-sm text-muted-foreground">Entry level positions</p>
                </Card>

                <Card className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <Brain className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="font-semibold mb-2">Senior AI Engineer</h3>
                  <div className="text-2xl font-bold text-success mb-2">$120k-160k</div>
                  <p className="text-sm text-muted-foreground">2-4 years experience</p>
                </Card>

                <Card className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Trophy className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">AI Lead/Architect</h3>
                  <div className="text-2xl font-bold text-accent mb-2">$180k+</div>
                  <p className="text-sm text-muted-foreground">5+ years experience</p>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {learningOutcomes.map((outcome, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-earn flex items-center justify-center mt-0.5">
                        <Target className="h-3 w-3 text-white" />
                      </div>
                      <p className="text-sm">{outcome}</p>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Popular Job Titles After Completion:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  {[
                    "Machine Learning Engineer",
                    "AI Software Engineer", 
                    "Data Scientist",
                    "Deep Learning Engineer",
                    "Computer Vision Engineer",
                    "NLP Engineer",
                    "MLOps Engineer",
                    "AI Research Scientist",
                    "AI Product Manager"
                  ].map((title, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      {title}
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Graduate Success Stories</h2>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">4.7</div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">1,834 reviews</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    name: "Alex Chen",
                    role: "Senior ML Engineer at Google",
                    rating: 5,
                    review: "This course gave me the technical depth I needed to land my dream job at Google. The MLOps section was particularly valuable for production systems."
                  },
                  {
                    name: "Priya Sharma",
                    role: "AI Research Scientist",
                    rating: 5,
                    review: "Comprehensive and challenging. The computer vision projects directly led to my research position. The instructors really know their stuff."
                  },
                  {
                    name: "Marcus Johnson",
                    role: "Founder, AI Startup",
                    rating: 5,
                    review: "Used the knowledge from this course to build and launch my own AI company. The practical projects gave me confidence to tackle real-world problems."
                  }
                ].map((review, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{review.name}</h4>
                        <p className="text-sm text-success">{review.role}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[1,2,3,4,5].map((star) => (
                            <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground italic">"{review.review}"</p>
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

export default TechnicalDeveloper;