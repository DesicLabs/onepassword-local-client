import DB, { Database } from "better-sqlite3";
import { FileInterface, Item, Profile, DataSource } from "../../types";

export class Sqlite implements DataSource {
  private file: FileInterface;
  private db: Database;
  constructor(file: FileInterface, path: string) {
    this.file = file;
    this.db = new DB(path, { fileMustExist: true });
  }

  public async getItems(): Promise<Item[]> {
    const query = this.db.prepare(
      "SELECT items.uuid as uuid, items.category_uuid as category, items.overview_data as o, items.updated_at as updated, items.created_at as created, items.tx_timestamp as tx, items.trashed, items.key_data as k, item_details.data as d FROM 'items' INNER JOIN item_details on item_details.item_id = items.id"
    );
    return query.all();
  }

  public async getProfile(): Promise<Profile> {
    const query = this.db.prepare(
      "SELECT uuid, salt, master_key_data as masterKey, overview_key_data as overviewKey, iterations, created_at as createdAt, updated_at as updatedAt, password_hint as passwordHint, profile_name as profileName, last_updated_by as lastUpdatedBy  FROM 'profiles' WHERE profile_name='default'"
    );
    return query.get();
  }

  public async saveItems(items: Item[]): Promise<boolean> {
    return false;
  }
}
