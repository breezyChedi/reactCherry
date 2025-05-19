export interface SubjectMark {
  subject: string;
  mark: number;
}

export interface UserData {
  subjectMarks: SubjectMark[];
  nbtScores: { [key: string]: number };
}

export interface SubjectRequirement {
  subject: string;
  minPoints: number;
  orSubject?: string;
}

export interface Degree {
  id: number;
  name: string;
  pointRequirement?: number;
  subjectRequirements: SubjectRequirement[];
  description?: string;
  bookmarked?: boolean;
}

export interface Faculty {
  id: number;
  name: string;
}

export interface University {
  id: number;
  name: string;
  location: string;
  logoUrl: string;
  appUrl: string;
  faculties: Faculty[];
  description?: string;
  campusImageUrl?: string;
} 