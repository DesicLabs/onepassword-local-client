import { join } from "path";
import { File as FileType, Item, Profile } from "../types";
export class File {
  private file: FileType;
  private path: string;
  constructor(file: FileType, path: string) {
    this.file = file;
    this.path = path;
  }

  public async getItems(): Promise<Item[]> {
    const itemFiles = this.getItemFileNames();
    const items = itemFiles.map(async path => {
      const exists = await this.file.findFile(path);
      if (exists) {
        const rawItem = await this.file.readFile(path);
        return Object.values(this.formatRawData<Record<string, Item>>(rawItem));
      }
    });
    return (await Promise.all(items)).flat().filter(item => item);
  }

  public async getProfile(): Promise<Profile> {
    const filename = join(this.path, "/profile.js");
    const rawProfile = await this.file.readFile(filename);
    return this.formatRawData<Profile>(rawProfile);
  }

  public async saveItems(items: Item[]): Promise<boolean> {
    const filename = this.getItemFileNames()[Math.floor(Math.random() * 15)];
    await this.file.writeFile(filename, this.transformStructuredItems(items));
    return true;
  }

  private getItemFileNames(): string[] {
    const filenames = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "A",
      "B",
      "C",
      "D",
      "E",
      "F"
    ];
    return filenames.map(name => join(this.path, `/band_${name}.js`));
  }

  private transformStructuredItems(items: Item[]): string {
    const object = items.reduce((acc, item) => {
      return { ...acc, [item.uuid]: item };
    }, {});
    return `ld(${JSON.stringify(object)})`;
  }

  private formatRawData<T>(data: string): T {
    const json = data.match(/{[\s\S]+}/gm).shift();
    return eval(`(${json})`);
  }
}
