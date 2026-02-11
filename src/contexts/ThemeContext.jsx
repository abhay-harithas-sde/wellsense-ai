import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      reminders: true,
      sound: true
    },
    privacy: {
      shareData: false,
      analytics: true,
      marketing: false
    },
    accessibility: {
      reducedMotion: false,
      highContrast: false,
      fontSize: 'medium'
    },
    language: 'en',
    timezone: 'auto'
  });

  // Load theme and settings from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('wellsense-theme');
    const savedSidebarState = localStorage.getItem('wellsense-sidebar-collapsed');
    const savedSettings = localStorage.getItem('wellsense-settings');

    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }

    if (savedSidebarState) {
      setSidebarCollapsed(JSON.parse(savedSidebarState));
    }

    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('wellsense-theme', theme);
  }, [theme]);

  // Save sidebar state
  useEffect(() => {
    localStorage.setItem('wellsense-sidebar-collapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Save settings
  useEffect(() => {
    localStorage.setItem('wellsense-settings', JSON.stringify(settings));
  }, [settings]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const updateSettings = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const resetSettings = () => {
    setSettings({
      notifications: {
        email: true,
        push: true,
        reminders: true,
        sound: true
      },
      privacy: {
        shareData: false,
        analytics: true,
        marketing: false
      },
      accessibility: {
        reducedMotion: false,
        highContrast: false,
        fontSize: 'medium'
      },
      language: 'en',
      timezone: 'auto'
    });
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebar,
    settings,
    updateSettings,
    resetSettings
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};