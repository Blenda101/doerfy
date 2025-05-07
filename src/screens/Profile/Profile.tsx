import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Sidebar } from '../../components/Sidebar';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { getCurrentUser, supabase, signOut } from '../../utils/supabaseClient';
import { cn } from '../../lib/utils';
import { Theme, getInitialTheme } from '../../utils/theme';
import { Camera, Loader2, User, LogOut } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url, first_name, last_name')
            .eq('id', currentUser.id)
            .single();
          
          if (profile?.avatar_url) {
            const { data: { publicUrl } } = supabase
              .storage
              .from('avatars')
              .getPublicUrl(profile.avatar_url);
            setAvatarUrl(publicUrl);
          }

          setFirstName(profile?.first_name || '');
          setLastName(profile?.last_name || '');
        }
      } catch (error) {
        console.error('Error loading user:', error);
        toast.error('Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: fileName,
          updated_at: new Date().toISOString(),
        });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success('Profile picture updated successfully');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || 'Error uploading profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName.trim() || null,
          last_name: lastName.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex h-screen",
      theme === 'dark' ? 'dark bg-[#0F172A]' : 'bg-white'
    )}>
      <Sidebar
        isSidebarExpanded={isSidebarExpanded}
        theme={theme}
        onToggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
        onToggleTheme={() => setTheme(current => current === 'dark' ? 'light' : 'dark')}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className={cn(
          "h-16 border-b flex items-center px-6 sticky top-0 z-10",
          theme === 'dark' ? "border-[#334155] bg-[#1E293B]" : "border-gray-200 bg-white"
        )}>
          <User className={cn(
            "w-6 h-6 mr-3",
            theme === 'dark' ? "text-[#8B5CF6]" : "text-[#5036b0]"
          )} />
          <h1 className={cn(
            "text-xl font-light",
            theme === 'dark' ? "text-gray-300" : "text-gray-600"
          )}>
            Profile
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-8">
            <div className={cn(
              "rounded-lg border",
              theme === 'dark' ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-white"
            )}>
              <div className="p-6">
                <div className="flex flex-col items-center mb-8">
                  <div 
                    {...getRootProps()} 
                    className={cn(
                      "relative group cursor-pointer",
                      isDragActive && "opacity-50"
                    )}
                  >
                    <input {...getInputProps()} />
                    <div className={cn(
                      "w-32 h-32 rounded-full overflow-hidden border-4",
                      theme === 'dark' 
                        ? 'border-[#8B5CF6] bg-slate-700' 
                        : 'border-[#5036b0] bg-gray-100'
                    )}>
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera className={cn(
                            "w-8 h-8",
                            theme === 'dark' ? 'text-slate-500' : 'text-gray-400'
                          )} />
                        </div>
                      )}
                    </div>
                    {isUploading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      </div>
                    ) : (
                      <div className={cn(
                        "absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                        isDragActive && "opacity-100"
                      )}>
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="mt-4 text-center">
                    <h2 className={cn(
                      "text-2xl font-bold mb-2",
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    )}>
                      {user?.email}
                    </h2>
                    <p className={cn(
                      "text-sm",
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    )}>
                      Member since {new Date(user?.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Separator className={theme === 'dark' ? "bg-slate-700" : undefined} />

                <div className="mt-6 space-y-4">
                  <div>
                    <Label className={theme === 'dark' ? "text-slate-200" : "text-gray-700"}>
                      First Name
                    </Label>
                    <Input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter your first name"
                      className={cn(
                        "mt-1",
                        theme === 'dark' 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white'
                      )}
                    />
                  </div>

                  <div>
                    <Label className={theme === 'dark' ? "text-slate-200" : "text-gray-700"}>
                      Last Name
                    </Label>
                    <Input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter your last name"
                      className={cn(
                        "mt-1",
                        theme === 'dark' 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white'
                      )}
                    />
                  </div>

                  <div>
                    <Label className={theme === 'dark' ? "text-slate-200" : "text-gray-700"}>
                      Email
                    </Label>
                    <Input
                      type="email"
                      value={user?.email}
                      readOnly
                      className={cn(
                        "mt-1",
                        theme === 'dark' 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-gray-100'
                      )}
                    />
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="w-full"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>

                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};