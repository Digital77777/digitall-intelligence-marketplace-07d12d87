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
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const FoundationPath = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const courseModules = [
    {
      id: 1,
      title: "Introduction to AI",
      description: "Understanding what AI is and isn't, key concepts, and real-world applications",
      duration: "2 weeks",
      lessons: 8,
      completed: false,
      externalUrl: "https://www.elementsofia.com",
      topics: [
        "What is Artificial Intelligence?",
        "History of AI Development", 
        "Types of AI: Narrow vs General",
        "AI vs Machine Learning vs Deep Learning",
        "Current AI Applications",
        "Ethical Considerations in AI",
        "Future of AI Technology",
        "Hands-on: Exploring AI Tools"
      ]
    },
    {
      id: 2, 
      title: "Mathematics for AI",
      description: "Essential math concepts explained simply - statistics, probability, and basic linear algebra",
      duration: "3 weeks",
      lessons: 12,
      completed: false,
      externalUrl: "https://www.khanacademy.org/math/linear-algebra",
      topics: [
        "Statistics Made Simple",
        "Understanding Probability", 
        "Data Distributions",
        "Correlation vs Causation",
        "Basic Linear Algebra",
        "Vectors and Matrices Basics",
        "Mathematical Thinking",
        "Practical Math Examples",
        "Using Math in AI Projects",
        "Calculator vs Understanding",
        "Real-world Math Applications",
        "Practice Problem Solving"
      ]
    },
    {
      id: 3,
      title: "Python Programming",
      description: "Learn Python from scratch with AI-focused examples and practical projects",
      duration: "4 weeks", 
      lessons: 16,
      completed: false,
      externalUrl: "https://www.freecodecamp.org/learn/machine-learning-with-python/",
      topics: [
        "Python Installation & Setup",
        "Variables and Data Types",
        "Control Flow (If/Else, Loops)",
        "Functions and Methods",
        "Working with Lists & Dictionaries",
        "File Handling Basics",
        "Introduction to Libraries",
        "Pandas for Data Analysis",
        "NumPy for Numerical Computing", 
        "Matplotlib for Visualization",
        "AI-specific Python Libraries",
        "Building Your First AI Script",
        "Error Handling & Debugging",
        "Code Organization & Best Practices",
        "Project: Data Analysis Tool",
        "Project: Simple AI Assistant"
      ]
    },
    {
      id: 4,
      title: "AI in Industries", 
      description: "Explore how AI is transforming different industries and career opportunities",
      duration: "2 weeks",
      lessons: 8,
      completed: false,
      externalUrl: "https://www.deeplearning.ai/courses/generative-ai-for-everyone/",
      topics: [
        "AI in Healthcare",
        "AI in Finance & Banking",
        "AI in Retail & E-commerce", 
        "AI in Manufacturing",
        "AI in Education",
        "AI in Transportation",
        "AI Career Opportunities",
        "Building Your AI Portfolio"
      ]
    }
  ];

  const learningOutcomes = [
    "Understand fundamental AI concepts and terminology",
    "Apply basic mathematics needed for AI understanding", 
    "Program confidently in Python for AI applications",
    "Recognize AI opportunities across different industries",
    "Build simple AI-powered projects",
    "Make informed decisions about AI adoption",
    "Communicate effectively about AI technologies",
    "Continue learning advanced AI concepts independently"
  ];

  const handleStartCourse = () => {
    toast({
      title: "Course started!",
      description: "Welcome to AI Basics for Everyone. Let's begin your journey!"
    });
  };

  const handleEnrollNow = () => {
    toast({
      title: "Enrollment successful!",
      description: "You're now enrolled in AI Basics for Everyone"
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
                  <Badge variant="secondary">Beginner Level</Badge>
                  <Badge variant="outline">Free Course</Badge>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold">
                  <span className="bg-gradient-learning bg-clip-text text-transparent">
                    AI Basics for Everyone
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Complete foundation covering AI fundamentals, essential mathematics, Python programming, 
                  and industry applications. Perfect for absolute beginners who want to understand and work with AI.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">8-12 weeks</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">44 lessons</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Total Lessons</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">3,241</span>
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
                <Button className="h-9 px-4 text-sm md:h-11 md:px-8 md:text-base" variant="outline" onClick={handleEnrollNow}>
                  <GraduationCap className="h-4 w-4 mr-1.5 md:h-5 md:w-5 md:mr-2" />
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
                    <Play className="h-12 w-12 text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Introduction Video</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">What you'll learn:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      AI fundamentals & terminology
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Essential math for AI
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Python programming basics
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Industry applications
                    </li>
                  </ul>
                </div>
                <Button className="w-full" onClick={handleEnrollNow}>
                  Enroll for Free
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
                  Comprehensive 44-lesson curriculum designed to take you from complete beginner to confident AI practitioner.
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
                        onClick={() => window.open(module.externalUrl, '_blank', 'noopener,noreferrer')}
                      >
                        View Full Course
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="outcomes" className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Learning Outcomes</h2>
                <p className="text-muted-foreground">
                  By the end of this course, you'll have the knowledge and skills to confidently work with AI technologies.
                </p>
              </div>

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
                  Certificate of Completion
                </h3>
                <p className="text-muted-foreground mb-4">
                  Upon successful completion of all modules and assessments, you'll receive a certificate 
                  that you can add to your LinkedIn profile and resume.
                </p>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Preview Certificate
                  </Button>
                  <Badge variant="secondary">Accredited Course</Badge>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="instructor" className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Meet Your Instructor</h2>
              </div>

              <Card className="p-6">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-learning flex items-center justify-center text-white text-2xl font-bold">
                    AI
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xl font-semibold">AI Learning Team</h3>
                      <p className="text-muted-foreground">Expert AI Educators & Practitioners</p>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Our course is designed by a team of AI experts, educators, and industry practitioners 
                      with decades of combined experience in artificial intelligence, machine learning, 
                      and technology education. We've taught thousands of students worldwide and are 
                      passionate about making AI accessible to everyone.
                    </p>
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-lg font-semibold">10,000+</div>
                        <div className="text-sm text-muted-foreground">Students Taught</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">15+</div>
                        <div className="text-sm text-muted-foreground">Years Experience</div>
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
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Student Reviews</h2>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">4.9</div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">3,241 reviews</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5,4,3,2,1].map((rating) => (
                      <div key={rating} className="flex items-center gap-3">
                        <span className="text-sm w-4">{rating}</span>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Progress value={rating === 5 ? 85 : rating === 4 ? 12 : 2} className="flex-1" />
                        <span className="text-sm text-muted-foreground w-8">
                          {rating === 5 ? '85%' : rating === 4 ? '12%' : '2%'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    name: "Sarah Chen",
                    rating: 5,
                    date: "2 weeks ago",
                    review: "Excellent course! I went from knowing nothing about AI to building my first projects. The explanations are clear and the Python section was especially helpful."
                  },
                  {
                    name: "Mike Rodriguez", 
                    rating: 5,
                    date: "1 month ago",
                    review: "Perfect for beginners. The math section made concepts I thought were impossible to understand actually click. Highly recommended!"
                  },
                  {
                    name: "Emily Johnson",
                    rating: 5,
                    date: "3 weeks ago", 
                    review: "I'm now confident talking about AI at work and even started a small AI project for my team. This course gave me exactly what I needed."
                  }
                ].map((review, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{review.name}</h4>
                        <div className="flex items-center gap-1 mt-1">
                          {[1,2,3,4,5].map((star) => (
                            <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>
                    <p className="text-muted-foreground">{review.review}</p>
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

export default FoundationPath;