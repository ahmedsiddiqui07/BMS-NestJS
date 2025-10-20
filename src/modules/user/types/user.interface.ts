export interface AccountDeletionResponse {
  id: number;
  deleted: boolean;
}

export interface UpdatedUser {
  id: number;
  name: string;
  email: string;
}
export interface GetUserByIdResponse {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  roleName: string;
  roleIsActive: boolean;
}
