
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
  const [values, setValues] = React.useState({
    name: "",
    email: "",
    message: "",
  });
  const [touched, setTouched] = React.useState({
    name: false,
    email: false,
  });
  const [submitted, setSubmitted] = React.useState(false);

  const hasError = {
    name: touched.name && !values.name.trim(),
    email:
      touched.email &&
      (!values.email.trim() ||
        !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,}$/.test(values.email)),
  };

  const isFormValid = !hasError.name && !hasError.email && values.name && values.email;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched((prev) => ({
      ...prev,
      [e.target.name]: true,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true });
    if (!isFormValid) return;
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      toast({
        title: "Request sent!",
        description: "Our team will reach out to you soon regarding pricing.",
      });
      setTimeout(() => {
        setValues({ name: "", email: "", message: "" });
        setTouched({ name: false, email: false });
        setSubmitted(false);
        onOpenChange(false);
      }, 1000);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>Request Pricing</DialogTitle>
          <DialogDescription>
            Fill out the form and our team will contact you with a personalized quote.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 px-6 py-4"
          autoComplete="off"
        >
          <div>
            <Label htmlFor="pricing-name">Your Name</Label>
            <Input
              id="pricing-name"
              name="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={submitting}
              required
              placeholder="Enter your name"
            />
            {hasError.name && (
              <p className="text-xs text-destructive mt-1">Name is required.</p>
            )}
          </div>
          <div>
            <Label htmlFor="pricing-email">Email</Label>
            <Input
              id="pricing-email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={submitting}
              required
              placeholder="you@email.com"
              autoComplete="email"
            />
            {hasError.email && (
              <p className="text-xs text-destructive mt-1">Valid email required.</p>
            )}
          </div>
          <div>
            <Label htmlFor="pricing-message">Message/Notes (optional)</Label>
            <textarea
              id="pricing-message"
              name="message"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
              value={values.message}
              onChange={handleChange}
              disabled={submitting}
              placeholder="Any specific needs or questions?"
            />
          </div>
          <Button
            type="submit"
            disabled={submitting || !isFormValid}
            className="w-full mt-2"
          >
            {submitting ? "Sending..." : "Request Pricing"}
          </Button>
          {submitted && (
            <div className="text-green-600 text-sm text-center mt-2">
              Request sent! Closing...
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
