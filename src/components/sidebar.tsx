'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Newspaper,
  Vote,
  ScanText,
  Home,
  BotMessageSquare,
  Flag,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/documents', label: 'Documents', icon: ShieldCheck },
  { href: '/scam-detector', label: 'Scam Detector', icon: ScanText },
  { href: '/fake-news', label: 'Fake News', icon: Newspaper },
  { href: '/voting-anomalies', label: 'Voting Anomalies', icon: Vote },
  { href: '/report-scam', label: 'Report Scam', icon: Flag },
];

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = () => {
    // In a real app, you would also clear authentication state here
    router.push('/login');
  };

  return (
    <Button
      variant="ghost"
      className="flex items-center gap-3 justify-start rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground w-full"
      onClick={handleLogout}
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
};

export function Sidebar() {
  const pathname = usePathname();

  const navLinks = (
    <nav className="grid items-start gap-2 px-4 text-sm font-medium">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
            key={label}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
              { 'bg-muted text-primary': pathname === href }
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center border-b px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <BotMessageSquare className="h-6 w-6 text-primary" />
              <span className="">Proofchain</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">{navLinks}</div>
          <div className="mt-auto border-t p-4">
            <LogoutButton />
          </div>
        </div>
      </div>
      {/* Mobile Sidebar */}
      <header className="flex h-14 items-center gap-4 border-b bg-card px-6 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
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
                <line x1="3" x2="21" y1="6" y2="6" />
                <line x1="3" x2="21" y1="12" y2="12" />
                <line x1="3" x2="21" y1="18" y2="18" />
              </svg>
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0">
            <div className="flex h-[60px] items-center border-b px-6">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <BotMessageSquare className="h-6 w-6 text-primary" />
                <span className="">Proofchain</span>
              </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">{navLinks}</div>
            <div className="mt-auto border-t p-4">
                <LogoutButton />
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">
            {navItems.find(item => item.href === pathname)?.label ?? 'Dashboard'}
          </h1>
        </div>
      </header>
    </>
  );
}
