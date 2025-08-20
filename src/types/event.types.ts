export interface CreateEventInput {
  name: string;
  datetime: string; // Maps to 'start' field in DB
  description?: string; // Maps to 'detail' field in DB
  location?: string; // Maps to 'location_name' field in DB
  latitude?: number;
  longitude?: number;
}

export interface UpdateEventInput {
  name?: string;
  datetime?: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  status?: 'DRAFT' | 'ONGOING' | 'UPCOMING' | 'COMPLETED';
}
