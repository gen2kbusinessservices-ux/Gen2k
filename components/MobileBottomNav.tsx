'use client';

import { motion } from 'framer-motion';
import { Home, Grid3x3, Mail, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type MobileBottomNavProps = {
  onMenuClick: () => void;
};

export default function MobileBottomNav({ onMenuClick }: MobileBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: 'Home', href: '/', testId: 'nav-home' },
    { icon: Grid3x3, label: 'Gallery', href: '/', testId: 'nav-gallery' },
    { icon: Mail, label: 'Contact', href: '/contact', testId: 'nav-contact' },
    { icon: Menu, label: 'Menu', onClick: onMenuClick, testId: 'nav-menu' },
  ];

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-gray-200 md:hidden"
      data-testid="mobile-bottom-nav"
    >
      <div className="flex justify-around items-center py-2 px-4">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.onClick) {
            return (
              <button
                key={idx}
                onClick={item.onClick}
                className="flex flex-col items-center gap-1 py-2 px-4 min-w-[60px] transition-colors"
                data-testid={item.testId}
              >
                <Icon className={`w-5 h-5 ${
                  isActive ? 'text-[#bbd922]' : 'text-gray-600'
                }`} />
                <span className={`text-xs ${
                  isActive ? 'text-[#bbd922] font-medium' : 'text-gray-600'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={idx}
              href={item.href}
              className="flex flex-col items-center gap-1 py-2 px-4 min-w-[60px] transition-colors"
              data-testid={item.testId}
            >
              <Icon className={`w-5 h-5 ${
                isActive ? 'text-[#bbd922]' : 'text-gray-600'
              }`} />
              <span className={`text-xs ${
                isActive ? 'text-[#bbd922] font-medium' : 'text-gray-600'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
