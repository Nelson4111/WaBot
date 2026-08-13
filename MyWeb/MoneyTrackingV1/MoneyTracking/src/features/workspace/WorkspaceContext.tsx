import React, { createContext, useContext, useState } from 'react';
import type { Workspace } from '../../lib/types';
import { mockWorkspaces } from '../../lib/mock-data';
import { useAuth } from '../auth/AuthContext';

interface WorkspaceContextValue {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (ws: Workspace) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // Filter workspaces based on user mode
  const userWorkspaces = mockWorkspaces.filter((ws) => {
    if (!user) return false;
    if (user.workspaceMode === 'personal') return ws.type === 'personal';
    if (user.workspaceMode === 'business') return ws.type === 'business';
    return true; // both
  });

  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    userWorkspaces[0] || null
  );

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces: userWorkspaces,
        currentWorkspace,
        setCurrentWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}

export default WorkspaceContext;
