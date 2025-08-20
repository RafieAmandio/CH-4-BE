// Profession response types
export interface ProfessionResponse {
    id: string;
    name: string;
}

export interface ProfessionCategoryResponse {
    categoryId: string;
    categoryName: string;
    professions: ProfessionResponse[];
}

export interface GetProfessionsResponse {
    data: ProfessionCategoryResponse[];
}

export interface CreateAttendeeInput {
    eventId: string;
    nickname: string;
    userEmail?: string;
    professionId: string;
    linkedinUsername?: string;
    photoLink: string;
}

export interface CreateAttendeeResponse {
    attendeeId: string;
    accessToken?: string; // Only for visitors
}

// For temporary token generation
export interface TemporaryTokenPayload {
    attendeeId: string;
    eventId: string;
    type: 'visitor';
}