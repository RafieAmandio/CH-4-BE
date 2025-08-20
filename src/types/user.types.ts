export interface UpdateProfileInput {
  name?: string;
  username?: string;
  nickname?: string;
}

export interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  username?: string;
  nickname?: string;
  profilePhoto?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicUserProfileResponse {
  id: string;
  name: string;
  username?: string;
  nickname?: string;
  profilePhoto?: string;
}
