import oboe from 'oboe';
import { LocationEntry, RawLocationEntry, ProcessingStats, ProcessingResult } from './types';

/**
 * Extract geo coordinates from a string like "geo:40.338423,-3.777495"
 */
function extractGeoCoordinates(geoString: string | undefined): { lat: number, lng: number } | null {
  if (!geoString) return null;
  
  const geoMatch = geoString.match(/geo:([-\d.]+),([-\d.]+)/);
  if (geoMatch) {
    return {
      lat: parseFloat(geoMatch[1]),
      lng: parseFloat(geoMatch[2])
    };
  }
  return null;
}

/**
 * Process a raw location entry into a structured format
 */
function processLocationEntry(entry: RawLocationEntry): LocationEntry {
  // Initialize an empty result object
  const processed: LocationEntry = {
    startTime: entry.startTime,
    endTime: entry.endTime
  };
  
  // Extract visit data if it exists
  if (entry.visit?.topCandidate) {
    const topCandidate = entry.visit.topCandidate;
    
    // Add semantic type if it exists
    if (topCandidate.semanticType) {
      processed.semanticType = topCandidate.semanticType;
    }
    
    // Add probability if it exists
    if (topCandidate.probability) {
      processed.probability = parseFloat(topCandidate.probability);
    }
    
    // Add placeID if it exists
    if (topCandidate.placeID) {
      processed.placeID = topCandidate.placeID;
    }
    
    // Extract lat/long from placeLocation if it exists
    const geoData = extractGeoCoordinates(topCandidate.placeLocation);
    if (geoData) {
      processed.latitude = geoData.lat;
      processed.longitude = geoData.lng;
    }
  }
  
  // Add activity data if it exists
  if (entry.activity) {
    const activity = entry.activity;
    
    // Extract start geo coordinates
    const startGeo = extractGeoCoordinates(activity.start);
    if (startGeo) {
      processed.start_lat = startGeo.lat;
      processed.start_lng = startGeo.lng;
    }
    
    // Extract end geo coordinates
    const endGeo = extractGeoCoordinates(activity.end);
    if (endGeo) {
      processed.end_lat = endGeo.lat;
      processed.end_lng = endGeo.lng;
    }
    
    // Extract distance
    if (activity.distanceMeters) {
      processed.distance_meters = parseFloat(activity.distanceMeters);
    }
    
    // Extract topCandidate data
    if (activity.topCandidate) {
      if (activity.topCandidate.type) {
        processed.activity_type = activity.topCandidate.type;
      }
      if (activity.topCandidate.probability) {
        processed.activity_probability = parseFloat(activity.topCandidate.probability);
      }
    }
  }
  
  // Add activity segment data if it exists
  if (entry.activitySegment) {
    const segment = entry.activitySegment;
    
    if (segment.activities && segment.activities.length > 0) {
      // Get the first activity
      const firstActivity = segment.activities[0];
      if (firstActivity.activityType) {
        processed.activityType = firstActivity.activityType;
      }
      if (firstActivity.probability) {
        processed.activityConfidence = parseFloat(firstActivity.probability);
      }
    }
    
    // Add any other activitySegment fields that might be useful
    if (segment.distance) {
      processed.segment_distance = segment.distance;
    }
    if (segment.duration) {
      processed.segment_duration = segment.duration;
    }
    if (segment.activityType) {
      processed.segment_activityType = segment.activityType;
    }
    if (segment.confidence) {
      processed.segment_confidence = segment.confidence;
    }
  }
  
  return processed;
}

/**
 * Process a JSON file in chunks using streaming
 */
