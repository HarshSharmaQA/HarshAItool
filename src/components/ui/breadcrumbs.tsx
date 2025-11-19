
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export interface Breadcrumb {
  label: string
  href: string
  isActive?: boolean
}

interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  separator?: React.ReactNode
  collapseOnMobile?: boolean
  items: Breadcrumb[]
}

const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(
  (
    {
      separator,
      collapseOnMobile = true,
      className,
      items,
      ...props
    },
    ref
  ) => {
    return (
      <nav ref={ref} aria-label="breadcrumb" {...props}>
        <ol
          className={cn(
            "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
            className
          )}
        >
          {items.map((item, index) => (
            <li
              key={index}
              className={cn(
                "inline-flex items-center gap-1.5",
                collapseOnMobile && index > 0 && "hidden md:inline-flex"
              )}
            >
              {index > 0 && (
                <>{separator ? separator : <span role="presentation">/</span>}</>
              )}
              <Link
                href={item.href}
                className={cn(
                  "transition-colors hover:text-foreground",
                  item.isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    )
  }
)
Breadcrumbs.displayName = "Breadcrumbs"

export { Breadcrumbs }
