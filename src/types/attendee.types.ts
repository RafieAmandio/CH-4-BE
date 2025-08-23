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
  eventCode: string;
  nickname: string;
  userEmail?: string;
  professionId: string;
  linkedinUsername?: string;
  photoLink: string;
}

export interface CreateAttendeeResponse {
  attendeeId: string;
  accessToken: string;
}

export interface GoalsCategoryResponse {
  id: string;
  name: string;
}

export interface GetGoalsCategoriesResponse {
  data: GoalsCategoryResponse[];
}

export interface UpdateGoalsCategoryInput {
  goalsCategoryId: string;
}

export interface QuestionResponse {
  id: string;
  question: string;
  type:
  | 'SINGLE_CHOICE'
  | 'MULTI_SELECT'
  | 'RANKED_CHOICE'
  | 'FREE_TEXT'
  | 'NUMBER'
  | 'SCALE'
  | 'DATE';
  placeholder?: string;
  displayOrder: number;
  isRequired: boolean;
  isShareable: boolean;
  constraints: {
    minSelect: number;
    maxSelect?: number;
    requireRanking: boolean;
    isUsingOther: boolean;
    textMaxLen?: number;
    numberMin?: number;
    numberMax?: number;
    numberStep?: number;
  };
  answerOptions: AnswerOptionResponse[];
}

export interface AnswerOptionResponse {
  id: string;
  label: string;
  value?: string;
  displayOrder: number;
}

export interface UpdateGoalsCategoryResponse {
  attendeeId: string;
  goalsCategory: GoalsCategoryResponse;
  questions: QuestionResponse[];
}

export interface SubmitAnswersInput {
  answers: Array<{
    questionId: string;
    answerOptionId?: string;
    textValue?: string;
    numberValue?: number;
    dateValue?: string;
    rank?: number;
    weight?: number;
  }>;
}

export interface RecommendationTargetAttendee {
  nickname: string;
  profession: {
    name: string;
    categoryName: string;
  };
  goalsCategory: {
    name: string;
  };
  linkedinUsername?: string;
  photoLink: string;
  shareableAnswers: Array<{
    question: string;
    questionType: string;
    answerLabel?: string;
    textValue?: string;
    numberValue?: number;
    dateValue?: string;
    rank?: number;
  }>;
}

export interface RecommendationResponse {
  targetAttendeeId: string;
  score?: number;
  reasoning: string;
  targetAttendee: RecommendationTargetAttendee;
}

export interface SubmitAnswersResponse {
  answersProcessed: number;
  recommendations: RecommendationResponse[];
}

export interface GetRecommendationsResponse {
  attendeeId: string;
  eventId: string;
  recommendations: RecommendationResponse[];
}

export interface ValidateEventResponse {
  id: string;
  name: string;
  start: string;
  end: string;
  detail?: string;
  photo_link?: string;
  location_name?: string;
  location_address?: string;
  location_link?: string;
  latitude?: number;
  longitude?: number;
  link?: string;
  status: string;
  current_participants: number;
  code: string;
  creator: {
    id: string;
    name: string;
  };
}
