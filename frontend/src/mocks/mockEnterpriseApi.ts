import {
  AUTH_TEST_USERS,
  ACCOUNT_MANAGER,
  buildCompanyEmail,
} from '../utils/mockPeople';

const ENABLE_MOCK_ENTERPRISE_DATA = true;

type MockDepartment = {
  id: string;
  name: string;
  description: string;
  parentDepartmentId: string | null;
  createdAt: string;
  updatedAt: string;
};

type MockEmployee = {
  id: string;
  userId: string;
  uid: string;
  name: string;
  surname: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Employee';
  departmentId: string;
  departmentName: string;
  status: 'active' | 'inactive';
  isActive: boolean;
  lastActive: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  phone: string;
  teamId?: string;
  cardsRefPath?: string;
  cardsRef?: string;
  individualPermissions?: { removed: string[]; added: string[] };
};

type MockTeam = {
  id: string;
  name: string;
  description: string;
  departmentId: string;
  departmentRef: string;
  leaderId: string;
  leaderRef: string | null;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
};

type MockCard = {
  id: string;
  userId: string;
  employeeId: string;
  name: string;
  surname: string;
  occupation: string;
  email: string;
  phone: string;
  company: string;
  colorScheme: string;
  createdAt: string;
  cardIndex: number;
  employeeName: string;
  employeeTitle: string;
  departmentId: string;
  departmentName: string;
  numberOfScan: number;
  scanCount: number;
  companyLogo: string | null;
  profileImage: string | null;
  socials: Record<string, { link: string; title: string }>;
};

type MockContact = {
  name: string;
  surname: string;
  phone: string;
  howWeMet: string;
  email: string;
  company: string;
  createdAt: { _seconds: number; _nanoseconds: number };
  ownerInfo: {
    userId: string;
    email: string;
    department: string;
    departmentName?: string;
  };
  enterpriseId: string;
  enterpriseName: string;
  location: {
    name?: string;
    latitude: number;
    longitude: number;
    city: string;
    region: string;
    country: string;
    countryCode: string;
    timezone: string;
    provider: string;
    randomized?: boolean;
  };
};

type MockSecurityAlert = {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  title: string;
  description: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
  };
  timestamp: string;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    failedAttempts?: number;
    affectedUsers?: number;
    errorCode?: string;
    logEntryId?: string;
  };
};

type MockSecurityLog = {
  id: string;
  action: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  timestamp: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
  errorMessage?: string;
};

const ENTERPRISE_ID = 'x-spark-test';
const ENTERPRISE_NAME = 'XS Card South Africa';
const COMPANY_NAME = 'XS Card';

const toIso = (date: Date) => date.toISOString();
const daysAgo = (days: number) => toIso(new Date(Date.now() - days * 24 * 60 * 60 * 1000));
const hoursAgo = (hours: number) => toIso(new Date(Date.now() - hours * 60 * 60 * 1000));
const firestoreTimestampDaysAgo = (days: number) => {
  const millis = Date.now() - days * 24 * 60 * 60 * 1000;
  return {
    _seconds: Math.floor(millis / 1000),
    _nanoseconds: 0,
  };
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });

const csvResponse = (body: string, filename: string) =>
  new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });

const departments: MockDepartment[] = [
  {
    id: 'dept-ops',
    name: 'Operations',
    description: 'Enterprise operations, onboarding, and internal enablement.',
    parentDepartmentId: null,
    createdAt: daysAgo(480),
    updatedAt: daysAgo(3),
  },
  {
    id: 'dept-sales',
    name: 'Sales',
    description: 'Field sales, partnerships, and strategic accounts.',
    parentDepartmentId: null,
    createdAt: daysAgo(470),
    updatedAt: daysAgo(5),
  },
  {
    id: 'dept-marketing',
    name: 'Marketing',
    description: 'Brand, growth campaigns, and event activation.',
    parentDepartmentId: null,
    createdAt: daysAgo(465),
    updatedAt: daysAgo(2),
  },
  {
    id: 'dept-success',
    name: 'Customer Success',
    description: 'Retention, training, and enterprise support delivery.',
    parentDepartmentId: null,
    createdAt: daysAgo(455),
    updatedAt: daysAgo(1),
  },
];

