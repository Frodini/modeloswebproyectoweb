"use client";

import Link from 'next/link';
import { CarIcon, HomeIcon, ListIcon, PlusCircleIcon, MenuIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/listings', label: 'Listings', icon: ListIcon },
  { href: '/sell-my-car', label: 'Sell My Car', icon: PlusCircleIcon },
];

export function Header() {
  const pathname = usePathname();

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navItems.map((item) => (
        <Button
          key={item.label}
          variant="ghost"
          asChild
          className={cn(
            "justify-start w-full text-md",
            mobile ? "text-foreground hover:bg-accent hover:text-accent-foreground" : "text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
            pathname === item.href && (mobile ? "bg-accent text-accent-foreground font-semibold" : "bg-primary/80 font-semibold")
          )}
        >
          <Link href={item.href} className="flex items-center gap-2">
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        </Button>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-primary-foreground">
          <CarIcon className="h-8 w-8" />
          <span className="text-2xl font-bold">AutoLink</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-2">
          <NavLinks />
        </nav>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground">
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] p-4 bg-background">
              <div className="flex flex-col space-y-2">
                <NavLinks mobile />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
