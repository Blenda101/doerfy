import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../utils/supabaseClient';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  React.useEffect(() => {
    // Check if user is already authenticated
    const checkExistingSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          // Clear potentially corrupted auth data
          localStorage.removeItem('supabase.auth.token');
          localStorage.removeItem('doerfy_tasks');
          navigate('/auth', { replace: true });
          return;
        }
        if (session) {
          navigate(from, { replace: true });
        }
      } catch (error) {
        // Handle any unexpected errors
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('doerfy_tasks');
        navigate('/auth', { replace: true });
      }
    };
    
    checkExistingSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        // Clear localStorage when signing in to prevent data conflicts
        localStorage.removeItem('doerfy_tasks');
        navigate(from, { replace: true });
      } else if (event === 'SIGNED_OUT') {
        // Clear all auth-related data when signing out
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('doerfy_tasks');
        navigate('/auth', { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, from]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img
            className="mx-auto h-12 w-auto"
            src="/doerfy-logo.svg"
            alt="Doerfy"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome to Doerfy
          </h2>
        </div>
        <div className="mt-8 bg-white dark:bg-slate-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#5036b0',
                    brandAccent: '#3a2783',
                  },
                },
              },
              style: {
                message: {
                  color: 'red',
                },
                container: {
                  color: '#1a1a1a',
                },
                label: {
                  color: '#1a1a1a',
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem',
                },
                input: {
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  color: '#1a1a1a',
                },
                button: {
                  backgroundColor: '#5036b0',
                  color: '#ffffff',
                },
                anchor: {
                  color: '#5036b0',
                },
              },
            }}
            providers={['google', 'apple']}
            redirectTo={`${window.location.origin}/auth/callback`}
            localization={{
              variables: {
                sign_in: {
                  email_input_placeholder: 'Your email address',
                  password_input_placeholder: 'Your password',
                  email_label: 'Email',
                  password_label: 'Password',
                  button_label: 'Sign in',
                  loading_button_label: 'Signing in ...',
                  social_provider_text: 'Sign in with {{provider}}',
                  link_text: 'Already have an account? Sign in',
                },
                sign_up: {
                  email_input_placeholder: 'Your email address',
                  password_input_placeholder: 'Create a password',
                  email_label: 'Email',
                  password_label: 'Password',
                  button_label: 'Sign up',
                  loading_button_label: 'Signing up ...',
                  social_provider_text: 'Sign up with {{provider}}',
                  link_text: "Don't have an account? Sign up",
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};