const employees: MockEmployee[] = [
  {
    id: 'BPxFmmG6SVXvbwwRJ0YjBnuI8e73',
    userId: 'BPxFmmG6SVXvbwwRJ0YjBnuI8e73',
    uid: 'BPxFmmG6SVXvbwwRJ0YjBnuI8e73',
    name: 'Naledi',
    surname: 'Mokoena',
    firstName: 'Naledi',
    lastName: 'Mokoena',
    email: AUTH_TEST_USERS[0].email,
    role: 'Admin',
    departmentId: 'dept-ops',
    departmentName: 'Operations',
    status: 'active',
    isActive: true,
    lastActive: hoursAgo(1),
    createdAt: daysAgo(420),
    updatedAt: daysAgo(1),
    title: 'Operations Director',
    phone: '+27 82 456 7812',
    teamId: 'team-ops-core',
    cardsRefPath: 'cards/card-naledi',
    cardsRef: 'cards/card-naledi',
    individualPermissions: { removed: [], added: ['manageAllCards', 'viewAnalytics', 'manageUsers'] },
  },
  {
    id: 'mgr-ayanda',
    userId: 'mgr-ayanda',
    uid: 'mgr-ayanda',
    name: 'Ayanda',
    surname: 'Dlamini',
    firstName: 'Ayanda',
    lastName: 'Dlamini',
    email: AUTH_TEST_USERS[1].email,
    role: 'Manager',
    departmentId: 'dept-sales',
    departmentName: 'Sales',
    status: 'active',
    isActive: true,
    lastActive: hoursAgo(2),
    createdAt: daysAgo(410),
    updatedAt: daysAgo(1),
    title: 'Regional Sales Manager',
    phone: '+27 72 341 8802',
    teamId: 'team-sales-field',
    cardsRefPath: 'cards/card-ayanda',
    cardsRef: 'cards/card-ayanda',
    individualPermissions: { removed: [], added: ['viewAnalytics', 'exportCards'] },
  },
  {
    id: 'mgr-lindokuhle',
    userId: 'mgr-lindokuhle',
    uid: 'mgr-lindokuhle',
    name: 'Lindokuhle',
    surname: 'Nkosi',
    firstName: 'Lindokuhle',
    lastName: 'Nkosi',
    email: buildCompanyEmail('Lindokuhle', 'Nkosi'),
    role: 'Manager',
    departmentId: 'dept-marketing',
    departmentName: 'Marketing',
    status: 'active',
    isActive: true,
    lastActive: hoursAgo(4),
    createdAt: daysAgo(395),
    updatedAt: daysAgo(2),
    title: 'Growth Marketing Manager',
    phone: '+27 83 774 1920',
    teamId: 'team-growth-lab',
    cardsRefPath: 'cards/card-lindokuhle',
    cardsRef: 'cards/card-lindokuhle',
    individualPermissions: { removed: [], added: ['exportCards'] },
  },
  {
    id: 'emp-aphiwe',
    userId: 'emp-aphiwe',
    uid: 'emp-aphiwe',
    name: 'Aphiwe',
    surname: 'Ndlovu',
    firstName: 'Aphiwe',
    lastName: 'Ndlovu',
    email: AUTH_TEST_USERS[2].email,
    role: 'Employee',
    departmentId: 'dept-ops',
    departmentName: 'Operations',
    status: 'active',
    isActive: true,
    lastActive: hoursAgo(6),
    createdAt: daysAgo(320),
    updatedAt: daysAgo(3),
    title: 'Onboarding Specialist',
    phone: '+27 82 118 4421',
    teamId: 'team-ops-core',
    cardsRefPath: 'cards/card-aphiwe',
    cardsRef: 'cards/card-aphiwe',
    individualPermissions: { removed: [], added: [] },
  },
  {
    id: 'emp-tebogo',
    userId: 'emp-tebogo',
    uid: 'emp-tebogo',
    name: 'Tebogo',
    surname: 'Mahlangu',
    firstName: 'Tebogo',
    lastName: 'Mahlangu',
    email: AUTH_TEST_USERS[3].email,
    role: 'Employee',
    departmentId: 'dept-sales',
    departmentName: 'Sales',
    status: 'active',
    isActive: true,
    lastActive: hoursAgo(12),
    createdAt: daysAgo(305),
    updatedAt: daysAgo(7),
    title: 'Account Executive',
    phone: '+27 78 552 7812',
    teamId: 'team-sales-field',
    cardsRefPath: 'cards/card-tebogo',
    cardsRef: 'cards/card-tebogo',
    individualPermissions: { removed: [], added: ['shareCards'] },
  },
  {
    id: 'emp-lerato',
    userId: 'emp-lerato',
    uid: 'emp-lerato',
    name: 'Lerato',
    surname: 'Zulu',
    firstName: 'Lerato',
    lastName: 'Zulu',
    email: AUTH_TEST_USERS[4].email,
    role: 'Employee',
    departmentId: 'dept-success',
    departmentName: 'Customer Success',
    status: 'active',
    isActive: true,
    lastActive: hoursAgo(8),
    createdAt: daysAgo(290),
    updatedAt: daysAgo(5),
    title: 'Client Success Consultant',
    phone: '+27 71 441 9903',
    teamId: 'team-client-success',
    cardsRefPath: 'cards/card-lerato',
    cardsRef: 'cards/card-lerato',
    individualPermissions: { removed: [], added: ['viewContacts'] },
  },
  {
    id: 'emp-zanele',
    userId: 'emp-zanele',
    uid: 'emp-zanele',
    name: 'Zanele',
    surname: 'Naidoo',
    firstName: 'Zanele',
    lastName: 'Naidoo',
    email: buildCompanyEmail('Zanele', 'Naidoo'),
    role: 'Employee',
    departmentId: 'dept-success',
    departmentName: 'Customer Success',
    status: 'active',
    isActive: true,
    lastActive: hoursAgo(10),
    createdAt: daysAgo(275),
    updatedAt: daysAgo(2),
    title: 'Enterprise Support Lead',
    phone: '+27 84 310 2201',
    teamId: 'team-client-success',
    cardsRefPath: 'cards/card-zanele',
    cardsRef: 'cards/card-zanele',
    individualPermissions: { removed: [], added: ['viewContacts'] },
  },
  {
    id: 'emp-kagiso',
    userId: 'emp-kagiso',
    uid: 'emp-kagiso',
    name: 'Kagiso',
    surname: 'Pillay',
    firstName: 'Kagiso',
    lastName: 'Pillay',
    email: buildCompanyEmail('Kagiso', 'Pillay'),
    role: 'Employee',
    departmentId: 'dept-marketing',
    departmentName: 'Marketing',
    status: 'active',
    isActive: true,
    lastActive: hoursAgo(14),
    createdAt: daysAgo(250),
    updatedAt: daysAgo(6),
    title: 'Campaign Coordinator',
    phone: '+27 76 007 1189',
    teamId: 'team-growth-lab',
    cardsRefPath: 'cards/card-kagiso',
    cardsRef: 'cards/card-kagiso',
    individualPermissions: { removed: [], added: [] },
  },
  {
    id: 'emp-thando',
    userId: 'emp-thando',
    uid: 'emp-thando',
    name: 'Thando',
    surname: 'Madonsela',
    firstName: 'Thando',
    lastName: 'Madonsela',
    email: buildCompanyEmail('Thando', 'Madonsela'),
    role: 'Employee',
    departmentId: 'dept-ops',
    departmentName: 'Operations',
    status: 'active',
    isActive: true,
    lastActive: hoursAgo(20),
    createdAt: daysAgo(240),
    updatedAt: daysAgo(3),
    title: 'Process Analyst',
    phone: '+27 83 112 0045',
    teamId: 'team-ops-core',
    cardsRefPath: 'cards/card-thando',
    cardsRef: 'cards/card-thando',
    individualPermissions: { removed: [], added: [] },
  },
  {
    id: 'emp-karabo',
    userId: 'emp-karabo',
    uid: 'emp-karabo',
    name: 'Karabo',
    surname: 'Jacobs',
    firstName: 'Karabo',
    lastName: 'Jacobs',
    email: buildCompanyEmail('Karabo', 'Jacobs'),
    role: 'Employee',
    departmentId: 'dept-sales',
    departmentName: 'Sales',
    status: 'active',
    isActive: true,
    lastActive: hoursAgo(16),
    createdAt: daysAgo(225),
    updatedAt: daysAgo(4),
    title: 'Partnerships Executive',
    phone: '+27 81 922 1130',
    teamId: 'team-sales-field',
    cardsRefPath: 'cards/card-karabo',
    cardsRef: 'cards/card-karabo',
    individualPermissions: { removed: [], added: [] },
  },
];

