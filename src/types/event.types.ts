export interface CreateEventInput {
  name: string;
  datetime: string; // Maps to 'start' field in DB
  description?: string; // Maps to 'detail' field in DB
  location?: string; // Maps to 'location_name' field in DB
  maxParticipants?: number; // New field to add to schema
}

export interface UpdateEventInput {
  name?: string;
  datetime?: string;
  description?: string;
  location?: string;
  status?: 'DRAFT' | 'ONGOING' | 'UPCOMING' | 'COMPLETED';
  maxParticipants?: number;
}
