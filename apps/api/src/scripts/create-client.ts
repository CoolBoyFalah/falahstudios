/**
 * Creates a Falah OS client workspace and prints its access code once.
 *
 *   npm run client:create -- "Business Name" [slug]
 *
 * The access code is FAL-<CLIENT CODE>-<SECRET>. Only a hash of the secret is
 * stored, so save the printed code: it can't be recovered, only replaced with
 * --rotate <CLIENT CODE>.
 */
import crypto from "crypto";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Client from "../models/Client";
import Website from "../models/website";

dotenv.config();

// No 0/O/1/I so codes are easy to read aloud.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(length: number) {
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueClientCode() {
  for (let i = 0; i < 20; i++) {
    const code = randomCode(4);
    if (!(await Client.exists({ clientCode: code }))) return code;
  }
  throw new Error("Could not generate a unique client code");
}

async function main() {
  const args = process.argv.slice(2);
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/falah-studios");

  const secret = randomCode(8);
  const accessCodeHash = await bcrypt.hash(secret, 10);

  if (args[0] === "--rotate") {
    const clientCode = (args[1] || "").toUpperCase();
    const client = await Client.findOneAndUpdate({ clientCode }, { accessCodeHash });
    if (!client) throw new Error(`No client with code ${clientCode}`);
    console.log(`\nNew access code for ${client.name}:\n\n  FAL-${clientCode}-${secret}\n`);
    return;
  }

  const name = args[0]?.trim();
  if (!name) {
    throw new Error('Usage: npm run client:create -- "Business Name" [slug]');
  }
  const slug = slugify(args[1] || name);
  if (!slug) throw new Error("Could not derive a slug; pass one explicitly.");
  if (await Client.exists({ slug })) throw new Error(`Slug "${slug}" is already taken`);

  const clientCode = await uniqueClientCode();
  const client = await Client.create({ name, slug, clientCode, accessCodeHash });
  await Website.create({ clientId: client._id, businessName: name });

  console.log(`\nCreated ${name} (${slug}).\nAccess code — share it privately, it won't be shown again:\n\n  FAL-${clientCode}-${secret}\n`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