const teams: MockTeam[] = [
  {
    id: 'team-ops-core',
    name: 'Operations Core',
    description: 'Runs internal delivery, onboarding, and support escalations.',
    departmentId: 'dept-ops',
    departmentRef: 'departments/dept-ops',
    leaderId: 'BPxFmmG6SVXvbwwRJ0YjBnuI8e73',
    leaderRef: 'employees/BPxFmmG6SVXvbwwRJ0YjBnuI8e73',
    memberCount: 3,
    createdAt: daysAgo(330),
    updatedAt: daysAgo(2),
  },
  {
    id: 'team-sales-field',
    name: 'Field Revenue',
    description: 'Enterprise account acquisition and channel development.',
    departmentId: 'dept-sales',
    departmentRef: 'departments/dept-sales',
    leaderId: 'mgr-ayanda',
    leaderRef: 'employees/mgr-ayanda',
    memberCount: 3,
    createdAt: daysAgo(320),
    updatedAt: daysAgo(2),
  },
  {
    id: 'team-growth-lab',
    name: 'Growth Lab',
    description: 'Campaign execution, brand storytelling, and events.',
    departmentId: 'dept-marketing',
    departmentRef: 'departments/dept-marketing',
    leaderId: 'mgr-lindokuhle',
    leaderRef: 'employees/mgr-lindokuhle',
    memberCount: 2,
    createdAt: daysAgo(318),
    updatedAt: daysAgo(1),
  },
  {
    id: 'team-client-success',
    name: 'Client Success',
    description: 'Retention, training, and enterprise support coverage.',
    departmentId: 'dept-success',
    departmentRef: 'departments/dept-success',
    leaderId: 'emp-zanele',
    leaderRef: 'employees/emp-zanele',
    memberCount: 2,
    createdAt: daysAgo(300),
    updatedAt: daysAgo(1),
  },
];

