'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Coffee, Layout, Search, User } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/hooks/useTranslation';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function NavigationBar() {
  const pathname = usePathname();
  const { isGuest } = useStore();
  const { t } = useTranslation();

  const navItems = [
    { label: t.home, icon: Home, href: '/' },
    { label: t.journey, icon: BookOpen, href: '/journey' },
    { label: t.brewing, icon: Coffee, href: '/brewing' },
    { label: t.shisha_bar, icon: Layout, href: '/equipment' },
    { label: t.search, icon: Search, href: '/search' },
    { label: isGuest ? t.login : t.profile, icon: User, href: '/login' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 px-4 h-16 safe-area-pb z-50">
      <div className="flex justify-between items-center h-full max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-colors",
                isActive ? "text-stone-700 dark:text-stone-300" : "text-stone-600 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
              )}
            >
              <Icon size={24} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
