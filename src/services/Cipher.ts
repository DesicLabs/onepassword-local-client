import {
  createHash,
  createHmac,
  createCipheriv,
  createDecipheriv,
  randomBytes,
  pbkdf2Sync
} from "crypto";
import {
  Keyset,
  Item,
  DecryptedItemOverview,
  DecryptedItemDetail
} from "../types";

export class Cipher {
  private derivedKeys: Keyset;
  private masterKeys: Keyset;
  private overviewKeys: Keyset;

  public setDerivedKeys(
    password: Buffer,
    salt: Buffer,
    iterations: number
  ): void {
    const keys = pbkdf2Sync(password, salt, iterations, 64, "sha512");
    this.derivedKeys = {
      encryptionKey: keys.slice(0, 32),
      macKey: keys.slice(32)
    };
  }

  public setMasterKeys(masterKey: string): void {
    const encrypted = Buffer.from(masterKey, "base64");
    this.masterKeys = this.decryptKeys(encrypted, this.derivedKeys);
  }

  public setOverviewKeys(overviewKey: string): void {
    const encrypted = Buffer.from(overviewKey, "base64");
    this.overviewKeys = this.decryptKeys(encrypted, this.derivedKeys);
  }

  public getItem(item: Item): DecryptedItemDetail & DecryptedItemOverview {
    return { ...this.getItemOverview(item), ...this.getItemDetail(item) };
  }

  public generateKeyPair(): Keyset {
    const encryptionKey = randomBytes(32);
    const macKey = randomBytes(32);
    return { encryptionKey, macKey };
  }

  public encryptItemKeys(itemKeys: Keyset): string {
    const iv = this.generateIV();
    const combinedKey = Buffer.concat([
      itemKeys.encryptionKey,
      itemKeys.macKey
    ]);
    const cipher = createCipheriv(
      "aes-256-cbc",
      this.masterKeys.encryptionKey,
      iv
    );
    cipher.setAutoPadding(false);
    const ek = Buffer.concat([cipher.update(combinedKey), cipher.final()]);
    const encryptedKeyWithIV = Buffer.concat([iv, ek]);
    const hash = createHmac("sha256", this.masterKeys.macKey)
      .update(encryptedKeyWithIV)
      .digest();
    const encrypted = Buffer.concat([encryptedKeyWithIV, hash]);
    return encrypted.toString("base64");
  }

  public encryptOpData(data: Buffer, key: Keyset = this.overviewKeys): string {
    const { encryptionKey, macKey } = key;
    const iv = this.generateIV();
    const opData01 = Buffer.from([111, 112, 100, 97, 116, 97, 48, 49]);
    const length = Buffer.from(this.splitToByte(data.byteLength));
    const remainder = data.byteLength % 16;
    const extraData = randomBytes(remainder === 0 ? 16 : 16 - remainder);
    const paddedData = Buffer.concat([extraData, data]);
    const header = Buffer.concat([opData01, length, iv]);
    const cipher = createCipheriv("aes-256-cbc", encryptionKey, iv);
    cipher.setAutoPadding(false);
    const encryptedData = Buffer.concat([
      cipher.update(paddedData),
      cipher.final()
    ]);
    const combinedData = Buffer.concat([header, encryptedData]);
    const hash = createHmac("sha256", macKey)
      .update(combinedData)
      .digest();
    const encrypted = Buffer.concat([combinedData, hash]);
    return encrypted.toString("base64");
  }

  public generateHMAC(data: any): string {
    const { macKey } = this.overviewKeys;
    const dataArray: Array<Uint8Array> = [];
    Object.keys(data).map(key => {
      dataArray.push(Buffer.from(key));
      dataArray.push(
        data[key].hasOwnProperty("byteLength")
          ? data[key]
          : Buffer.from(String(data[key]))
      );
    });
    const mergedData = Buffer.concat(dataArray);
    return createHmac("sha256", macKey)
      .update(mergedData)
      .digest("base64");
  }

  private getItemOverview(item: Item): DecryptedItemOverview {
    const overviewData = Buffer.from(item.o, "base64");
    const overview = this.decryptOpdata(overviewData, this.overviewKeys);
    const itemData = JSON.parse(overview.toString());
    return itemData;
  }

  private getItemDetail(item: Item): DecryptedItemDetail {
    const data = Buffer.from(item.d, "base64");
    const itemKeys = this.itemKeys(item);
    const detail = this.decryptOpdata(data, itemKeys);
    return JSON.parse(detail.toString());
  }

  private decryptKeys(encryptedKey: Buffer, encryptionKeys: Keyset): Keyset {
    const keyBase = this.decryptOpdata(encryptedKey, encryptionKeys);
    const digest = createHash("sha512")
      .update(keyBase)
      .digest();
    return {
      encryptionKey: digest.slice(0, 32),
      macKey: digest.slice(32)
    };
  }

  private decryptOpdata(cipherText: Buffer, cipherKeys: Keyset): Buffer {
    const keyData = cipherText.slice(0, -32);
    const macData = cipherText.slice(-32);
    this.checkHmac(keyData, cipherKeys.macKey, macData);

    const plaintext = this.decryptData(
      cipherKeys.encryptionKey,
      keyData.slice(16, 32),
      keyData.slice(32)
    );
    const dv = new DataView(Uint8Array.from(keyData).buffer, 8, 16);
    const plaintextSize = dv.getUint32(0, true);
    return plaintext.slice(-plaintextSize);
  }

  private checkHmac(data: Buffer, hmacKey: Buffer, desiredHmac: Buffer): true {
    const generatedHMAC = createHmac("sha256", hmacKey)
      .update(data)
      .digest();
    const isValid = generatedHMAC.equals(desiredHmac);
    if (!isValid) throw new Error("Invalid Credentials.");

    return true;
  }

  private itemKeys(item: Item): Keyset {
    const itemKey = Buffer.from(item.k, "base64");
    const keyData = itemKey.slice(0, -32);
    const macData = itemKey.slice(-32);

    this.checkHmac(keyData, this.masterKeys.macKey, macData);

    const plaintext = this.decryptData(
      this.masterKeys.encryptionKey,
      keyData.slice(0, 16),
      keyData.slice(16)
    );

    return {
      encryptionKey: plaintext.slice(0, 32),
      macKey: plaintext.slice(32)
    };
  }

  decryptData(key: Buffer, iv: Buffer, data: Buffer): Buffer {
    const padding = Buffer.from(
      new Uint8Array([
        16,
        16,
        16,
        16,
        16,
        16,
        16,
        16,
        16,
        16,
        16,
        16,
        16,
        16,
        16,
        16
      ])
    );
    const paddingCipher = createCipheriv("aes-256-cbc", key, data.slice(-16));
    paddingCipher.setAutoPadding(false);

    const suffix = Buffer.concat([
      paddingCipher.update(padding),
      paddingCipher.final()
    ]);
    const paddedData = Buffer.concat([data, suffix]);
    const plainText = createDecipheriv("aes-256-cbc", key, iv);
    return Buffer.concat([plainText.update(paddedData), plainText.final()]);
  }

  private generateIV() {
    return randomBytes(16);
  }

  private splitToByte(number: number) {
    const splitArray = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]);
    for (let i = 0; i < 4; i++) {
      splitArray[i] = number >> (i * 8);
    }
    return splitArray;
  }
}