const cards: MockCard[] = employees
  .filter((employee) => employee.cardsRefPath)
  .map((employee, index) => ({
    id: employee.cardsRefPath!.split('/').pop()!,
    userId: employee.id,
    employeeId: employee.id,
    name: employee.name,
    surname: employee.surname,
    occupation: employee.title,
    email: employee.email,
    phone: employee.phone,
    company: COMPANY_NAME,
    colorScheme: ['#1B2B5B', '#0F766E', '#7C3AED', '#DC2626'][index % 4],
    createdAt: employee.createdAt,
    cardIndex: index,
    employeeName: `${employee.name} ${employee.surname}`,
    employeeTitle: employee.title,
    departmentId: employee.departmentId,
    departmentName: employee.departmentName,
    numberOfScan: [124, 91, 77, 68, 84, 57, 63, 49, 38, 72][index] || 20,
    scanCount: [124, 91, 77, 68, 84, 57, 63, 49, 38, 72][index] || 20,
    companyLogo: null,
    profileImage: null,
    socials: {
      linkedin: {
        link: `https://linkedin.com/in/${employee.firstName.toLowerCase()}-${employee.lastName.toLowerCase().replace(/\s+/g, '-')}`,
        title: 'LinkedIn',
      },
    },
  }));

const contactTemplates = [
  { name: 'Nomsa', surname: 'Dube', company: 'Ubuntu Retail', city: 'Johannesburg', region: 'Gauteng', lat: -26.2041, lng: 28.0473 },
  { name: 'Siyabonga', surname: 'Cele', company: 'Mzansi Media', city: 'Durban', region: 'KwaZulu-Natal', lat: -29.8587, lng: 31.0218 },
  { name: 'Leanne', surname: 'Petersen', company: 'Cape Connect', city: 'Cape Town', region: 'Western Cape', lat: -33.9249, lng: 18.4241 },
  { name: 'Tshepo', surname: 'Molefe', company: 'North Star Logistics', city: 'Pretoria', region: 'Gauteng', lat: -25.7479, lng: 28.2293 },
  { name: 'Asanda', surname: 'Gqeba', company: 'Bayview Tech', city: 'Gqeberha', region: 'Eastern Cape', lat: -33.9608, lng: 25.6022 },
  { name: 'Riyaad', surname: 'Davids', company: 'Winelands Digital', city: 'Stellenbosch', region: 'Western Cape', lat: -33.9321, lng: 18.8602 },
];

