export interface CreateEventInput {
  name: string;
  start: string; // ISO 8601 datetime
  end: string; // ISO 8601 datetime
  description?: string; // Maps to 'detail' field in DB
  photoLink?: string; // Maps to 'photo_link' field in DB
  locationName?: string; // Maps to 'location_name' field in DB
  locationAddress?: string; // Maps to 'location_address' field in DB
  locationLink?: string; // Maps to 'location_link' field in DB
  latitude?: number;
  longitude?: number;
  link?: string; // Event-related link
}

export interface UpdateEventInput {
  name?: string;
  start?: string; // ISO 8601 datetime
  end?: string; // ISO 8601 datetime
  description?: string; // Maps to 'detail' field in DB
  photoLink?: string; // Maps to 'photo_link' field in DB
  locationName?: string; // Maps to 'location_name' field in DB
  locationAddress?: string; // Maps to 'location_address' field in DB
  locationLink?: string; // Maps to 'location_link' field in DB
  latitude?: number;
  longitude?: number;
  link?: string; // Event-related link
  status?: 'DRAFT' | 'ONGOING' | 'UPCOMING' | 'COMPLETED';
}
