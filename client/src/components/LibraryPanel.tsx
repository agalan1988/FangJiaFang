import { useState, useEffect } from "react";
import { Search, Plus, BookOpen, ScrollText, Filter, CirclePlus, CircleEllipsis } from "lucide-react";
import QuantitySelectDialog from "@/components/QuantitySelectDialog";
import { calculateFormulaTotal, processFormulaWithHerbs } from "@/lib/formula-utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Herb, Formula, FormulaWithHerbs } from "@shared/schema";
import { HerbWithGrams } from "@/types";

// Función para obtener el color según la naturaleza de la hierba
const getNatureColor = (nature: string) => {
  const natureMap: {[key: string]: string} = {
    'Caliente': 'bg-red-500',
    'Calor': 'bg-red-500',
    'Tibia': 'bg-orange-400',
    'Neutra': 'bg-yellow-300',
    'Neutral': 'bg-yellow-300',
    'Fresca': 'bg-blue-300',
    'Fría': 'bg-blue-500',
    'Frío': 'bg-blue-500',
    // Añadir en inglés también
    'Hot': 'bg-red-500',
    'Warm': 'bg-orange-400',
    'Cool': 'bg-blue-300',
    'Cold': 'bg-blue-500'
  };
  
  return natureMap[nature] || 'bg-gray-400';
};

interface LibraryPanelProps {
  herbs: Herb[];
  formulas: FormulaWithHerbs[] | Formula[];
  onAddHerb: (herb: Herb | HerbWithGrams) => void;
  onAddFormula: (formula: FormulaWithHerbs) => void;
  onAddFormulaHerbs: (formula: FormulaWithHerbs) => void;
}

