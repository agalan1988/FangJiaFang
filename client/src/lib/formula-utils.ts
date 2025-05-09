import { FormulaWithHerbs, Formula, Herb } from "@shared/schema";

/**
 * Calcula el total de gramos para una fórmula
 */
export function calculateFormulaTotal(formula: FormulaWithHerbs): number {
  // Si ya tiene un totalGrams definido, lo usamos
  if (formula.totalGrams && formula.totalGrams > 0) {
    return formula.totalGrams;
  }
  
  // Sino, calculamos la suma de los gramos de todas las hierbas
  const total = formula.herbs?.reduce((sum, herb) => {
    return sum + (herb.grams || 0);
  }, 0) || 0;
  
  return total;
}

/**
 * Procesa una fórmula para asegurarse de que tenga la estructura correcta con sus hierbas
 * Convierte el campo composition (JSON) en un array de hierbas con sus cantidades
 */
export function processFormulaWithHerbs(formula: Formula, allHerbs: Herb[]): FormulaWithHerbs {
  // Si ya tiene la estructura correcta, devolvemos la fórmula tal cual
  if ('herbs' in formula && Array.isArray(formula.herbs) && formula.herbs.length > 0) {
    return formula as FormulaWithHerbs;
  }
  
  // Obtener los datos de composición desde el campo JSON
  let composition: any[] = [];
  
  if (formula.composition) {
    try {
      composition = Array.isArray(formula.composition) 
        ? formula.composition 
        : typeof formula.composition === 'string' 
          ? JSON.parse(formula.composition) 
          : [];
    } catch (e) {
      console.error('Error parsing formula composition:', e);
      composition = [];
    }
  }
  
  // Mapear los datos de composición a hierbas reales
  const herbs = composition.map(item => {
    console.log("Procesando componente de fórmula:", item);
    
    // Extraer campos relevantes del item de composición
    const herbName = item.herb || item.name || item.pinyinName || '';
    const herbId = item.herbId || item.id || 0;
    
    // Intentar encontrar la hierba primero por ID, luego por nombre
    let foundHerb = null;
    if (herbId > 0) {
      foundHerb = allHerbs.find(h => h.id === herbId);
    }
    
    // Si no la encontramos por ID, intentar por nombre
    if (!foundHerb) {
      foundHerb = allHerbs.find(h => 
        h.pinyinName === herbName || 
        h.pinyinName?.toLowerCase() === herbName.toLowerCase()
      );
    }
    
    // Extraer los gramos de la dosificación (ejemplo: "10g" -> 10)
    let grams = 0;
    if (item.grams) {
      grams = typeof item.grams === 'number' ? item.grams : parseFloat(String(item.grams));
    } else if (item.dosage) {
      const match = String(item.dosage).match(/(\d+\.?\d*)/);
      grams = match ? parseFloat(match[0]) : 0;
    }
    
    // Calcular el porcentaje basado en esta hierba (si se añadiera a una fórmula de 100g)
    // Se usará más tarde para calcular proporciones exactas
    const percentage = grams; // En una fórmula estándar de 100g, los gramos son iguales al porcentaje
    
    // Si encontramos la hierba en el catálogo, la devolvemos con los datos adicionales
    if (foundHerb) {
      return {
        ...foundHerb,
        grams,
        percentage,
        function: item.function || ''
      };
    }
    
    // Si no encontramos la hierba, crear un objeto con la información disponible
    console.log(`Hierba no encontrada en catálogo: ${herbName}`);
    return {
      id: herbId,
      pinyinName: herbName,
      chineseName: item.chineseName || '',
      latinName: item.latinName || '',
      englishName: item.englishName || '',
      // Campos requeridos por el tipo Herb, pero que podemos dejar vacíos
      category: '',
      nature: '',
      flavor: '',
      meridians: [],
      dosage: '',
      preparation: '',
      functions: [],
      indications: [],
      contraindications: [],
      commonCombinations: [],
      pharmacologicalEffects: [],
      traditionalUsage: [],
      modernResearch: [],
      cautions: [],
      herbDrugInteractions: [],
      clinicalStudiesAndResearch: [],
      // Los valores importantes que necesitamos mantener
      grams,
      percentage,
      function: item.function || ''
    };
  });
  
  // Calcular el total de gramos
  const totalGrams = herbs.reduce((sum, herb) => sum + (herb.grams || 0), 0);
  
  // Devolver la fórmula con la estructura correcta
  return {
    ...formula,
    herbs,
    totalGrams
  };
}