const buildContactsForEmployee = (employee: MockEmployee, startIndex: number): MockContact[] =>
  Array.from({ length: 3 }, (_, index) => {
    const template = contactTemplates[(startIndex + index) % contactTemplates.length];
    return {
      name: template.name,
      surname: template.surname,
      phone: `+27 8${index + 1} ${100 + startIndex}${index} ${4500 + startIndex * 11 + index}`,
      howWeMet: ['Networking breakfast', 'Client workshop', 'Product demo'][index % 3],
      email: buildCompanyEmail(template.name, template.surname, startIndex + index + 1),
      company: template.company,
      createdAt: firestoreTimestampDaysAgo(18 + startIndex * 7 + index * 6),
      ownerInfo: {
        userId: employee.id,
        email: employee.email,
        department: employee.departmentId,
        departmentName: employee.departmentName,
      },
      enterpriseId: ENTERPRISE_ID,
      enterpriseName: ENTERPRISE_NAME,
      location: {
        latitude: template.lat,
        longitude: template.lng,
        city: template.city,
        region: template.region,
        country: 'South Africa',
        countryCode: 'ZA',
        timezone: 'Africa/Johannesburg',
        provider: 'mock-enterprise-api',
        randomized: false,
      },
    };
  });

const contactsByOwner = Object.fromEntries(
  employees.map((employee, index) => [employee.id, buildContactsForEmployee(employee, index)]),
) as Record<string, MockContact[]>;

const securityAlerts: MockSecurityAlert[] = [
  {
    id: 'alert-001',
    type: 'authentication',
    severity: 'high',
    status: 'active',
    title: 'Repeated sign-in failures detected',
    description: `Multiple failed sign-in attempts were detected for ${employees[3].name} ${employees[3].surname}.`,
    user: {
      id: employees[3].id,
      name: `${employees[3].name} ${employees[3].surname}`,
      email: employees[3].email,
      role: employees[3].role,
      department: employees[3].departmentName,
    },
    timestamp: hoursAgo(2),
    metadata: {
      ipAddress: '105.23.114.88',
      location: 'Johannesburg',
      failedAttempts: 6,
    },
  },
  {
    id: 'alert-002',
    type: 'permissions',
    severity: 'medium',
    status: 'acknowledged',
    title: 'Role change requires review',
    description: `${employees[1].name} ${employees[1].surname} updated role access for the sales team.`,
    user: {
      id: employees[1].id,
      name: `${employees[1].name} ${employees[1].surname}`,
      email: employees[1].email,
      role: employees[1].role,
      department: employees[1].departmentName,
    },
    timestamp: hoursAgo(7),
    metadata: {
      affectedUsers: 3,
      location: 'Pretoria',
    },
  },
  {
    id: 'alert-003',
    type: 'bulk_operations',
    severity: 'critical',
    status: 'resolved',
    title: 'Bulk export threshold exceeded',
    description: `${employees[2].name} ${employees[2].surname} exported more records than the default threshold.`,
    user: {
      id: employees[2].id,
      name: `${employees[2].name} ${employees[2].surname}`,
      email: employees[2].email,
      role: employees[2].role,
      department: employees[2].departmentName,
    },
    timestamp: hoursAgo(18),
    metadata: {
      affectedUsers: 24,
      location: 'Cape Town',
      logEntryId: 'sec-log-003',
    },
  },
];

const securityLogs: MockSecurityLog[] = [
  {
    id: 'sec-log-001',
    action: 'login',
    userId: employees[0].id,
    userName: `${employees[0].name} ${employees[0].surname}`,
    userEmail: employees[0].email,
    timestamp: hoursAgo(1),
    success: true,
    ipAddress: '196.33.118.40',
    userAgent: 'Chrome on macOS',
    details: 'Administrator signed in successfully.',
  },
  {
    id: 'sec-log-002',
    action: 'role_update',
    userId: employees[1].id,
    userName: `${employees[1].name} ${employees[1].surname}`,
    userEmail: employees[1].email,
    timestamp: hoursAgo(4),
    success: true,
    ipAddress: '102.89.44.30',
    userAgent: 'Chrome on Windows',
    details: 'Updated employee access for the field revenue team.',
  },
  {
    id: 'sec-log-003',
    action: 'failed_login',
    userId: employees[3].id,
    userName: `${employees[3].name} ${employees[3].surname}`,
    userEmail: employees[3].email,
    timestamp: hoursAgo(2),
    success: false,
    ipAddress: '105.23.114.88',
    userAgent: 'Safari on iPhone',
    errorMessage: 'Repeated invalid password attempts.',
  },
  {
    id: 'sec-log-004',
    action: 'contact_export',
    userId: employees[2].id,
    userName: `${employees[2].name} ${employees[2].surname}`,
    userEmail: employees[2].email,
    timestamp: hoursAgo(10),
    success: true,
    ipAddress: '41.13.55.91',
    userAgent: 'Edge on Windows',
    details: 'Exported enterprise contact list for campaign follow-up.',
  },
];

