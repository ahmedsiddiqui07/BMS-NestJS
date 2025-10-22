export const usersData = [
  { name: 'Super Admin', email: 'superadmin@gmail.com', role: 'super_admin' },
  { name: 'Admin', email: 'admin@gmail.com', role: 'admin' },
  { name: 'Librarian', email: 'librarian@gmail.com', role: 'librarian' },
  { name: 'User', email: 'user@gmail.com', role: 'user' },
];
export const ROLES = {
  USER: 'user',
  LIBRARIAN: 'librarian',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};
export const allowedPairs = [
  ['user', 'librarian'],
  ['librarian', 'user'],
];
export const Password = 'Ahmed123$';
export const ReturnDays = 7;
export const finePerDay = 50;
export const msPerDay = 1000 * 60 * 60 * 24;
