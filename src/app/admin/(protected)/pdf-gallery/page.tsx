'use client';

import { useState, useMemo } from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PDF } from '@/lib/types';
import { useDebounce } from '@/hooks/use-debounce';
import PdfCard from './pdf-card';
import UploadForm from './(form)/upload-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, FileWarning } from 'lucide-react';
import { useUser } from '@/components/providers/app-providers';

export default function PdfGalleryAdminPage() {
  const pdfsQuery = db ? query(collection(db, 'pdfGallery'), orderBy('createdAt', 'desc')) : null;
  const { data: initialPdfs, loading, setData: setPdfs } = useCollection<PDF>(pdfsQuery);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const categories = useMemo(() => {
    if (!initialPdfs) return [];
    const cats = new Set(initialPdfs.map(pdf => pdf.category || '').filter(cat => cat !== ''));
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

  const handleUploadComplete = () => {
    // Data is refreshed by useCollection
  };

  const handlePdfDeleted = (id: string) => {
    setPdfs(prevPdfs => prevPdfs?.filter(p => p.id !== id) || null);
  };

  return (
    <div className="space-y-8">
      <UploadForm onUploadComplete={handleUploadComplete} />

      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm border-primary/30 focus-visible:ring-primary"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[180px] border-primary/30 focus:ring-primary focus:ring-1">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem 
                key={category} 
                value={category || ''} 
                className="capitalize hover:bg-primary/10 focus:bg-primary/10"
              >
                {category === 'all' ? 'All Categories' : category || 'Uncategorized'}
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
        <div className="text-center py-16 border-2 border-dashed rounded-lg border-primary/30 bg-primary/5">
            <FileWarning className="mx-auto h-12 w-12 text-primary" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No PDFs Found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              There are no PDFs that match your current filters.
            </p>
        </div>
      )}
    </div>
  );
}