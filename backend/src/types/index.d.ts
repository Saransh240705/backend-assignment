export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
