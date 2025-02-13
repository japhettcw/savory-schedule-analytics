
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { MenuItem, Ingredient, MenuItemVariation } from "@/types/menu";
import { useToast } from "@/hooks/use-toast";

export function useMenuItems() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: menuItems = [], isLoading, error } = useQuery({
    queryKey: ['menuItems'],
    queryFn: async () => {
      console.log('Fetching menu items...');
      const { data, error } = await supabase
        .from('menu_items')
        .select('*');
      
      console.log('Supabase response:', { data, error });
      
      if (error) {
        console.error('Error fetching menu items:', error);
        toast({
          title: "Error fetching menu items",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      const transformedData = data.map(item => ({
        ...item,
        id: item.id,
        allergens: item.allergens || [],
        ingredients: (item.ingredients as any[] || []).map((ing: any) => ({
          name: ing.name || '',
          quantity: ing.quantity || '',
          unit: ing.unit || '',
        })) as Ingredient[],
        image: item.image || "/placeholder.svg",
        variations: (item.variations as any[] || []).map((var_: any) => ({
          id: var_.id || crypto.randomUUID(),
          name: var_.name || '',
          price: Number(var_.price) || 0,
        })) as MenuItemVariation[],
        stockLevel: item.stock_level || 0,
      })) as MenuItem[];
      
      console.log('Transformed menu items:', transformedData);
      return transformedData;
    },
  });

  const { mutate: handleAddEditItem } = useMutation({
    mutationFn: async (item: MenuItem) => {
      console.log('Adding/Editing menu item:', item);
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error("No user session found");
      }

      const { data, error } = await supabase
        .from('menu_items')
        .upsert({
          id: item.id,
          name: item.name,
          price: item.price,
          category: item.category,
          description: item.description,
          image: item.image,
          available: item.available,
          allergens: item.allergens,
          ingredients: item.ingredients,
          variations: item.variations,
          stock_level: item.stockLevel,
          user_id: session.session.user.id,
        })
        .select()
        .single();

      console.log('Upsert response:', { data, error });
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast({
        title: "Menu item updated",
        description: `${variables.name} has been updated successfully.`,
      });
    },
    onError: (error: Error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Error saving menu item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { mutate: handleDeleteItem } = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting menu item:', id);
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast({
        title: "Menu item deleted",
        description: "The menu item has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      console.error('Delete error:', error);
      toast({
        title: "Error deleting menu item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    menuItems,
    isLoading,
    error,
    handleAddEditItem,
    handleDeleteItem,
  };
}
