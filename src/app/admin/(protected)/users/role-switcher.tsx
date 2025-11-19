
'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateUserRole } from '@/app/actions/user-actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/components/providers/app-providers';

interface RoleSwitcherProps {
  uid: string;
  currentRole: 'admin' | 'user';
}

export default function RoleSwitcher({ uid, currentRole }: RoleSwitcherProps) {
  const [role, setRole] = useState(currentRole);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  const handleRoleChange = async (newRole: 'admin' | 'user') => {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'You must be logged in to change roles.',
        });
        return;
    }
    setIsUpdating(true);
    setRole(newRole);
    try {
        const idToken = await user.getIdToken();
        const result = await updateUserRole(idToken, uid, newRole);
        if (result.error) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: result.error,
          });
          // Revert optimistic update
          setRole(currentRole);
        } else {
          toast({
            title: 'Success',
            description: result.success,
          });
        }
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'An unexpected error occurred.',
        });
        setRole(currentRole);
    } finally {
        setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
      <Select
        value={role}
        onValueChange={handleRoleChange}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-[120px] h-8">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
