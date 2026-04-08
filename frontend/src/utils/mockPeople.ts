export type DemoRole = 'Administrator' | 'Manager' | 'Employee';

type NamePool = {
  firstNames: string[];
  surnames: string[];
};

export interface AuthTestUser {
  label: string;
  name: string;
  email: string;
  password: string;
  role: DemoRole | 'Individual';
}

export interface DemoDirectoryUser {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: DemoRole;
}

export interface SecurityAlertDemoUser extends DemoDirectoryUser {
  department: string;
}

const COMPANY_DOMAIN = 'xscard.co.za';

const roleNamePools: Record<DemoRole, NamePool> = {
  Administrator: {
    firstNames: ['Naledi', 'Sibusiso', 'Lerato', 'Themba', 'Zanele'],
    surnames: ['Mokoena', 'Khumalo', 'Naidoo', 'Daniels', 'Mthembu'],
  },
  Manager: {
    firstNames: ['Ayanda', 'Lindokuhle', 'Refilwe', 'Kagiso', 'Bongani', 'Nokuthula'],
    surnames: ['Dlamini', 'Nkosi', 'Mabaso', 'Pillay', 'Zulu', 'Mahlangu'],
  },
  Employee: {
    firstNames: [
      'Aphiwe',
      'Tebogo',
      'Nandi',
      'Siphesihle',
      'Lethabo',
      'Thando',
      'Karabo',
      'Zinhle',
      'Banele',
      'Amahle',
      'Tshepang',
      'Okuhle',
    ],
    surnames: [
      'Ndlovu',
      'Molefe',
      'van Wyk',
      'Maseko',
      'Petersen',
      'Madonsela',
      'Jacobs',
      'Mhlongo',
      'Mabena',
      'Msimang',
      'Botha',
      'Cele',
    ],
  },
};

const sanitizeEmailPart = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');

export const buildCompanyEmail = (
  firstName: string,
  lastName: string,
  suffix?: number,
) => {
  const suffixPart = suffix ? `${suffix}` : '';
  return `${sanitizeEmailPart(firstName)}.${sanitizeEmailPart(lastName)}${suffixPart}@${COMPANY_DOMAIN}`;
};

export const createRoleDemoUsers = (
  role: DemoRole,
  count: number,
): DemoDirectoryUser[] => {
  const { firstNames, surnames } = roleNamePools[role];

  return Array.from({ length: count }, (_, index) => {
    const firstName = firstNames[index % firstNames.length];
    const lastName = surnames[Math.floor(index / firstNames.length) % surnames.length];

    return {
      id: `${role.toLowerCase()}_${index + 1}`,
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      email: buildCompanyEmail(firstName, lastName, index >= firstNames.length ? Math.floor(index / firstNames.length) + 1 : undefined),
      role,
    };
  });
};

export const AUTH_TEST_USERS: AuthTestUser[] = [
  {
    label: '🔧 Naledi Mokoena',
    name: 'Naledi Mokoena',
    email: 'xenacoh740@percyfx.com',
    password: 'Password.10',
    role: 'Administrator',
  },
  {
    label: '👔 Ayanda Dlamini',
    name: 'Ayanda Dlamini',
    email: 'xapayi9567@coursora.com',
    password: 'Password.10',
    role: 'Manager',
  },
  {
    label: '👤 Aphiwe Ndlovu',
    name: 'Aphiwe Ndlovu',
    email: 'higenaw972@fursee.com',
    password: 'Password.10',
    role: 'Employee',
  },
  {
    label: '👤 Tebogo Mahlangu',
    name: 'Tebogo Mahlangu',
    email: 'xicepo4195@futebr.com',
    password: 'Password.10',
    role: 'Employee',
  },
  {
    label: '🧪 Lerato Zulu',
    name: 'Lerato Zulu',
    email: 'tshehlap@gmail.com',
    password: 'P.zzle$0',
    role: 'Employee',
  },
  {
    label: '🧪 Zanele Naidoo',
    name: 'Zanele Naidoo',
    email: 'devel66949@ahanim.com',
    password: '123456',
    role: 'Employee',
  },
  {
    label: '🧪 Kagiso Pillay',
    name: 'Kagiso Pillay',
    email: 'sibef28831@aperiol.com',
    password: '123456',
    role: 'Employee',
  },
  {
    label: '👤 Refilwe Daniels',
    name: 'Refilwe Daniels',
    email: 'testehakke@gufum.com',
    password: '123456',
    role: 'Individual',
  },
];

export const PRIMARY_ADMIN_TEST_EMAIL = AUTH_TEST_USERS[0].email;
export const PRIMARY_EMPLOYEE_TEST_EMAIL = AUTH_TEST_USERS[2].email;

export const DEFAULT_DEMO_USER = {
  id: 'demo-admin',
  name: 'Naledi Mokoena',
  email: buildCompanyEmail('Naledi', 'Mokoena'),
  role: 'Administrator' as const,
};

export const ACCOUNT_MANAGER = {
  name: 'Lerato Naidoo',
  firstName: 'Lerato',
  surname: 'Naidoo',
  title: 'Enterprise Account Manager',
  email: buildCompanyEmail('Lerato', 'Naidoo'),
  phone: '+27 11 458 2450',
};

export const PREVIEW_CONTACT = {
  name: 'Naledi',
  surname: 'Mokoena',
  fullName: 'Naledi Mokoena',
  title: 'Operations Director',
  email: buildCompanyEmail('Naledi', 'Mokoena'),
  phone: '+27 82 456 7812',
  company: 'XS Card',
  department: 'Enterprise Operations',
};

export const SECURITY_ACTION_DEMO_USERS = [
  createRoleDemoUsers('Employee', 2)[0],
  createRoleDemoUsers('Manager', 1)[0],
  createRoleDemoUsers('Employee', 3)[2],
];

export const SECURITY_ALERT_DEMO_USERS: SecurityAlertDemoUser[] = [
  {
    ...createRoleDemoUsers('Employee', 1)[0],
    department: 'Operations',
  },
  {
    ...createRoleDemoUsers('Manager', 1)[0],
    department: 'Customer Success',
  },
  {
    ...createRoleDemoUsers('Employee', 2)[1],
    department: 'Sales',
  },
];
