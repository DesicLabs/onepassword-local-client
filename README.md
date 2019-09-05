# Onepassword Local Client

## Class Hierarchy

### Methods

- [addAccount](README.md#addaccount)
- [getAccounts](README.md#getaccounts)
- [login](README.md#login)

## Methods

### constructor

▸ **constructor**(`fileInterface`: [FileInterface], `path`: string): _Promise‹boolean›_

**Parameters:**

| Name            | Type            |
| --------------- | --------------- |
| `fileInterface` | [FileInterface] |
| `path`          | string          |

**Returns:** _void_

---

### addAccount

▸ **addAccount**(`entry`: [Entry]): _Promise‹boolean›_

**Parameters:**

| Name    | Type    |
| ------- | ------- |
| `entry` | [Entry] |

**Returns:** _Promise‹boolean›_

---

### getAccounts

▸ **getAccounts**(): _Promise‹[Entry]_

**Returns:** _Promise_

---

### login

▸ **login**(`username`: string, `password`: string): _Promise‹void›_

**Parameters:**

| Name       | Type   |
| ---------- | ------ |
| `username` | string |
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
}
```

---

### Entry

Ƭ **Entry**: _Record‹[EntryFields](README.md#entryfields), string›_

---

### EntryFields

Ƭ **EntryFields**: _"name" | "url" | "type" | "username" | "password" | "otp"_

---
