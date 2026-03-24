import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mode: text("mode"),
  profil: text("profil"),
  barometre: jsonb("barometre"),
  experience: text("experience"),
  objectifs: jsonb("objectifs").$type<string[]>(),
  difficulte: text("difficulte"),
  typeCollab: text("type_collab"),
  complement: text("complement"),
  scenarioChoisi: text("scenario_choisi"),
  personaDisc: text("persona_disc"),
  personaRelation: text("persona_relation"),
  personaEtatEsprit: text("persona_etat_esprit"),
  niveauDifficulte: text("niveau_difficulte"),
  messages: jsonb("messages").$type<Array<{ role: string; content: string; timestamp: string }>>(),
  clarte: real("clarte"),
  ecoute: real("ecoute"),
  assertivite: real("assertivite"),
  global: real("global"),
  pointsForts: jsonb("points_forts").$type<string[]>(),
  axesProgression: jsonb("axes_progression").$type<string[]>(),
  conseilCle: text("conseil_cle"),
  nps: integer("nps"),
  facilite: integer("facilite"),
  pertinence: integer("pertinence"),
  realisme: integer("realisme"),
  ameliorations: jsonb("ameliorations").$type<string[]>(),
  commentaire: text("commentaire"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
});

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;
