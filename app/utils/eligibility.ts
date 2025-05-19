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

export const filterDegreesByEligibility = (
  degrees: Degree[],
  userData: UserData,
  faculty: string
): Degree[] => {
  return degrees.filter(degree => {
    // Check if user meets the minimum points requirement
    const totalPoints = userData.subjectMarks.reduce((sum, mark) => sum + mark.mark, 0);
    if (totalPoints < degree.pointRequirement) {
      return false;
    }

    // Check if user meets all subject requirements
    return degree.subjectRequirements.every(requirement => {
      const userMark = userData.subjectMarks.find(mark => mark.subject === requirement.subject);
      const orUserMark = requirement.orSubject 
        ? userData.subjectMarks.find(mark => mark.subject === requirement.orSubject)
        : null;

      if (!userMark && !orUserMark) {
        return false;
      }

      return (userMark?.mark || 0) >= requirement.minPoints || 
             (orUserMark?.mark || 0) >= requirement.minPoints;
    });
  });
}; 