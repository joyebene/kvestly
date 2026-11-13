/** Run once per deploy that changes schemas (autoIndex is off in production):  npx tsx --env-file=.env.local scripts/sync-indexes.ts */
import mongoose from "mongoose";
import { User } from "../src/models/User";
import { Session } from "../src/models/Session";
import { AuditLog } from "../src/models/AuditLog";
import { RateLimit } from "../src/models/RateLimit";
import { ContactMessage } from "../src/models/ContactMessage";
import { KycSubmission } from "../src/models/KycSubmission";
import { InvestmentProduct } from "../src/models/InvestmentProduct";
import { LedgerEntry } from "../src/models/LedgerEntry";
import { FundingRequest } from "../src/models/FundingRequest";
import { Notification } from "../src/models/Notification";
import { SupportTicket } from "../src/models/SupportTicket";
import { ContentBlock } from "../src/models/ContentBlock";

(async () => {
  await mongoose.connect(process.env.MONGODB_URI!, { dbName: process.env.MONGODB_DB ?? "kvesty" });
  for (const m of [User, Session, AuditLog, RateLimit, ContactMessage, KycSubmission, InvestmentProduct, LedgerEntry, FundingRequest, Notification, SupportTicket, ContentBlock]) {
    await m.syncIndexes(); console.log("indexes ok:", m.modelName);
  }
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
