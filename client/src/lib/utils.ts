import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  try {
    // Phòng trường hợp date là number hoặc object khác
    if (typeof date !== 'string' && !(date instanceof Date)) {
      return String(date);
    }
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj instanceof Date && !isNaN(dateObj.getTime())
      ? format(dateObj, 'dd/MM/yyyy')
      : String(date);
  } catch {
    return String(date);
  }
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  try {
    // Phòng trường hợp date là number hoặc object khác
    if (typeof date !== 'string' && !(date instanceof Date)) {
      return String(date);
    }
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj instanceof Date && !isNaN(dateObj.getTime())
      ? format(dateObj, 'dd/MM/yyyy HH:mm')
      : String(date);
  } catch {
    return String(date);
  }
}

export function formatCurrency(amount: number | string | null | undefined, locale: string = 'vi-VN', currency: string = 'VND'): string {
  if (amount === null || amount === undefined) return '';
  
  try {
    // Convert string to number if needed
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Check if it's a valid number
    if (typeof numAmount !== 'number' || isNaN(numAmount)) {
      return String(amount);
    }
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount);
  } catch {
    return String(amount);
  }
}

export function formatFileSize(bytes: number | string | null | undefined): string {
  if (bytes === null || bytes === undefined) return '0 Bytes';

  try {
    // Convert string to number if needed
    const numBytes = typeof bytes === 'string' ? parseFloat(bytes) : bytes;
    
    // Check if it's a valid number
    if (typeof numBytes !== 'number' || isNaN(numBytes)) {
      return String(bytes);
    }
    
    if (numBytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(numBytes) / Math.log(k));
    
    return parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  } catch {
    return String(bytes);
  }
}

export function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text) return '';
  
  const strText = String(text);
  if (strText.length <= maxLength) return strText;
  return strText.slice(0, maxLength) + '...';
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
}

export function getInitials(name: string): string {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .filter(char => char.match(/[A-Z]/))
    .slice(0, 2)
    .join('');
}

export function downloadAsFile(content: string, filename: string, contentType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  link.click();
  
  URL.revokeObjectURL(url);
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function getBytesFromSize(size: number, unit: string): number {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const unitIndex = units.indexOf(unit.toUpperCase());
  
  if (unitIndex === -1) return 0;
  
  return size * Math.pow(1024, unitIndex);
}
