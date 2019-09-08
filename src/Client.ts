import { find } from "lodash";
import { Cipher } from "./services/Cipher";
import { File } from "./services/File";
import { prepareItem } from "./utilities";
import { Client, Entry, Item, FileInterface, EntryCredentials } from "./types";
import { Categories } from "./config";

export default class OnepasswordClient implements Client {
  private cipher: Cipher;
  private file: File;
  private items: Item[];

  public constructor(file: FileInterface, path: string) {
    this.cipher = new Cipher();
    this.file = new File(file, path);
  }

  public async login(
    password: string,
    username?: string,
    secret?: string
  ): Promise<void> {
    const {
      salt: encodedSalt,
      iterations,
      masterKey,
      overviewKey
    } = await this.file.getProfile();
    const salt = Buffer.from(encodedSalt, "base64");
    this.cipher.setDerivedKeys(Buffer.from(password), salt, iterations);
    this.cipher.setMasterKeys(masterKey);
    this.cipher.setOverviewKeys(overviewKey);
  }

  public async getAccounts(): Promise<Entry[]> {
    this.items = await this.file.getItems();
    return this.items.map(
      (item): Entry => {
        const category = Categories[parseInt(item.category)];
        const { title: name, url } = this.cipher.getItemOverview(item);
        return {
          name,
          url,
          type: category ? category.toLowerCase() : "Unknown"
        };
      }
    );
  }

  public async getAccountCredentials(fqdn: string): Promise<EntryCredentials> {
    this.items = await this.file.getItems();
    let entryCredentials: EntryCredentials;
    for (let i = 0; i < this.items.length; i++) {
      const { url } = this.cipher.getItemOverview(this.items[i]);
      if (url.match(new RegExp(fqdn))) {
        const { fields } = this.cipher.getItemDetail(this.items[i]);
        const username = find(fields, ["designation", "username"]);
        const password = find(fields, ["designation", "password"]);
        entryCredentials = {
          username: username ? username.value : "",
          password: password ? password.value : "",
          otp: ""
        };
        break;
      }
    }
    if (!entryCredentials) throw new Error("No account found.");
    return entryCredentials;
  }

  public async addAccount(entry: Entry): Promise<void> {
    const { detail, overview } = prepareItem(entry);
    const itemKeys = this.cipher.generateKeyPair();
    const k = this.cipher.encryptItemKeys(itemKeys);
    const o = this.cipher.encryptOpData(Buffer.from(JSON.stringify(overview)));
    const d = this.cipher.encryptOpData(
      Buffer.from(JSON.stringify(detail)),
      itemKeys
    );
    const date = Math.floor(Date.now() / 1000);
    const returnData = {
      category: "001",
      created: date,
      d,
      k,
      o,
      tx: date,
      updated: date,
      uuid: overview.uuid
    };
    const hmac = this.cipher.generateHMAC(returnData);
    await this.file.saveItems([...this.items, { ...returnData, hmac }]);
  }
}
