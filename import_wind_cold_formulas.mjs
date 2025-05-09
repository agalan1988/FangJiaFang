import fs from 'fs';
import fetch from 'node-fetch';

async function importWindColdFormulas() {
  try {
    // Leer el archivo JSON
    const formulasData = JSON.parse(fs.readFileSync('./attached_assets/formulas_convertidas.json', 'utf8'));
    
    console.log('Importando fórmulas de Wind-cold releasing...');
    
    // Primero obtener todas las fórmulas existentes para verificar cuáles ya existen
    const response = await fetch('http://localhost:5000/api/formulas');
    const existingFormulas = await response.json();
    
    // Crear un mapa para verificar rápidamente si una fórmula ya existe
    const existingFormulasMap = new Map();
    existingFormulas.forEach(formula => {
      existingFormulasMap.set(formula.pinyinName, formula.id);
    });
    
    // Procesar cada fórmula
    for (const [formulaName, data] of Object.entries(formulasData)) {
      if (data.grupo === "Wind-cold releasing") {
        console.log(`Procesando fórmula ${formulaName}...`);
        
        // Preparar los datos de composición
        const composition = data.ingredientes.map(item => ({
          herb: item.planta,
          dosage: `${item.gramos}g`,
          function: "",  // No tenemos esta información en los datos originales
          chineseName: ""  // No tenemos esta información en los datos originales
        }));
        
        // Preparar los datos básicos de la fórmula
        const formulaData = {
          pinyinName: formulaName,
          chineseName: "",  // No tenemos el nombre chino
          category: data.grupo,
          actions: [],  // No tenemos las acciones
          indications: "Wind-cold syndrome",  // Indicación básica
          composition: composition
        };
        
        // Verificar si la fórmula ya existe
        if (existingFormulasMap.has(formulaName)) {
          const formulaId = existingFormulasMap.get(formulaName);
          console.log(`La fórmula ${formulaName} ya existe con ID ${formulaId}, actualizando...`);
          
          // Actualizar la fórmula existente
          const updateResponse = await fetch(`http://localhost:5000/api/formulas/${formulaId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              category: formulaData.category,
              composition: formulaData.composition
            })
          });
          
          if (updateResponse.ok) {
            console.log(`Fórmula ${formulaName} actualizada con éxito.`);
          } else {
            const errorData = await updateResponse.json();
            console.error(`Error al actualizar la fórmula ${formulaName}:`, errorData);
          }
        } else {
          console.log(`Creando nueva fórmula ${formulaName}...`);
          
          // Crear la nueva fórmula
          const createResponse = await fetch('http://localhost:5000/api/formulas', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formulaData)
          });
          
          if (createResponse.ok) {
            console.log(`Fórmula ${formulaName} creada con éxito.`);
          } else {
            const errorData = await createResponse.json();
            console.error(`Error al crear la fórmula ${formulaName}:`, errorData);
          }
        }
      }
    }
    
    console.log('Importación completada con éxito.');
  } catch (error) {
    console.error('Error al importar fórmulas:', error);
    console.error('Detalles del error:', error.stack);
  }
}

importWindColdFormulas();