import { PaginationResponse } from './index.js';

export interface UpdateProfileInput {
  name?: string;
  email?: string;
  username?: string;
  linkedinUsername?: string;
  photoLink?: string;
  professionId?: string;
}

export interface CompleteRegistrationInput {
  name: string;
  email: string;
  linkedinUsername?: string;
  photoLink: string;
  professionId: string;
}

export interface ProfessionResponse {
  id: string;
  name: string;
}

export interface ProfessionCategoryResponse {
  categoryId: string;
  categoryName: string;
  professions: ProfessionResponse[];
}

export interface UserProfessionResponse {
  id: string;
  name: string;
  categoryName: string;
}

export interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  username: string | null;
  linkedinUsername: string | null;
  photoLink: string | null;
  profession: UserProfessionResponse | null;
}



export interface PublicUserProfileResponse {
  id: string;
  name: string;
  username: string | null;
  linkedinUsername: string | null;
  photoLink: string | null;
  profession: {
    name: string;
    categoryName: string;
  } | null;
}

export interface EventHistoryItem {
  attendeeId: string;
  event: {
    id: string;
    name: string;
    start: string;
    end: string;
    detail: string | null;
    photo_link: string | null;
    location_name: string | null;
    location_address: string | null;
    location_link: string | null;
    link: string | null;
    status: string;
    current_participants: number;
    code: string;
  };
  registrationDate: string;
}

export interface EventHistoryResponse {
  items: EventHistoryItem[];
  pagination: PaginationResponse;
}
