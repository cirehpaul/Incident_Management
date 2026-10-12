export type AccountRole = 'admin';

export interface Account {
  id: string;
  name: string;
  role: AccountRole;
  pin: string;
}


export const ACCOUNTS: Account[] = [
  {
    id: 'smac-admin',
    name: 'SMAC ADMIN',
    role: 'admin',
    pin: '1234',
  },
];

// helpers
export function findAccountByPin(pin: string): Account | null {
  return ACCOUNTS.find((a) => a.pin === pin) ?? null;
}

export function isAdmin(account: Account | null): boolean {
  return account?.role === 'admin';
}
