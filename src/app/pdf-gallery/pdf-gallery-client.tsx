'use client';

import { useState, useMemo } from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PDF } from '@/lib/types';
import { useDebounce } from '@/hooks/use-debounce';
import PdfCard from './pdf-card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, FileWarning } from 'lucide-react';
import { useUser } from '@/components/providers/app-providers';

export default function PdfGalleryClient() {
  const pdfsQuery = db ? query(collection(db, 'pdfGallery'), orderBy('createdAt', 'desc')) : null;
  const { data: initialPdfs, loading, setData: setPdfs } = useCollection<PDF>(pdfsQuery);
  const { isAdmin } = useUser();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const categories = useMemo(() => {
    if (!initialPdfs) return [];
    const cats = new Set(initialPdfs.map(pdf => pdf.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [initialPdfs]);

  const filteredPdfs = useMemo(() => {
    if (!initialPdfs) return [];
    return initialPdfs.filter(pdf => {
      const matchesCategory = selectedCategory === 'all' || pdf.category === selectedCategory;
      const matchesSearch = debouncedSearchTerm 
        ? pdf.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        : true;
      return matchesCategory && matchesSearch;
    });
  }, [initialPdfs, selectedCategory, debouncedSearchTerm]);
  
  const handlePdfDeleted = (id: string) => {
    setPdfs(prevPdfs => prevPdfs?.filter(p => p.id !== id) || null);
  };

  return (
    <>
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category || 'all'} className="capitalize">
                {category === 'all' || !category ? 'All Categories' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredPdfs && filteredPdfs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPdfs.map(pdf => (
            <PdfCard key={pdf.id} pdf={pdf} onDeleted={handlePdfDeleted} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <FileWarning className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No PDFs Found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              There are no PDFs that match your current filters.
            </p>
        </div>
      )}
    </>
  );
}