export default function LibraryPanel({
  herbs,
  formulas,
  onAddHerb,
  onAddFormula,
  onAddFormulaHerbs
}: LibraryPanelProps) {
  const [activeTab, setActiveTab] = useState("herbs");
  const [herbSearch, setHerbSearch] = useState("");
  const [formulaSearch, setFormulaSearch] = useState("");
  const [herbCategoryFilter, setHerbCategoryFilter] = useState<string>("");
  const [formulaCategoryFilter, setFormulaCategoryFilter] = useState<string>("");
  const [selectedFormula, setSelectedFormula] = useState<FormulaWithHerbs | null>(null);
  const [isQuantityDialogOpen, setIsQuantityDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'addFormula' | 'addHerbsIndividually'>('addFormula');
  const [processedFormulas, setProcessedFormulas] = useState<FormulaWithHerbs[]>([]);
  
  // Procesar fórmulas para asegurarnos de que tengan la estructura correcta con hierbas
  useEffect(() => {
    const processedData = formulas.map(formula => processFormulaWithHerbs(formula, herbs));
    setProcessedFormulas(processedData);
  }, [formulas, herbs]);

  // Obtener categorías únicas
  const herbCategories = Array.from(new Set(herbs.map(h => h.category).filter(Boolean))) as string[];
  const formulaCategories = Array.from(new Set(formulas.map(f => f.category).filter(Boolean))) as string[];

  // Filtrar hierbas
  const filteredHerbs = herbs.filter(herb => {
    const matchesSearch = 
      herbSearch === "" || 
      herb.pinyinName?.toLowerCase().includes(herbSearch.toLowerCase()) ||
      herb.latinName?.toLowerCase().includes(herbSearch.toLowerCase()) ||
      herb.englishName?.toLowerCase().includes(herbSearch.toLowerCase()) ||
      herb.chineseName?.toLowerCase().includes(herbSearch.toLowerCase());
    
    const matchesCategory = 
      herbCategoryFilter === "" || 
      herbCategoryFilter === "all" ||
      herb.category === herbCategoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Filtrar fórmulas
  const filteredFormulas = processedFormulas.filter(formula => {
    const matchesSearch = 
      formulaSearch === "" || 
      formula.pinyinName?.toLowerCase().includes(formulaSearch.toLowerCase()) ||
      formula.englishName?.toLowerCase().includes(formulaSearch.toLowerCase()) ||
      formula.chineseName?.toLowerCase().includes(formulaSearch.toLowerCase());
    
    const matchesCategory = 
      formulaCategoryFilter === "" || 
      formulaCategoryFilter === "all" ||
      formula.category === formulaCategoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Función para manejar el click en el botón de añadir fórmula
  const handleAddFormulaWithQuantity = (formula: FormulaWithHerbs) => {
    setSelectedFormula(formula);
    setDialogAction('addFormula');
    setIsQuantityDialogOpen(true);
  };

  // Función para manejar el click en añadir hierbas individualmente
  const handleAddFormulaHerbsIndividuallyWithQuantity = (formula: FormulaWithHerbs) => {
    setSelectedFormula(formula);
    setDialogAction('addHerbsIndividually');
    setIsQuantityDialogOpen(true);
  };

  // Función que se llama cuando se confirma la cantidad en el diálogo
  const handleConfirmQuantity = (quantity: number) => {
    if (selectedFormula) {
      if (dialogAction === 'addFormula') {
        handleAddFormula(selectedFormula, quantity);
      } else {
        handleAddFormulaHerbs(selectedFormula, quantity);
      }
    }
    setIsQuantityDialogOpen(false);
    setSelectedFormula(null);
  };

  // Manejar la adición de una fórmula con cantidad personalizada
  const handleAddFormula = (formula: FormulaWithHerbs, quantity: number = 100) => {
    console.log("Añadiendo fórmula completa con cantidad:", quantity);
    
    // Nos aseguramos que la fórmula tenga un totalGrams calculado
    const totalWeight = calculateFormulaTotal(formula);
    
    // Si no hay gramos, podemos añadir directamente con la cantidad especificada
    if (totalWeight === 0) {
      const formulaWithQuantity = {
        ...formula,
        totalGrams: quantity
      };
      console.log("Añadiendo fórmula sin desglose con cantidad:", quantity);
      onAddFormula(formulaWithQuantity);
      return;
    }
    
    // Crear una copia para no modificar la original, respetando la cantidad solicitada
    const scaledFormula = {
      ...formula,
      totalGrams: quantity, // Aquí establecemos la cantidad total solicitada
      herbs: formula.herbs.map(herb => {
        if (!herb.grams) return herb;
        
        // Calcular los nuevos gramos según la proporción original
        const percentage = (herb.grams / totalWeight) * 100;
        const newGrams = Math.round((percentage * quantity / 100) * 10) / 10;
        
        return {
          ...herb,
          percentage, // Guardamos el porcentaje original
          grams: newGrams // Ajustamos los gramos según la cantidad solicitada
        };
      })
    };
    
    console.log("Añadiendo fórmula escalada a", quantity, "gramos");
    onAddFormula(scaledFormula);
  };

  // Manejar la adición de hierbas individuales de una fórmula
  const handleAddFormulaHerbs = (formula: FormulaWithHerbs, quantity: number = 100) => {
    console.log(`Agregando hierbas individuales de '${formula.pinyinName}' con cantidad total: ${quantity}g`);
    
    // MÉTODO DIRECTO Y SIMPLIFICADO PARA CALCULAR LOS PORCENTAJES Y GRAMOS
    // Las fórmulas están estandarizadas para dosificaciones de 100g, por lo que:
    // 1. Calcularemos el porcentaje directo de cada hierba respecto al total de la fórmula
    // 2. Aplicaremos ese porcentaje a la cantidad solicitada
    
    // Paso 1: Extraer la información exacta de gramos y calcular el total original
    let totalOriginalGrams = 0;
    let hasDefinedGrams = false;
    
    // Verificar si las hierbas tienen gramos definidos
    formula.herbs.forEach(herb => {
      if (herb.grams && herb.grams > 0) {
        totalOriginalGrams += herb.grams;
        hasDefinedGrams = true;
      }
    });
    
    // Si hay un totalGrams definido en la fórmula, lo usamos en lugar de la suma
    if (formula.totalGrams && formula.totalGrams > 0) {
      totalOriginalGrams = formula.totalGrams;
    }
    
    // Si no hay gramos definidos, distribuir equitativamente
    if (!hasDefinedGrams || totalOriginalGrams === 0) {
      console.log("No hay gramos definidos, distribuyendo equitativamente");
      
      const percentagePerHerb = 100 / formula.herbs.length;
      const gramsPerHerb = quantity / formula.herbs.length;
      
      const equalDistributionHerbs = formula.herbs.map(herb => ({
        ...herb,
        percentage: Math.round(percentagePerHerb * 10) / 10,
        grams: Math.round(gramsPerHerb * 10) / 10
      }));
      
      // Enviar las hierbas con distribución equitativa
      onAddFormulaHerbs({
        ...formula,
        totalGrams: quantity,
        herbs: equalDistributionHerbs
      });
      
      return;
    }
    
    // Paso 2: Calcular los porcentajes exactos y los nuevos gramos proporcionales
    console.log(`Total original: ${totalOriginalGrams}g, Cantidad solicitada: ${quantity}g`);
    
    const herbsWithGrams = formula.herbs.map(herb => {
      // Calcular el porcentaje basado en los gramos originales
      const percentage = herb.grams && herb.grams > 0 
        ? (herb.grams / totalOriginalGrams) * 100
        : 0;
      
      // Calcular los gramos proporcionales a la cantidad solicitada
      const calculatedGrams = percentage > 0
        ? Math.round((percentage * quantity / 100) * 10) / 10
        : 0;
      
      return {
        ...herb,
        percentage: Math.round(percentage * 10) / 10,
        grams: calculatedGrams
      };
    });
    
    // Filtrar las hierbas sin información de gramos y redistribuir para las que tienen
    const validHerbs = herbsWithGrams.filter(herb => herb.percentage > 0 && herb.grams > 0);
    
    // Si no hay hierbas válidas, usar todas y distribuir equitativamente
    if (validHerbs.length === 0) {
      console.warn("No hay hierbas con gramos válidos, usando distribución equitativa");
      
      const percentagePerHerb = 100 / formula.herbs.length;
      const gramsPerHerb = quantity / formula.herbs.length;
      
      const equalDistributionHerbs = formula.herbs.map(herb => ({
        ...herb,
        percentage: Math.round(percentagePerHerb * 10) / 10,
        grams: Math.round(gramsPerHerb * 10) / 10
      }));
      
      onAddFormulaHerbs({
        ...formula,
        totalGrams: quantity,
        herbs: equalDistributionHerbs
      });
      
      return;
    }
    
    // Calcular y mostrar el total de gramos calculados para verificación
    const totalCalculatedGrams = validHerbs.reduce((sum, herb) => sum + herb.grams, 0);
    
    console.log("Desglose de hierbas:");
    validHerbs.forEach(herb => {
      console.log(`${herb.pinyinName}: ${herb.percentage}% = ${herb.grams}g de ${quantity}g total`);
    });
    console.log(`Total calculado: ${totalCalculatedGrams}g de ${quantity}g solicitados`);
    
    // Crear la fórmula procesada y enviarla
    onAddFormulaHerbs({
      ...formula,
      totalGrams: quantity,
      herbs: validHerbs
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle>Biblioteca</CardTitle>
        <CardDescription>
          Encuentra hierbas y fórmulas para tu prescripción
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 pb-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="herbs" className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" /> Hierbas
            </TabsTrigger>
            <TabsTrigger value="formulas" className="flex items-center gap-1">
              <ScrollText className="h-4 w-4" /> Fórmulas
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="herbs" className="m-0">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar hierbas..."
                  className="pl-10"
                  value={herbSearch}
                  onChange={(e) => setHerbSearch(e.target.value)}
                />
              </div>
              
              {herbCategories.length > 0 && (
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select 
                    value={herbCategoryFilter} 
                    onValueChange={setHerbCategoryFilter}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filtrar por categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {herbCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <ScrollArea className="h-[calc(100vh-380px)] pr-3">
                <div className="space-y-2">
                  {filteredHerbs.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No se encontraron hierbas</p>
                    </div>
                  ) : (
                    filteredHerbs.map(herb => (
                      <div 
                        key={herb.id} 
                        className="border rounded-md p-3 hover:bg-accent/20 transition-colors cursor-pointer"
                        onClick={() => onAddHerb(herb)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{herb.pinyinName}</h4>
                            <p className="text-sm text-muted-foreground italic">
                              {herb.latinName}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {herb.nature && (
                              <div 
                                className={`h-2.5 w-2.5 rounded-full my-auto ${getNatureColor(herb.nature)}`} 
                                title={herb.nature}
                              />
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddHerb(herb);
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {herb.category && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                              {herb.category}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
          
          <TabsContent value="formulas" className="m-0">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar fórmulas..."
                  className="pl-10"
                  value={formulaSearch}
                  onChange={(e) => setFormulaSearch(e.target.value)}
                />
              </div>
              
              {formulaCategories.length > 0 && (
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select 
                    value={formulaCategoryFilter} 
                    onValueChange={setFormulaCategoryFilter}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filtrar por categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {formulaCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <ScrollArea className="h-[calc(100vh-380px)] pr-3">
                <div className="space-y-2">
                  {filteredFormulas.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No se encontraron fórmulas</p>
                    </div>
                  ) : (
                    filteredFormulas.map(formula => (
                      <div 
                        key={formula.id} 
                        className="border rounded-md p-3 hover:bg-accent/20 transition-colors"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{formula.pinyinName || formula.englishName}</h4>
                              {formula.nature && (
                                <div 
                                  className={`h-2.5 w-2.5 rounded-full ${getNatureColor(formula.nature)}`} 
                                  title={formula.nature}
                                />
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                title="Añadir como hierbas individuales"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Asegurar que estamos pasando una fórmula procesada con hierbas
                                  const processedFormula = processFormulaWithHerbs(formula, herbs);
                                  handleAddFormulaHerbsIndividuallyWithQuantity(processedFormula);
                                }}
                              >
                                <CircleEllipsis className="h-3.5 w-3.5 text-green-600" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                title="Añadir como fórmula completa"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Asegurar que estamos pasando una fórmula procesada con hierbas
                                  const processedFormula = processFormulaWithHerbs(formula, herbs);
                                  handleAddFormulaWithQuantity(processedFormula);
                                }}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          
                          {formula.englishName && (
                            <p className="text-sm text-muted-foreground italic pl-1">
                              {formula.englishName}
                            </p>
                          )}
                        </div>
                        {/* Se eliminaron las etiquetas de categoría y número de hierbas */}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Diálogo para seleccionar cantidad */}
      <QuantitySelectDialog
        open={isQuantityDialogOpen && selectedFormula !== null}
        onOpenChange={setIsQuantityDialogOpen}
        title={dialogAction === 'addFormula' ? 'Añadir Fórmula' : 'Añadir Hierbas Individuales'}
        description={dialogAction === 'addFormula' 
          ? `Indica la cantidad en gramos para ${selectedFormula?.pinyinName || ''}`
          : `Indica la cantidad total en gramos para calcular las proporciones de ${selectedFormula?.pinyinName || ''}`
        }
        initialQuantity={100}
        onConfirm={handleConfirmQuantity}
      />
    </Card>
  );
}