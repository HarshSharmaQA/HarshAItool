
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Order, Settings } from './types';
import { PlaceHolderImages } from './placeholder-images';
import type { ImagePlaceholder } from './placeholder-images';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertTimestamps(obj: any): any {
  if (!obj) return obj;

  if (Array.isArray(obj)) {
    return obj.map(convertTimestamps);
  }

  if (typeof obj === 'object' && obj !== null) {
    // Firestore Timestamp check
    if (typeof obj.toDate === 'function') {
      return obj.toDate();
    }
    
    // Check for serialized timestamp from server components
    if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(obj)) {
        const date = new Date(obj);
        if (!isNaN(date.getTime())) {
            return date;
        }
    }
    
    // Handle Firebase Timestamp-like objects with seconds/nanoseconds
    if (typeof obj === 'object' && obj !== null && 
        typeof obj.seconds === 'number' && 
        typeof obj.nanoseconds === 'number') {
      const date = new Date(obj.seconds * 1000 + Math.floor(obj.nanoseconds / 1000000));
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = convertTimestamps(obj[key]);
      }
    }
    return newObj;
  }

  return obj;
}


export const generateInvoicePDF = (order: Order, settings: Settings) => {
    const doc = new jsPDF();
    const currency = settings.currency || '₹';
  
    // Header
    doc.setFontSize(20);
    doc.text(`${settings.siteTitle} - Invoice`, 14, 22);
    doc.setFontSize(12);
    doc.text(`Order #${order.id.slice(0, 7)}`, 14, 30);
    
    const createdAt = (order.createdAt as any)?.seconds 
        ? new Date((order.createdAt as any).seconds * 1000) 
        : new Date(order.createdAt);
    
    doc.text(`Date: ${createdAt.toLocaleDateString()}`, 14, 36);
  
    // Shipping Details
    doc.setFontSize(14);
    doc.text('Shipping To:', 14, 50);
    doc.setFontSize(10);
    const shippingAddress = order.shippingAddress;
    const addressLines = [
        shippingAddress.name,
        shippingAddress.address1,
        shippingAddress.address2,
        `${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}`,
        shippingAddress.country
    ].filter(Boolean);
    doc.text(addressLines.join('\n'), 14, 56);
  
    // Items table
    const tableColumn = ["Product", "Quantity", "Price", "Total"];
    const tableRows: (string | number)[][] = [];
  
    order.items.forEach(item => {
      const itemData = [
        item.name,
        item.quantity,
        `${currency}${item.price.toFixed(2)}`,
        `${currency}${(item.price * item.quantity).toFixed(2)}`
      ];
      tableRows.push(itemData);
    });
  
    (doc as any).autoTable({
        startY: 80,
        head: [tableColumn],
        body: tableRows,
    });
  
    // Total
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(14);
    doc.text('Total:', 150, finalY + 15);
    doc.text(`${currency}${order.total.toFixed(2)}`, 180, finalY + 15);
  
    // Footer
    doc.setFontSize(10);
    doc.text('Thank you for your business!', 14, finalY + 30);
  
    doc.save(`invoice-${order.id.slice(0, 7)}.pdf`);
};

// Utility function to get placeholder image based on index
export const getPlaceholderImage = (index: number): ImagePlaceholder => {
    const placeholderId = `blog-${(index % 3) + 1}`;
    const placeholder = PlaceHolderImages.find((p: ImagePlaceholder) => p.id === placeholderId);
    return placeholder || PlaceHolderImages[0];
};

// Utility function to check if image is FeaturedImage or ImagePlaceholder
export const isFeaturedImage = (image: any): image is { url: string; hint: string } => {
    return image && typeof image === 'object' && 'url' in image && 'hint' in image;
};

// Utility function to strip HTML tags and create excerpt
export const createExcerpt = (content: string, maxLength: number = 150) => {
    return content.replace(/<[^>]*>?/gm, '').substring(0, maxLength) + '...';
};

// Utility function to safely create date from various formats
export const safeDate = (dateInput: any): Date => {
    try {
        if (!dateInput) return new Date();
        
        // Handle Firestore Timestamp
        if (typeof dateInput.toDate === 'function') {
            return dateInput.toDate();
        }
        
        // Handle serialized timestamp
        if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(dateInput)) {
            const date = new Date(dateInput);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
        
        // Handle Firebase Timestamp-like objects
        if (typeof dateInput === 'object' && 
            typeof dateInput.seconds === 'number' && 
            typeof dateInput.nanoseconds === 'number') {
            const date = new Date(dateInput.seconds * 1000 + Math.floor(dateInput.nanoseconds / 1000000));
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
        
        // Handle regular date input
        const date = new Date(dateInput);
        return isNaN(date.getTime()) ? new Date() : date;
    } catch (e) {
        return new Date();
    }
};