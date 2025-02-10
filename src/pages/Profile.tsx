
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Shield } from "lucide-react";

const profileSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/auth");
          return;
        }

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profileError) {
          toast({
            title: "Error",
            description: "Failed to load profile",
            variant: "destructive",
          });
          return;
        }

        // Fetch role data
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (roleError) {
          console.error("Error fetching role:", roleError);
        } else {
          setUserRole(roleData?.role || null);
        }

        if (profileData) {
          form.reset({
            first_name: profileData.first_name || "",
            last_name: profileData.last_name || "",
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: "Something went wrong",
          variant: "destructive",
        });
      }
    };

    fetchProfile();
  }, [navigate, form, toast]);

  const onSubmit = async (values: ProfileFormValues) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: values.first_name,
        last_name: values.last_name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Profile updated successfully",
    });
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="container max-w-2xl py-6">
      <div className="mb-6 flex items-center justify-between">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        {userRole === "owner" && (
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate("/role-management")}
          >
            <Shield className="h-4 w-4" />
            Manage Roles
          </Button>
        )}
      </div>
      
      <Card className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Edit Profile</h1>
          {userRole && (
            <p className="text-sm text-muted-foreground mt-1">
              Current role: <span className="font-medium capitalize">{userRole}</span>
            </p>
          )}
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4">
              <Button type="submit">
                Save Changes
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate("/")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}
