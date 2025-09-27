"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { navigationItems } from '@/config/navigation';

const getBreadcrumbSegments = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs = segments.map((segment, idx) => {
    const href = `/${segments.slice(0, idx + 1).join('/')}`;
    const match = navigationItems.find(item => item.href === href);

    return {
      label: match?.label ?? segment.replace('-', ' '),
      href,
      isCurrent: idx === segments.length - 1,
    };
  });

  if (crumbs.length === 0) {
    return [
      {
        label: 'Dashboard',
        href: '/dashboard',
        isCurrent: true,
      },
    ];
  }

  return crumbs;
};

export const Breadcrumbs = () => {
  const pathname = usePathname();
  const segments = getBreadcrumbSegments(pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, idx) => (
          <BreadcrumbItem key={segment.href}>
            {segment.isCurrent ? (
              <BreadcrumbPage>{segment.label}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild>
                <Link href={segment.href}>{segment.label}</Link>
              </BreadcrumbLink>
            )}
            {idx < segments.length - 1 ? <BreadcrumbSeparator /> : null}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
