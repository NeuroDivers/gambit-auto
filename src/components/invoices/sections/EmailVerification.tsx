
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lock, Mail, ArrowRightCircle } from "lucide-react";

interface EmailVerificationProps {
  email: string;
  invoiceId: string;
  onVerified: () => void;
}

export function EmailVerification({ email, invoiceId, onVerified }: EmailVerificationProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const sendVerificationCode = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('email_verifications')
        .insert({
          email,
          invoice_id: invoiceId,
          code: Math.floor(100000 + Math.random() * 900000).toString(),
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes from now
        });

      if (error) throw error;

      toast.success("Verification code sent to your email");
      setCodeSent(true);
    } catch (error) {
      console.error("Error sending code:", error);
      toast.error("Failed to send verification code");
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode) {
      toast.error("Please enter the verification code");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('email_verifications')
        .select('*')
        .eq('email', email)
        .eq('invoice_id', invoiceId)
        .eq('code', verificationCode)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error("Invalid or expired verification code");
        return;
      }

      toast.success("Email verified successfully");
      onVerified();
    } catch (error) {
      console.error("Error verifying code:", error);
      toast.error("Failed to verify code");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle className="text-center flex justify-center items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          Email Verification
        </CardTitle>
        <CardDescription className="text-center">
          To view this invoice, we need to verify your email address.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!codeSent ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary/10 rounded-full p-3">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <Label>Email address</Label>
            <Input value={email} disabled />
            
            <Button 
              className="w-full mt-2" 
              onClick={sendVerificationCode}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Verification Code"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary/10 rounded-full p-3">
                <ArrowRightCircle className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <p className="text-center text-sm text-muted-foreground">
              We've sent a verification code to <strong>{email}</strong>
            </p>
            
            <Label>Verification Code</Label>
            <Input 
              value={verificationCode} 
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code" 
            />
            
            <Button 
              className="w-full mt-2" 
              onClick={verifyCode}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Verifying..." : "Verify Code"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
