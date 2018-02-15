export type PlaceType = 'POI' | 'Neighborhood' | 'City' | 'Admin' | 'Unknown';

export class PlaceResult {
    name: string;
    type: PlaceType;
    country: string;
    hashtags: string[];
    sources: string[];
}
