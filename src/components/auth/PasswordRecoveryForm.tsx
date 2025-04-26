import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { CheckCircledIcon } from "@radix-ui/react-icons";

interface PasswordRecoveryFormProps {
  onSubmit: (email: string) => void;
  isLoading?: boolean;
  error?: string;
  success?: boolean;
}

export function PasswordRecoveryForm({ onSubmit, isLoading, error, success }: PasswordRecoveryFormProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Reset your password</CardTitle>
        <CardDescription>Enter your email address and we'll send you a link to reset your password</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <CheckCircledIcon className="h-4 w-4" />
              <AlertDescription>
                If an account exists with that email, you will receive password reset instructions.
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={success}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-6">
          <Button type="submit" className="w-full" disabled={isLoading || success}>
            {isLoading ? "Sending reset link..." : "Send reset link"}
          </Button>
          <div className="text-sm text-center">
            Remember your password?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Sign In
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
