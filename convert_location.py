import polars as pl
import json
from pathlib import Path
import ijson
import re

# Define input and output file paths
json_file_path = Path("location-history.json")
parquet_file_path = Path("location-history.parquet")

print(f"Attempting to read {json_file_path} using ijson streaming...")

try:
    # Function to extract and transform each location entry
    def process_location_entry(entry):
        # Initialize an empty dictionary
        processed = {
            'startTime': entry.get('startTime'),
            'endTime': entry.get('endTime')
        }
        
        # Extract visit data if it exists
        if 'visit' in entry and 'topCandidate' in entry['visit']:
            top_candidate = entry['visit']['topCandidate']
            
            # Add semantic type if it exists
            if 'semanticType' in top_candidate:
                processed['semanticType'] = top_candidate['semanticType']
                
            # Add probability if it exists
            if 'probability' in top_candidate:
                processed['probability'] = float(top_candidate['probability'])
                
            # Add placeID if it exists
            if 'placeID' in top_candidate:
                processed['placeID'] = top_candidate['placeID']
                
            # Extract lat/long from placeLocation if it exists
            if 'placeLocation' in top_candidate:
                # Pattern: "geo:latitude,longitude"
                geo_match = re.match(r'geo:([-\d.]+),([-\d.]+)', top_candidate['placeLocation'])
                if geo_match:
                    processed['latitude'] = float(geo_match.group(1))
                    processed['longitude'] = float(geo_match.group(2))
        
        # Add activity data if it exists
        if 'activity' in entry:
            activity = entry['activity']
            
            # Extract start geo coordinates
            if 'start' in activity:
                geo_match = re.match(r'geo:([-\d.]+),([-\d.]+)', activity['start'])
                if geo_match:
                    processed['start_lat'] = float(geo_match.group(1))
                    processed['start_lng'] = float(geo_match.group(2))
            
            # Extract end geo coordinates
            if 'end' in activity:
                geo_match = re.match(r'geo:([-\d.]+),([-\d.]+)', activity['end'])
                if geo_match:
                    processed['end_lat'] = float(geo_match.group(1))
                    processed['end_lng'] = float(geo_match.group(2))
            
            # Extract distance
            if 'distanceMeters' in activity:
                processed['distance_meters'] = float(activity['distanceMeters'])
            
            # Extract topCandidate data
            if 'topCandidate' in activity:
                top_candidate = activity['topCandidate']
                if 'type' in top_candidate:
                    processed['activity_type'] = top_candidate['type']
                if 'probability' in top_candidate:
                    processed['activity_probability'] = float(top_candidate['probability'])
        
        # Add activity segment data if it exists (not seen in the sample, but might be in other entries)
        if 'activitySegment' in entry:
            activity = entry['activitySegment']
            if 'activities' in activity and activity['activities']:
                # Get the first activity
                first_activity = activity['activities'][0]
                processed['activityType'] = first_activity.get('activityType')
                processed['activityConfidence'] = float(first_activity.get('probability', 0))
                
            # Add any other activitySegment fields that might be useful
            for key in ['distance', 'duration', 'activityType', 'confidence']:
                if key in activity:
                    processed[f'segment_{key}'] = activity[key]
        
        return processed

    # Use ijson to stream the 'item' entries from the JSON array
    with json_file_path.open('r', encoding='utf-8') as f:
        entries_generator = ijson.items(f, 'item')
        
        # Process each entry to extract the data we want
        processed_entries = []
        count = 0
        for entry in entries_generator:
            processed_entry = process_location_entry(entry)
            processed_entries.append(processed_entry)
            count += 1
            
            # Optional: Print progress for large files
            if count % 10000 == 0:
                print(f"Processed {count} entries...")
        
        # Create DataFrame from the processed entries
        df = pl.from_records(processed_entries)
    
    if df is None or len(df) == 0:
        print("No location data found or DataFrame creation failed.")
        exit()

    print(f"Successfully created DataFrame with {len(df)} records.")

except ImportError:
    print("Error: Required library not found.")
    print("Please install all requirements: uv pip install polars pyarrow ijson")
    exit()
except FileNotFoundError:
    print(f"Error: Input file not found at {json_file_path}")
    exit()
except Exception as e:
    print(f"Error processing JSON: {e}")
    exit()

# --- Data Processing ---
print("Processing DataFrame...")

# Convert timestamps to datetime
expressions = []
if "startTime" in df.columns:
    expressions.append(
        pl.col("startTime").str.to_datetime(format=None).alias("startTime_dt")
    )
if "endTime" in df.columns:
    expressions.append(
        pl.col("endTime").str.to_datetime(format=None).alias("endTime_dt")
    )

# Apply transformations if there are any
if expressions:
    df = df.with_columns(expressions)

# --- Write to Parquet ---
try:
    print(f"Writing {len(df)} processed records to {parquet_file_path}...")
    df.write_parquet(parquet_file_path, compression='zstd')
    print(f"Successfully wrote Parquet file to {parquet_file_path}")
    
    # Print sample of the data for verification
    print("\nSample of processed data:")
    print(df.head(5))

except Exception as e:
    print(f"Error writing Parquet file: {e}") 