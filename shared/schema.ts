import { pgTable, serial, text, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import * as z from 'zod';

// Herbs table
export const herbs = pgTable("herbs", {
  id: serial("id").primaryKey(),
  pinyinName: text("pinyin_name").notNull(),
  chineseName: text("chinese_name").notNull(),
  latinName: text("latin_name"),
  englishName: text("english_name"),
  category: text("category"),
  nature: text("nature"),
  flavor: text("flavor"),
  meridians: text("meridians").array(),
  dosage: text("dosage"),
  preparation: text("preparation"),
  functions: text("functions").array(),
  applications: text("applications"),
  contraindications: text("contraindications"),
  cautions: text("cautions"),
  properties: text("properties"),
  // Hierarchical structure fields
  secondaryActions: jsonb("secondary_actions"),
  commonCombinations: jsonb("common_combinations"),
  // Additional effects fields
  pharmacologicalEffects: text("pharmacological_effects").array(),
  laboratoryEffects: text("laboratory_effects").array(),
  herbDrugInteractions: text("herb_drug_interactions").array(),
  clinicalStudiesAndResearch: text("clinical_studies_and_research").array()
});

// Formulas table
export const formulas = pgTable("formulas", {
  id: serial("id").primaryKey(),
  pinyinName: text("pinyin_name").notNull(),
  chineseName: text("chinese_name").notNull(),
  englishName: text("english_name"),
  category: text("category"),
  actions: text("actions").array(), // Chinese actions
  indications: text("indications"), // Clinical manifestations
  clinicalManifestations: text("clinical_manifestations"),
  clinicalApplications: text("clinical_applications"),
  contraindications: text("contraindications"),
  cautions: text("cautions"),
  pharmacologicalEffects: text("pharmacological_effects"),
  research: text("research"),
  herbDrugInteractions: text("herb_drug_interactions"),
  composition: jsonb("composition")
});

// Patients table
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  identifier: text("identifier"),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  contactInfo: text("contact_info"),
  medicalHistory: text("medical_history")
});

// Prescriptions table
export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  formulaId: integer("formula_id"),
  customFormula: jsonb("custom_formula"),
  dateCreated: timestamp("date_created").defaultNow(),
  status: text("status"),
  instructions: text("instructions"),
  duration: text("duration"),
  notes: text("notes")
});

// Activity schema for tracking system events
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  timestamp: text("timestamp").notNull(),
  relatedId: integer("related_id"),
});

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull(),
});

// Schemas for validation
export const insertHerbSchema = createInsertSchema(herbs).omit({
  id: true,
});

export const insertFormulaSchema = createInsertSchema(formulas).omit({
  id: true,
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
});

export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({
  id: true,
  dateCreated: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Types for TypeScript
export type Herb = typeof herbs.$inferSelect;
export type InsertHerb = z.infer<typeof insertHerbSchema>;

export type Formula = typeof formulas.$inferSelect;
export type InsertFormula = z.infer<typeof insertFormulaSchema>;

// Extensión para fórmulas con hierbas incluidas
export interface FormulaWithHerbs extends Formula {
  herbs: (Herb & { grams?: number; percentage?: number })[];
  totalGrams?: number;
  nature?: string; // Para indicar la naturaleza de la fórmula completa
}

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type Prescription = typeof prescriptions.$inferSelect & {
  patient?: { id: number; name: string };
  formula?: { id: number; pinyinName: string; chineseName: string };
};
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
