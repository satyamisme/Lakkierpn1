import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

interface TrainingModeContextType {
  isTrainingMode: boolean;
  toggleTrainingMode: () => void;
}

const TrainingModeContext = createContext<TrainingModeContextType | undefined>(undefined);

export const TrainingModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isTrainingMode, setIsTrainingMode] = useState(user?.isTrainingMode || false);

  const toggleTrainingMode = async () => {
    const newMode = !isTrainingMode;
    try {
      const response = await fetch('/api/auth/training-mode', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isTrainingMode: newMode }),
      });
      
      if (response.ok) {
        setIsTrainingMode(newMode);
        // Reload to apply middleware
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to toggle training mode:", error);
    }
  };

  return (
    <TrainingModeContext.Provider value={{ isTrainingMode, toggleTrainingMode }}>
      {children}
    </TrainingModeContext.Provider>
  );
};

export const useTrainingMode = () => {
  const context = useContext(TrainingModeContext);
  if (context === undefined) {
    throw new Error('useTrainingMode must be used within a TrainingModeProvider');
  }
  return context;
};
