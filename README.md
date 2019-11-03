# Onepassword Local Client

## Class Hierarchy

### Methods

- [addAccount](README.md#addaccount)
- [getAccounts](README.md#getaccounts)
- [getAccountCredentials](README.md#getaccountcredentials)
- [login](README.md#login)

## Methods

### constructor

▸ **constructor**(`fileInterface`: [FileInterface], `path`: string, `type?`: [SourceType]): _Promise‹boolean›_

**Parameters:**

| Name            | Type            |
| --------------- | --------------- |
| `fileInterface` | [FileInterface] |
| `path`          | string          |
| `type`          | [SourceType]    |

**Returns:** _void_

---

### addAccount

▸ **addAccount**(`entry`: [RawEntry]): _Promise‹boolean›_

**Parameters:**

| Name    | Type       |
| ------- | ---------- |
| `entry` | [RawEntry] |

**Returns:** _Promise‹boolean›_

---

### getAccounts

▸ **getAccounts**(): _Promise‹[Entry]_

**Returns:** _Promise_

---

### getAccountCredentials

▸ **getAccountCredentials**(): _Promise‹[EntryCredentials]_

**Returns:** _Promise_

---

### login

▸ **login**(`password`: string): _Promise‹void›_

**Parameters:**

| Name       | Type   |
| ---------- | ------ |
| `password` | string |

**Returns:** _Promise‹void›_

## Type aliases

### FileInterface

Ƭ **FileInterface**:

```javascript
{
    readFile: (path: string) => Promise<string>;
    writeFile: (path: string, data: string) => Promise<void>;
    findFile: (path: string) => Promise<boolean>;
    createFile: (path: string) => Promise<void>;
    deleteFile: (path: string) => Promise<void>;
}
```

---

### SourceType

Ƭ **SourceType**: \_"sqlite" | "opvault"

---

### RawEntry

Ƭ **RawEntry**: _Record‹[RawEntryFields](README.md#rawentryfields), string›_

---

### RawEntryFields

Ƭ **RawEntryFields**: \_"name" | "url" | "type" | "username" | "password" | "otp"

---

### Entry

Ƭ **Entry**: _Record‹[EntryFields](README.md#entryfields), string›_

---

### EntryFields

Ƭ **EntryFields**: \_"name" | "url" | "type"

---

### EntryCredentials

Ƭ **EntryCredentials**: _Record‹[EntryCredentialsFields](README.md#entrycredentialsfields), string›_

---

### EntryCredentialsFields

Ƭ **EntryCredentialsFields**: \_"username" | "password" | "otp";

---
