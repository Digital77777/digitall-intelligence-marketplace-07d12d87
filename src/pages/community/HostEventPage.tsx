import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Calendar, Users, Clock, Link, MapPin, 
  Globe, Tag, FileText, Mail, Image, X, Plus, Building2, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCommunity } from "@/hooks/useCommunity";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "EST (Eastern Standard Time)" },
  { value: "America/Chicago", label: "CST (Central Standard Time)" },
  { value: "America/Denver", label: "MST (Mountain Standard Time)" },
  { value: "America/Los_Angeles", label: "PST (Pacific Standard Time)" },
  { value: "Europe/London", label: "GMT (Greenwich Mean Time)" },
  { value: "Europe/Paris", label: "CET (Central European Time)" },
  { value: "Asia/Dubai", label: "GST (Gulf Standard Time)" },
  { value: "Asia/Kolkata", label: "IST (India Standard Time)" },
  { value: "Asia/Shanghai", label: "CST (China Standard Time)" },
  { value: "Asia/Tokyo", label: "JST (Japan Standard Time)" },
  { value: "Australia/Sydney", label: "AEST (Australian Eastern)" },
  { value: "Africa/Johannesburg", label: "SAST (South Africa Standard Time)" },
  { value: "Africa/Lagos", label: "WAT (West Africa Time)" },
];

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Portuguese", "Arabic",
  "Chinese", "Japanese", "Korean", "Hindi", "Russian", "Italian"
];

const HostEventPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createEvent } = useCommunity();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [tagInput, setTagInput] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    date: "",
    time: "",
    duration: "60",
    maxAttendees: "",
    location: "virtual",
    meetingLink: "",
    coverImage: "",
    venueName: "",
    fullAddress: "",
    city: "",
    country: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    tags: [] as string[],
    requirements: "",
    language: "English",
    contactEmail: "",
    isPersonalHost: true,
    hostedBy: ""
  });

  // Pre-fill contact email from user profile
  useEffect(() => {
    const fetchUserEmail = async () => {
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("email")
          .eq("user_id", user.id)
          .single();
        
        if (data?.email) {
          setFormData(prev => ({ ...prev, contactEmail: data.email }));
        }
      }
    };
    fetchUserEmail();
  }, [user]);

  const handleChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file type", description: "Please upload an image file", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Image must be less than 5MB", variant: "destructive" });
      return;
    }

    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `event-covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("community-insights")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("community-insights")
        .getPublicUrl(filePath);

      handleChange("coverImage", data.publicUrl);
      toast({ title: "Image uploaded", description: "Cover image uploaded successfully" });
    } catch (error) {
      toast({ title: "Upload failed", description: "Failed to upload image", variant: "destructive" });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      handleChange("tags", [...formData.tags, tag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleChange("tags", formData.tags.filter(t => t !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!formData.title || !formData.description || !formData.type || !formData.date || !formData.time) {
      toast({ title: "Missing fields", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await createEvent.mutateAsync({
        title: formData.title.trim(),
        description: formData.description.trim(),
        event_type: formData.type,
        event_date: formData.date,
        event_time: formData.time,
        duration_minutes: formData.duration ? parseInt(formData.duration) : 60,
        max_attendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        is_online: formData.location === "virtual" || formData.location === "hybrid",
        meeting_link: formData.meetingLink.trim() || undefined,
        location: formData.location !== "virtual" ? formData.venueName.trim() || undefined : undefined,
        cover_image: formData.coverImage || undefined,
        venue_name: formData.venueName.trim() || undefined,
        full_address: formData.fullAddress.trim() || undefined,
        city: formData.city.trim() || undefined,
        country: formData.country.trim() || undefined,
        timezone: formData.timezone,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        requirements: formData.requirements.trim() || undefined,
        language: formData.language,
        contact_email: formData.contactEmail.trim() || undefined,
        is_personal_host: formData.isPersonalHost,
        hosted_by: formData.isPersonalHost ? undefined : formData.hostedBy.trim() || undefined,
      });
      navigate("/community");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showLocationFields = formData.location === "in-person" || formData.location === "hybrid";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/community")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Community
        </Button>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Host an Event</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Create a workshop, Q&A session, or demo for the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section: Basic Information */}
              <Card className="bg-card/50 border-dashed">
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    Basic Information
                  </h3>
                
                  {/* Cover Image Upload */}
                  <div className="space-y-2">
                    <Label>Cover Image</Label>
                    <div className="border-2 border-dashed border-border rounded-xl p-4 transition-colors hover:border-primary/50">
                      {formData.coverImage ? (
                        <div className="relative aspect-[2/1] overflow-hidden rounded-lg">
                          <img 
                            src={formData.coverImage} 
                            alt="Event cover" 
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8"
                            onClick={() => handleChange("coverImage", "")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center h-32 cursor-pointer">
                          <Image className="w-8 h-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">
                            {isUploadingImage ? "Uploading..." : "Click to upload cover image"}
                          </span>
                          <span className="text-xs text-muted-foreground mt-1">Max 5MB, JPG/PNG • Recommended 2:1 ratio</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                            disabled={isUploadingImage}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., AI Ethics Workshop"
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      maxLength={150}
                      className="h-11"
                    />
                    <div className="flex justify-end">
                      <span className="text-xs text-muted-foreground">{formData.title.length}/150</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <div className="relative">
                      <Textarea
                        id="description"
                        placeholder="Describe what attendees will learn or experience..."
                        value={formData.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        rows={5}
                        maxLength={2000}
                        className="resize-none pb-6"
                      />
                      <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
                        {formData.description.length}/2000
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Section: Host Information */}
              <Card className="bg-card/50 border-dashed">
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    Host Information
                  </h3>

                  <div className="space-y-4">
                    <Label>Who is hosting this event?</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 min-h-[80px] ${
                          formData.isPersonalHost 
                            ? "border-primary bg-primary/5 shadow-sm" 
                            : "border-border hover:border-muted-foreground hover:bg-muted/30"
                        }`}
                        onClick={() => handleChange("isPersonalHost", true as unknown as string)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-full transition-colors ${formData.isPersonalHost ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium">I'm hosting personally</p>
                            <p className="text-sm text-muted-foreground">As an individual</p>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 min-h-[80px] ${
                          !formData.isPersonalHost 
                            ? "border-primary bg-primary/5 shadow-sm" 
                            : "border-border hover:border-muted-foreground hover:bg-muted/30"
                        }`}
                        onClick={() => handleChange("isPersonalHost", false as unknown as string)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-full transition-colors ${!formData.isPersonalHost ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium">Organization hosting</p>
                            <p className="text-sm text-muted-foreground">Company or group</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {!formData.isPersonalHost && (
                      <div className="space-y-2">
                        <Label htmlFor="hostedBy">Organization Name *</Label>
                        <Input
                          id="hostedBy"
                          placeholder="e.g., TechCorp, AI Community Group, University..."
                          value={formData.hostedBy}
                          onChange={(e) => handleChange("hostedBy", e.target.value)}
                          maxLength={100}
                          className="h-11"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Section: Event Details */}
              <Card className="bg-card/50 border-dashed">
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Tag className="w-5 h-5 text-primary" />
                    </div>
                    Event Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Event Type *</Label>
                      <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                        <SelectTrigger id="type" className="h-11">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="workshop">Workshop</SelectItem>
                          <SelectItem value="qa">Q&A Session</SelectItem>
                          <SelectItem value="demo">Demo</SelectItem>
                          <SelectItem value="webinar">Webinar</SelectItem>
                          <SelectItem value="networking">Networking</SelectItem>
                          <SelectItem value="hackathon">Hackathon</SelectItem>
                          <SelectItem value="meetup">Meetup</SelectItem>
                          <SelectItem value="conference">Conference</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select value={formData.language} onValueChange={(value) => handleChange("language", value)}>
                        <SelectTrigger id="language" className="h-11">
                          <Globe className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map(lang => (
                            <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label>Tags (up to 5)</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag (e.g., AI, Beginners)"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleTagKeyPress}
                        maxLength={30}
                        className="h-11"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleAddTag}
                        disabled={formData.tags.length >= 5}
                        className="h-11 px-4"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="gap-1 py-1 px-3">
                            {tag}
                            <X 
                              className="w-3 h-3 cursor-pointer hover:text-destructive transition-colors" 
                              onClick={() => handleRemoveTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">Prerequisites / Requirements</Label>
                    <div className="relative">
                      <Textarea
                        id="requirements"
                        placeholder="e.g., Laptop with Python installed, basic understanding of machine learning..."
                        value={formData.requirements}
                        onChange={(e) => handleChange("requirements", e.target.value)}
                        rows={3}
                        maxLength={500}
                        className="resize-none pb-6"
                      />
                      <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
                        {formData.requirements.length}/500
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      What should attendees bring or know beforehand?
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Section: Date & Time */}
              <Card className="bg-card/50 border-dashed">
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    Date & Time
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="date"
                          type="date"
                          className="pl-10 h-11"
                          value={formData.date}
                          onChange={(e) => handleChange("date", e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">Time *</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="time"
                          type="time"
                          className="pl-10 h-11"
                          value={formData.time}
                          onChange={(e) => handleChange("time", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Select value={formData.duration} onValueChange={(value) => handleChange("duration", value)}>
                        <SelectTrigger id="duration" className="h-11">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="90">1.5 hours</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                          <SelectItem value="180">3 hours</SelectItem>
                          <SelectItem value="240">4 hours</SelectItem>
                          <SelectItem value="480">Full day (8 hours)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={formData.timezone} onValueChange={(value) => handleChange("timezone", value)}>
                        <SelectTrigger id="timezone" className="h-11">
                          <Globe className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIMEZONES.map(tz => (
                            <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Section: Location */}
              <Card className="bg-card/50 border-dashed">
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    Location
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="location">Event Format</Label>
                    <Select value={formData.location} onValueChange={(value) => handleChange("location", value)}>
                      <SelectTrigger id="location" className="h-11">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="virtual">Virtual (Online Only)</SelectItem>
                        <SelectItem value="in-person">In-Person</SelectItem>
                        <SelectItem value="hybrid">Hybrid (In-Person + Online)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {showLocationFields && (
                    <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            placeholder="e.g., San Francisco"
                            value={formData.city}
                            onChange={(e) => handleChange("city", e.target.value)}
                            maxLength={100}
                            className="h-11"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="country">Country *</Label>
                          <Input
                            id="country"
                            placeholder="e.g., United States"
                            value={formData.country}
                            onChange={(e) => handleChange("country", e.target.value)}
                            maxLength={100}
                            className="h-11"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="venueName">Venue Name</Label>
                        <Input
                          id="venueName"
                          placeholder="e.g., Tech Hub Conference Center"
                          value={formData.venueName}
                          onChange={(e) => handleChange("venueName", e.target.value)}
                          maxLength={100}
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fullAddress">Full Address</Label>
                        <Textarea
                          id="fullAddress"
                          placeholder="e.g., 123 Innovation Street, Tech District"
                          value={formData.fullAddress}
                          onChange={(e) => handleChange("fullAddress", e.target.value)}
                          rows={2}
                          maxLength={300}
                          className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                          Street address for navigation
                        </p>
                      </div>
                    </div>
                  )}

                  {(formData.location === "virtual" || formData.location === "hybrid") && (
                    <div className="space-y-2">
                      <Label htmlFor="meetingLink">Meeting Link</Label>
                      <div className="relative">
                        <Link className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="meetingLink"
                          type="url"
                          placeholder="https://zoom.us/j/..."
                          className="pl-10 h-11"
                          value={formData.meetingLink}
                          onChange={(e) => handleChange("meetingLink", e.target.value)}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Zoom, Google Meet, Microsoft Teams, or other platform
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Section: Capacity & Contact */}
              <Card className="bg-card/50 border-dashed">
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    Capacity & Contact
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxAttendees">Max Attendees</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="maxAttendees"
                          type="number"
                          placeholder="e.g., 100 (leave empty for unlimited)"
                          className="pl-10 h-11"
                          value={formData.maxAttendees}
                          onChange={(e) => handleChange("maxAttendees", e.target.value)}
                          min={1}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="contactEmail"
                          type="email"
                          placeholder="your@email.com"
                          className="pl-10 h-11"
                          value={formData.contactEmail}
                          onChange={(e) => handleChange("contactEmail", e.target.value)}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        For attendees to reach out with questions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto bg-gradient-ai text-white min-h-[48px]" 
                  disabled={isSubmitting || isUploadingImage}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Creating..." : "Create Event"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/community")}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto min-h-[48px]"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HostEventPage;