const departmentEmployees = (departmentId: string) =>
  employees.filter((employee) => employee.departmentId === departmentId);

const departmentCards = (departmentId: string) =>
  cards.filter((card) => card.departmentId === departmentId);

const resolveEmployee = (employeeId: string, departmentId?: string) =>
  employees.find((employee) => employee.id === employeeId || employee.userId === employeeId) ||
  (departmentId ? departmentEmployees(departmentId)[0] : undefined) ||
  employees[0];

const buildDepartmentsResponse = () => ({
  departments: departments.map((department) => ({
    ...department,
    memberCount: departmentEmployees(department.id).length,
  })),
});

const buildEmployeesResponse = (search?: string) => {
  const filtered = !search
    ? employees
    : employees.filter((employee) => {
        const haystack = [
          employee.name,
          employee.surname,
          employee.email,
          employee.departmentName,
          employee.role,
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(search.toLowerCase());
      });

  return {
    success: true,
    employees: filtered,
    totalCount: filtered.length,
    message: 'Mock enterprise employees loaded successfully',
  };
};

const buildContactsDetailResponse = () => {
  const contactsByDepartment = departments.reduce<Record<string, { departmentName: string; departmentId: string; contacts: MockContact[]; contactCount: number }>>(
    (acc, department) => {
      const departmentContacts = employees
        .filter((employee) => employee.departmentId === department.id)
        .flatMap((employee) => contactsByOwner[employee.id] || []);

      acc[department.id] = {
        departmentName: department.name,
        departmentId: department.id,
        contacts: departmentContacts,
        contactCount: departmentContacts.length,
      };

      return acc;
    },
    {},
  );

  const departmentStats = departments.reduce<Record<string, { name: string; contactCount: number; employeeCount: number; contacts: MockContact[] }>>(
    (acc, department) => {
      const contactsEntry = contactsByDepartment[department.id];
      acc[department.id] = {
        name: department.name,
        contactCount: contactsEntry.contactCount,
        employeeCount: departmentEmployees(department.id).length,
        contacts: contactsEntry.contacts,
      };
      return acc;
    },
    {},
  );

  const totalContacts = Object.values(contactsByDepartment).reduce((sum, department) => sum + department.contactCount, 0);

  return {
    success: true,
    cached: false,
    data: {
      enterpriseId: ENTERPRISE_ID,
      enterpriseName: ENTERPRISE_NAME,
      totalContacts,
      totalDepartments: departments.length,
      departmentStats,
      contactsByDepartment,
      generatedAt: new Date().toISOString(),
      cacheExpiry: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    },
    timestamp: new Date().toISOString(),
  };
};

const buildCardAnalyticsResponse = () => ({
  success: true,
  cardScans: cards.map((card) => ({
    id: card.id,
    cardName: card.name,
    cardSurname: card.surname,
    userEmail: card.email,
    occupation: card.occupation,
    departmentName: card.departmentName,
    departmentId: card.departmentId,
    scanCount: card.scanCount,
  })),
  summary: {
    totalCards: cards.length,
    totalScans: cards.reduce((sum, card) => sum + card.scanCount, 0),
  },
});

const buildSecurityAlertsResponse = () => {
  const criticalCount = securityAlerts.filter((alert) => alert.severity === 'critical').length;
  const highCount = securityAlerts.filter((alert) => alert.severity === 'high').length;
  const mediumCount = securityAlerts.filter((alert) => alert.severity === 'medium').length;
  const lowCount = securityAlerts.filter((alert) => alert.severity === 'low').length;

  return {
    status: true,
    data: {
      alerts: securityAlerts,
      totalCount: securityAlerts.length,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
    },
  };
};

const buildSecurityLogsResponse = (url: URL) => {
  const search = (url.searchParams.get('search') || '').toLowerCase();
  const successFilter = url.searchParams.get('success');
  const filtered = securityLogs.filter((log) => {
    const matchesSearch =
      !search ||
      [log.action, log.userName, log.userEmail, log.details, log.errorMessage]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search);
    const matchesSuccess =
      successFilter === null ||
      (successFilter === 'true' && log.success) ||
      (successFilter === 'false' && !log.success);
    return matchesSearch && matchesSuccess;
  });

  return {
    status: true,
    data: {
      logs: filtered,
      totalCount: filtered.length,
      hasMore: false,
      lastDoc: filtered[filtered.length - 1]?.id,
      lastTimestamp: filtered[filtered.length - 1]?.timestamp || new Date().toISOString(),
      filters: {
        timeframe: url.searchParams.get('timeframe') || '7d',
        userId: url.searchParams.get('userId'),
        action: url.searchParams.get('action'),
        resource: url.searchParams.get('resource'),
        search: url.searchParams.get('search'),
        success: successFilter === null ? null : successFilter === 'true',
      },
      meta: {
        enterpriseUserCount: employees.length,
        timeRange: {
          start: daysAgo(30),
          end: new Date().toISOString(),
        },
      },
    },
  };
};

