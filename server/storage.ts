import { 
  users, type User, type InsertUser,
  herbs, type Herb, type InsertHerb,
  formulas, type Formula, type InsertFormula,
  patients, type Patient, type InsertPatient,
  prescriptions, type Prescription, type InsertPrescription,
  activities, type Activity, type InsertActivity
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Storage interface
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Herbs
  getHerbs(): Promise<Herb[]>;
  getHerb(id: number): Promise<Herb | undefined>;
  createHerb(herb: InsertHerb): Promise<Herb>;
  updateHerb(id: number, herb: Partial<InsertHerb>): Promise<Herb | undefined>;
  deleteHerb(id: number): Promise<boolean>;

  // Formulas
  getFormulas(): Promise<Formula[]>;
  getFormula(id: number): Promise<Formula | undefined>;
  createFormula(formula: InsertFormula): Promise<Formula>;
  updateFormula(id: number, formula: Partial<InsertFormula>): Promise<Formula | undefined>;
  deleteFormula(id: number): Promise<boolean>;

  // Patients
  getPatients(): Promise<Patient[]>;
  getPatient(id: number): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient | undefined>;
  deletePatient(id: number): Promise<boolean>;

  // Prescriptions
  getPrescriptions(): Promise<Prescription[]>;
  getPrescription(id: number): Promise<Prescription | undefined>;
  getPrescriptionsByPatient(patientId: number): Promise<Prescription[]>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  updatePrescription(id: number, prescription: Partial<InsertPrescription>): Promise<Prescription | undefined>;
  deletePrescription(id: number): Promise<boolean>;

  // Activities
  getActivities(): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private herbs: Map<number, Herb>;
  private formulas: Map<number, Formula>;
  private patients: Map<number, Patient>;
  private prescriptions: Map<number, Prescription>;
  private activities: Map<number, Activity>;
  private userCounter: number;
  private herbCounter: number;
  private formulaCounter: number;
  private patientCounter: number;
  private prescriptionCounter: number;
  private activityCounter: number;

  constructor() {
    this.users = new Map();
    this.herbs = new Map();
    this.formulas = new Map();
    this.patients = new Map();
    this.prescriptions = new Map();
    this.activities = new Map();
    this.userCounter = 1;
    this.herbCounter = 1;
    this.formulaCounter = 1;
    this.patientCounter = 1;
    this.prescriptionCounter = 1;
    this.activityCounter = 1;

    // Initialize with some sample data for development
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Add sample users, herbs, formulas, patients and prescriptions
    // This is for development purposes only
    console.log("Initializing sample data for development...");
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userCounter++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  // Herb methods
  async getHerbs(): Promise<Herb[]> {
    return Array.from(this.herbs.values());
  }

  async getHerb(id: number): Promise<Herb | undefined> {
    return this.herbs.get(id);
  }

  async createHerb(herb: InsertHerb): Promise<Herb> {
    const id = this.herbCounter++;
    const newHerb: Herb = { ...herb, id };
    this.herbs.set(id, newHerb);
    
    // Create activity for herb creation
    await this.createActivity({
      type: "herb",
      title: "Nueva hierba registrada",
      description: `Hierba: ${newHerb.name}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });
    
    return newHerb;
  }

  async updateHerb(id: number, herb: Partial<InsertHerb>): Promise<Herb | undefined> {
    const existingHerb = this.herbs.get(id);
    if (!existingHerb) return undefined;

    const updatedHerb = { ...existingHerb, ...herb };
    this.herbs.set(id, updatedHerb);
    
    // Create activity for herb update
    await this.createActivity({
      type: "herb",
      title: "Hierba actualizada",
      description: `Hierba: ${updatedHerb.name}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });
    
    return updatedHerb;
  }

  async deleteHerb(id: number): Promise<boolean> {
    const herb = this.herbs.get(id);
    if (!herb) return false;
    
    const deleted = this.herbs.delete(id);
    
    if (deleted) {
      // Create activity for herb deletion
      await this.createActivity({
        type: "herb",
        title: "Hierba eliminada",
        description: `Hierba: ${herb.name}`,
        timestamp: new Date().toISOString(),
        relatedId: id
      });
    }
    
    return deleted;
  }

  // Formula methods
  async getFormulas(): Promise<Formula[]> {
    return Array.from(this.formulas.values());
  }

  async getFormula(id: number): Promise<Formula | undefined> {
    return this.formulas.get(id);
  }

  async createFormula(formula: InsertFormula): Promise<Formula> {
    const id = this.formulaCounter++;
    const newFormula: Formula = { ...formula, id };
    this.formulas.set(id, newFormula);
    
    // Create activity for formula creation
    await this.createActivity({
      type: "formula",
      title: "Nueva fórmula registrada",
      description: `Fórmula: ${newFormula.name}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });
    
    return newFormula;
  }

  async updateFormula(id: number, formula: Partial<InsertFormula>): Promise<Formula | undefined> {
    const existingFormula = this.formulas.get(id);
    if (!existingFormula) return undefined;

    const updatedFormula = { ...existingFormula, ...formula };
    this.formulas.set(id, updatedFormula);
    
    // Create activity for formula update
    await this.createActivity({
      type: "formula",
      title: "Fórmula actualizada",
      description: `Fórmula: ${updatedFormula.name}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });
    
    return updatedFormula;
  }

  async deleteFormula(id: number): Promise<boolean> {
    const formula = this.formulas.get(id);
    if (!formula) return false;
    
    const deleted = this.formulas.delete(id);
    
    if (deleted) {
      // Create activity for formula deletion
      await this.createActivity({
        type: "formula",
        title: "Fórmula eliminada",
        description: `Fórmula: ${formula.name}`,
        timestamp: new Date().toISOString(),
        relatedId: id
      });
    }
    
    return deleted;
  }

  // Patient methods
  async getPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const id = this.patientCounter++;
    const newPatient: Patient = { ...patient, id };
    this.patients.set(id, newPatient);
    
    // Create activity for patient creation
    await this.createActivity({
      type: "patient",
      title: "Nuevo paciente registrado",
      description: `Paciente: ${newPatient.name}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });
    
    return newPatient;
  }

  async updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient | undefined> {
    const existingPatient = this.patients.get(id);
    if (!existingPatient) return undefined;

    const updatedPatient = { ...existingPatient, ...patient };
    this.patients.set(id, updatedPatient);
    
    // Create activity for patient update
    await this.createActivity({
      type: "patient",
      title: "Paciente actualizado",
      description: `Paciente: ${updatedPatient.name}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });
    
    return updatedPatient;
  }

  async deletePatient(id: number): Promise<boolean> {
    const patient = this.patients.get(id);
    if (!patient) return false;
    
    const deleted = this.patients.delete(id);
    
    if (deleted) {
      // Create activity for patient deletion
      await this.createActivity({
        type: "patient",
        title: "Paciente eliminado",
        description: `Paciente: ${patient.name}`,
        timestamp: new Date().toISOString(),
        relatedId: id
      });
    }
    
    return deleted;
  }

  // Prescription methods
  async getPrescriptions(): Promise<Prescription[]> {
    return Array.from(this.prescriptions.values()).map(prescription => {
      // Add patient and formula information to the prescription
      const patient = this.patients.get(prescription.patientId);
      const formula = this.formulas.get(prescription.formulaId);
      
      return {
        ...prescription,
        patient: {
          id: patient?.id || 0,
          name: patient?.name || "Paciente no encontrado"
        },
        formula: {
          id: formula?.id || 0,
          name: formula?.name || "Fórmula no encontrada"
        }
      };
    });
  }

  async getPrescription(id: number): Promise<Prescription | undefined> {
    const prescription = this.prescriptions.get(id);
    if (!prescription) return undefined;
    
    // Add patient and formula information to the prescription
    const patient = this.patients.get(prescription.patientId);
    const formula = this.formulas.get(prescription.formulaId);
    
    return {
      ...prescription,
      patient: {
        id: patient?.id || 0,
        name: patient?.name || "Paciente no encontrado"
      },
      formula: {
        id: formula?.id || 0,
        name: formula?.name || "Fórmula no encontrada"
      }
    };
  }

  async getPrescriptionsByPatient(patientId: number): Promise<Prescription[]> {
    return Array.from(this.prescriptions.values())
      .filter(prescription => prescription.patientId === patientId)
      .map(prescription => {
        // Add patient and formula information to the prescription
        const patient = this.patients.get(prescription.patientId);
        const formula = this.formulas.get(prescription.formulaId);
        
        return {
          ...prescription,
          patient: {
            id: patient?.id || 0,
            name: patient?.name || "Paciente no encontrado"
          },
          formula: {
            id: formula?.id || 0,
            name: formula?.name || "Fórmula no encontrada"
          }
        };
      });
  }

  async createPrescription(prescription: InsertPrescription): Promise<Prescription> {
    const id = this.prescriptionCounter++;
    const newPrescription = { ...prescription, id } as Prescription;
    this.prescriptions.set(id, newPrescription);
    
    // Get patient and formula information
    const patient = await this.getPatient(prescription.patientId);
    const formula = await this.getFormula(prescription.formulaId);
    
    // Create activity for prescription creation
    await this.createActivity({
      type: "prescription",
      title: "Nueva prescripción creada",
      description: `Paciente: ${patient?.name || 'Desconocido'} - Fórmula: ${formula?.name || 'Desconocida'}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });
    
    // Add patient and formula information to the prescription
    return {
      ...newPrescription,
      patient: {
        id: patient?.id || 0,
        name: patient?.name || "Paciente no encontrado"
      },
      formula: {
        id: formula?.id || 0,
        name: formula?.name || "Fórmula no encontrada"
      }
    };
  }

  async updatePrescription(id: number, prescription: Partial<InsertPrescription>): Promise<Prescription | undefined> {
    const existingPrescription = this.prescriptions.get(id);
    if (!existingPrescription) return undefined;

    const updatedPrescription = { ...existingPrescription, ...prescription };
    this.prescriptions.set(id, updatedPrescription);
    
    // Get patient and formula information
    const patient = await this.getPatient(updatedPrescription.patientId);
    const formula = await this.getFormula(updatedPrescription.formulaId);
    
    // Create activity for prescription update
    await this.createActivity({
      type: "prescription",
      title: "Prescripción actualizada",
      description: `Paciente: ${patient?.name || 'Desconocido'} - Fórmula: ${formula?.name || 'Desconocida'}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });
    
    // Add patient and formula information to the prescription
    return {
      ...updatedPrescription,
      patient: {
        id: patient?.id || 0,
        name: patient?.name || "Paciente no encontrado"
      },
      formula: {
        id: formula?.id || 0,
        name: formula?.name || "Fórmula no encontrada"
      }
    };
  }

  async deletePrescription(id: number): Promise<boolean> {
    const prescription = this.prescriptions.get(id);
    if (!prescription) return false;
    
    const deleted = this.prescriptions.delete(id);
    
    if (deleted) {
      // Get patient and formula information
      const patient = await this.getPatient(prescription.patientId);
      const formula = await this.getFormula(prescription.formulaId);
      
      // Create activity for prescription deletion
      await this.createActivity({
        type: "prescription",
        title: "Prescripción eliminada",
        description: `Paciente: ${patient?.name || 'Desconocido'} - Fórmula: ${formula?.name || 'Desconocida'}`,
        timestamp: new Date().toISOString(),
        relatedId: id
      });
    }
    
    return deleted;
  }

  // Activity methods
  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10); // Only return the 10 most recent activities
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityCounter++;
    const newActivity: Activity = { ...activity, id };
    this.activities.set(id, newActivity);
    return newActivity;
  }
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Herb methods
  async getHerbs(): Promise<Herb[]> {
    return await db.select().from(herbs);
  }

  async getHerb(id: number): Promise<Herb | undefined> {
    const [herb] = await db.select().from(herbs).where(eq(herbs.id, id));
    return herb || undefined;
  }

  async createHerb(herb: InsertHerb): Promise<Herb> {
    const [newHerb] = await db
      .insert(herbs)
      .values(herb)
      .returning();
    
    // Create activity for herb creation
    await this.createActivity({
      type: "herb",
      title: "New herb added",
      description: `Herb: ${newHerb.pinyinName}`,
      timestamp: new Date().toISOString(),
      relatedId: newHerb.id
    });
    
    return newHerb;
  }

  async updateHerb(id: number, herb: Partial<InsertHerb>): Promise<Herb | undefined> {
    const [updatedHerb] = await db
      .update(herbs)
      .set(herb)
      .where(eq(herbs.id, id))
      .returning();
    
    if (updatedHerb) {
      // Create activity for herb update
      await this.createActivity({
        type: "herb",
        title: "Herb updated",
        description: `Herb: ${updatedHerb.pinyinName}`,
        timestamp: new Date().toISOString(),
        relatedId: id
      });
    }
    
    return updatedHerb || undefined;
  }

  async deleteHerb(id: number): Promise<boolean> {
    const [herb] = await db.select().from(herbs).where(eq(herbs.id, id));
    
    if (!herb) return false;
    
    await db.delete(herbs).where(eq(herbs.id, id));
    
    // Create activity for herb deletion
    await this.createActivity({
      type: "herb",
      title: "Herb deleted",
      description: `Herb: ${herb.pinyinName}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });
    
    return true;
  }

  // Formula methods
  async getFormulas(): Promise<Formula[]> {
    return await db.select().from(formulas);
  }

  async getFormula(id: number): Promise<Formula | undefined> {
    const [formula] = await db.select().from(formulas).where(eq(formulas.id, id));
    return formula || undefined;
  }

  async createFormula(formula: InsertFormula): Promise<Formula> {
    const [newFormula] = await db
      .insert(formulas)
      .values(formula)
      .returning();
    
    // Create activity for formula creation
    await this.createActivity({
      type: "formula",
      title: "New formula added",
      description: `Formula: ${newFormula.pinyinName}`,
      timestamp: new Date().toISOString(),
      relatedId: newFormula.id
    });
    
    return newFormula;
  }

  async updateFormula(id: number, formula: Partial<InsertFormula>): Promise<Formula | undefined> {
    const [updatedFormula] = await db
      .update(formulas)
      .set(formula)
      .where(eq(formulas.id, id))
      .returning();
    
    if (updatedFormula) {
      // Create activity for formula update
      await this.createActivity({
        type: "formula",
        title: "Formula updated",
        description: `Formula: ${updatedFormula.pinyinName}`,
        timestamp: new Date().toISOString(),
        relatedId: id
      });
    }
    
    return updatedFormula || undefined;
  }

  async deleteFormula(id: number): Promise<boolean> {
    const [formula] = await db.select().from(formulas).where(eq(formulas.id, id));
    
    if (!formula) return false;
    
    await db.delete(formulas).where(eq(formulas.id, id));
    
    // Create activity for formula deletion
    await this.createActivity({
      type: "formula",
      title: "Formula deleted",
      description: `Formula: ${formula.pinyinName}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });
    
    return true;
  }

  // Patient methods
  async getPatients(): Promise<Patient[]> {
    return await db.select().from(patients);
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient || undefined;
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const [newPatient] = await db
      .insert(patients)
      .values(patient)
      .returning();
    
    // Create activity for patient creation
    await this.createActivity({
      type: "patient",
      title: "New patient registered",
      description: `Patient: ${newPatient.name}`,
      timestamp: new Date().toISOString(),
      relatedId: newPatient.id
    });
    
    return newPatient;
  }

  async updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient | undefined> {
    const [updatedPatient] = await db
      .update(patients)
      .set(patient)
      .where(eq(patients.id, id))
      .returning();
    
    if (updatedPatient) {
      // Create activity for patient update
      await this.createActivity({
        type: "patient",
        title: "Patient updated",
        description: `Patient: ${updatedPatient.name}`,
        timestamp: new Date().toISOString(),
        relatedId: id
      });
    }
    
    return updatedPatient || undefined;
  }

  async deletePatient(id: number): Promise<boolean> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    
    if (!patient) return false;
    
    await db.delete(patients).where(eq(patients.id, id));
    
    // Create activity for patient deletion
    await this.createActivity({
      type: "patient",
      title: "Patient deleted",
      description: `Patient: ${patient.name}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });
    
    return true;
  }

  // Prescription methods
  async getPrescriptions(): Promise<Prescription[]> {
    const result = await db.select().from(prescriptions);
    
    // Enhance prescriptions with patient and formula information
    const enhancedPrescriptions = await Promise.all(
      result.map(async prescription => {
        let patientInfo = { id: 0, name: "Patient not found" };
        let formulaInfo = { id: 0, pinyinName: "Formula not found", chineseName: "" };
        
        if (prescription.patientId) {
          const [patient] = await db
            .select()
            .from(patients)
            .where(eq(patients.id, prescription.patientId));
          
          if (patient) {
            patientInfo = { id: patient.id, name: patient.name };
          }
        }
        
        if (prescription.formulaId) {
          const [formula] = await db
            .select()
            .from(formulas)
            .where(eq(formulas.id, prescription.formulaId));
          
          if (formula) {
            formulaInfo = { 
              id: formula.id, 
              pinyinName: formula.pinyinName,
              chineseName: formula.chineseName
            };
          }
        }
        
        return {
          ...prescription,
          patient: patientInfo,
          formula: formulaInfo
        };
      })
    );
    
    return enhancedPrescriptions;
  }

  async getPrescription(id: number): Promise<Prescription | undefined> {
    const [prescription] = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.id, id));
    
    if (!prescription) return undefined;
    
    // Add patient and formula information
    let patientInfo = { id: 0, name: "Patient not found" };
    let formulaInfo = { id: 0, pinyinName: "Formula not found", chineseName: "" };
    
    if (prescription.patientId) {
      const [patient] = await db
        .select()
        .from(patients)
        .where(eq(patients.id, prescription.patientId));
      
      if (patient) {
        patientInfo = { id: patient.id, name: patient.name };
      }
    }
    
    if (prescription.formulaId) {
      const [formula] = await db
        .select()
        .from(formulas)
        .where(eq(formulas.id, prescription.formulaId));
      
      if (formula) {
        formulaInfo = { 
          id: formula.id, 
          pinyinName: formula.pinyinName,
          chineseName: formula.chineseName 
        };
      }
    }
    
    return {
      ...prescription,
      patient: patientInfo,
      formula: formulaInfo
    };
  }

  async getPrescriptionsByPatient(patientId: number): Promise<Prescription[]> {
    const result = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.patientId, patientId));
    
    // Enhance prescriptions with patient and formula information
    const enhancedPrescriptions = await Promise.all(
      result.map(async prescription => {
        let patientInfo = { id: 0, name: "Patient not found" };
        let formulaInfo = { id: 0, pinyinName: "Formula not found", chineseName: "" };
        
        const [patient] = await db
          .select()
          .from(patients)
          .where(eq(patients.id, patientId));
        
        if (patient) {
          patientInfo = { id: patient.id, name: patient.name };
        }
        
        if (prescription.formulaId) {
          const [formula] = await db
            .select()
            .from(formulas)
            .where(eq(formulas.id, prescription.formulaId));
          
          if (formula) {
            formulaInfo = { 
              id: formula.id, 
              pinyinName: formula.pinyinName,
              chineseName: formula.chineseName 
            };
          }
        }
        
        return {
          ...prescription,
          patient: patientInfo,
          formula: formulaInfo
        };
      })
    );
    
    return enhancedPrescriptions;
  }

  async createPrescription(prescription: InsertPrescription): Promise<Prescription> {
    const [newPrescription] = await db
      .insert(prescriptions)
      .values(prescription)
      .returning();
    
    // Get patient and formula information
    let patientInfo = { id: 0, name: "Patient not found" };
    let formulaInfo = { id: 0, pinyinName: "Formula not found", chineseName: "" };
    
    if (prescription.patientId) {
      const [patient] = await db
        .select()
        .from(patients)
        .where(eq(patients.id, prescription.patientId));
      
      if (patient) {
        patientInfo = { id: patient.id, name: patient.name };
      }
    }
    
    if (prescription.formulaId) {
      const [formula] = await db
        .select()
        .from(formulas)
        .where(eq(formulas.id, prescription.formulaId));
      
      if (formula) {
        formulaInfo = { 
          id: formula.id, 
          pinyinName: formula.pinyinName,
          chineseName: formula.chineseName 
        };
      }
    }
    
    // Create activity for prescription creation
    await this.createActivity({
      type: "prescription",
      title: "New prescription created",
      description: `Patient: ${patientInfo.name}`,
      timestamp: new Date().toISOString(),
      relatedId: newPrescription.id
    });
    
    return {
      ...newPrescription,
      patient: patientInfo,
      formula: formulaInfo
    };
  }

  async updatePrescription(id: number, prescription: Partial<InsertPrescription>): Promise<Prescription | undefined> {
    const [updatedPrescription] = await db
      .update(prescriptions)
      .set(prescription)
      .where(eq(prescriptions.id, id))
      .returning();
    
    if (!updatedPrescription) return undefined;
    
    // Get patient and formula information
    let patientInfo = { id: 0, name: "Patient not found" };
    let formulaInfo = { id: 0, pinyinName: "Formula not found", chineseName: "" };
    
    const patientId = prescription.patientId || updatedPrescription.patientId;
    const formulaId = prescription.formulaId || updatedPrescription.formulaId;
    
    if (patientId) {
      const [patient] = await db
        .select()
        .from(patients)
        .where(eq(patients.id, patientId));
      
      if (patient) {
        patientInfo = { id: patient.id, name: patient.name };
      }
    }
    
    if (formulaId) {
      const [formula] = await db
        .select()
        .from(formulas)
        .where(eq(formulas.id, formulaId));
      
      if (formula) {
        formulaInfo = { 
          id: formula.id, 
          pinyinName: formula.pinyinName,
          chineseName: formula.chineseName 
        };
      }
    }
    
    // Create activity for prescription update
    await this.createActivity({
      type: "prescription",
      title: "Prescription updated",
      description: `Patient: ${patientInfo.name}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });
    
    return {
      ...updatedPrescription,
      patient: patientInfo,
      formula: formulaInfo
    };
  }

  async deletePrescription(id: number): Promise<boolean> {
    const [prescription] = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.id, id));
    
    if (!prescription) return false;
    
    // Get patient information before deletion
    let patientName = "Unknown";
    if (prescription.patientId) {
      const [patient] = await db
        .select()
        .from(patients)
        .where(eq(patients.id, prescription.patientId));
      
      if (patient) {
        patientName = patient.name;
      }
    }
    
    await db.delete(prescriptions).where(eq(prescriptions.id, id));
    
    // Create activity for prescription deletion
    await this.createActivity({
      type: "prescription",
      title: "Prescription deleted",
      description: `Patient: ${patientName}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });
    
    return true;
  }

  // Activity methods
  async getActivities(): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .orderBy(desc(activities.timestamp))
      .limit(10);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db
      .insert(activities)
      .values(activity)
      .returning();
    
    return newActivity;
  }
}

// Export an instance of the storage class
// Using DatabaseStorage now, but we can easily switch to MemStorage if needed
export const storage = new DatabaseStorage();
