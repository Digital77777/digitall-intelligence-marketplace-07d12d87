import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Clock, Users, Star, Play, CheckCircle, ArrowRight,
  GraduationCap, Target, Trophy, Download, Video, Palette
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AIProductDesign = () => {
  const { toast } = useToast();

  const courseModules = [
    {
      id: 1,
      title: "AI UX Design Fundamentals",
      description: "Learn the principles of designing intuitive AI-powered user experiences",
      duration: "3 weeks",
      lessons: 12,
      topics: [
        "Introduction to AI UX Design",
        "Human-Centered Design Principles",
        "Understanding User Mental Models",
        "AI Transparency and Trust",
        "Designing for AI Uncertainty",
        "Feedback Loops in AI Systems",
        "Accessibility in AI Applications",
        "AI Design Patterns Library",
        "Onboarding Users to AI Features",
        "Managing User Expectations",
        "Error Handling and Recovery",
        "Case Studies: Successful AI UX"
      ]
    },
    {
      id: 2,
      title: "Conversational Interface Design",
      description: "Master the art of designing chatbots, voice assistants, and conversational AI",
      duration: "3 weeks",
      lessons: 12,
      topics: [
        "Conversation Design Principles",
        "Personality and Tone of Voice",
        "Dialog Flow Architecture",
        "Natural Language Understanding UX",
        "Handling Ambiguity Gracefully",
        "Multi-turn Conversation Design",
        "Voice Interface Considerations",
        "Chatbot UI Components",
        "Error Recovery Conversations",
        "Escalation to Human Support",
        "Testing Conversational Interfaces",
        "Project: Design a Chatbot Experience"
      ]
    },
    {
      id: 3,
      title: "Visual Design for AI Products",
      description: "Create stunning visual designs that communicate AI capabilities effectively",
      duration: "3 weeks",
      lessons: 10,
      topics: [
        "Visual Language for AI",
        "Data Visualization Principles",
        "Designing AI Dashboards",
        "Animation and Motion in AI UX",
        "Iconography for AI Features",
        "Color Theory for AI Applications",
        "Typography for Clarity",
        "Responsive AI Interfaces",
        "Design Systems for AI Products",
        "Project: Create an AI Product Visual System"
      ]
    },
    {
      id: 4,
      title: "User Research & Testing",
      description: "Validate your AI designs through effective user research and testing methods",
      duration: "3 weeks",
      lessons: 10,
      topics: [
        "Research Methods for AI Products",
        "User Interview Techniques",
        "Prototype Testing Strategies",
        "A/B Testing AI Features",
        "Measuring AI UX Success",
        "Wizard of Oz Testing",
        "Longitudinal Studies for AI",
        "Analyzing User Behavior Data",
        "Iterative Design Process",
        "Project: Conduct User Research"
      ]
    },
    {
      id: 5,
      title: "Human-AI Interaction Patterns",
      description: "Deep dive into advanced interaction patterns between humans and AI systems",
      duration: "2 weeks",
      lessons: 8,
      topics: [
        "Collaborative Intelligence Design",
        "AI as a Partner vs Tool",
        "Proactive AI Assistance",
        "Personalization UX Patterns",
        "Privacy-Respecting Design",
        "Building Long-term Trust",
        "Future of Human-AI Interaction",
        "Capstone: Design a Human-Centered AI Product"
      ]
    }
  ];

  const learningOutcomes = [
    "Design intuitive AI-powered user experiences from scratch",
    "Create conversational interfaces that delight users",
    "Build visual design systems specifically for AI products",
    "Conduct effective user research for AI applications",
    "Apply human-centered design principles to AI development",
    "Handle AI uncertainty and errors gracefully in UX",
    "Create accessible and inclusive AI experiences",
    "Lead AI product design projects confidently"
  ];

  const handleStartCourse = () => {
    toast({
      title: "Course started!",
      description: "Welcome to Designing Human-Centered AI. Let's create amazing AI experiences!"
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
                  <span className="bg-gradient-ai bg-clip-text text-transparent">
                    Designing Human-Centered AI
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Learn to design AI applications and tools that people love using. Master UX principles,
                  conversational interfaces, and human-AI interaction patterns.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">14-18 weeks</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">52 lessons</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Total Lessons</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">1,245</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium">4.8</span>
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
                    <Palette className="h-12 w-12 text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">AI UX Design Preview</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">What you'll learn:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      AI UX design principles
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Conversational interface design
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Visual design for AI products
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Human-AI interaction patterns
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
                  Comprehensive 52-lesson curriculum covering all aspects of human-centered AI design.
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
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Learning Outcomes</h2>
                <p className="text-muted-foreground">
                  By the end of this course, you'll be able to design AI products that users love.
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
                  Receive an AI UX Design certificate upon successful completion of all modules.
                </p>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Preview Certificate
                  </Button>
                  <Badge variant="secondary">Industry Recognized</Badge>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="instructor" className="space-y-6">
              <Card className="p-6">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-ai flex items-center justify-center text-white text-2xl font-bold">
                    UX
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xl font-semibold">AI Design Team</h3>
                      <p className="text-muted-foreground">Expert UX Designers & AI Practitioners</p>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Our team combines deep expertise in UX design with hands-on AI development experience.
                      We've designed AI products used by millions and are passionate about human-centered technology.
                    </p>
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-lg font-semibold">5,000+</div>
                        <div className="text-sm text-muted-foreground">Students Taught</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">12+</div>
                        <div className="text-sm text-muted-foreground">Years Experience</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">4.8/5</div>
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
                    <div className="text-3xl font-bold">4.8</div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className={`h-4 w-4 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-yellow-400'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">1,245 reviews</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {[
                  { name: "Emily Chen", rating: 5, comment: "This course transformed how I think about AI design. The conversational interface module was particularly excellent." },
                  { name: "Marcus Johnson", rating: 5, comment: "Finally, a course that bridges the gap between UX design and AI development. Highly practical!" },
                  { name: "Sofia Rodriguez", rating: 4, comment: "Great content on human-centered design. Would love even more case studies from industry." }
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

export default AIProductDesign;
