import fetch from 'node-fetch';

async function cleanDuplicates() {
  try {
    console.log('Iniciando limpieza de duplicados...');
    
    // Obtener todas las hierbas
    console.log('Obteniendo la lista de hierbas...');
    const herbsResponse = await fetch('http://localhost:5000/api/herbs');
    const herbs = await herbsResponse.json();
    
    // Obtener todas las fórmulas
    console.log('Obteniendo la lista de fórmulas...');
    const formulasResponse = await fetch('http://localhost:5000/api/formulas');
    const formulas = await formulasResponse.json();
    
    // Identificar hierbas duplicadas (mismo pinyinName, ignorando mayúsculas/minúsculas)
    const uniqueHerbs = new Map();
    const duplicateHerbs = [];
    
    herbs.forEach(herb => {
      const normalizedName = herb.pinyinName.toLowerCase().trim();
      
      if (uniqueHerbs.has(normalizedName)) {
        // Es un duplicado, lo agregamos a la lista para eliminarlo
        duplicateHerbs.push(herb);
      } else {
        // Es la primera vez que vemos esta hierba, la guardamos
        uniqueHerbs.set(normalizedName, herb);
      }
    });
    
    // Identificar fórmulas duplicadas (mismo pinyinName, ignorando mayúsculas/minúsculas)
    const uniqueFormulas = new Map();
    const duplicateFormulas = [];
    
    formulas.forEach(formula => {
      const normalizedName = formula.pinyinName.toLowerCase().trim();
      
      if (uniqueFormulas.has(normalizedName)) {
        // Es un duplicado, lo agregamos a la lista para eliminarlo
        duplicateFormulas.push(formula);
      } else {
        // Es la primera vez que vemos esta fórmula, la guardamos
        uniqueFormulas.set(normalizedName, formula);
      }
    });
    
    console.log(`Se encontraron ${duplicateHerbs.length} hierbas duplicadas y ${duplicateFormulas.length} fórmulas duplicadas.`);
    
    // Eliminar hierbas duplicadas
    if (duplicateHerbs.length > 0) {
      console.log('Eliminando hierbas duplicadas...');
      for (const herb of duplicateHerbs) {
        console.log(`Eliminando hierba duplicada: ${herb.pinyinName} (ID: ${herb.id})`);
        const deleteResponse = await fetch(`http://localhost:5000/api/herbs/${herb.id}`, {
          method: 'DELETE'
        });
        
        if (deleteResponse.ok) {
          console.log(`Hierba ID ${herb.id} eliminada con éxito.`);
        } else {
          console.error(`Error al eliminar hierba ID ${herb.id}: ${deleteResponse.statusText}`);
        }
      }
    }
    
    // Eliminar fórmulas duplicadas
    if (duplicateFormulas.length > 0) {
      console.log('Eliminando fórmulas duplicadas...');
      for (const formula of duplicateFormulas) {
        console.log(`Eliminando fórmula duplicada: ${formula.pinyinName} (ID: ${formula.id})`);
        const deleteResponse = await fetch(`http://localhost:5000/api/formulas/${formula.id}`, {
          method: 'DELETE'
        });
        
        if (deleteResponse.ok) {
          console.log(`Fórmula ID ${formula.id} eliminada con éxito.`);
        } else {
          console.error(`Error al eliminar fórmula ID ${formula.id}: ${deleteResponse.statusText}`);
        }
      }
    }
    
    console.log('Proceso de limpieza completado.');
    
    // Mostrar estadísticas finales
    console.log(`Se eliminaron ${duplicateHerbs.length} hierbas duplicadas.`);
    console.log(`Se eliminaron ${duplicateFormulas.length} fórmulas duplicadas.`);
    console.log(`Hierbas restantes: ${uniqueHerbs.size}`);
    console.log(`Fórmulas restantes: ${uniqueFormulas.size}`);
    
  } catch (error) {
    console.error('Error durante el proceso de limpieza:', error);
  }
}

cleanDuplicates();