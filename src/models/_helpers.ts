import { Schema } from "mongoose";

/** Block updates/deletes on append-only collections (audit log, ledger). */
export function makeImmutable(schema: Schema) {
  const block = function () {
    throw new Error("This collection is append-only. Records cannot be modified or deleted.");
  };
  for (const op of [
    "updateOne", "updateMany", "findOneAndUpdate", "findOneAndReplace", "replaceOne",
    "deleteOne", "deleteMany", "findOneAndDelete",
  ] as const) {
    schema.pre(op, block);
  }
  schema.pre("save", function () {
    if (!this.isNew) throw new Error("This collection is append-only. Records cannot be modified.");
  });
}
