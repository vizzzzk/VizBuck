
"use client";

import * as React from "react";
import Link from "next/link";
import {
  Home,
  LogOut,
  Upload,
  List,
  Gift,
  User as UserIcon,
  LineChart,
  Mail,
  Search,
  Settings,
  HelpCircle,
  ChevronDown,
  Bell,
  Wallet,
  FileInvoice,
  Repeat,
  Tag,
  MessageSquare,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [user, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (!user) {
    return null; // or a loading spinner
  }
  
  const getPageTitle = () => {
    switch (pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/dashboard/analytics":
        return "Analytics";
      case "/dashboard/import":
        return "Import Statement";
      case "/dashboard/transactions":
        return "Transactions";
      case "/dashboard/wallets":
        return "Wallets & Assets";
      case "/dashboard/profile":
        return "Your Profile";
      default:
        return "Dashboard";
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <FinancialsProvider>
    <Dialog>
      <div className="min-h-screen bg-gray-50 text-gray-800">
        <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center">
                <div className="flex items-center mr-8">
                    <Flame className="text-primary h-6 w-6 mr-2" />
                    <span className="font-bold text-xl text-gray-800">Webot</span>
                </div>
                 <div className="flex items-center">
                    <span className="mr-2">Welcome back, {user.displayName?.split(' ')[0] || 'User'} 👋</span>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon"><Bell className="text-gray-500 h-5 w-5"/></Button>
                <DialogTrigger asChild>
                   <Button variant="ghost" size="icon"><Mail className="text-gray-500 h-5 w-5"/></Button>
                </DialogTrigger>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <div className="flex items-center cursor-pointer">
                        <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={user.photoURL ?? ""} alt="User avatar" />
                            <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{user.displayName ?? "User"}</span>
                        <ChevronDown className="text-gray-500 ml-1 h-4 w-4" />
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
                         <DropdownMenuItem asChild>
                             <Link href="/dashboard/profile">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
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
          {/* Sidebar */}
          <aside className="w-64 border-r bg-white">
            <div className="p-4">
              <div className="relative mb-6">
                <Input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 text-sm"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>

              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-3">
                  MAIN MENU
                </h3>
                <ul className="space-y-1">
                  <li>
                    <Link href="/dashboard" className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${isActive('/dashboard') ? 'bg-gray-100 text-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}>
                      <Home className="mr-3 h-4 w-4" />
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/wallets" className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${isActive('/dashboard/wallets') ? 'bg-gray-100 text-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}>
                      <Wallet className="mr-3 h-4 w-4" />
                      Wallets
                    </Link>
                  </li>
                   <li>
                    <Link href="/dashboard/analytics" className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${isActive('/dashboard/analytics') ? 'bg-gray-100 text-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}>
                      <LineChart className="mr-3 h-4 w-4" />
                      Analytics
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/transactions" className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${isActive('/dashboard/transactions') ? 'bg-gray-100 text-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}>
                      <List className="mr-3 h-4 w-4" />
                      Transactions
                    </Link>
                  </li>
                   <li>
                    <Link href="/dashboard/import" className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${isActive('/dashboard/import') ? 'bg-gray-100 text-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}>
                      <Upload className="mr-3 h-4 w-4" />
                      Import
                    </Link>
                  </li>
                </ul>
              </div>
              
               <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-3">
                  GENERAL
                </h3>
                <ul className="space-y-1">
                  <li>
                     <Link href="/dashboard/profile" className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${isActive('/dashboard/profile') ? 'bg-gray-100 text-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <Settings className="mr-3 h-4 w-4" />
                        Settings
                    </Link>
                  </li>
                  <DialogTrigger asChild>
                    <li>
                        <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Mail className="mr-3 h-4 w-4" />
                            Contact
                        </button>
                    </li>
                  </DialogTrigger>
                  <li>
                    <button onClick={handleLogout} className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
                      <LogOut className="mr-3 h-4 w-4" />
                      Log out
                    </button>
                  </li>
                </ul>
              </div>

            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 p-6">{children}</main>
        </div>
        </div>
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contact Developer</DialogTitle>
          <DialogDescription>
            For any support or inquiries, please email us at:
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <p className="select-all text-center font-mono p-2 bg-muted rounded-md text-sm">
            incomingvirus.iv@gmail.com
          </p>
        </div>
      </DialogContent>
    </Dialog>
    </FinancialsProvider>
  );
}
