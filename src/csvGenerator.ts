import Papa from 'papaparse';
import { LocationEntry } from './types';

/**
 * Generate a CSV file from location entries
 */
export function generateCSV(data: LocationEntry[]): string {
  const options = {
    header: true,
    skipEmptyLines: true,
  };
  
  return Papa.unparse(data, options);
}

/**
 * Download the generated CSV as a file
 */
export function downloadCSV(csvContent: string, filename: string = 'location-history.csv'): void {
  // Create blob and URL
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link and trigger download
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
} 