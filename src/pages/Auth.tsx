import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Brain, BookOpen, TrendingUp } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { authSchema, signUpSchema } from '@/lib/validationSchemas';
import { handleAuthError } from '@/lib/errorHandler';
import { SEOHead } from '@/components/SEOHead';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import UpdatePasswordForm from '@/components/auth/UpdatePasswordForm';

const Auth = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { signUp, signIn, user, resetPassword, updatePassword, isPasswordRecovery } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isRecoveryFromUrl = searchParams.get('type') === 'recovery';
  const isRecovery = isRecoveryFromUrl || isPasswordRecovery;
  const refCode = searchParams.get('ref');

  // Track referral click once per session
  useEffect(() => {
    if (!refCode) return;
    const key = `dim_ref_click_${refCode}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    try { sessionStorage.setItem('dim_pending_ref', refCode); } catch {}
    import('@/integrations/supabase/client').then(({ supabase }) => {
      supabase.functions
        .invoke('referral-track', {
          body: { referral_code: refCode, landing_path: window.location.pathname + window.location.search },
        })
        .catch(() => {});
    });
  }, [refCode]);

  // Redirect if already authenticated and NOT in recovery mode
  useEffect(() => {
    if (user && !isRecovery) {
      navigate('/');
    }
  }, [user, navigate, isRecovery]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const validated = signUpSchema.parse({ 
        fullName: fullName.trim(), 
        email: email.trim(), 
        password 
      });
      
      const { error } = await signUp(validated.email, validated.password, validated.fullName);
      
      if (error) {
        setError(handleAuthError(error));
      } else {
        setSuccess('Check your email for confirmation link!');
        setFullName('');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError('An unexpected error occurred');
      }
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const validated = authSchema.parse({ email: email.trim(), password });
      
      const { error } = await signIn(validated.email, validated.password);
      
      if (error) {
        setError(handleAuthError(error));
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError('An unexpected error occurred');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <SEOHead 
        title="Sign In - Learn, Build & Earn with AI"
        description="Join thousands of students learning and earning with AI. Sign in to access AI tools, courses, and opportunities."
        keywords={["AI education", "login", "sign in", "AI learning platform", "AI courses"]}
      />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Digital Intelligence
            </h1>
          </div>
          <p className="text-muted-foreground">
            Join thousands of students learning and earning with AI
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-card/95 border-primary/10">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {isRecovery ? 'Reset Password' : 'Welcome Back'}
            </CardTitle>
            <CardDescription>
              {isRecovery ? 'Set your new password' : 'Access your AI learning journey'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isRecovery ? (
              <UpdatePasswordForm onUpdatePassword={updatePassword} />
            ) : showForgotPassword ? (
              <ForgotPasswordForm
                onBack={() => setShowForgotPassword(false)}
                onResetPassword={resetPassword}
              />
            ) : (
              <>
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="signin">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="example@gmail.com"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign In
                      </Button>
                      <Button
                        type="button"
                        variant="link"
                        className="w-full text-sm"
                        onClick={() => setShowForgotPassword(true)}
                      >
                        Forgot your password?
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signup">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div>
                        <Label htmlFor="signup-fullname">Full Name</Label>
                        <Input
                          id="signup-fullname"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="John Doe"
                          required
                          autoComplete="name"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          This will be shown to the community instead of your email
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="example@gmail.com"
                          required
                          autoComplete="email"
                        />
                      </div>
                      <div>
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          minLength={8}
                          autoComplete="new-password"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Min 8 characters with uppercase and number
                        </p>
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                {error && (
                  <Alert className="mt-4 border-destructive/50">
                    <AlertDescription className="text-destructive">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="mt-4 border-primary/50">
                    <AlertDescription className="text-primary">
                      {success}
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>Free Learning</span>
            </div>
            <div className="flex items-center gap-1">
              <Brain className="h-4 w-4" />
              <span>AI Tools</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>Earn Money</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;