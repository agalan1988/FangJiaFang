import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertHerbSchema, 
  insertFormulaSchema, 
  insertPatientSchema, 
  insertPrescriptionSchema 
} from "@shared/schema";
import { ZodError } from "zod";

// Custom error type
class ApiError extends Error {
  status: number;

  constructor(message: string, status: number = 400) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

// Handle zod validation errors
function handleZodError(error: ZodError) {
  const issues = error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
  return {
    message: "Validation error",
    errors: issues,
  };
}

// Error handler middleware
function errorHandler(err: any, res: Response) {
  console.error("API Error:", err);

  if (err instanceof ZodError) {
    return res.status(400).json(handleZodError(err));
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message });
  }

  return res.status(500).json({ message: "Internal server error" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Herbs endpoints
  app.get("/api/herbs", async (req: Request, res: Response) => {
    try {
      const herbs = await storage.getHerbs();
      res.json(herbs);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.get("/api/herbs/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ApiError("Invalid ID format", 400);
      }

      const herb = await storage.getHerb(id);
      if (!herb) {
        throw new ApiError("Herb not found", 404);
      }

      res.json(herb);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.post("/api/herbs", async (req: Request, res: Response) => {
    try {
      const herbData = insertHerbSchema.parse(req.body);
      const herb = await storage.createHerb(herbData);
      res.status(201).json(herb);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.patch("/api/herbs/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ApiError("Invalid ID format", 400);
      }

      // Partial validation of the herb data
      const herbData = insertHerbSchema.partial().parse(req.body);
      
      const updatedHerb = await storage.updateHerb(id, herbData);
      if (!updatedHerb) {
        throw new ApiError("Herb not found", 404);
      }

      res.json(updatedHerb);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.delete("/api/herbs/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ApiError("Invalid ID format", 400);
      }

      const success = await storage.deleteHerb(id);
      if (!success) {
        throw new ApiError("Herb not found", 404);
      }

      res.status(204).end();
    } catch (err) {
      errorHandler(err, res);
    }
  });

  // Formulas endpoints
  app.get("/api/formulas", async (req: Request, res: Response) => {
    try {
      const formulas = await storage.getFormulas();
      res.json(formulas);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.get("/api/formulas/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ApiError("Invalid ID format", 400);
      }

      const formula = await storage.getFormula(id);
      if (!formula) {
        throw new ApiError("Formula not found", 404);
      }

      res.json(formula);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.post("/api/formulas", async (req: Request, res: Response) => {
    try {
      const formulaData = insertFormulaSchema.parse(req.body);
      const formula = await storage.createFormula(formulaData);
      res.status(201).json(formula);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.patch("/api/formulas/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ApiError("Invalid ID format", 400);
      }

      // Partial validation of the formula data
      const formulaData = insertFormulaSchema.partial().parse(req.body);
      
      const updatedFormula = await storage.updateFormula(id, formulaData);
      if (!updatedFormula) {
        throw new ApiError("Formula not found", 404);
      }

      res.json(updatedFormula);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.delete("/api/formulas/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ApiError("Invalid ID format", 400);
      }

      const success = await storage.deleteFormula(id);
      if (!success) {
        throw new ApiError("Formula not found", 404);
      }

      res.status(204).end();
    } catch (err) {
      errorHandler(err, res);
    }
  });
  
  app.post("/api/formulas/import", async (req: Request, res: Response) => {
    try {
      const formulasData = req.body;
      const results = {
        imported: 0,
        skipped: 0,
        errors: [] as string[]
      };
      
      // Comprobar si es un objeto JSON con múltiples fórmulas o una fórmula individual
      if (Array.isArray(formulasData) || (formulasData && typeof formulasData === 'object' && 'pinyinName' in formulasData)) {
        // Es un array de fórmulas o una fórmula individual en formato nuevo
        const formulasArray = Array.isArray(formulasData) ? formulasData : [formulasData];
        
        for (const formulaData of formulasArray) {
          try {
            // Verificar campos requeridos
            if (!formulaData.pinyinName) {
              throw new Error("Falta el campo pinyinName");
            }
            
            const formulaName = formulaData.pinyinName;
            
            // Adaptar la estructura de composición si está en formato nuevo
            let processedComposition = formulaData.composition;
            if (Array.isArray(processedComposition)) {
              processedComposition = processedComposition.map(item => ({
                herb: item.pinyinName,
                dosage: item.dosage || "0g",
                function: item.function || "",
                chineseName: item.chineseName || ""
              }));
            }
            
            // Buscar si la fórmula ya existe
            const existingFormulas = await storage.getFormulas();
            const existingFormula = existingFormulas.find(f => 
              f.pinyinName === formulaName || 
              f.pinyinName === formulaName.toLowerCase() || 
              f.pinyinName === formulaName.toUpperCase()
            );
            
            if (existingFormula) {
              // Actualizar la fórmula existente
              await storage.updateFormula(existingFormula.id, {
                chineseName: formulaData.chineseName || existingFormula.chineseName,
                englishName: formulaData.englishName || existingFormula.englishName,
                category: formulaData.category || existingFormula.category,
                actions: formulaData.actions || existingFormula.actions, // Chinese actions
                indications: formulaData.indications || existingFormula.indications, // Clinical manifestations
                clinicalManifestations: formulaData.clinicalManifestations || existingFormula.clinicalManifestations,
                clinicalApplications: formulaData.clinicalApplications || existingFormula.clinicalApplications,
                contraindications: formulaData.contraindications || existingFormula.contraindications,
                cautions: formulaData.cautions || existingFormula.cautions,
                pharmacologicalEffects: formulaData.pharmacologicalEffects || existingFormula.pharmacologicalEffects,
                research: formulaData.research || (formulaData.modernResearch ? formulaData.modernResearch[0]?.[0] || existingFormula.research : existingFormula.research),
                herbDrugInteractions: formulaData.herbDrugInteractions || existingFormula.herbDrugInteractions,
                composition: processedComposition
              });
              results.imported++;
              
              await storage.createActivity({
                type: "formula",
                title: "Fórmula actualizada (importación)",
                description: `Se actualizó la fórmula ${formulaName} desde la importación`,
                timestamp: new Date().toISOString(),
                relatedId: existingFormula.id
              });
            } else {
              // Asegurarse de que el chineseName no esté vacío (es un campo requerido)
              // Si está vacío, usamos el pinyinName como valor predeterminado
              const chineseName = formulaData.chineseName || formulaName;
              
              console.log("Intentando crear fórmula:", {
                pinyinName: formulaName,
                chineseName: chineseName,
                category: formulaData.category || "",
              });
              
              // Crear nueva fórmula
              const newFormula = await storage.createFormula({
                pinyinName: formulaName,
                chineseName: chineseName, 
                englishName: formulaData.englishName || "",
                category: formulaData.category || "",
                actions: formulaData.actions || [], // Chinese actions
                indications: formulaData.indications || "", // Clinical manifestations
                clinicalManifestations: formulaData.clinicalManifestations || "",
                clinicalApplications: formulaData.clinicalApplications || "",
                contraindications: formulaData.contraindications || "",
                cautions: formulaData.cautions || "",
                pharmacologicalEffects: formulaData.pharmacologicalEffects || "",
                research: formulaData.research || (formulaData.modernResearch ? formulaData.modernResearch[0]?.[0] || "" : ""),
                herbDrugInteractions: formulaData.herbDrugInteractions || "",
                composition: processedComposition || []
              });
              console.log("Fórmula creada con éxito:", newFormula.id);
              
              results.imported++;
              
              await storage.createActivity({
                type: "formula",
                title: "Fórmula creada (importación)",
                description: `Se creó la fórmula ${formulaName} desde la importación`,
                timestamp: new Date().toISOString(),
                relatedId: newFormula.id
              });
            }
          } catch (err: any) {
            results.errors.push(`Error con la fórmula ${formulaData.pinyinName || 'desconocida'}: ${err.message}`);
            results.skipped++;
          }
        }
      } else {
        // Formato antiguo con estructura {nombreFormula: { grupo, ingredientes }}
        for (const [formulaName, data] of Object.entries(formulasData)) {
          try {
            // Extraer la información del objeto
            const typedData = data as { grupo: string, ingredientes: Array<{planta: string, gramos: number}> };
            
            // Dar formato a la composición para que coincida con el esquema de la BD
            const composition = typedData.ingredientes.map(item => ({
              herb: item.planta,
              dosage: `${item.gramos}g`,
              function: "",
              chineseName: ""
            }));
            
            // Buscar si la fórmula ya existe
            const existingFormulas = await storage.getFormulas();
            const existingFormula = existingFormulas.find(f => 
              f.pinyinName === formulaName || 
              f.pinyinName === formulaName.toLowerCase() || 
              f.pinyinName === formulaName.toUpperCase()
            );
            
            if (existingFormula) {
              // Actualizar la fórmula existente
              await storage.updateFormula(existingFormula.id, {
                category: typedData.grupo,
                composition: composition
              });
              results.imported++;
              
              await storage.createActivity({
                type: "formula",
                title: "Fórmula actualizada (importación)",
                description: `Se actualizó la fórmula ${formulaName} desde la importación`,
                timestamp: new Date().toISOString(),
                relatedId: existingFormula.id
              });
            } else {
              // Crear nueva fórmula - asegurarnos de que chineseName no esté vacío
              console.log("Creando fórmula con formato antiguo:", formulaName);
              const newFormula = await storage.createFormula({
                pinyinName: formulaName,
                chineseName: formulaName, // Usamos el nombre pinyin ya que no tenemos el nombre chino
                category: typedData.grupo,
                composition: composition
              });
              results.imported++;
              
              await storage.createActivity({
                type: "formula",
                title: "Fórmula creada (importación)",
                description: `Se creó la fórmula ${formulaName} desde la importación`,
                timestamp: new Date().toISOString(),
                relatedId: newFormula.id
              });
            }
          } catch (err: any) {
            results.errors.push(`Error con la fórmula ${formulaName}: ${err.message}`);
            results.skipped++;
          }
        }
      }
      
      res.json(results);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  // Patients endpoints
  app.get("/api/patients", async (req: Request, res: Response) => {
    try {
      const patients = await storage.getPatients();
      res.json(patients);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.get("/api/patients/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ApiError("Invalid ID format", 400);
      }

      const patient = await storage.getPatient(id);
      if (!patient) {
        throw new ApiError("Patient not found", 404);
      }

      res.json(patient);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.get("/api/patients/:id/prescriptions", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ApiError("Invalid ID format", 400);
      }

      const patient = await storage.getPatient(id);
      if (!patient) {
        throw new ApiError("Patient not found", 404);
      }

      const prescriptions = await storage.getPrescriptionsByPatient(id);
      res.json(prescriptions);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.post("/api/patients", async (req: Request, res: Response) => {
    try {
      const patientData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(patientData);
      res.status(201).json(patient);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.patch("/api/patients/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ApiError("Invalid ID format", 400);
      }

      // Partial validation of the patient data
      const patientData = insertPatientSchema.partial().parse(req.body);
      
      const updatedPatient = await storage.updatePatient(id, patientData);
      if (!updatedPatient) {
        throw new ApiError("Patient not found", 404);
      }

      res.json(updatedPatient);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.delete("/api/patients/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ApiError("Invalid ID format", 400);
      }

      const success = await storage.deletePatient(id);
      if (!success) {
        throw new ApiError("Patient not found", 404);
      }

      res.status(204).end();
    } catch (err) {
      errorHandler(err, res);
    }
  });

  // Prescriptions endpoints
  app.get("/api/prescriptions", async (req: Request, res: Response) => {
    try {
      const prescriptions = await storage.getPrescriptions();
      res.json(prescriptions);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.get("/api/prescriptions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ApiError("Invalid ID format", 400);
      }

      const prescription = await storage.getPrescription(id);
      if (!prescription) {
        throw new ApiError("Prescription not found", 404);
      }

      res.json(prescription);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.post("/api/prescriptions", async (req: Request, res: Response) => {
    try {
      const prescriptionData = insertPrescriptionSchema.parse(req.body);
      
      // Validate that the patient and formula exist
      const patient = await storage.getPatient(prescriptionData.patientId);
      if (!patient) {
        throw new ApiError("Patient not found", 404);
      }
      
      const formula = await storage.getFormula(prescriptionData.formulaId);
      if (!formula) {
        throw new ApiError("Formula not found", 404);
      }
      
      const prescription = await storage.createPrescription(prescriptionData);
      res.status(201).json(prescription);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.patch("/api/prescriptions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ApiError("Invalid ID format", 400);
      }

      // Partial validation of the prescription data
      const prescriptionData = insertPrescriptionSchema.partial().parse(req.body);
      
      // If patient or formula ID is provided, validate they exist
      if (prescriptionData.patientId) {
        const patient = await storage.getPatient(prescriptionData.patientId);
        if (!patient) {
          throw new ApiError("Patient not found", 404);
        }
      }
      
      if (prescriptionData.formulaId) {
        const formula = await storage.getFormula(prescriptionData.formulaId);
        if (!formula) {
          throw new ApiError("Formula not found", 404);
        }
      }
      
      const updatedPrescription = await storage.updatePrescription(id, prescriptionData);
      if (!updatedPrescription) {
        throw new ApiError("Prescription not found", 404);
      }

      res.json(updatedPrescription);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  app.delete("/api/prescriptions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ApiError("Invalid ID format", 400);
      }

      const success = await storage.deletePrescription(id);
      if (!success) {
        throw new ApiError("Prescription not found", 404);
      }

      res.status(204).end();
    } catch (err) {
      errorHandler(err, res);
    }
  });

  // Activities endpoints
  app.get("/api/activities", async (req: Request, res: Response) => {
    try {
      const activities = await storage.getActivities();
      res.json(activities);
    } catch (err) {
      errorHandler(err, res);
    }
  });

  // Initialize database with Drizzle if in development
  if (process.env.NODE_ENV === 'development') {
    await initializeDatabase();
  }

  return httpServer;
}

// Helper function to initialize the database
async function initializeDatabase() {
  try {
    // We'll reset and recreate the sample data for demonstration
    console.log("Reinitializing sample data for the database...");

    console.log("Initializing sample data for development...");

    // Create sample herbs
    const ginseng = await storage.createHerb({
      pinyinName: "Ren Shen",
      chineseName: "人参",
      latinName: "Radix Ginseng",
      englishName: "Ginseng",
      category: "Tonics",
      nature: "Slightly warm",
      flavor: "Sweet, slightly bitter",
      meridians: ["Spleen", "Lung", "Heart"],
      dosage: "3-10g",
      functions: ["Tonifies Qi", "Strengthens Spleen and Lung", "Generates fluids"],
      applications: "For Qi deficiency, fatigue, shortness of breath",
      contraindications: "Avoid in excess heat conditions",
      properties: "Highly valued adaptogenic herb",
      secondaryActions: [
        { action: "Calms the spirit", details: "Improves mental function and reduces anxiety" },
        { action: "Generates fluids", details: "Relieves thirst and dryness" }
      ],
      indications: [
        "Deficiencia grave de Qi: fatiga extrema, respiración corta, sudoración espontánea",
        "Deficiencia de Qi de Bazo: falta de apetito, digestión deficiente, heces blandas",
        "Deficiencia de Qi de Pulmón: respiración débil, voz débil, susceptibilidad a resfriados",
        "Deficiencia de Yin con sequedad: sed, sequedad, calor por deficiencia",
        "Hemorragias por deficiencia de Qi: incapacidad para contener la sangre",
        "Shock o colapso: sudor frío, extremidades frías, pulso débil"
      ],
      dosage: "3-10g",
      preparation: "Añadir al final",
      precautions: "Evitar en exceso de calor",
      combinations: ["Huang Qi", "Bai Zhu", "Fu Ling", "Dang Gui", "Mai Men Dong", "Wu Wei Zi"],
      relatedFormulas: [
        { id: 1, name: "Si Jun Zi Tang" },
        { id: 2, name: "Bu Zhong Yi Qi Tang" },
        { id: 3, name: "Gui Pi Tang" },
        { id: 4, name: "Ren Shen Yang Ying Tang" }
      ],
      references: [
        "\"Chinese Herbal Medicine: Materia Medica\" - Bensky, Clavey, Stoger",
        "\"Chinese Medical Herbology & Pharmacology\" - Chen & Chen",
        "\"The Divine Farmer's Materia Medica\" - Yang Shou-zhong"
      ]
    });

    const huangQi = await storage.createHerb({
      pinyinName: "Huang Qi",
      chineseName: "黄芪",
      latinName: "Radix Astragali",
      englishName: "Astragalus",
      category: "Tonics",
      nature: "Slightly warm",
      flavor: "Sweet",
      meridians: ["Spleen", "Lung"],
      dosage: "9-30g",
      functions: ["Tonifies Qi", "Raises Yang Qi", "Strengthens Wei Qi", "Generates fluids and blood"],
      applications: "For Qi deficiency, fatigue, chronic illness, and organ prolapse",
      contraindications: "Avoid in acute infections and excess heat conditions",
      properties: "Immune system enhancing herb with adaptogenic properties",
      secondaryActions: [
        { action: "Strengthens Wei Qi", details: "Prevents colds and flu" },
        { action: "Raises Yang", details: "Helps with organ prolapse issues" }
      ],
      commonCombinations: [
        { herb: "Ren Shen", purpose: "Strengthens Qi tonification" },
        { herb: "Bai Zhu", purpose: "Tonifies Spleen" },
        { herb: "Dang Gui", purpose: "Nourishes Blood along with Qi" },
        { herb: "Gan Cao", purpose: "Harmonizes the formula" }
      ]
    });

    // Create sample formulas
    const siJunZiTang = await storage.createFormula({
      pinyinName: "Si Jun Zi Tang",
      chineseName: "四君子汤",
      englishName: "Four Gentlemen Decoction",
      category: "Qi Tonification Formulas",
      contraindications: "Excess heat patterns, food stagnation, or qi stagnation",
      actions: ["Tonifies Qi", "Strengthens Spleen"],
      indications: "Spleen Qi deficiency with fatigue and poor appetite",
      composition: [
        { herbId: ginseng.id, name: "Ren Shen", chineseName: "人参", function: "Tonifica el Qi de Bazo", dosage: "9g" },
        { herbId: 0, name: "Bai Zhu", chineseName: "白术", function: "Fortalece el Bazo y seca la humedad", dosage: "9g" },
        { herbId: 0, name: "Fu Ling", chineseName: "茯苓", function: "Drena la humedad y fortalece el Bazo", dosage: "9g" },
        { herbId: 0, name: "Zhi Gan Cao", chineseName: "炙甘草", function: "Tonifica el Qi y armoniza los ingredientes", dosage: "6g" }
      ],
      preparation: "Decocción estándar. Tomar una vez al día dividido en 2 dosis.",
      actions: [
        "Tonifica el Qi",
        "Fortalece el Bazo"
      ],
      indications: [
        "Deficiencia de Qi de Bazo y Estómago",
        "Fatiga, debilidad",
        "Falta de apetito",
        "Heces blandas",
        "Lengua pálida con saburra blanca",
        "Pulso débil"
      ],
      contraindications: [
        "Exceso de calor",
        "Estancamiento de alimentos",
        "Estancamiento de Qi"
      ],
      modifications: [
        {
          condition: "Con Deficiencia de Qi de Pulmón",
          changes: [
            "Agregar Huang Qi 15g",
            "Agregar Wu Wei Zi 6g"
          ]
        },
        {
          condition: "Con Deficiencia de Yin",
          changes: [
            "Agregar Mai Men Dong 9g",
            "Agregar Shi Hu 9g"
          ]
        }
      ],
      clinicalNotes: "Fórmula base para tratar la deficiencia de Qi. Puede modificarse para adaptarse a diferentes presentaciones clínicas. Se usa comúnmente en casos de fatiga crónica y problemas digestivos por deficiencia.",
      references: [
        "\"Formulas & Strategies\" - Bensky & Barolet",
        "\"Chinese Medical Formulas\" - Chen & Chen"
      ]
    });

    const buZhongYiQiTang = await storage.createFormula({
      pinyinName: "Bu Zhong Yi Qi Tang",
      chineseName: "补中益气汤",
      englishName: "Tonify the Middle and Augment the Qi Decoction",
      category: "Qi Tonification Formulas",
      contraindications: "Excess patterns, qi stagnation, or excessive heat",
      actions: ["Tonifies Qi", "Raises Yang Qi", "Strengthens the exterior"],
      indications: "Qi deficiency with sinking Yang, organ prolapse, chronic fatigue",
      composition: [
        { herbId: ginseng.id, name: "Ren Shen", chineseName: "人参", function: "Tonifica el Qi de Bazo", dosage: "6g" },
        { herbId: huangQi.id, name: "Huang Qi", chineseName: "黄芪", function: "Tonifica el Qi y eleva el Yang", dosage: "15g" },
        { herbId: 0, name: "Bai Zhu", chineseName: "白术", function: "Fortalece el Bazo", dosage: "9g" },
        { herbId: 0, name: "Dang Gui", chineseName: "当归", function: "Nutre la sangre", dosage: "6g" },
        { herbId: 0, name: "Chen Pi", chineseName: "陈皮", function: "Regula el Qi", dosage: "6g" },
        { herbId: 0, name: "Sheng Ma", chineseName: "升麻", function: "Eleva el Yang Qi", dosage: "3g" },
        { herbId: 0, name: "Chai Hu", chineseName: "柴胡", function: "Eleva el Yang Qi", dosage: "3g" },
        { herbId: 0, name: "Zhi Gan Cao", chineseName: "炙甘草", function: "Tonifica el Qi y armoniza", dosage: "3g" }
      ],
      preparation: "Decocción estándar. Tomar una vez al día dividido en 2 dosis.",
      actions: [
        "Tonifica el Qi de Bazo y Estómago",
        "Eleva el Yang Qi caído",
        "Fortalece el Qi defensivo exterior"
      ],
      indications: [
        "Deficiencia de Qi con caída de Yang",
        "Prolapso de órganos: útero, estómago, recto",
        "Ptosis gástrica",
        "Fatiga crónica con debilidad",
        "Sudoración espontánea",
        "Diarrea crónica por deficiencia",
        "Pulso débil"
      ],
      contraindications: [
        "Patrones de exceso",
        "Estancamiento de Qi",
        "Calor exuberante"
      ],
      modifications: [
        {
          condition: "Para prolapso uterino",
          changes: [
            "Aumentar Huang Qi a 30g",
            "Agregar Tu Si Zi 9g"
          ]
        },
        {
          condition: "Para sudoración por deficiencia",
          changes: [
            "Agregar Mu Li 15g",
            "Agregar Fu Xiao Mai 9g"
          ]
        }
      ],
      clinicalNotes: "Fórmula clásica para tonificar y elevar el Qi. Muy útil en casos de prolapsos y deficiencia crónica de Qi con manifestaciones de hundimiento energético.",
      references: [
        "\"Formulas & Strategies\" - Bensky & Barolet",
        "\"Chinese Medical Formulas\" - Chen & Chen",
        "\"Pi Wei Lun\" - Li Dong-yuan"
      ]
    });

    // Create sample patients
    const patient1 = await storage.createPatient({
      name: "María González",
      identifier: "MG-2023-001",
      dateOfBirth: "1975-05-15",
      gender: "Female",
      contactInfo: "+1 612-345-6789, maria.gonzalez@email.com, Calle Principal 123, Madrid",
      medicalHistory: "Hypothyroidism (since 2015), controlled with medication. Migraine (since 2010), frequent episodes during stress periods."
    });

    const patient2 = await storage.createPatient({
      name: "Carlos Rodríguez",
      identifier: "CR-2023-002",
      dateOfBirth: "1980-11-22",
      gender: "Male",
      contactInfo: "+1 655-789-1234, carlos.rodriguez@email.com, Avenida Secundaria 456, Barcelona",
      medicalHistory: "Hypertension (since 2018), controlled with diet and exercise."
    });

    // Create sample prescriptions
    await storage.createPrescription({
      patientId: patient1.id,
      formulaId: siJunZiTang.id,
      status: "completed",
      notes: "Add 3g of Chen Pi to improve digestion",
      customFormula: {
        herbs: [
          { herbId: ginseng.id, name: "Ren Shen", chineseName: "人参", function: "Tonifies Spleen Qi", dosage: "9g" },
          { herbId: 0, name: "Bai Zhu", chineseName: "白术", function: "Strengthens Spleen and dries dampness", dosage: "12g" },
          { herbId: 0, name: "Fu Ling", chineseName: "茯苓", function: "Drains dampness and strengthens Spleen", dosage: "9g" },
          { herbId: 0, name: "Zhi Gan Cao", chineseName: "炙甘草", function: "Tonifies Qi and harmonizes the formula", dosage: "6g" }
        ]
      },
      instructions: "Take the content of one packet in hot water, divided in 2 doses (morning and evening) after meals",
      duration: "2 weeks"
    });

    await storage.createPrescription({
      patientId: patient1.id,
      formulaId: buZhongYiQiTang.id,
      status: "active",
      notes: "Progressive improvement in symptoms after 2 months of treatment",
      customFormula: {
        herbs: [
          { herbId: ginseng.id, name: "Ren Shen", chineseName: "人参", function: "Tonifies Spleen Qi", dosage: "6g" },
          { herbId: huangQi.id, name: "Huang Qi", chineseName: "黄芪", function: "Tonifies Qi and raises Yang", dosage: "15g" },
          { herbId: 0, name: "Bai Zhu", chineseName: "白术", function: "Strengthens Spleen", dosage: "9g" },
          { herbId: 0, name: "Dang Gui", chineseName: "当归", function: "Nourishes Blood", dosage: "6g" },
          { herbId: 0, name: "Chen Pi", chineseName: "陈皮", function: "Regulates Qi", dosage: "6g" },
          { herbId: 0, name: "Sheng Ma", chineseName: "升麻", function: "Raises Yang Qi", dosage: "3g" },
          { herbId: 0, name: "Chai Hu", chineseName: "柴胡", function: "Raises Yang Qi", dosage: "3g" },
          { herbId: 0, name: "Zhi Gan Cao", chineseName: "炙甘草", function: "Tonifies Qi and harmonizes", dosage: "3g" }
        ]
      },
      instructions: "Take the content of one packet in hot water, divided in 2 doses (morning and evening) after meals",
      duration: "1 month"
    });

    console.log("Sample data initialization completed successfully");
  } catch (error) {
    console.error("Error initializing sample data:", error);
  }
}
