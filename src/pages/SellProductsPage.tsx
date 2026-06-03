import { useNavigate } from "react-router-dom";

import { Store, Upload, DollarSign, Users, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const SellProductsPage = () => {
  const navigate = useNavigate();
  const startSelling = () => navigate('/marketplace/create');
  const benefits = [
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "No Listing Fees",
      description: "List unlimited products with zero upfront costs"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Global Audience",
      description: "Reach AI enthusiasts and professionals worldwide"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure Payments",
      description: "Protected transactions with instant payouts"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Easy Setup",
      description: "Launch your store in under 10 minutes"
    }
  ];

  const productTypes = [
    {
      title: "AI Prompt Templates",
      description: "Curated prompt collections for ChatGPT, Claude, and other AI models",
      avgPrice: "$15-50",
      demand: "High"
    },
    {
      title: "AI Models & Datasets",
      description: "Pre-trained models, fine-tuned variations, and quality datasets",
      avgPrice: "$100-500",
      demand: "Very High"
    },
    {
      title: "AI Courses & Tutorials",
      description: "Educational content, video courses, and step-by-step guides",
      avgPrice: "$50-200",
      demand: "High"
    },
    {
      title: "AI Tools & Scripts",
      description: "Automation scripts, browser extensions, and productivity tools",
      avgPrice: "$25-100",
      demand: "Medium"
    },
    {
      title: "Design Assets",
      description: "AI-generated graphics, templates, and creative resources",
      avgPrice: "$10-75",
      demand: "Medium"
    },
    {
      title: "Research & Reports",
      description: "Industry insights, market analysis, and technical documentation",
      avgPrice: "$50-300",
      demand: "Medium"
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Create Your Profile",
      description: "Set up your seller profile with portfolio and credentials"
    },
    {
      number: "2",
      title: "Upload Products",
      description: "Add your AI products with descriptions, images, and pricing"
    },
    {
      number: "3",
      title: "Set Pricing",
      description: "Choose competitive pricing and licensing terms"
    },
    {
      number: "4",
      title: "Start Selling",
      description: "Go live and start earning from your AI creations"
    }
  ];

  const successStories = [
    {
      name: "Alex Chen",
      product: "GPT-4 Marketing Prompts",
      earnings: "$12,400",
      timeframe: "3 months"
    },
    {
      name: "Sarah Johnson",
      product: "Computer Vision Dataset",
      earnings: "$8,900",
      timeframe: "2 months"
    },
    {
      name: "Miguel Rodriguez",
      product: "AI Automation Scripts",
      earnings: "$15,600",
      timeframe: "4 months"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 pt-20 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-success/10 rounded-full">
              <Store className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-success">Sell Products</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-earn bg-clip-text text-transparent">
                Monetize Your AI Creations
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Turn your AI expertise into profit. Sell prompts, models, courses, tools, and more to a global community of AI enthusiasts.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-earn text-white hover:opacity-90"
                onClick={startSelling}
              >
                <Store className="h-5 w-5 mr-2" />
                Start Selling Now
              </Button>
              <Button size="lg" variant="outline">
                View Examples
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Sell With Us?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of AI creators earning passive income from their digital products
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {benefit.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Product Types */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Can You Sell?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore the most popular AI product categories and their earning potential
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productTypes.map((type, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">{type.title}</CardTitle>
                    <Badge variant={type.demand === "Very High" ? "default" : type.demand === "High" ? "secondary" : "outline"}>
                      {type.demand}
                    </Badge>
                  </div>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg. Price Range</span>
                    <span className="font-semibold text-success">{type.avgPrice}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simple steps to start earning from your AI creations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-8 h-0.5 bg-border transform translate-x-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Success Stories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See how our sellers are building successful AI product businesses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {successStories.map((story, index) => (
              <Card key={index} className="border-success/20">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-earn flex items-center justify-center text-white font-bold text-lg">
                    {story.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h3 className="font-semibold mb-1">{story.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{story.product}</p>
                  <div className="text-2xl font-bold text-success mb-1">{story.earnings}</div>
                  <p className="text-xs text-muted-foreground">in {story.timeframe}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Selling?</h2>
            <p className="text-muted-foreground mb-8">
              Join our community of successful AI product sellers and start earning from your expertise today.
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-earn text-white hover:opacity-90"
              onClick={startSelling}
            >
              <Upload className="h-5 w-5 mr-2" />
              Create Your Store
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default SellProductsPage;