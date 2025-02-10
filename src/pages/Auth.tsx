
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === "SIGNED_IN" && session) {
          navigate("/");
        } else if (event === "USER_DELETED") {
          toast({
            title: "Account deleted",
            description: "Your account has been successfully deleted",
          });
        } else if (event === "PASSWORD_RECOVERY") {
          toast({
            title: "Password Recovery",
            description: "Check your email for password reset instructions",
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'rgb(5 150 105)',
                  brandAccent: 'rgb(4 120 87)',
                },
              },
            },
          }}
          providers={[]}
          redirectTo={window.location.origin}
          onError={(error) => {
            console.error("Auth error:", error);
            toast({
              title: "Authentication Error",
              description: error.message || "An error occurred during authentication",
              variant: "destructive",
            });
          }}
        />
      </Card>
    </div>
  );
}
