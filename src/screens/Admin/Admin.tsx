import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Input } from '../../components/ui/input';
import { Sidebar } from '../../components/Sidebar';
import { getAllUsers, updateUserRole, deleteUser } from '../../utils/supabaseClient';
import { cn } from '../../lib/utils';
import { Theme, getInitialTheme, setTheme } from '../../utils/theme';
import { Search, Trash2, Shield } from 'lucide-react';
import {
  useToast
} from '../../components/ui/use-toast';

interface User {
  id: string;
  is_admin: boolean;
  auth_user: {
    email: string;
  };
}

export const Admin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [theme, setCurrentTheme] = useState<Theme>(getInitialTheme);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setTheme(theme);
  }, [theme]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers as User[]);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleToggle = async (userId: string, currentValue: boolean) => {
    try {
      await updateUserRole(userId, !currentValue);
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_admin: !currentValue }
          : user
      ));
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.auth_user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={cn(
      "flex h-screen",
      theme === 'dark' ? 'dark bg-[#0F172A]' : 'bg-white'
    )}>
      <Sidebar
        isSidebarExpanded={isSidebarExpanded}
        theme={theme}
        onToggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
        onToggleTheme={() => setCurrentTheme(current => current === 'dark' ? 'light' : 'dark')}
      />

      <div className={cn(
        "flex-1 flex flex-col",
        theme === 'dark' && "bg-[#0F172A]"
      )}>
        <div className={cn(
          "h-16 border-b flex items-center px-6",
          theme === 'dark' 
            ? "border-[#334155] bg-[#1E293B]" 
            : "border-gray-200"
        )}>
          <div className="flex items-center">
            <Shield className={cn(
              "w-6 h-6 mr-3",
              theme === 'dark' ? "text-[#8B5CF6]" : "text-[#5036b0]"
            )} />
            <span className={cn(
              "text-xl font-light",
              theme === 'dark' ? "text-gray-300" : "text-gray-600"
            )}>
              Admin Dashboard
            </span>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h2 className={cn(
                "text-2xl font-semibold mb-4",
                theme === 'dark' ? "text-white" : "text-gray-900"
              )}>
                User Management
              </h2>
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className={cn(
                    "absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5",
                    theme === 'dark' ? "text-gray-400" : "text-gray-500"
                  )} />
                  <Input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={cn(
                      "pl-10",
                      theme === 'dark' 
                        ? "bg-slate-800 border-slate-700 text-white" 
                        : "bg-white"
                    )}
                  />
                </div>
              </div>

              <div className={cn(
                "rounded-lg border",
                theme === 'dark' 
                  ? "border-slate-700" 
                  : "border-gray-200"
              )}>
                <Table>
                  <TableHeader>
                    <TableRow className={theme === 'dark' ? "hover:bg-slate-800" : undefined}>
                      <TableHead className={theme === 'dark' ? "text-slate-300" : undefined}>Email</TableHead>
                      <TableHead className={theme === 'dark' ? "text-slate-300" : undefined}>Admin</TableHead>
                      <TableHead className={theme === 'dark' ? "text-slate-300" : undefined}>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className={cn(
                          "text-center py-8",
                          theme === 'dark' ? "text-slate-400" : "text-gray-500"
                        )}>
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow 
                          key={user.id}
                          className={theme === 'dark' ? "hover:bg-slate-800" : undefined}
                        >
                          <TableCell className={theme === 'dark' ? "text-slate-300" : undefined}>
                            {user.auth_user.email}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={user.is_admin}
                              onCheckedChange={() => handleRoleToggle(user.id, user.is_admin)}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteUser(user.id)}
                              className={cn(
                                "text-red-500 hover:text-red-700",
                                theme === 'dark' && "hover:bg-slate-700"
                              )}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};