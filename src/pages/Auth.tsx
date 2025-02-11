
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
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session check error:", error);
          return;
        }
        
        if (session) {
          console.log("User already logged in, redirecting to home");
          navigate("/");
        }
      } catch (error) {
        console.error("Auth check error:", error);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (event === "SIGNED_IN" && session) {
          try {
            // Check if user has a role assigned
            const { data: roleData, error: roleError } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", session.user.id)
              .maybeSingle();

            if (roleError) {
              console.error("Role check error:", roleError);
              throw roleError;
            }

            if (!roleData) {
              console.log("No role assigned, this might be a new user");
            }

            navigate("/");
          } catch (error) {
            console.error("Error during sign in:", error);
            toast({
              title: "Error",
              description: "There was a problem signing you in. Please try again.",
              variant: "destructive",
            });
          }
        } else if (event === "SIGNED_OUT") {
          console.log("User signed out");
        } else if (event === "PASSWORD_RECOVERY") {
          toast({
            title: "Password Recovery",
            description: "Check your email for password reset instructions",
          });
        }
      }
    );

    return () => {
      console.log("Cleaning up auth subscriptions");
      subscription.unsubscribe();
    };
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
        />
      </Card>
    </div>
  );
}
