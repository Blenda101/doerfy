import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { getCurrentUser, supabase, signOut } from '../../utils/supabaseClient';
import { cn } from '../../lib/utils';
import { Theme } from '../../utils/theme';
import { Camera, Loader2, X, LogOut } from 'lucide-react';

export const Profile: React.FC<{ theme?: Theme }> = ({ theme = 'light' }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
          // Ensure profile exists
          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert({ id: currentUser.id });

          if (upsertError) throw upsertError;

          // Get profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', currentUser.id)
            .single();
          
          if (profile?.avatar_url) {
            const { data: { publicUrl } } = supabase
              .storage
              .from('avatars')
              .getPublicUrl(profile.avatar_url);
            setAvatarUrl(publicUrl);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
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
      alert('Please upload an image file');
      return;
    }

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: fileName,
          updated_at: new Date().toISOString(),
        });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      alert(error.message || 'Error uploading avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Error signing out. Please try again.');
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
      "min-h-screen p-8",
      theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'
    )}>
      <div className={cn(
        "max-w-2xl mx-auto rounded-lg shadow-md p-8 relative",
        theme === 'dark' ? 'bg-slate-800' : 'bg-white'
      )}>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute right-4 top-4",
            theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'
          )}
          onClick={() => navigate(-1)}
        >
          <X className="h-5 w-5" />
        </Button>

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
            <h1 className={cn(
              "text-2xl font-bold mb-2",
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              {user?.email}
            </h1>
            <p className={cn(
              "text-sm",
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            )}>
              Member since {new Date(user?.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Label className={cn(
              "block mb-2",
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            )}>
              Email
            </Label>
            <Input
              type="email"
              value={user?.email}
              readOnly
              className={cn(
                "w-full",
                theme === 'dark' 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-gray-100'
              )}
            />
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="destructive"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              {isLoggingOut ? 'Signing out...' : 'Sign out'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};