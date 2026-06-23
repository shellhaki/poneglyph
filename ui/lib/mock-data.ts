import type { DbKindId, TableMeta } from "./types";

const owners: TableMeta = {
  name: "owners",
  primaryKey: "owner_id",
  rowCount: 6,
  columns: [
    { name: "owner_id", type: "int", primaryKey: true },
    { name: "name", type: "text" },
    { name: "email", type: "text" },
    { name: "city", type: "text" },
    { name: "joined_at", type: "timestamp" },
  ],
  rows: [
    { owner_id: 1, name: "Jane Wilson", email: "jane@nico.io", city: "Ohara", joined_at: "2023-01-12 09:24" },
    { owner_id: 2, name: "Dan Jukes", email: "dan@grandline.co", city: "Water 7", joined_at: "2023-02-03 14:10" },
    { owner_id: 3, name: "Nico Robin", email: "robin@poneglyph.dev", city: "Ohara", joined_at: "2023-02-19 11:42" },
    { owner_id: 4, name: "Franky Cutty", email: "franky@galley.la", city: "Water 7", joined_at: "2023-03-08 16:05" },
    { owner_id: 5, name: "Koby Marine", email: "koby@hq.mil", city: "Marineford", joined_at: "2023-04-21 08:51" },
    { owner_id: 6, name: "Vivi Nefel", email: "vivi@alabasta.gov", city: "Alubarna", joined_at: "2023-05-30 19:33" },
  ],
};

const pets: TableMeta = {
  name: "pets",
  primaryKey: "pet_id",
  rowCount: 8,
  columns: [
    { name: "pet_id", type: "int", primaryKey: true },
    { name: "owner_id", type: "int", foreignKey: { table: "owners", column: "owner_id" } },
    { name: "name", type: "text" },
    { name: "species", type: "text" },
    { name: "breed", type: "text" },
    { name: "age", type: "int" },
  ],
  rows: [
    { pet_id: 1, owner_id: 1, name: "Rex", species: "Dog", breed: "German Shepherd", age: 4 },
    { pet_id: 2, owner_id: 1, name: "Milo", species: "Cat", breed: "Tabby", age: 2 },
    { pet_id: 3, owner_id: 2, name: "Felix", species: "Cat", breed: "Siamese", age: 6 },
    { pet_id: 4, owner_id: 3, name: "Max", species: "Dog", breed: "Labrador", age: 3 },
    { pet_id: 5, owner_id: 3, name: "Lucy", species: "Cat", breed: "Persian", age: 5 },
    { pet_id: 6, owner_id: 4, name: "Toto", species: "Dog", breed: "Boxer", age: 1 },
    { pet_id: 7, owner_id: 5, name: "Lola", species: "Cat", breed: "Maine Coon", age: 7 },
    { pet_id: 8, owner_id: 6, name: "Rocky", species: "Dog", breed: "Rottweiler", age: 2 },
  ],
};

const appointments: TableMeta = {
  name: "appointments",
  primaryKey: "appointment_id",
  rowCount: 9,
  columns: [
    { name: "appointment_id", type: "int", primaryKey: true },
    { name: "pet_id", type: "int", foreignKey: { table: "pets", column: "pet_id" } },
    { name: "appointment_date", type: "timestamp" },
    { name: "description", type: "text" },
    { name: "paid", type: "boolean" },
  ],
  rows: [
    { appointment_id: 1, pet_id: 1, appointment_date: "2025-07-31 12:00", description: "General Check-up", paid: true },
    { appointment_id: 2, pet_id: 2, appointment_date: "2025-07-02 15:00", description: "Vaccination", paid: true },
    { appointment_id: 3, pet_id: 3, appointment_date: "2025-07-03 17:00", description: "Dental Cleaning", paid: false },
    { appointment_id: 4, pet_id: 4, appointment_date: "2025-07-04 11:00", description: "General Check-up", paid: true },
    { appointment_id: 5, pet_id: 6, appointment_date: "2025-07-06 16:00", description: "Grooming", paid: false },
    { appointment_id: 6, pet_id: 7, appointment_date: "2025-07-07 17:00", description: "Grooming", paid: true },
    { appointment_id: 7, pet_id: 8, appointment_date: "2025-07-08 11:00", description: "General Check-up", paid: true },
    { appointment_id: 8, pet_id: 5, appointment_date: "2025-06-15 12:00", description: "Checkup", paid: false },
    { appointment_id: 9, pet_id: 4, appointment_date: "2025-07-10 13:00", description: "Dental Cleaning", paid: true },
  ],
};

