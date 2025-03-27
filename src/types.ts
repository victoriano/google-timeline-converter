export interface LocationEntry {
  startTime?: string;
  endTime?: string;
  
  // Visit data
  semanticType?: string;
  probability?: number;
  placeID?: string;
  latitude?: number;
  longitude?: number;
  
  // Activity data
  start_lat?: number;
  start_lng?: number;
  end_lat?: number;
  end_lng?: number;
  distance_meters?: number;
  activity_type?: string;
  activity_probability?: number;
  
  // Activity segment data
  activityType?: string;
  activityConfidence?: number;
  segment_distance?: string;
  segment_duration?: string;
  segment_activityType?: string;
  segment_confidence?: string;
}

export interface RawLocationEntry {
  startTime?: string;
  endTime?: string;
  visit?: {
    topCandidate?: {
      semanticType?: string;
      probability?: string;
      placeID?: string;
      placeLocation?: string;
    }
  };
  activity?: {
    start?: string;
    end?: string;
    distanceMeters?: string;
    topCandidate?: {
      type?: string;
      probability?: string;
    }
  };
  activitySegment?: {
    activities?: Array<{
      activityType?: string;
      probability?: string;
    }>;
    distance?: string;
    duration?: string;
    activityType?: string;
    confidence?: string;
  };
}

export interface ProcessingStats {
  processedCount: number;
  totalCount: number;
  message?: string;
}

export interface ProcessingResult {
  data: LocationEntry[];
  error?: string;
  details?: string;
  message?: string;
} 