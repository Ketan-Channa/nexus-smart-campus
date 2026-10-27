export type UserRole = 'Student' | 'Faculty' | 'Parent' | 'Alumni' | 'Administrator';

export interface SecurityQuestion {
  question: string;
  answer: string;
}

export const SECURITY_QUESTIONS_LIST = [
  'What was the name of your first elementary school?',
  'What is your mother\'s maiden name?',
  'What was your childhood nickname?',
  'In what city were you born?',
  'What was the name of your first pet?',
  'What is your favorite book or movie?',
  'What model was your first bicycle?',
  'What primary school did you attend?',
];

// Login payloads
export interface StudentLoginPayload {
  fullName: string;
  rollNumber: string;
  password: string;
}

export interface AlumniLoginPayload {
  fullName: string;
  alumniId: string; // Roll Number / Alumni ID
  password: string;
}

export interface FacultyLoginPayload {
  facultyName: string;
  password: string;
}

export interface ParentLoginPayload {
  studentName: string;
  studentRollNumber: string;
  parentPassword: string;
}

export interface AdminLoginPayload {
  adminName: string;
  password: string;
}

// User object after login
export interface UserSession {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
  avatarUrl?: string;
  token?: string;
  isClassIncharge?: string;
  inchargeClass?: string;
  rollNumber?: string;
  department?: string;
  className?: string;
}
