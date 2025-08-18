
"use client";

import * as React from "react";
import Link from "next/link";
import {
  Home,
  LogOut,
  List,
  User as UserIcon,
  LineChart,
  Wallet,
  DollarSign,
  Gift,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FinancialsProvider } from "@/hooks/use-financials";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [user, router]);
  
  React.useEffect(() => {
    const handleStart = (url: string) => {
      if (url !== pathname) {
        setIsLoading(true);
      }
    };
    const handleComplete = () => {
       setTimeout(() => setIsLoading(false), 300); // Simulate loading
    };
    
    // In a real Next.js app, you'd use router events.
    // For this simulation, we'll just handle it on path change.
    handleComplete(); // Reset on initial load
    
    return () => {
      // Cleanup logic here
    };

  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };
  
  const handleRouteChange = (path: string) => {
     if (pathname !== path) {
       setIsLoading(true);
       router.push(path);
     }
  };

  if (!user) {
    return null; // or a loading spinner
  }
  
  const isActive = (path: string) => pathname === path;

  return (
    <FinancialsProvider>
      <div className="min-h-screen bg-background text-foreground">
        <div className="bg-background">
        <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
            <div className="flex items-center">
                <div className="flex items-center mr-8">
                    <div className="bg-primary/10 text-primary rounded-md p-2 mr-3">
                        <DollarSign className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-xl">VizBot</span>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <div className="flex items-center cursor-pointer">
                        <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={user.photoURL ?? ""} alt="User avatar" />
                            <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{user.displayName ?? "User"}</span>
                    </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                             <Link href="/dashboard/profile">
                                <UserIcon className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
        <div className="flex">
          <aside className="w-64 border-r border-border/50 bg-background flex flex-col justify-between">
            <div className="p-4">
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-3">
                  MAIN MENU
                </h3>
                <ul className="space-y-1">
                  <li>
                    <Button variant={isActive('/dashboard') ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => handleRouteChange('/dashboard')}>
                      <Home className="mr-3 h-4 w-4" />
                      Dashboard
                    </Button>
                  </li>
                  <li>
                    <Button variant={isActive('/dashboard/wallets') ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => handleRouteChange('/dashboard/wallets')}>
                      <Wallet className="mr-3 h-4 w-4" />
                      Wallets
                    </Button>
                  </li>
                  <li>
                    <Button variant={isActive('/dashboard/transactions') ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => handleRouteChange('/dashboard/transactions')}>
                      <List className="mr-3 h-4 w-4" />
                      Transactions
                    </Button>
                  </li>
                   <li>
                    <Button variant={isActive('/dashboard/import') ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => handleRouteChange('/dashboard/import')}>
                      <Upload className="mr-3 h-4 w-4" />
                      Import
                    </Button>
                  </li>
                   <li>
                    <Button variant={isActive('/dashboard/analytics') ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => handleRouteChange('/dashboard/analytics')}>
                      <LineChart className="mr-3 h-4 w-4" />
                      Analytics
                    </Button>
                  </li>
                  <li>
                    <Button variant={isActive('/dashboard/wishlist') ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => handleRouteChange('/dashboard/wishlist')}>
                      <Gift className="mr-3 h-4 w-4" />
                      Wishlist
                    </Button>
                  </li>
                </ul>
              </div>
            </div>
             <div className="p-4 border-t border-border/50">
                 <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-3">
                  SUPPORT
                </h3>
                <div className="px-3 text-sm text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">Contact Developer</p>
                  <p>For any support or inquiries, please email us at:</p>
                  <p className="font-medium text-primary">incomingvirus.iv@gmail.com</p>
                </div>
            </div>
          </aside>

          <main className="flex-1 p-6 relative bg-muted/20">
             {isLoading && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                   <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              )}
             <div className={isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}>
                {children}
             </div>
          </main>
        </div>
        </div>
      </div>
    </FinancialsProvider>
  );
}

    