const customers: TableMeta = {
  name: "customers",
  primaryKey: "id",
  rowCount: 6,
  columns: [
    { name: "id", type: "int", primaryKey: true },
    { name: "full_name", type: "text" },
    { name: "email", type: "text" },
    { name: "country", type: "text" },
    { name: "lifetime_value", type: "numeric" },
  ],
  rows: [
    { id: 1, full_name: "Monkey D. Luffy", email: "luffy@straw.hat", country: "Goa", lifetime_value: 1240.5 },
    { id: 2, full_name: "Roronoa Zoro", email: "zoro@santoryu.jp", country: "Shimotsuki", lifetime_value: 980.0 },
    { id: 3, full_name: "Nami Cat", email: "nami@cocoyasi.io", country: "Cocoyasi", lifetime_value: 4310.75 },
    { id: 4, full_name: "Sanji Vinsmoke", email: "sanji@baratie.fr", country: "North Blue", lifetime_value: 2055.2 },
    { id: 5, full_name: "Usopp Sniper", email: "usopp@syrup.vil", country: "Syrup", lifetime_value: 612.4 },
    { id: 6, full_name: "Tony Chopper", email: "chopper@drum.med", country: "Drum", lifetime_value: 1788.9 },
  ],
};

const products: TableMeta = {
  name: "products",
  primaryKey: "sku",
  rowCount: 6,
  columns: [
    { name: "sku", type: "text", primaryKey: true },
    { name: "title", type: "text" },
    { name: "category", type: "text" },
    { name: "price", type: "numeric" },
    { name: "in_stock", type: "boolean" },
  ],
  rows: [
    { sku: "LOG-POSE-01", title: "Log Pose", category: "Navigation", price: 89.0, in_stock: true },
    { sku: "DEN-MUSHI-04", title: "Den Den Mushi", category: "Comms", price: 240.0, in_stock: true },
    { sku: "STRIKER-09", title: "Striker Skiff", category: "Vessels", price: 1290.0, in_stock: false },
    { sku: "RUM-BARREL-2", title: "Rum Barrel", category: "Supplies", price: 18.5, in_stock: true },
    { sku: "WANTED-PSTR", title: "Wanted Poster", category: "Misc", price: 4.0, in_stock: true },
    { sku: "ETERNAL-POSE", title: "Eternal Pose", category: "Navigation", price: 145.0, in_stock: false },
  ],
};

const orders: TableMeta = {
  name: "orders",
  primaryKey: "order_id",
  rowCount: 7,
  columns: [
    { name: "order_id", type: "int", primaryKey: true },
    { name: "customer_id", type: "int", foreignKey: { table: "customers", column: "id" } },
    { name: "sku", type: "text", foreignKey: { table: "products", column: "sku" } },
    { name: "qty", type: "int" },
    { name: "placed_at", type: "timestamp" },
    { name: "status", type: "text" },
  ],
  rows: [
    { order_id: 1001, customer_id: 1, sku: "LOG-POSE-01", qty: 1, placed_at: "2025-05-12 10:14", status: "shipped" },
    { order_id: 1002, customer_id: 3, sku: "ETERNAL-POSE", qty: 2, placed_at: "2025-05-13 08:02", status: "pending" },
    { order_id: 1003, customer_id: 2, sku: "RUM-BARREL-2", qty: 6, placed_at: "2025-05-15 19:40", status: "shipped" },
    { order_id: 1004, customer_id: 4, sku: "DEN-MUSHI-04", qty: 1, placed_at: "2025-05-18 12:25", status: "delivered" },
    { order_id: 1005, customer_id: 5, sku: "WANTED-PSTR", qty: 12, placed_at: "2025-05-21 15:11", status: "cancelled" },
    { order_id: 1006, customer_id: 6, sku: "STRIKER-09", qty: 1, placed_at: "2025-05-24 09:33", status: "pending" },
    { order_id: 1007, customer_id: 1, sku: "DEN-MUSHI-04", qty: 2, placed_at: "2025-05-29 21:07", status: "shipped" },
  ],
};

const accounts: TableMeta = {
  name: "accounts",
  primaryKey: "_id",
  rowCount: 5,
  columns: [
    { name: "_id", type: "text", primaryKey: true },
    { name: "handle", type: "text" },
    { name: "verified", type: "boolean" },
    { name: "followers", type: "int" },
    { name: "profile", type: "json" },
  ],
  rows: [
    { _id: "64f1a", handle: "@goingmerry", verified: true, followers: 12400, profile: '{"bio":"ship"}' },
    { _id: "64f1b", handle: "@thousandsunny", verified: true, followers: 88100, profile: '{"bio":"ship v2"}' },
    { _id: "64f1c", handle: "@barateco", verified: false, followers: 320, profile: '{"bio":"food"}' },
    { _id: "64f1d", handle: "@redforce", verified: true, followers: 50230, profile: '{"bio":"yonko"}' },
    { _id: "64f1e", handle: "@miniMerry", verified: false, followers: 90, profile: '{"bio":"skiff"}' },
  ],
};

