import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Award,
  Smartphone,
  MessageCircle,
  FileText,
  Loader2,
  Laptop,
  Wifi,
  Timer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CourseHero } from '@/components/course/CourseHero';
import { EnrollmentCard } from '@/components/course/EnrollmentCard';
import { CurriculumModule } from '@/components/course/CurriculumModule';
import { CourseFAQ } from '@/components/course/CourseFAQ';
import { RelatedPaths } from '@/components/course/RelatedPaths';
import { useCourseEnrollment, useCourseEnrollmentCount } from '@/hooks/useCourseEnrollment';
import { useAuth } from '@/hooks/useAuth';

const COURSE_ID = 'foundation-path';

const FoundationPath = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('curriculum');
  
  const { 
    enrollment, 
    moduleProgress,
    isEnrolled, 
    isLoading, 
    isEnrolling,
    enroll 
  } = useCourseEnrollment(COURSE_ID);
  
  const { data: enrollmentCount = 0 } = useCourseEnrollmentCount(COURSE_ID);

  const courseModules = [
    {
      id: 1,
      title: "Introduction to AI",
      description: "Understanding what AI is and isn't, key concepts, and real-world applications",
      duration: "2 weeks",
      lessons: 8,
      externalUrl: "https://www.elementsofia.com",
      topics: [
        { title: "What is Artificial Intelligence?" },
        { title: "History of AI Development" },
        { title: "Types of AI: Narrow vs General" },
        { title: "AI vs Machine Learning vs Deep Learning" },
        { title: "Current AI Applications" },
        { title: "Ethical Considerations in AI" },
        { title: "Future of AI Technology" },
        { title: "Hands-on: Exploring AI Tools" }
      ]
    },
    {
      id: 2,
      title: "Mathematics for AI",
      description: "Essential math concepts explained simply - statistics, probability, and basic linear algebra",
      duration: "3 weeks",
      lessons: 12,
      externalUrl: "https://www.khanacademy.org/math/linear-algebra",
      topics: [
        { title: "Statistics Made Simple" },
        { title: "Understanding Probability" },
        { title: "Data Distributions" },
        { title: "Correlation vs Causation" },
        { title: "Basic Linear Algebra" },
        { title: "Vectors and Matrices Basics" },
        { title: "Mathematical Thinking" },
        { title: "Practical Math Examples" },
        { title: "Using Math in AI Projects" },
        { title: "Calculator vs Understanding" },
        { title: "Real-world Math Applications" },
        { title: "Practice Problem Solving" }
      ]
    },
    {
      id: 3,
      title: "Python Programming",
      description: "Learn Python from scratch with AI-focused examples and practical projects",
      duration: "4 weeks",
      lessons: 16,
      externalUrl: "https://www.freecodecamp.org/learn/machine-learning-with-python/",
      topics: [
        { title: "Python Installation & Setup" },
        { title: "Variables and Data Types" },
        { title: "Control Flow (If/Else, Loops)" },
        { title: "Functions and Methods" },
        { title: "Working with Lists & Dictionaries" },
        { title: "File Handling Basics" },
        { title: "Introduction to Libraries" },
        { title: "Pandas for Data Analysis" },
        { title: "NumPy for Numerical Computing" },
        { title: "Matplotlib for Visualization" },
        { title: "AI-specific Python Libraries" },
        { title: "Building Your First AI Script" },
        { title: "Error Handling & Debugging" },
        { title: "Code Organization & Best Practices" },
        { title: "Project: Data Analysis Tool" },
        { title: "Project: Simple AI Assistant" }
      ]
    },
    {
      id: 4,
      title: "AI in Industries",
      description: "Explore how AI is transforming different industries and career opportunities",
      duration: "2 weeks",
      lessons: 8,
      externalUrl: "https://www.deeplearning.ai/courses/generative-ai-for-everyone/",
      topics: [
        { title: "AI in Healthcare" },
        { title: "AI in Finance & Banking" },
        { title: "AI in Retail & E-commerce" },
        { title: "AI in Manufacturing" },
        { title: "AI in Education" },
        { title: "AI in Transportation" },
        { title: "AI Career Opportunities" },
        { title: "Building Your AI Portfolio" }
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

  const whatsIncluded = [
    { icon: Award, label: "Certificate of Completion" },
    { icon: FileText, label: "Downloadable Resources" },
    { icon: Target, label: "Hands-on Projects" },
    { icon: MessageCircle, label: "Community Access" },
    { icon: Smartphone, label: "Mobile Access" },
    { icon: Clock, label: "Lifetime Access" }
  ];

  const prerequisites = [
    { icon: Laptop, label: "Computer", description: "Any modern laptop or desktop (Windows, Mac, or Linux)" },
    { icon: Wifi, label: "Internet Connection", description: "Stable internet for streaming video lessons" },
    { icon: Timer, label: "Time Commitment", description: "3-5 hours per week recommended" },
    { icon: BookOpen, label: "Prior Knowledge", description: "None required - designed for complete beginners" }
  ];

  const totalLessons = courseModules.reduce((sum, m) => sum + m.lessons, 0);
  const progressPercent = enrollment?.progress_percent || 0;

  const getModuleProgress = (moduleId: number) => {
    const progress = moduleProgress.find(p => p.module_id === moduleId);
    if (!progress) return 0;
    if (progress.completed_at) return 100;
    return 50; // In progress
  };

  const isModuleCompleted = (moduleId: number) => {
    const progress = moduleProgress.find(p => p.module_id === moduleId);
    return !!progress?.completed_at;
  };

  const handleContinueLearning = () => {
    const currentModule = enrollment?.current_module || 0;
    navigate(`/course/${COURSE_ID}/module/${currentModule + 1}`);
  };

  const handleStartModule = (moduleId: number) => {
    navigate(`/course/${COURSE_ID}/module/${moduleId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="pt-16">
        <CourseHero
          title="AI Basics for Everyone"
          description="Complete foundation covering AI fundamentals, essential mathematics, Python programming, and industry applications. Perfect for absolute beginners who want to understand and work with AI."
          tier="Foundation Path"
          totalLessons={totalLessons}
          duration="8-12 weeks"
          enrolledCount={enrollmentCount}
          rating={4.9}
          isEnrolled={isEnrolled}
          isEnrolling={isEnrolling}
          onEnroll={enroll}
          onContinue={handleContinueLearning}
        />
      </div>

      {/* Trust Badges */}
      <div className="border-y bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {['Beginner Friendly', 'Self-Paced', 'Certificate Included', '24/7 Access', 'Projects Included'].map((badge) => (
              <Badge key={badge} variant="secondary" className="whitespace-nowrap flex-shrink-0">
                <CheckCircle className="w-3 h-3 mr-1.5" />
                {badge}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-4 md:grid-cols-6 h-auto p-1">
                <TabsTrigger value="curriculum" className="text-xs md:text-sm">
                  Curriculum
                </TabsTrigger>
                <TabsTrigger value="outcomes" className="text-xs md:text-sm">
                  Outcomes
                </TabsTrigger>
                <TabsTrigger value="included" className="text-xs md:text-sm">
                  Included
                </TabsTrigger>
                <TabsTrigger value="prerequisites" className="text-xs md:text-sm">
                  Prerequisites
                </TabsTrigger>
                <TabsTrigger value="instructor" className="text-xs md:text-sm hidden md:flex">
                  Instructor
                </TabsTrigger>
                <TabsTrigger value="reviews" className="text-xs md:text-sm hidden md:flex">
                  Reviews
                </TabsTrigger>
              </TabsList>

              {/* Curriculum Tab */}
              <TabsContent value="curriculum" className="space-y-6 mt-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Course Curriculum</h2>
                  <p className="text-muted-foreground">
                    {totalLessons} lessons across 4 comprehensive modules designed for beginners.
                  </p>
                </div>

                <div className="space-y-4">
                  {courseModules.map((module) => (
                    <CurriculumModule
                      key={module.id}
                      moduleNumber={module.id}
                      title={module.title}
                      description={module.description}
                      duration={module.duration}
                      lessonCount={module.lessons}
                      topics={module.topics}
                      externalLink={module.externalUrl}
                      isLocked={!isEnrolled}
                      isCompleted={isModuleCompleted(module.id)}
                      progress={getModuleProgress(module.id)}
                      onStart={() => handleStartModule(module.id)}
                    />
                  ))}
                </div>
              </TabsContent>

              {/* Learning Outcomes Tab */}
              <TabsContent value="outcomes" className="space-y-6 mt-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Learning Outcomes</h2>
                  <p className="text-muted-foreground">
                    What you'll be able to do after completing this course.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {learningOutcomes.map((outcome, index) => (
                    <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Target className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-sm leading-relaxed">{outcome}</p>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Certificate Section */}
                <Card className="p-6 border-dashed border-2">
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="w-16 h-16 rounded-xl bg-gradient-learning flex items-center justify-center flex-shrink-0">
                      <Trophy className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">Certificate of Completion</h3>
                      <p className="text-muted-foreground mb-4">
                        Upon successful completion, receive a digital certificate you can share on LinkedIn or add to your resume.
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Preview Certificate
                        </Button>
                        <Badge variant="secondary">Shareable</Badge>
                        <Badge variant="secondary">Verifiable</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* What's Included Tab */}
              <TabsContent value="included" className="space-y-6 mt-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">What's Included</h2>
                  <p className="text-muted-foreground">
                    Everything you get with this free course.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {whatsIncluded.map((item, index) => (
                    <Card key={index} className="p-5 text-center hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <item.icon className="h-6 w-6 text-primary" />
                      </div>
                      <p className="font-medium">{item.label}</p>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Prerequisites Tab */}
              <TabsContent value="prerequisites" className="space-y-6 mt-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Prerequisites</h2>
                  <p className="text-muted-foreground">
                    What you need before starting this course.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {prerequisites.map((item, index) => (
                    <Card key={index} className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <item.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">{item.label}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Card className="p-5 bg-green-500/10 border-green-500/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <p className="text-sm">
                      <span className="font-medium">Good news!</span> No prior programming or AI experience required. This course starts from the very basics.
                    </p>
                  </div>
                </Card>
              </TabsContent>

              {/* Instructor Tab */}
              <TabsContent value="instructor" className="space-y-6 mt-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Meet Your Instructor</h2>
                </div>

                <Card className="p-6">
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-learning flex items-center justify-center text-primary-foreground text-2xl font-bold flex-shrink-0">
                      AI
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">AI Learning Team</h3>
                      <p className="text-muted-foreground mb-4">Expert AI Educators & Practitioners</p>
                      <p className="text-muted-foreground leading-relaxed mb-6">
                        Our course is designed by a team of AI experts, educators, and industry practitioners 
                        with decades of combined experience in artificial intelligence, machine learning, 
                        and technology education. We've taught thousands of students worldwide and are 
                        passionate about making AI accessible to everyone.
                      </p>
                      <div className="grid grid-cols-3 gap-6 text-center">
                        <div>
                          <div className="text-2xl font-bold">10,000+</div>
                          <div className="text-sm text-muted-foreground">Students Taught</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">15+</div>
                          <div className="text-sm text-muted-foreground">Years Experience</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">4.9/5</div>
                          <div className="text-sm text-muted-foreground">Average Rating</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-6 mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Student Reviews</h2>
                    <p className="text-muted-foreground">What our learners are saying</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      <span className="text-2xl font-bold">4.9</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Based on 847 reviews</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      name: "Sarah M.",
                      rating: 5,
                      date: "2 weeks ago",
                      review: "This course exceeded my expectations! As someone with zero tech background, I was worried about keeping up. The explanations are clear, and the pace is perfect for beginners."
                    },
                    {
                      name: "David K.",
                      rating: 5,
                      date: "1 month ago",
                      review: "Finally, an AI course that doesn't assume you already know everything! The Python section was particularly helpful. I'm now building my own projects."
                    },
                    {
                      name: "Priya S.",
                      rating: 5,
                      date: "1 month ago",
                      review: "The industry applications module opened my eyes to so many career possibilities. I've already started applying for AI-related roles at my company."
                    }
                  ].map((review, index) => (
                    <Card key={index} className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                          {review.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="font-medium">{review.name}</span>
                              <span className="text-muted-foreground text-sm ml-2">{review.date}</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.review}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Button variant="outline" className="w-full">
                  Load More Reviews
                </Button>
              </TabsContent>
            </Tabs>

            {/* FAQ Section */}
            <CourseFAQ />

            {/* Related Paths */}
            <RelatedPaths currentPathId={COURSE_ID} />
          </div>

          {/* Right Sidebar - Enrollment Card (Desktop) */}
          <div className="hidden lg:block">
            <EnrollmentCard
              courseId={COURSE_ID}
              isEnrolled={isEnrolled}
              isEnrolling={isEnrolling}
              progressPercent={progressPercent}
              onEnroll={enroll}
              onContinue={handleContinueLearning}
              totalLessons={totalLessons}
              duration="8-12 weeks"
            />
          </div>
        </div>
      </div>

      {/* Mobile Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-background border-t p-4 z-50">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">AI Basics for Everyone</p>
            <p className="text-sm text-muted-foreground">
              {isEnrolled ? `${progressPercent}% complete` : 'Free • 44 lessons'}
            </p>
          </div>
          {isEnrolled ? (
            <Button variant="ai" onClick={handleContinueLearning}>
              <Play className="w-4 h-4 mr-2" />
              Continue
            </Button>
          ) : (
            <Button 
              variant="ai" 
              onClick={() => user ? enroll() : navigate('/auth')}
              disabled={isEnrolling}
            >
              {isEnrolling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Enroll Free
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Bottom Padding for Mobile Sticky Footer */}
      <div className="h-20 lg:hidden" />
    </div>
  );
};

export default FoundationPath;
