import uuidv4 from "uuid/v4";
import { Entry, DecryptedItemDetail, DecryptedItemOverview } from "./types";
type PreparedItem = {
  detail: DecryptedItemDetail;
  overview: DecryptedItemOverview;
};

export const prepareItem = (entry: Entry): PreparedItem => {
  const uuid = uuidv4()
    .replace(/-/g, "")
    .toUpperCase();
  const overview: DecryptedItemOverview = {
    uuid,
    ainfo: entry.username,
    title: entry.name,
    url: entry.url
  };
  const detail: DecryptedItemDetail = {
    backupKeys: [""],
    fields: [
      {
        designation: "username",
        name: "username",
        type: "T",
        value: entry.username
      },
      {
        designation: "password",
        name: "password",
        type: "p",
        value: entry.password
      }
    ],
    sections: [{ title: "Related Items", name: "linked items" }] as any[]
  };
  entry.otp.length > 0 &&
    detail.sections.push({
      title: "OTP",
      name: "OTP",
      fields: [
        {
          k: "concealed",
          n: `TOTP_${uuid}`,
          t: "",
          v: `otpauth://totp/default?secret=${entry.otp.replace(/\s/g, "")}`
        }
      ]
    });
  return { detail, overview };
};
