import { Link } from "wouter";
import Sidebar from "./Sidebar";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { X, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-10 border-b bg-background h-16 flex items-center px-4 md:px-6">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <Link href="/" className="font-bold text-xl flex items-center">
              <span className="text-primary">Medicina China</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
            </Button>
            <Button variant="ghost" size="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </Button>
            <div className="flex items-center gap-2 border border-border rounded-full px-2 py-1">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <span className="font-medium">MC</span>
              </div>
              <span className="text-sm font-medium hidden sm:inline">Dr. López</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {isMobile ? (
          sidebarOpen && (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
              <div className="fixed inset-y-0 left-0 z-50 w-72 bg-background border-r">
                <div className="flex h-16 items-center justify-between px-4">
                  <Link href="/" className="font-bold text-xl">
                    <span className="text-primary">Medicina China</span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <Sidebar onClose={() => setSidebarOpen(false)} />
              </div>
            </div>
          )
        ) : (
          <div className="w-72 border-r shrink-0">
            <Sidebar />
          </div>
        )}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
