
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type AppRole = "owner" | "manager" | "staff";

export function useRoleGuard(requiredRole?: AppRole) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session) {
          console.log("No session found, redirecting to auth");
          navigate("/auth");
          return;
        }

        // Direct query without using RLS policies
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (roleError) {
          console.error("Role check error:", roleError);
          throw roleError;
        }

        const currentRole = roleData?.role as AppRole | null;
        setUserRole(currentRole);

        if (!currentRole) {
          toast({
            title: "No Role Assigned",
            description: "You don't have any role assigned. Please contact an administrator.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        if (requiredRole) {
          const roleHierarchy: Record<AppRole, number> = {
            owner: 3,
            manager: 2,
            staff: 1,
          };

          const hasRequiredAccess = roleHierarchy[currentRole] >= roleHierarchy[requiredRole];
          setHasAccess(hasRequiredAccess);

          if (!hasRequiredAccess) {
            toast({
              title: "Access Denied",
              description: `You need ${requiredRole} role or higher to access this page`,
              variant: "destructive",
            });
            navigate("/");
            return;
          }
        } else {
          setHasAccess(true);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error checking role:", error);
        toast({
          title: "Error",
          description: "Failed to verify access rights",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };

    checkAccess();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate("/auth");
      } else if (session) {
        checkAccess();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, requiredRole, toast]);

  return { isLoading, hasAccess, userRole };
}
