import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Sparkles, MessageCircle, Zap, Shield, Crown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SEOHead } from "@/components/SEOHead";

const WHATSAPP_LINK = "https://chat.whatsapp.com/CwA3peVDQ8i5FOJaouHBvU?mode=gi_t";
const MAX_MEMBERS = 150;
const CURRENT_MEMBERS = 110; // Update this as members join
const SPOTS_REMAINING = MAX_MEMBERS - CURRENT_MEMBERS;
const PROGRESS_PERCENTAGE = (CURRENT_MEMBERS / MAX_MEMBERS) * 100;

const benefits = [
  {
    icon: MessageCircle,
    title: "Real-Time Discussions",
    description: "Get instant answers and engage in live conversations with AI enthusiasts worldwide."
  },
  {
    icon: Zap,
    title: "Exclusive Resources",
    description: "Access tips, tools, tutorials, and platform updates before anyone else."
  },
  {
    icon: Users,
    title: "Network & Grow",
    description: "Connect with industry professionals, learners, and AI practitioners."
  }
];

const WhatsAppCommunityPage = () => {
  const navigate = useNavigate();

  const handleJoinCommunity = () => {
    window.open(WHATSAPP_LINK, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Join Our Private AI Community" 
        description="Connect with fellow AI enthusiasts in our exclusive private WhatsApp community. Limited to the first 150 members." 
        keywords={["AI community", "WhatsApp group", "AI networking", "AI enthusiasts", "private community"]} 
      />

      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-12 sm:py-20">
        {/* Floating Orbs for Visual Interest */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 sm:w-64 sm:h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-40 h-40 sm:w-80 sm:h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-96 sm:h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          {/* Back Navigation */}
          <Button 
            variant="ghost" 
            onClick={() => navigate("/community")}
            className="mb-6 sm:mb-8 hover:bg-background/50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Community
          </Button>

          <div className="text-center max-w-3xl mx-auto">
            {/* Exclusive Badge */}
            <Badge 
              variant="secondary" 
              className="mb-4 sm:mb-6 px-4 py-1.5 text-sm font-medium bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30"
            >
              <Crown className="w-4 h-4 mr-2 text-primary" />
              Exclusive Private Community
            </Badge>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-ai bg-clip-text text-transparent leading-tight">
              Join Our Private AI Community
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed px-2">
              Connect with fellow AI enthusiasts in our exclusive private WhatsApp group. 
              Share insights, get support, and grow together.
            </p>

            {/* Urgency Banner */}
            <Card className="mb-8 sm:mb-10 border-primary/20 bg-background/80 backdrop-blur-sm max-w-md mx-auto">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  <span className="font-semibold text-foreground">Limited to First {MAX_MEMBERS} Members</span>
                </div>
                <Progress value={PROGRESS_PERCENTAGE} className="h-3 mb-3" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{PROGRESS_PERCENTAGE.toFixed(0)}% full</span>
                  <span className="font-medium text-primary">
                    Only {SPOTS_REMAINING} spots remaining!
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
            Why Join Our Community?
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card 
                  key={index} 
                  className="group border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 bg-card"
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-foreground">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-t from-primary/5 to-transparent">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto">
            {/* WhatsApp Button */}
            <Button 
              size="lg" 
              onClick={handleJoinCommunity}
              className="w-full sm:w-auto min-h-[56px] px-8 text-lg font-semibold bg-[#25D366] hover:bg-[#20BD5A] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <svg 
                viewBox="0 0 24 24" 
                className="w-6 h-6 mr-3 fill-current"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Join WhatsApp Community
              <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
            </Button>

            {/* Trust Elements */}
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-primary" />
                <span>Your privacy is protected</span>
              </div>
              <p className="text-xs text-muted-foreground max-w-sm">
                Community guidelines ensure a safe, respectful environment for all members. 
                You can leave anytime.
              </p>
            </div>

            {/* Secondary Back Link */}
            <div className="mt-10">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/community")}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Community
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhatsAppCommunityPage;
