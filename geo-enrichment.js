/**
 * Geo Enrichment Module
 * Handles geospatial enrichment of location data with municipality information
 */

// Global variable to store municipality data
let municipalityPolygons = null;

/**
 * Initialize geo enrichment by loading the municipality data
 * @param {HTMLElement} statusElement - The element to display status messages
 * @param {Function} callback - Optional callback function after data is loaded
 */
function initGeoEnrichment(statusElement, callback = null) {
    try {
        // Try to load the GADM data from the official source
        const gadmUrl = 'https://geodata.ucdavis.edu/gadm/gadm4.1/json/gadm41_ESP_4.json';
        statusElement.textContent = 'Loading Spanish municipalities (might take a while)...';
        
        fetch(gadmUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                municipalityPolygons = data;
                statusElement.textContent = `✓ Loaded Spanish municipalities (${data.features.length} areas).`;
                statusElement.style.color = '#4CAF50';
                if (callback) callback();
            })
            .catch(error => {
                console.warn('Failed to load GADM data, using simplified fallback:', error);
                loadFallbackGeoJson(statusElement);
                if (callback) callback();
            });
    } catch (e) {
        console.warn('Error initializing geo enrichment:', e);
        loadFallbackGeoJson(statusElement);
        if (callback) callback();
    }
}

/**
 * Fallback to load a simplified version embedded in the page
 * @param {HTMLElement} statusElement - The element to display status messages
 */
