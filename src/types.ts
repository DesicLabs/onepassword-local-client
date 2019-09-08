export type EntryFields = "name" | "url" | "type";

export type Entry = Record<EntryFields, string>;

export type EntryCredentialsFields = "username" | "password" | "otp";

export type EntryCredentials = Record<EntryCredentialsFields, string>;

export type RawEntryFields = EntryFields & EntryCredentialsFields;

export type RawEntry = Entry & EntryCredentials;

export interface Client {
  login: (
    password: string,
    username?: string,
    secret?: string
  ) => Promise<void>;
  getAccounts: () => Promise<Entry[]>;
  getAccountCredentials: (fqdn: string) => Promise<EntryCredentials>;
  addAccount: (account: Entry) => Promise<void>;
}

export type Keyset = Record<"encryptionKey" | "macKey", Buffer>;

export type Profile = {
  uuid: string;
  updatedAt: number;
  passwordHint: string;
  masterKey: string;
  iterations: number;
  lastUpdatedBy: string;
  profileName: string;
  salt: string;
  overviewKey: string;
  createdAt: number;
};

export type Item = {
  uuid: string;
  category: string;
  o: string;
  hmac: string;
  updated: number;
  k: string;
  d: string;
  created: number;
  tx: number;
};

export type DecryptedItemOverview = {
  uuid: string;
  title: string;
  url: string;
  ainfo: string;
};

export type DecryptedItemDetail = {
  backupKeys: string[];
  sections: Array<{
    name: string;
    title: string;
    fields: Record<string, string>[];
  }>;
  fields: Array<{
    name: string;
    value: string;
    type: string;
    designation: string;
  }>;
};

export type FileInterface = {
  readFile: (path: string) => Promise<Buffer>;
  writeFile: (path: string, data: Buffer) => Promise<void>;
  findFile: (path: string) => Promise<boolean>;
  createFile: (path: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
};
