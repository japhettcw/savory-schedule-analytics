
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Database } from "@/integrations/supabase/types";
import { useRealtimeSync } from "@/hooks/use-realtime-sync";

type Role = Database["public"]["Enums"]["app_role"];

type UserWithRoles = {
  id: string;
  email: string;
  roles: Role[];
};

const RoleManager = () => {
  const [currentUser, setCurrentUser] = useState<UserWithRoles | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCurrentUserAndRoles = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      if (!session) return;

      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);

      if (rolesError) throw rolesError;

      setCurrentUser({
        id: session.user.id,
        email: session.user.email || '',
        roles: rolesData.map(role => role.role as Role)
      });
    } catch (error) {
      console.error('Error fetching user and roles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user and roles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUserAndRoles();
  }, []);

  useRealtimeSync({
    tableName: 'user_roles',
    onDataChange: fetchCurrentUserAndRoles,
  });

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: newRole
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Role updated successfully",
      });

      await fetchCurrentUserAndRoles();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <div>No user found</div>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">User Role Management</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow key={currentUser.id}>
              <TableCell>{currentUser.email}</TableCell>
              <TableCell>{currentUser.roles.join(', ') || 'No role'}</TableCell>
              <TableCell>
                <Select
                  onValueChange={(value) => handleRoleChange(currentUser.id, value as Role)}
                  defaultValue={currentUser.roles[0]}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default RoleManager;