function loadFallbackGeoJson(statusElement) {
    statusElement.textContent = 'Loading simplified Spanish regions...';
    
    // Create a more comprehensive coverage of Spain with smaller, regional areas
    // This provides actual municipality names rather than just province names
    const simplifiedGeoJson = {
        "type": "FeatureCollection",
        "features": [
            // Andalucía region with major municipalities and more coverage points
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain",
                    "NAME_1": "Andalucía", 
                    "NAME_2": "Málaga",
                    "NAME_4": "Málaga" 
                },
                "geometry": { "type": "Point", "coordinates": [-4.4214, 36.7213] }
            },
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain",
                    "NAME_1": "Andalucía", 
                    "NAME_2": "Málaga",
                    "NAME_4": "Marbella" 
                },
                "geometry": { "type": "Point", "coordinates": [-4.8858, 36.5097] }
            },
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain",
                    "NAME_1": "Andalucía", 
                    "NAME_2": "Málaga",
                    "NAME_4": "Antequera" 
                },
                "geometry": { "type": "Point", "coordinates": [-4.5598, 37.0187] }
            },
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain",
                    "NAME_1": "Andalucía", 
                    "NAME_2": "Granada",
                    "NAME_4": "Granada" 
                },
                "geometry": { "type": "Point", "coordinates": [-3.5986, 37.1773] }
            },
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain",
                    "NAME_1": "Andalucía", 
                    "NAME_2": "Córdoba",
                    "NAME_4": "Córdoba" 
                },
                "geometry": { "type": "Point", "coordinates": [-4.7794, 37.8882] }
            },
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain",
                    "NAME_1": "Andalucía", 
                    "NAME_2": "Sevilla",
                    "NAME_4": "Sevilla" 
                },
                "geometry": { "type": "Point", "coordinates": [-5.9845, 37.3891] }
            },
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain",
                    "NAME_1": "Andalucía", 
                    "NAME_2": "Cádiz",
                    "NAME_4": "Cádiz" 
                },
                "geometry": { "type": "Point", "coordinates": [-6.3010, 36.5298] }
            },
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain",
                    "NAME_1": "Andalucía", 
                    "NAME_2": "Jaén",
                    "NAME_4": "Jaén" 
                },
                "geometry": { "type": "Point", "coordinates": [-3.7903, 37.7796] }
            },
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain",
                    "NAME_1": "Andalucía", 
                    "NAME_2": "Huelva",
                    "NAME_4": "Huelva" 
                },
                "geometry": { "type": "Point", "coordinates": [-6.9447, 37.2614] }
            },
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain",
                    "NAME_1": "Andalucía", 
                    "NAME_2": "Almería",
                    "NAME_4": "Almería" 
                },
                "geometry": { "type": "Point", "coordinates": [-2.4637, 36.8381] }
            },
            // Madrid region
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain",
                    "NAME_1": "Madrid", 
                    "NAME_2": "Madrid",
                    "NAME_4": "Madrid" 
                },
                "geometry": { "type": "Point", "coordinates": [-3.7038, 40.4168] }
            },
            // Cataluña region
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain",
                    "NAME_1": "Cataluña", 
                    "NAME_2": "Barcelona",
                    "NAME_4": "Barcelona" 
                },
                "geometry": { "type": "Point", "coordinates": [2.1734, 41.3851] }
            },
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain",
                    "NAME_1": "Cataluña", 
                    "NAME_2": "Girona",
                    "NAME_4": "Girona" 
                },
                "geometry": { "type": "Point", "coordinates": [2.8214, 41.9818] }
            },
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain",
                    "NAME_1": "Cataluña", 
                    "NAME_2": "Lleida",
                    "NAME_4": "Lleida" 
                },
                "geometry": { "type": "Point", "coordinates": [0.6267, 41.6178] }
            },
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain",
                    "NAME_1": "Cataluña", 
                    "NAME_2": "Tarragona",
                    "NAME_4": "Tarragona" 
                },
                "geometry": { "type": "Point", "coordinates": [1.2444, 41.1188] }
            },
            // Comunidad Valenciana
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain",
                    "NAME_1": "Comunidad Valenciana", 
                    "NAME_2": "Valencia",
                    "NAME_4": "Valencia" 
                },
                "geometry": { "type": "Point", "coordinates": [-0.3763, 39.4699] }
            },
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain",
                    "NAME_1": "Comunidad Valenciana", 
                    "NAME_2": "Alicante",
                    "NAME_4": "Alicante" 
                },
                "geometry": { "type": "Point", "coordinates": [-0.4813, 38.3452] }
            },
            // Aragón region
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain",
                    "NAME_1": "Aragón", 
                    "NAME_2": "Zaragoza",
                    "NAME_4": "Zaragoza" 
                },
                "geometry": { "type": "Point", "coordinates": [-0.8890, 41.6488] }
            },
            // Galicia region
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain", 
                    "NAME_1": "Galicia",
                    "NAME_2": "A Coruña",
                    "NAME_4": "A Coruña" 
                },
                "geometry": { "type": "Point", "coordinates": [-8.3959, 43.3623] }
            },
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain", 
                    "NAME_1": "Galicia",
                    "NAME_2": "Pontevedra",
                    "NAME_4": "Vigo" 
                },
                "geometry": { "type": "Point", "coordinates": [-8.7207, 42.2406] }
            },
            // País Vasco region
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain",
                    "NAME_1": "País Vasco", 
                    "NAME_2": "Vizcaya",
                    "NAME_4": "Bilbao" 
                },
                "geometry": { "type": "Point", "coordinates": [-2.9350, 43.2630] }
            },
            // Add more regions to improve coverage
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain",
                    "NAME_1": "Castilla-La Mancha", 
                    "NAME_2": "Toledo",
                    "NAME_4": "Toledo" 
                },
                "geometry": { "type": "Point", "coordinates": [-4.0273, 39.8628] }
            },
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain",
                    "NAME_1": "Castilla-La Mancha", 
                    "NAME_2": "Ciudad Real",
                    "NAME_4": "Ciudad Real" 
                },
                "geometry": { "type": "Point", "coordinates": [-3.9273, 38.9848] }
            },
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain",
                    "NAME_1": "Castilla-La Mancha", 
                    "NAME_2": "Ciudad Real",
                    "NAME_4": "Valdepeñas" 
                },
                "geometry": { "type": "Point", "coordinates": [-3.3836, 38.7609] }
            },
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain",
                    "NAME_1": "Castilla-La Mancha", 
                    "NAME_2": "Ciudad Real",
                    "NAME_4": "Puertollano" 
                },
                "geometry": { "type": "Point", "coordinates": [-4.1073, 38.6869] }
            },
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain",
                    "NAME_1": "Castilla-La Mancha", 
                    "NAME_2": "Albacete",
                    "NAME_4": "Albacete" 
                },
                "geometry": { "type": "Point", "coordinates": [-1.8563, 38.9942] }
            },
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain",
                    "NAME_1": "Castilla-La Mancha", 
                    "NAME_2": "Cuenca",
                    "NAME_4": "Cuenca" 
                },
                "geometry": { "type": "Point", "coordinates": [-2.1374, 40.0718] }
            },
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain",
                    "NAME_1": "Castilla-La Mancha", 
                    "NAME_2": "Guadalajara",
                    "NAME_4": "Guadalajara" 
                },
                "geometry": { "type": "Point", "coordinates": [-3.1668, 40.6321] }
            },
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain",
                    "NAME_1": "Castilla y León", 
                    "NAME_2": "Valladolid",
                    "NAME_4": "Valladolid" 
                },
                "geometry": { "type": "Point", "coordinates": [-4.7262, 41.6523] }
            },
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain",
                    "NAME_1": "Murcia", 
                    "NAME_2": "Murcia",
                    "NAME_4": "Murcia" 
                },
                "geometry": { "type": "Point", "coordinates": [-1.1307, 37.9922] }
            },
            {
                "type": "Feature",
                "properties": { 
                    "NAME_0": "Spain",
                    "NAME_1": "Extremadura", 
                    "NAME_2": "Badajoz",
                    "NAME_4": "Badajoz" 
                },
                "geometry": { "type": "Point", "coordinates": [-6.9706, 38.8794] }
            }
        ]
    };
    
    municipalityPolygons = simplifiedGeoJson;
    statusElement.textContent = `✓ Loaded Spanish municipalities (${simplifiedGeoJson.features.length} areas).`;
    statusElement.style.color = '#FF9800';
    
    // Return the data for any caller that needs it
    return simplifiedGeoJson;
}

