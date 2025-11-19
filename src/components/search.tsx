
'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FileText, Newspaper, Search as SearchIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { Page, Post } from '@/lib/types';
import { useDebounce } from '@/hooks/use-debounce';
import { search as aiSearch, type SearchInput } from '@/ai/flows/search';

type SearchResult = {
  type: 'Page' | 'Post';
  title: string;
  url: string;
};

export default function Search() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [allData, setAllData] = useState<SearchInput['documents']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsFetchingData(true);
      try {
        const response = await fetch('/api/search-data');
        if (!response.ok) {
          throw new Error('Failed to fetch search data');
        }
        const { pages, posts } = await response.json();
        const data = [
          ...pages.map((p: Page) => ({ type: 'Page' as const, title: p.title, url: `/${p.urlSlug}` })),
          ...posts.map((p: Post) => ({ type: 'Post' as const, title: p.title, url: `/blog/${p.urlSlug}` })),
        ];
        setAllData(data);
      } catch (error) {
        console.error("Failed to fetch search data:", error);
        setAllData([]);
      } finally {
        setIsFetchingData(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
        if (debouncedQuery.length < 3 || allData.length === 0) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        try {
            const searchResult = await aiSearch({
                query: debouncedQuery,
                documents: allData,
            });
            setResults(searchResult.results);
        } catch (error) {
            console.error("AI search failed:", error);
            // Fallback to simple filter on error
            const filtered = allData.filter((item) =>
                item.title.toLowerCase().includes(debouncedQuery.toLowerCase())
            );
            setResults(filtered);
        } finally {
            setIsLoading(false);
        }
    };

    performSearch();
  }, [debouncedQuery, allData]);
  
  useEffect(() => {
    // Reset loading and open states on route change
    setIsLoading(false);
    setIsOpen(false);
  }, [pathname]);

  const handleSelect = (url: string) => {
    setIsLoading(true);
    router.push(url);
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);
  
  const runCommand = useCallback((command: () => unknown) => {
    command()
  }, [])

  const pageResults = results.filter(r => r.type === 'Page');
  const postResults = results.filter(r => r.type === 'Post');

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-4 xl:py-2 text-sm text-muted-foreground"
        aria-label="Open search"
      >
        <SearchIcon className="h-4 w-4 xl:mr-2 text-current" />
        <span className="hidden xl:inline-flex">Search pages and blogs...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
            <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="overflow-hidden p-0 shadow-lg">
          <DialogHeader className="sr-only">
            <DialogTitle>Search Site</DialogTitle>
            <DialogDescription>Search for pages and blog posts across the site.</DialogDescription>
          </DialogHeader>
          <Command
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
            shouldFilter={false}
          >
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search pages and posts..."
              disabled={isLoading || isFetchingData}
            />
             {(isLoading || isFetchingData) && (
              <div className="absolute right-4 top-3.5">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground text-current" />
              </div>
            )}
            <CommandList>
                {query.length < 3 ? (
                    <CommandEmpty>Please enter 3 or more characters to search.</CommandEmpty>
                ) : !isLoading && results.length === 0 && debouncedQuery.length >= 3 ? (
                    <CommandEmpty>No results found.</CommandEmpty>
                ) : null}

              {pageResults.length > 0 && (
                <CommandGroup heading="Pages">
                  {pageResults.slice(0, 5).map((page, index) => (
                    <CommandItem
                      key={`page-${index}`}
                      onSelect={() => runCommand(() => handleSelect(page.url))}
                      value={page.title}
                      className="cursor-pointer"
                    >
                      <FileText className="mr-2 h-4 w-4 text-current" />
                      <span>{page.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
               {postResults.length > 0 && (
                <CommandGroup heading="Blog Posts">
                  {postResults.slice(0, 5).map((post, index) => (
                    <CommandItem
                      key={`post-${index}`}
                      onSelect={() => runCommand(() => handleSelect(post.url))}
                      value={post.title}
                      className="cursor-pointer"
                    >
                      <Newspaper className="mr-2 h-4 w-4 text-current" />
                      <span>{post.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
