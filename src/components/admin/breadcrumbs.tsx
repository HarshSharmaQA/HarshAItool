
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

const Breadcrumbs: React.FC = () => {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(segment => segment);

  if (!pathname.startsWith('/admin') || pathSegments.length <= 1) {
    return null;
  }

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const isLast = index === pathSegments.length - 1;
    
    // Capitalize the first letter
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

    return (
      <React.Fragment key={href}>
        <li>
          <div className="flex items-center">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link 
              href={href} 
              className={`ml-2 text-sm font-medium ${isLast ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              aria-current={isLast ? 'page' : undefined}
            >
              {label}
            </Link>
          </div>
        </li>
      </React.Fragment>
    );
  });

  return (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
        <li className="inline-flex items-center">
          <Link href="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
            Admin
          </Link>
        </li>
        {breadcrumbs.slice(1)}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
