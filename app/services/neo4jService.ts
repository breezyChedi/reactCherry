import { Buffer } from 'buffer';

// Types - Local type definitions
export interface University {
  id: number;
  name: string;
  location: string;
  logoUrl: string;
  appUrl: string;
  faculties: Faculty[];
}

export interface Faculty {
  id: number;
  name: string;
}

export interface SubjectRequirement {
  minPoints: number;
  orSubject?: string;
  subject: string;
}

export interface Degree {
  id: number;
  name: string;
  description: string;
  subjectRequirements: SubjectRequirement[];
  pointRequirement?: number;
  pointCalculation: string;
}

export interface UniversityWithFaculties {
  id: number;
  name: string;
  location: string;
  logoUrl: string;
  appUrl: string;
  description: string;
  campusImageUrl: string;
  faculties: Faculty[];
}

// Neo4j Configuration
const NEO4J_CONFIG = {
  url: 'https://1172d0e4.databases.neo4j.io/db/neo4j/query/v2',
  username: 'neo4j',
  password: 'tvwCOzDbft2TndK1P9KgOoLLI31SJISGYmzCB3Qiq3s'
};

// Helper function to create basic auth header
const getAuthHeader = () => {
  const credentials = `${NEO4J_CONFIG.username}:${NEO4J_CONFIG.password}`;
  const basicAuth = Buffer.from(credentials).toString('base64');
  return `Basic ${basicAuth}`;
};