const handleMockRequest = (url: URL, method: string): Response | null => {
  const path = url.pathname;

  if (method === 'GET' && /^\/api\/enterprise\/[^/]+\/departments$/.test(path)) {
    return jsonResponse(buildDepartmentsResponse());
  }

  if (method === 'GET' && /^\/enterprise\/[^/]+\/employees$/.test(path)) {
    return jsonResponse(buildEmployeesResponse(url.searchParams.get('search') || undefined));
  }

  const departmentEmployeesMatch = path.match(/^\/enterprise\/[^/]+\/departments\/([^/]+)\/employees$/);
  if (method === 'GET' && departmentEmployeesMatch) {
    const departmentId = departmentEmployeesMatch[1];
    const deptEmployees = departmentEmployees(departmentId);
    return jsonResponse({
      success: true,
      employees: deptEmployees,
      totalCount: deptEmployees.length,
    });
  }

  const unassignedMatch = path.match(/^\/enterprise\/[^/]+\/departments\/([^/]+)\/employees\/unassigned$/);
  if (method === 'GET' && unassignedMatch) {
    const departmentId = unassignedMatch[1];
    const deptEmployees = departmentEmployees(departmentId).filter((employee) => !employee.teamId);
    return jsonResponse({
      success: true,
      employees: deptEmployees,
      totalCount: deptEmployees.length,
    });
  }

  const employeeDetailMatch = path.match(/^\/enterprise\/[^/]+\/departments\/([^/]+)\/employees\/([^/]+)$/);
  if (method === 'GET' && employeeDetailMatch) {
    const departmentId = employeeDetailMatch[1];
    const employeeId = employeeDetailMatch[2];
    return jsonResponse({
      success: true,
      employee: resolveEmployee(employeeId, departmentId),
    });
  }

  if (method === 'GET' && /^\/enterprise\/[^/]+\/cards$/.test(path)) {
    return jsonResponse({
      success: true,
      cards,
      totalCount: cards.length,
    });
  }

  const cardsMatch = path.match(/^\/Cards\/([^/]+)$/);
  if (method === 'GET' && cardsMatch) {
    const requestedId = cardsMatch[1];
    const matchedCards = cards.filter(
      (card) => card.id === requestedId || card.userId === requestedId || card.employeeId === requestedId,
    );
    return jsonResponse({
      success: true,
      cards: matchedCards.length > 0 ? matchedCards : [cards[0]],
      count: matchedCards.length > 0 ? matchedCards.length : 1,
    });
  }

  const contactsMatch = path.match(/^\/Contacts\/([^/]+)$/);
  if (method === 'GET' && contactsMatch) {
    const requestedUserId = contactsMatch[1];
    const fallbackContacts = contactsByOwner[employees[3].id] || [];
    return jsonResponse({
      success: true,
      contactList: contactsByOwner[requestedUserId] || fallbackContacts,
      totalCount: (contactsByOwner[requestedUserId] || fallbackContacts).length,
    });
  }

  if (method === 'GET' && /^\/api\/enterprise\/[^/]+\/contacts\/summary$/.test(path)) {
    const details = buildContactsDetailResponse();
    return jsonResponse({
      success: true,
      data: {
        totalContacts: details.data.totalContacts,
        totalDepartments: details.data.totalDepartments,
      },
    });
  }

  if (method === 'GET' && /^\/api\/enterprise\/[^/]+\/contacts\/details$/.test(path)) {
    return jsonResponse(buildContactsDetailResponse());
  }

  if (method === 'GET' && /^\/logs\/analytics\/cards\/[^/]+$/.test(path)) {
    return jsonResponse(buildCardAnalyticsResponse());
  }

  const departmentsDetailMatch = path.match(/^\/enterprise\/[^/]+\/departments\/([^/]+)$/);
  if (method === 'GET' && departmentsDetailMatch) {
    const departmentId = departmentsDetailMatch[1];
    const department = departments.find((item) => item.id === departmentId) || departments[0];
    return jsonResponse({
      success: true,
      department: {
        ...department,
        memberCount: departmentEmployees(department.id).length,
      },
    });
  }

  const teamsMatch = path.match(/^\/enterprise\/[^/]+\/departments\/([^/]+)\/teams$/);
  if (method === 'GET' && teamsMatch) {
    const departmentId = teamsMatch[1];
    const deptTeams = teams.filter((team) => team.departmentId === departmentId);
    return jsonResponse({
      success: true,
      teams: deptTeams,
      count: deptTeams.length,
    });
  }

  const teamDetailMatch = path.match(/^\/enterprise\/[^/]+\/departments\/([^/]+)\/teams\/([^/]+)$/);
  if (method === 'GET' && teamDetailMatch) {
    const [, departmentId, teamId] = teamDetailMatch;
    const team = teams.find((item) => item.id === teamId && item.departmentId === departmentId) || teams[0];
    return jsonResponse({
      success: true,
      team,
    });
  }

  if (method === 'GET' && /^\/api\/enterprise\/[^/]+\/security\/alerts$/.test(path)) {
    return jsonResponse(buildSecurityAlertsResponse());
  }

  if (method === 'POST' && /^\/api\/enterprise\/[^/]+\/security\/alerts\/[^/]+\/(acknowledge|resolve)$/.test(path)) {
    return jsonResponse({
      status: true,
      message: 'Mock security alert action completed successfully',
    });
  }

  if (method === 'GET' && /^\/api\/enterprise\/[^/]+\/security\/logs$/.test(path)) {
    return jsonResponse(buildSecurityLogsResponse(url));
  }

  if (method === 'GET' && /^\/api\/enterprise\/[^/]+\/security\/logs\/export$/.test(path)) {
    const rows = [
      'Action,User,Email,Success,Timestamp,IP Address',
      ...securityLogs.map((log) =>
        [
          log.action,
          log.userName || 'System',
          log.userEmail || '',
          log.success ? 'Success' : 'Error',
          log.timestamp,
          log.ipAddress || '',
        ].join(','),
      ),
    ].join('\n');
    return csvResponse(rows, `security-logs-${new Date().toISOString().split('T')[0]}.csv`);
  }

  if (method === 'POST' && /^\/api\/enterprise\/[^/]+\/security\/actions$/.test(path)) {
    return jsonResponse({
      status: true,
      message: `Mock security action queued by ${ACCOUNT_MANAGER.name}`,
      data: {
        actionId: `action-${Date.now()}`,
        performedAt: new Date().toISOString(),
        performedBy: ACCOUNT_MANAGER.name,
      },
    });
  }

  return null;
};

export const installMockEnterpriseApi = () => {
  if (!ENABLE_MOCK_ENTERPRISE_DATA || typeof window === 'undefined') {
    return;
  }

  const mockWindow = window as Window & { __xsCardMockApiInstalled?: boolean };
  if (mockWindow.__xsCardMockApiInstalled) {
    return;
  }

  const originalFetch = window.fetch.bind(window);
  mockWindow.__xsCardMockApiInstalled = true;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init);
    const url = new URL(request.url, window.location.origin);
    const mockedResponse = handleMockRequest(url, request.method.toUpperCase());

    if (mockedResponse) {
      await new Promise((resolve) => setTimeout(resolve, 120));
      return mockedResponse;
    }

    return originalFetch(input, init);
  };

  console.info('🧪 XS Card mock enterprise API enabled');
};