const posts: TableMeta = {
  name: "posts",
  primaryKey: "_id",
  rowCount: 6,
  columns: [
    { name: "_id", type: "text", primaryKey: true },
    { name: "account_id", type: "text", foreignKey: { table: "accounts", column: "_id" } },
    { name: "body", type: "text" },
    { name: "likes", type: "int" },
    { name: "created_at", type: "timestamp" },
  ],
  rows: [
    { _id: "p001", account_id: "64f1a", body: "Set sail at dawn", likes: 230, created_at: "2025-06-01 06:00" },
    { _id: "p002", account_id: "64f1b", body: "Coup de Burst ready", likes: 1820, created_at: "2025-06-02 09:12" },
    { _id: "p003", account_id: "64f1d", body: "Meeting at Onigashima", likes: 9400, created_at: "2025-06-03 22:40" },
    { _id: "p004", account_id: "64f1a", body: "Repairs done", likes: 75, created_at: "2025-06-04 14:05" },
    { _id: "p005", account_id: "64f1c", body: "Special of the day", likes: 12, created_at: "2025-06-05 18:30" },
    { _id: "p006", account_id: "64f1b", body: "Aqua Laguna incoming", likes: 540, created_at: "2025-06-06 07:55" },
  ],
};

const notes: TableMeta = {
  name: "notes",
  primaryKey: "id",
  rowCount: 5,
  columns: [
    { name: "id", type: "int", primaryKey: true },
    { name: "title", type: "text" },
    { name: "content", type: "text" },
    { name: "pinned", type: "boolean" },
    { name: "updated_at", type: "timestamp" },
  ],
  rows: [
    { id: 1, title: "Road map", content: "Find the four road poneglyphs", pinned: true, updated_at: "2025-06-10 12:00" },
    { id: 2, title: "Crew", content: "Recruit a musician", pinned: false, updated_at: "2025-06-09 16:20" },
    { id: 3, title: "Supplies", content: "Restock meat and cola", pinned: false, updated_at: "2025-06-08 08:40" },
    { id: 4, title: "Bounty", content: "Update wanted posters", pinned: true, updated_at: "2025-06-07 19:05" },
    { id: 5, title: "Log", content: "Calibrate the log pose", pinned: false, updated_at: "2025-06-06 10:15" },
  ],
};

const tags: TableMeta = {
  name: "tags",
  primaryKey: "id",
  rowCount: 4,
  columns: [
    { name: "id", type: "int", primaryKey: true },
    { name: "note_id", type: "int", foreignKey: { table: "notes", column: "id" } },
    { name: "label", type: "text" },
  ],
  rows: [
    { id: 1, note_id: 1, label: "priority" },
    { id: 2, note_id: 1, label: "secret" },
    { id: 3, note_id: 4, label: "marine" },
    { id: 4, note_id: 2, label: "wishlist" },
  ],
};

const cache: TableMeta = {
  name: "cache:keys",
  primaryKey: "key",
  rowCount: 6,
  columns: [
    { name: "key", type: "text", primaryKey: true },
    { name: "type", type: "text" },
    { name: "value", type: "text" },
    { name: "ttl", type: "int" },
  ],
  rows: [
    { key: "session:luffy", type: "string", value: "active", ttl: 3600 },
    { key: "rank:bounties", type: "zset", value: "12 members", ttl: -1 },
    { key: "queue:tasks", type: "list", value: "4 items", ttl: 120 },
    { key: "flags:beta", type: "hash", value: "8 fields", ttl: -1 },
    { key: "lock:helm", type: "string", value: "zoro", ttl: 30 },
    { key: "cache:weather", type: "string", value: "storm", ttl: 600 },
  ],
};

export const MOCK_CATALOG: Record<DbKindId, TableMeta[]> = {
  postgres: [owners, pets, appointments],
  mysql: [customers, products, orders],
  mongodb: [accounts, posts],
  sqlite: [notes, tags],
  redis: [cache],
};

export function tablesFor(kind: DbKindId): TableMeta[] {
  return MOCK_CATALOG[kind] ?? [];
}

export function tableMeta(kind: DbKindId, name: string): TableMeta | undefined {
  return tablesFor(kind).find((t) => t.name === name);
}
