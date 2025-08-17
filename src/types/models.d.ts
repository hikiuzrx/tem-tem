export interface publicUser {
  id: string;
  email: string;
  username: string;
  createdAt?: Date;
  role: 'admin' | 'user';
}
