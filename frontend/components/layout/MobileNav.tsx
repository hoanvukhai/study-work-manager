'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, KanbanSquare, Calendar, Inbox, BookOpenCheck } from 'lucide-react';
import styles from './MobileNav.module.css';

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Tổng quan', href: '/', icon: <LayoutDashboard size={20} /> },
    { label: 'Kanban', href: '/kanban', icon: <KanbanSquare size={20} /> },
    { label: 'Lịch trình', href: '/calendar', icon: <Calendar size={20} /> },
    { label: 'Học tập', href: '/study', icon: <BookOpenCheck size={20} /> },
    { label: 'Hộp nhận', href: '/inbox', icon: <Inbox size={20} /> },
  ];

  return (
    <nav className={styles.mobileNav} aria-label="Thanh điều hướng di động">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
