export type Theme = 'light' | 'dark';

export const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';

  // Check local storage first
  const savedTheme = localStorage.getItem('theme') as Theme;
  if (savedTheme) {
    return savedTheme;
  }

  // Check system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Add listener for system theme changes
  prefersDark.addEventListener('change', (e) => {
    setTheme(e.matches ? 'dark' : 'light');
  });

  return prefersDark.matches ? 'dark' : 'light';
};

export const setTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return;

  localStorage.setItem('theme', theme);
  
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    // Prevent flash of unstyled content
    document.documentElement.style.colorScheme = 'dark';
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
  }
};