import { ReactNode } from 'react';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';

interface DualSidebarLayoutProps {
  children: ReactNode;
}

export function DualSidebarLayout({ children }: DualSidebarLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Left Sidebar - Main Navigation */}
      <LeftSidebar />
      
      {/* Right Sidebar - Contextual Content */}
      <RightSidebar />
      
      {/* Main Content Area */}
      <div className="transition-all duration-300 ease-in-out">
        {children}
      </div>
    </div>
  );
} 