// Helper function to make Neo4j API requests
const makeNeo4jRequest = async (query: string, parameters: any = {}) => {
  try {
    const response = await fetch(NEO4J_CONFIG.url, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        statement: query,
        parameters
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Neo4j request failed:', error);
    throw error;
  }
};

// API Functions
export const fetchUniversities = async (): Promise<University[]> => {
  const query = 'MATCH (u:University) RETURN u.name AS name, u.location AS location';
  const result = await makeNeo4jRequest(query);
  
  return result.data.values.map(([name, location]: [string, string]) => ({
    id: 0, // Placeholder for compatibility
    name,
    location,
    logoUrl: '',
    appUrl: '',
    faculties: []
  }));
};

export const fetchUniversitiesWithFaculties = async (): Promise<UniversityWithFaculties[]> => {
  const query = `
    MATCH (u:University)-[:HAS_FACULTY]->(f:Faculty)
    WITH u, collect({
      id: id(f),
      name: f.name
    }) as faculties
    RETURN 
      id(u) as id,
      u.name as name,
      u.location as location,
      u.logoUrl as logoUrl,
      u.appUrl as appUrl,
      u.description as description,
      u.campusImageUrl as campusImageUrl,
      faculties
    ORDER BY u.ranking
  `;
  
  const result = await makeNeo4jRequest(query);
  
  if (!result.data || !result.data.values) {
    console.error('Unexpected Neo4j response format:', result);
    throw new Error('Invalid response format from Neo4j');
  }

  console.log('Raw Neo4j response:', JSON.stringify(result.data.values, null, 2));

  return result.data.values.map((row: any[]) => {
    const [id, name, location, logoUrl, appUrl, description, campusImageUrl, faculties] = row;
    return {
      id: Number(id) || 0, // Ensure id is always a valid number
      name: name || 'Unknown University',
      location: location || 'Unknown Location',
      logoUrl: logoUrl || '',
      appUrl: appUrl || '',
      description: description || '',
      campusImageUrl: campusImageUrl || '',
      faculties: Array.isArray(faculties) ? faculties.map((f: any) => ({
        id: Number(f.id) || Math.floor(Math.random() * 10000), // Ensure id is always a valid number
        name: f.name || 'Unknown Faculty'
      })) : []
    };
  });
};

export const fetchFacultiesForUniversity = async (universityId: string): Promise<string[]> => {
  const query = `
    MATCH (u:University)-[:HAS_FACULTY]->(f:Faculty) 
    WHERE id(u) = $universityId 
    RETURN f.name AS name 
    ORDER BY f.name
  `;
  
  const result = await makeNeo4jRequest(query, { universityId });
  
  return result.data.values.map(([name]: [string]) => name || 'Unknown Faculty');
};

export const fetchDegrees = async (facultyId: number): Promise<Degree[]> => {
  if (!facultyId) {
    console.warn('fetchDegrees called with invalid facultyId:', facultyId);
    return [];
  }

  console.log(`Fetching degrees for faculty ID: ${facultyId}`);

  const query = `
    MATCH (f:Faculty)-[:HAS_DEGREE]->(d:Degree)
    MATCH (f:Faculty)-[:USES_PC]->(pc:PointCalculation)
    WHERE id(f) = $facultyId
    OPTIONAL MATCH (d)-[sr:SUBJECT_REQUIREMENT]->(s:Subject)
    OPTIONAL MATCH (d)-[pr:POINT_REQUIREMENT]->(pc:PointCalculation)
    RETURN id(d) as id, d.name as name, d.description as description,
           collect({
             minPoints: sr.minPoints,
             orSubject: sr.orSubject,
             subject: s.name
           }) AS subjectRequirements,
           pr.minPoints AS pointRequirement,
           pc.name as pointCalculation
    ORDER BY d.name
  `;
  
  const result = await makeNeo4jRequest(query, { facultyId });
  
  if (!result.data || !result.data.values) {
    console.error('Unexpected Neo4j response format in fetchDegrees:', result);
    return [];
  }

  console.log(`Raw Neo4j response for degrees:`, JSON.stringify(result.data.values.slice(0, 2), null, 2));

  return result.data.values.map(([id, name, description, subjectRequirementsRaw, pointRequirementRaw, pointCalculation]: [number, string, string, any[], number, string]) => {
    console.log(`Processing degree: id=${id}, name=${name}`);
    
    const processedSubjectRequirements = Array.isArray(subjectRequirementsRaw) 
      ? subjectRequirementsRaw.map(req => ({
          subject: req.subject || 'Unknown Subject',
          minPoints: Number(req.minPoints) || 0,
          orSubject: req.orSubject
        })) 
      : [];

    return {
      id: Number(id),
      name: name || 'Unknown Degree',
      description: description || '',
      subjectRequirements: processedSubjectRequirements,
      pointRequirement: pointRequirementRaw ? Number(pointRequirementRaw) : null,
      pointCalculation: pointCalculation || 'APS'
    };
  });
};

export const fetchDegree = async (degreeId: number): Promise<Degree | null> => {
  if (!degreeId && degreeId !== 0) {
    console.warn('fetchDegree called with invalid degreeId:', degreeId);
    return null;
  }

  console.log(`Fetching degree with ID: ${degreeId}`);

  const query = `
    MATCH (d:Degree)
    WHERE id(d) = $degreeId
    OPTIONAL MATCH (d)-[sr:SUBJECT_REQUIREMENT]->(s:Subject)
    OPTIONAL MATCH (d)-[pr:POINT_REQUIREMENT]->(pc:PointCalculation)
    RETURN id(d) as id, d.name as name, d.description as description,
           collect({
             minPoints: sr.minPoints,
             orSubject: sr.orSubject,
             subject: s.name
           }) AS subjectRequirements,
           pr.minPoints AS pointRequirement,
           pc.name as pointCalculation
  `;
  
  try {
    const result = await makeNeo4jRequest(query, { degreeId });
    
    if (!result.data || !result.data.values || result.data.values.length === 0) {
      console.warn(`No degree found with ID ${degreeId}`);
      return null;
    }

    const [id, name, description, subjectRequirementsRaw, pointRequirementRaw, pointCalculation] = result.data.values[0];
    
    const processedSubjectRequirements = Array.isArray(subjectRequirementsRaw) 
      ? subjectRequirementsRaw.map(req => ({
          subject: req.subject || 'Unknown Subject',
          minPoints: Number(req.minPoints) || 0,
          orSubject: req.orSubject
        })) 
      : [];

    return {
      id: Number(id),
      name: name || 'Unknown Degree',
      description: description || '',
      subjectRequirements: processedSubjectRequirements,
      pointRequirement: pointRequirementRaw ? Number(pointRequirementRaw) : null,
      pointCalculation: pointCalculation || 'APS'
    };
  } catch (error) {
    console.error(`Error fetching degree with ID ${degreeId}:`, error);
    return null;
  }
};

export const fetchFaculties = async (universityId: number): Promise<Faculty[]> => {
  if (!universityId) {
    console.warn('fetchFaculties called with invalid universityId:', universityId);
    return [];
  }
  
  const query = `
    MATCH (u:University)-[:HAS_FACULTY]->(f:Faculty)
    WHERE id(u) = $universityId
    RETURN id(f) as id, f.name as name
    ORDER BY f.name
  `;
  
  const result = await makeNeo4jRequest(query, { universityId });
  
  if (!result.data || !result.data.values) {
    console.error('Unexpected Neo4j response format in fetchFaculties:', result);
    return [];
  }
  
  return result.data.values.map(([id, name]: [number, string]) => ({
    id: Number(id) || Math.floor(Math.random() * 10000),
    name: name || 'Unknown Faculty'
  }));
}; 