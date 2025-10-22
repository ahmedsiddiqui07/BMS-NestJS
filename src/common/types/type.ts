import { ROLES } from '../constants/constant';

export type SafeBody = Record<string, unknown> | undefined;
export type RoleType = (typeof ROLES)[keyof typeof ROLES];
