import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Trophy } from "lucide-react";
import { useCreateSuccessStory, SuccessStoryType } from "@/hooks/useSuccessStories";

const types: { value: SuccessStoryType; label: string }[] = [
  { value: "job_secured", label: "Got a job" },
  { value: "freelance_gig", label: "Won a freelance gig" },
  { value: "business_launched", label: "Launched a business" },
  { value: "certification_earned", label: "Earned a certification" },
  { value: "revenue_milestone", label: "Hit a revenue milestone" },
];

export const ShareWinDialog = ({
  trigger,
}: {
  trigger?: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<SuccessStoryType>("job_secured");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [amount, setAmount] = useState("");
  const create = useCreateSuccessStory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({
      type,
      title: title.trim(),
      body: body.trim() || undefined,
      amount: amount ? Number(amount) : undefined,
    });
    setOpen(false);
    setTitle(""); setBody(""); setAmount("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-1.5">
            <Trophy className="w-4 h-4" /> Share a win
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share your win</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as SuccessStoryType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {types.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Headline</Label>
            <Input
              required
              maxLength={140}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What did you achieve?"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Story (optional)</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share the details to motivate others…"
              rows={4}
              maxLength={1000}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Amount (optional)</Label>
            <Input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 2500"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!title || create.isPending}>
              {create.isPending ? "Sharing…" : "Share win"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
