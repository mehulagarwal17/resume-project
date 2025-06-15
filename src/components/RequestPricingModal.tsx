
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

type RequestPricingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const RequestPricingModal: React.FC<RequestPricingModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState("");

  const hasError =
    touched &&
    (!email.trim() ||
      !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,}$/.test(email));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setError("");
    if (hasError) return;

    setSubmitting(true);
    try {
      // Call Supabase Edge Function to send PDF
      const res = await fetch(
        "https://nghmvumdtbijhhhksfrn.supabase.co/functions/v1/send-pricing-pdf",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        toast({
          title: "Pricing sent!",
          description: "A custom pricing PDF has been emailed to you.",
        });
        setTimeout(() => {
          setEmail("");
          setTouched(false);
          setSubmitted(false);
          onOpenChange(false);
        }, 2000);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send email.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>Request Pricing</DialogTitle>
          <DialogDescription>
            Enter your email to instantly receive a PDF with your custom pricing quote.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 px-6 py-4"
          autoComplete="off"
        >
          <div>
            <Label htmlFor="pricing-email">Email</Label>
            <Input
              id="pricing-email"
              name="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onBlur={() => setTouched(true)}
              disabled={submitting || submitted}
              required
              placeholder="you@email.com"
              autoComplete="email"
            />
            {hasError && (
              <p className="text-xs text-destructive mt-1">Valid email required.</p>
            )}
            {error && (
              <p className="text-xs text-destructive mt-1">{error}</p>
            )}
          </div>
          <Button
            type="submit"
            disabled={submitting || !email || hasError || submitted}
            className="w-full mt-2"
          >
            {submitting ? "Sending..." : "Request Pricing"}
          </Button>
          {submitted && (
            <div className="text-green-600 text-sm text-center mt-2">
              Success! Your pricing PDF has been emailed.
            </div>
          )}
        </form>
        <DialogClose asChild>
          <button
            className="absolute right-4 top-4 rounded-full p-1 hover:bg-gray-200 transition"
            aria-label="Close"
            disabled={submitting}
            type="button"
          >
            ×
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default RequestPricingModal;
