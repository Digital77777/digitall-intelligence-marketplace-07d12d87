import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const submissionSchema = z.object({
  projectUrl: z.string().url({ message: "Please enter a valid URL" }),
  notes: z.string().max(1000, "Notes must be under 1000 characters").optional(),
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

interface ChallengeSubmissionFormProps {
  challengeId: number;
  challengeTitle: string;
}

export const ChallengeSubmissionForm = ({ challengeId, challengeTitle }: ChallengeSubmissionFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const form = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      projectUrl: "",
      notes: "",
    },
  });

  const onSubmit = async (data: SubmissionFormData) => {
    if (!user) {
      toast.error("Please sign in to submit your challenge");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("challenge_submissions").insert({
        user_id: user.id,
        challenge_id: challengeId,
        project_url: data.projectUrl,
        notes: data.notes || null,
      });

      if (error) throw error;

      setHasSubmitted(true);
      toast.success("Challenge submitted successfully!");
      form.reset();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit challenge");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasSubmitted) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Submission Received!</h3>
            <p className="text-muted-foreground text-sm">
              Your challenge submission is under review. You'll be notified once it's been reviewed.
            </p>
            <Button variant="outline" onClick={() => setHasSubmitted(false)} className="mt-2">
              Submit Another
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          Submit Your Challenge
        </CardTitle>
        <CardDescription>
          Completed "{challengeTitle}"? Submit your project for review
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="projectUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project URL *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://your-project-url.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about your submission, challenges faced, or features implemented..."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Challenge
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
