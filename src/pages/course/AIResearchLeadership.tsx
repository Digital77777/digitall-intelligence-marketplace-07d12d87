import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Clock, Users, Star, Play, CheckCircle, ArrowRight,
  GraduationCap, Target, Trophy, Download, Video, FlaskConical
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AIResearchLeadership = () => {
  const { toast } = useToast();

  const courseModules = [
    {
      id: 1,
      title: "AI Research Methods",
      description: "Master the scientific approach to AI research",
      duration: "4 weeks",
      lessons: 12,
      topics: [
        "Research Philosophy in AI",
        "Formulating Research Questions",
        "Literature Review Mastery",
        "Research Design Principles",
        "Experimental Methodology",
        "Reproducibility Standards",
        "Benchmark Development",
        "Dataset Curation",
        "Statistical Analysis for AI",
        "Ablation Studies Design",
        "Negative Results Value",
        "Project: Research Proposal"
      ]
    },
    {
      id: 2,
      title: "Scientific Thinking",
      description: "Develop rigorous scientific reasoning for AI innovation",
      duration: "3 weeks",
      lessons: 10,
      topics: [
        "Critical Thinking in AI",
        "Hypothesis Generation",
        "Evidence Evaluation",
        "Cognitive Biases in Research",
        "First Principles Thinking",
        "Analogical Reasoning",
        "Systems Thinking",
        "Innovation Methodologies",
        "Problem Reframing",
        "Creative Problem Solving"
      ]
    },
    {
      id: 3,
      title: "Building Research Teams",
      description: "Lead and manage high-performing AI research teams",
      duration: "4 weeks",
      lessons: 12,
      topics: [
        "Research Team Dynamics",
        "Hiring Research Talent",
        "PhD Student Mentorship",
        "Postdoc Management",
        "Research Collaboration",
        "Cross-functional Teams",
        "Remote Research Teams",
        "Conflict Resolution",
        "Performance Evaluation",
        "Career Development Paths",
        "Diversity in Research",
        "Project: Team Building Plan"
      ]
    },
    {
      id: 4,
      title: "Publishing & Communication",
      description: "Share your research effectively with the world",
      duration: "4 weeks",
      lessons: 12,
      topics: [
        "Paper Writing Excellence",
        "Storytelling in Research",
        "Visualization Best Practices",
        "Conference Submission Strategy",
        "Peer Review Navigation",
        "Responding to Reviews",
        "Journal vs Conference Trade-offs",
        "Open Science Practices",
        "Research Blogging",
        "Conference Presentations",
        "Media Communication",
        "Project: Paper Submission"
      ]
    },
    {
      id: 5,
      title: "Lab Culture & Operations",
      description: "Build a thriving research lab environment",
      duration: "3 weeks",
      lessons: 10,
      topics: [
        "Lab Vision and Mission",
        "Research Agenda Setting",
        "Funding and Grants",
        "Industry Partnerships",
        "Equipment and Infrastructure",
        "Knowledge Management",
        "Lab Meetings Best Practices",
        "Celebrating Successes",
        "Handling Failures",
        "Capstone: Lab Blueprint"
      ]
    }
  ];

  const learningOutcomes = [
    "Design and execute rigorous AI research projects",
    "Lead and mentor research teams effectively",
    "Publish in top-tier AI conferences and journals",
    "Build a research lab culture that attracts talent",
    "Secure funding for research initiatives",
    "Navigate academic and industry research careers",
    "Communicate research to diverse audiences",
    "Drive innovation at the frontier of AI"
  ];

  const handleStartCourse = () => {
    toast({
      title: "Course started!",
      description: "Welcome to Pushing the Boundaries. Let's lead AI research!"
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
                  <Badge variant="secondary">Expert Level</Badge>
                  <Badge variant="outline">Free Course</Badge>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold">
                  <span className="bg-gradient-earn bg-clip-text text-transparent">
                    Pushing the Boundaries
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Lead research labs or cutting-edge AI teams. Master research methods,
                  scientific thinking, team leadership, and lab culture.
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
                    <span className="text-sm font-medium">56 lessons</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Total Lessons</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">654</span>
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
                    <FlaskConical className="h-12 w-12 text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Research Leadership Preview</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">What you'll learn:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Research methodology
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Team leadership
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Publishing strategy
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Lab operations
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
                  Complete training for AI research leadership excellence.
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
                  Research Leadership Certificate
                </h3>
                <p className="text-muted-foreground mb-4">
                  Earn certification recognized by top research institutions.
                </p>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Preview Certificate
                  </Button>
                  <Badge variant="secondary">Academic Excellence</Badge>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="instructor" className="space-y-6">
              <Card className="p-6">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-earn flex items-center justify-center text-white text-2xl font-bold">
                    PI
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xl font-semibold">Principal Investigators Team</h3>
                      <p className="text-muted-foreground">Lab Directors & Research Leaders</p>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Learn from professors and lab directors who have built world-renowned
                      AI research groups at top universities and industry labs.
                    </p>
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-lg font-semibold">500+</div>
                        <div className="text-sm text-muted-foreground">Papers Authored</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">100+</div>
                        <div className="text-sm text-muted-foreground">PhDs Mentored</div>
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
                  { name: "Prof. Elena Kowalski", rating: 5, comment: "This course prepared me to lead my own lab. The team management module was invaluable." },
                  { name: "Dr. Raj Patel", rating: 5, comment: "The publishing strategy section helped me get papers accepted at NeurIPS and ICML." },
                  { name: "Dr. Sarah Mitchell", rating: 5, comment: "Comprehensive coverage of what it takes to run a successful research program." }
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

export default AIResearchLeadership;
