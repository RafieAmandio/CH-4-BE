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
