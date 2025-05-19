import { filterDegreesByEligibility } from './eligibility';

interface SubjectMark {
  subject: string;
  mark: number;
}

interface UserData {
  subjectMarks: SubjectMark[];
  nbtScores: { [key: string]: number };
}

interface SubjectRequirement {
  subject: string;
  minPoints: number;
  orSubject?: string;
}

interface Degree {
  id: number;
  name: string;
  pointRequirement: number;
  subjectRequirements: SubjectRequirement[];
  description?: string;
}

export default {
  filterDegreesByEligibility: async (
    degrees: Degree[],
    userProfile: any,
    faculty: string
  ): Promise<Degree[]> => {
    const subjectMarks = userProfile.subjects.map((subject: string, index: number) => ({
      subject,
      mark: userProfile.marks[`mark${index + 1}`]
    }));

    const userData = {
      subjectMarks,
      nbtScores: userProfile.nbtScores
    };

    return filterDegreesByEligibility(degrees, userData, faculty);
  }
}; 