export async function processLocationFile(
  file: File, 
  onProgress: (stats: ProcessingStats) => void
): Promise<ProcessingResult> {
  return new Promise((resolve, reject) => {
    const results: LocationEntry[] = [];
    const fileReader = new FileReader();
    let processedCount = 0;
    let totalCount = 0;
    let jsonStructureDetected = false;
    
    // Detect the structure in the first chunk to determine total count for progress
    let isFirstChunk = true;
    
    // Check file size and warn for large files
    if (file.size > 50 * 1024 * 1024) { // > 50MB
      console.warn('Large file detected. Processing may take some time and could cause browser performance issues.');
      onProgress({ 
        processedCount: 0, 
        totalCount: 0, 
        message: 'Large file detected (>50MB). Processing may take some time...'
      });
    }
    
    fileReader.onload = () => {
      // Convert ArrayBuffer to text
      const jsonText = fileReader.result as string;
      
      // Check if this is a direct array format (not wrapped in an object)
      const trimmedText = jsonText.trim();
      if (trimmedText.startsWith('[') && trimmedText.endsWith(']')) {
        onProgress({ 
          processedCount: 0, 
          totalCount: 0,
          message: "Detected JSON array format. Processing directly..." 
        });
        
        try {
          // Parse the whole array directly
          const entries = JSON.parse(trimmedText);
          if (Array.isArray(entries)) {
            // Process each entry
            entries.forEach((entry) => {
              try {
                const processed = processLocationEntry(entry);
                results.push(processed);
              } catch (entryError) {
                console.error('Error processing entry:', entryError);
              }
            });
            
            resolve({
              data: results,
              message: `Successfully processed ${results.length} location entries from array format.`
            });
            return;
          }
        } catch (arrayError) {
          console.error('Error parsing array format:', arrayError);
          // Continue with other methods if array parsing fails
        }
      }
      
      // Try to determine the JSON structure
      if (jsonText.includes('"locations":') && !jsonText.includes('"item":')) {
        // This is likely the newer Google format
        console.log("Detected newer Google Location History format");
        onProgress({ 
          processedCount: 0, 
          totalCount: 0,
          message: "Detected newer Google format. Adapting parser..." 
        });
        
        // Parse initial JSON to get locations array
        try {
          const parsed = JSON.parse(jsonText);
          if (parsed.locations && Array.isArray(parsed.locations)) {
            // Define types for the Google location format
            interface GoogleLocationEntry {
              timestamp?: string;
              timestampMs?: string;
              latitudeE7?: number;
              longitudeE7?: number;
              accuracy?: number;
              velocity?: number;
              altitude?: number;
              verticalAccuracy?: number;
              [key: string]: any; // Allow other properties
            }
            
            // Process the locations array directly
            const adaptedResults = parsed.locations.map((loc: GoogleLocationEntry) => ({
              startTime: loc.timestamp || loc.timestampMs,
              endTime: loc.timestamp || loc.timestampMs,
              latitude: loc.latitudeE7 ? loc.latitudeE7/1e7 : null,
              longitude: loc.longitudeE7 ? loc.longitudeE7/1e7 : null,
              // Add any other fields that exist
              accuracy: loc.accuracy,
              source: "Google Location History (new format)"
            }));
            
            resolve({ 
              data: adaptedResults,
              message: `Successfully processed ${adaptedResults.length} location entries using alternate parser.`
            });
            return;
          }
        } catch (parseError) {
          console.error("Failed to parse newer format:", parseError);
        }
      }
      
      // Basic JSON structure validation
      const trimmedStart = jsonText.trim().substring(0, 50);
      if (!trimmedStart.startsWith('{') && !trimmedStart.startsWith('[')) {
        reject({ 
          error: 'File does not appear to be valid JSON. Expected file to begin with { or [', 
          data: [],
          details: 'The uploaded file does not appear to be a valid JSON file. Please ensure you are uploading a Google Location History JSON file.'
        });
        return;
      }
      
      try {
        onProgress({ 
          processedCount: 0, 
          totalCount: 0, 
          message: 'Starting JSON parsing...' 
        });
        
        // Use oboe for streaming JSON parsing
        oboe(jsonText)
          .node('!', function() {
            jsonStructureDetected = true;
            return oboe.drop;
          })
          .node('!.*', function(item: any) {
            totalCount = 1; // At least we found something
            return oboe.drop; // Just counting items, don't need to store
          })
          .node('*.length', function(length: number) {
            if (isFirstChunk) {
              totalCount = length;
              isFirstChunk = false;
              onProgress({ 
                processedCount: 0, 
                totalCount, 
                message: `Detected ${totalCount} location entries. Starting processing...` 
              });
            }
          })
          .node('item.*', function(entry: RawLocationEntry) {
            if (!jsonStructureDetected) {
              jsonStructureDetected = true;
            }
            
            try {
              const processed = processLocationEntry(entry);
              results.push(processed);
              
              processedCount++;
              if (processedCount % 1000 === 0 || processedCount === totalCount) {
                onProgress({ processedCount, totalCount });
              }
            } catch (entryError: any) {
              console.error('Error processing entry:', entryError, entry);
              // Continue processing other entries
            }
            
            return oboe.drop; // Allow garbage collection
          })
          .done(() => {
            if (results.length === 0 && !jsonStructureDetected) {
              reject({ 
                error: 'No location data found in file', 
                data: [],
                details: 'The file was parsed successfully, but no location data was found. Please ensure you are uploading a Google Location History JSON file with the expected format.'
              });
            } else {
              resolve({ 
                data: results,
                message: `Successfully processed ${results.length} location entries.`
              });
            }
          })
          .fail((error: any) => {
            console.error('Parsing error details:', error);
            
            // Determine more specific error message based on the error
            let errorDetails = 'Unknown parsing error occurred.';
            let suggestion = 'Try using a smaller subset of your data or check if the file is properly formatted.';
            
            if (error && error.thrown) {
              if (error.thrown.message && error.thrown.message.includes('Unexpected token')) {
                errorDetails = `JSON syntax error: ${error.thrown.message}`;
                suggestion = 'Your file appears to contain invalid JSON. Please verify the file format.';
              } else if (error.thrown.message && error.thrown.message.includes('out of memory')) {
                errorDetails = 'Browser ran out of memory while processing the file.';
                suggestion = 'Your file is too large for the browser to handle. Try splitting it into smaller files.';
              } else {
                errorDetails = `${error.thrown.name || 'Error'}: ${error.thrown.message || 'Unknown error'}`;
              }
            }
            
            const fullErrorMessage = `${errorDetails} ${suggestion}`;
            
            reject({ 
              error: `Error parsing JSON: ${error?.message || 'undefined'}`, 
              data: results.length > 0 ? results : [],
              details: fullErrorMessage
            });
          });
      } catch (error: any) {
        console.error('General processing error:', error);
        let errorMsg = 'Error processing file';
        let details = 'An unexpected error occurred while processing your file.';
        
        if (error.message) {
          if (error.message.includes('memory')) {
            errorMsg = 'Memory limit exceeded';
            details = 'Your browser ran out of memory. Try using a smaller file or a different browser.';
          } else {
            errorMsg = `Error processing file: ${error.message}`;
            details = 'Please check if your file is properly formatted and not corrupted.';
          }
        }
        
        reject({ error: errorMsg, data: results, details });
      }
    };
    
    fileReader.onerror = (event) => {
      console.error('FileReader error:', event);
      reject({ 
        error: 'Error reading file', 
        data: results,
        details: 'The browser encountered an error while reading the file. The file might be too large or corrupted.'
      });
    };
    
    // Start reading the file as text
    try {
      fileReader.readAsText(file);
    } catch (error: any) {
      reject({ 
        error: `Error reading file: ${error.message || 'unknown error'}`, 
        data: [],
        details: 'Failed to read the file. It might be too large for your browser to handle.'
      });
    }
  });
} 