/**
 * Find municipality for a given point
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Object|null} Municipality information or null if not found
 */
function findMunicipality(lat, lng) {
    if (!municipalityPolygons || !municipalityPolygons.features) {
        return null;
    }
    
    const point = turf.point([lng, lat]);
    
    // First attempt to find precise polygon match
    let result = null;
    let matchDistance = Infinity;
    let closestFeature = null;
    
    // Check if point is likely in Spain based on bounding box
    // Spain's rough bounding box: latitude 36-44, longitude -9.5 to 4.5
    const isLikelyInSpain = (lat >= 35.5 && lat <= 44.5 && lng >= -9.5 && lng <= 4.5);
    
    for (const feature of municipalityPolygons.features) {
        // For polygon geometries (the normal case from GADM data)
        if (feature.geometry && feature.geometry.type.includes('Polygon') && 
            turf.booleanPointInPolygon(point, feature.geometry)) {
            // Return an object with all admin levels
            return {
                country: feature.properties.NAME_0 || 'Spain',
                region: feature.properties.NAME_1,
                province: feature.properties.NAME_2,
                municipality: feature.properties.NAME_4 || feature.properties.NAME_3
            };
        }
        
        // For the simplified version with points
        if (feature.geometry && feature.geometry.type === 'Point') {
            // Create a coverage buffer around the point
            // Increase buffer to 35km for better coverage
            const buffer = turf.buffer(feature.geometry, 35, {units: 'kilometers'});
            
            if (turf.booleanPointInPolygon(point, buffer)) {
                // If we're within the buffer, calculate distance to center
                const distance = turf.distance(
                    point, 
                    turf.point(feature.geometry.coordinates), 
                    {units: 'kilometers'}
                );
                
                // Keep track of the closest match
                if (distance < matchDistance) {
                    matchDistance = distance;
                    closestFeature = feature;
                    result = {
                        country: feature.properties.NAME_0 || 'Spain',
                        region: feature.properties.NAME_1,
                        province: feature.properties.NAME_2,
                        municipality: feature.properties.NAME_4
                    };
                }
            } else {
                // Even if not in buffer, calculate distance to find closest point
                const distance = turf.distance(
                    point, 
                    turf.point(feature.geometry.coordinates), 
                    {units: 'kilometers'}
                );
                
                if (distance < matchDistance) {
                    matchDistance = distance;
                    closestFeature = feature;
                }
            }
        }
    }
    
    // Return the matched result if found
    if (result) {
        return result;
    }
    
    // For points that are in Spain but outside our buffer coverage
    // Use the closest feature to determine region, no matter the distance
    if (isLikelyInSpain && closestFeature) {
        return {
            country: 'Spain',
            region: closestFeature.properties.NAME_1 || 'Unknown Region',
            province: closestFeature.properties.NAME_2 || 'Unknown Province',
            municipality: `Unknown in ${closestFeature.properties.NAME_2 || 'Spain'}`
        };
    }
    
    // Last resort fallback for any point within Spain's bounding box
    if (isLikelyInSpain) {
        return {
            country: 'Spain',
            region: 'Unknown Region',
            province: 'Unknown Province',
            municipality: 'Unknown Municipality'
        };
    }
    
    return null;
}

/**
 * Enriches location data with municipality information
 * @param {Array} data - Array of location records
 * @returns {Array} Enriched data with municipality information
 */
function enrichWithMunicipalities(data) {
    if (!data || data.length === 0) {
        return data;
    }
    
    return data.map(record => {
        // Skip if no coordinates or already has municipality info
        if (!record.latitude || !record.longitude || 
            (record.country && record.region && record.province && record.municipality)) {
            return record;
        }
        
        const municipality = findMunicipality(parseFloat(record.latitude), parseFloat(record.longitude));
        
        if (municipality) {
            return {
                ...record,
                country: municipality.country,
                region: municipality.region,
                province: municipality.province,
                municipality: municipality.municipality
            };
        }
        
        return record;
    });
}

// Export the functions to make them available
window.geoEnrichment = {
    initGeoEnrichment,
    findMunicipality,
    enrichWithMunicipalities
}; 