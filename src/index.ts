import { processLocationFile } from './locationProcessor';
import { generateCSV, downloadCSV } from './csvGenerator';
import { ProcessingStats } from './types';

// DOM Elements
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const selectFileBtn = document.getElementById('selectFileBtn') as HTMLButtonElement;
const uploadArea = document.getElementById('uploadArea') as HTMLDivElement;
const progressContainer = document.getElementById('progressContainer') as HTMLDivElement;
const progressBar = document.getElementById('progressBar') as HTMLProgressElement;
const statusElement = document.getElementById('status') as HTMLDivElement;
const downloadBtn = document.getElementById('downloadBtn') as HTMLButtonElement;

// State
let processedData: any[] = [];

// Event Handlers
function handleFileSelect(event: Event) {
  const files = fileInput.files;
  if (files && files.length > 0) {
    processFile(files[0]);
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault();
  uploadArea.classList.remove('highlight');
  
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    processFile(files[0]);
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault();
  uploadArea.classList.add('highlight');
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault();
  uploadArea.classList.remove('highlight');
}

async function processFile(file: File) {
  // Only accept JSON files
  if (!file.name.endsWith('.json')) {
    alert('Please select a JSON file from Google Location History.');
    return;
  }
  
  // Update UI for processing
  uploadArea.style.display = 'none';
  progressContainer.style.display = 'block';
  downloadBtn.style.display = 'none';
  statusElement.textContent = 'Reading file...';
  progressBar.value = 0;
  
  // Show file info
  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
  statusElement.textContent = `Reading file: ${file.name} (${fileSizeMB} MB)`;
  
  try {
    // Start processing
    const result = await processLocationFile(file, updateProgress);
    processedData = result.data;
    
    // Update UI after processing
    const successMessage = result.message || `Processed ${result.data.length} location entries successfully!`;
    statusElement.textContent = successMessage;
    downloadBtn.style.display = 'inline-block';
  } catch (error: any) {
    console.error('Processing error:', error);
    
    // Show the error message
    const errorTitle = error.error || 'Unknown error processing file';
    const errorDetails = error.details || '';
    
    // Create a more user-friendly error display
    statusElement.innerHTML = `
      <div style="color: #d32f2f; margin-bottom: 10px; font-weight: bold;">
        ${errorTitle}
      </div>
      <div style="margin-bottom: 15px;">
        ${errorDetails}
      </div>
      <div>
        <button id="resetBtn" style="background-color: #757575;">Try Again</button>
      </div>
    `;
    
    // Add reset button functionality
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        uploadArea.style.display = 'block';
        progressContainer.style.display = 'none';
        downloadBtn.style.display = 'none';
      });
    }
    
    // If we have partial data, still allow download
    if (error.data && error.data.length > 0) {
      processedData = error.data;
      downloadBtn.style.display = 'inline-block';
      statusElement.innerHTML += `
        <div style="margin-top: 15px; color: #2e7d32;">
          Partial data with ${error.data.length} entries is available for download
        </div>
      `;
    }
  }
}

function updateProgress(stats: ProcessingStats) {
  if (stats.message) {
    // If there's a custom message, display it
    statusElement.textContent = stats.message;
  } else if (stats.totalCount > 0) {
    // Calculate percentage if we have a total
    const percent = Math.min(100, Math.round((stats.processedCount / stats.totalCount) * 100));
    progressBar.value = percent;
    statusElement.textContent = `Processing: ${stats.processedCount} of ${stats.totalCount} entries (${percent}%)`;
  } else {
    // Otherwise just show the processed count
    progressBar.value = 0;
    statusElement.textContent = `Processing: ${stats.processedCount} entries`;
  }
}

function handleDownload() {
  if (processedData.length === 0) {
    alert('No data available to download.');
    return;
  }
  
  statusElement.textContent = 'Generating CSV file...';
  
  try {
    // Generate and download the CSV
    const csvContent = generateCSV(processedData);
    downloadCSV(csvContent);
    
    statusElement.textContent = 'CSV file downloaded successfully!';
  } catch (error: any) {
    console.error('CSV generation error:', error);
    statusElement.innerHTML = `
      <div style="color: #d32f2f; margin-bottom: 10px;">
        Error generating CSV: ${error.message || 'Unknown error'}
      </div>
      <div>
        Please try again or try with a smaller file.
      </div>
    `;
  }
}

// Initialize Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // File selection button
  selectFileBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileSelect);
  
  // Drag and drop
  uploadArea.addEventListener('dragover', handleDragOver);
  uploadArea.addEventListener('dragleave', handleDragLeave);
  uploadArea.addEventListener('drop', handleDrop);
  
  // Download button
  downloadBtn.addEventListener('click', handleDownload);
}); 