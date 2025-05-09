import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Upload, FileUp, X } from "lucide-react";

// Tipo de estructura de la hierba en el formato alternativo
interface AlternativeHerbFormat {
  Pinyin: string;
  Latin: string;
  Nature: string;
  Flavor: string;
  Meridians: string[];
  ChineseActions: {
    ActionPrimary: string;
    ActionsSecondary: {
      ActionSecondary: string;
      // Combinaciones de hierbas directamente en la acción secundaria
      HerbsCombination?: string[];
      Formula?: string;
      // Acciones terciarias (subdivisiones de la acción secundaria)
      ActionsTertiary?: {
        ActionTertiary: string;
        HerbsCombination?: string[];
        Formula?: string;
      }[];
    }[];
  }[];
  PharmacologicalEffects?: string[];
  Cautions?: string[];
  Contraindications?: string[];
  // Combinaciones comunes
  CommonCombinations?: {
    Indication: string;
    Combination: string;
  }[];
  // Campos opcionales
  Chinese?: string;
  English?: string;
  Dosage?: string;
  Category?: string;
}

// Tipo para la estructura estándar del sistema
interface StandardHerbFormat {
  pinyinName: string;
  chineseName: string;
  latinName: string;
  englishName?: string;
  category?: string;
  nature?: string;
  flavor?: string;
  meridians?: string[];
  dosage?: string;
  preparation?: string;
  functions: string[];
  applications?: string;
  contraindications?: string;
  cautions?: string;
  properties?: string;
  secondaryActions: {
    primaryFunction: string;
    action: string;
    tertiaryActions: {
      description: string;
      combinations?: {
        herbs: string[];
        formula?: string;
      }[];
    }[];
  }[];
  commonCombinations?: {
    indication: string;
    combination: string;
  }[];
  pharmacologicalEffects?: string[];
  laboratoryEffects?: string[];
  herbDrugInteractions?: string[];
  clinicalStudiesAndResearch?: string[];
}

// Función para convertir del formato alternativo al estándar
function convertHerbFormat(alternativeFormat: AlternativeHerbFormat): StandardHerbFormat {
  // Extraer funciones principales de ChineseActions, si existen
  const functions = alternativeFormat.ChineseActions && Array.isArray(alternativeFormat.ChineseActions) 
    ? alternativeFormat.ChineseActions.map(action => action.ActionPrimary)
    : [];
  
  // Mapear acciones secundarias y terciarias (si existen)
  const secondaryActions = (alternativeFormat.ChineseActions && Array.isArray(alternativeFormat.ChineseActions)) 
    ? alternativeFormat.ChineseActions.flatMap(primaryAction => {
        if (!primaryAction.ActionsSecondary || !Array.isArray(primaryAction.ActionsSecondary)) {
          return [];
        }
        
        return primaryAction.ActionsSecondary.map(secondaryAction => {
          // Verificar si hay acciones terciarias en esta acción secundaria
          const hasTertiaryActions = Array.isArray(secondaryAction.ActionsTertiary) && secondaryAction.ActionsTertiary.length > 0;
          
          // Si hay HerbsCombination pero no hay acciones terciarias (está a nivel de secundaria)
          const combinationsAtSecondaryLevel = ('HerbsCombination' in secondaryAction && Array.isArray(secondaryAction.HerbsCombination)) ? 
            [{
              herbs: secondaryAction.HerbsCombination,
              formula: secondaryAction.Formula || ''
            }] : [];
          
          // Mapear acciones terciarias si existen
          const tertiaryActions = hasTertiaryActions ? 
            secondaryAction.ActionsTertiary!.map(tertiaryAction => {
              return {
                description: tertiaryAction.ActionTertiary || '',
                combinations: tertiaryAction.HerbsCombination && Array.isArray(tertiaryAction.HerbsCombination) ? [
                  {
                    herbs: tertiaryAction.HerbsCombination,
                    formula: tertiaryAction.Formula || ''
                  }
                ] : []
              };
            }) : 
            // Si no hay acciones terciarias pero hay combinaciones a nivel secundario, crear una acción terciaria ficticia
            (combinationsAtSecondaryLevel.length > 0 ? 
              [{
                description: secondaryAction.ActionSecondary,
                combinations: combinationsAtSecondaryLevel
              }] : 
              // Si no hay ni acciones terciarias ni combinaciones secundarias, dejar un arreglo vacío
              []);
          
          return {
            primaryFunction: primaryAction.ActionPrimary || '',
            action: secondaryAction.ActionSecondary || '',
            tertiaryActions: tertiaryActions
          };
        });
      })
    : [];
  
  // Solo usamos combinaciones comunes si están explícitamente en el JSON
  const commonCombinations: { indication: string; combination: string }[] = [];
  
  // Si hay CommonCombinations en el formato alternativo, las usamos
  if (alternativeFormat.CommonCombinations && Array.isArray(alternativeFormat.CommonCombinations)) {
    alternativeFormat.CommonCombinations.forEach(combo => {
      if (combo.Indication && combo.Combination) {
        commonCombinations.push({
          indication: combo.Indication,
          combination: combo.Combination
        });
      }
    });
  }
  
  // Construir el objeto en el formato estándar
  return {
    pinyinName: alternativeFormat.Pinyin,
    chineseName: alternativeFormat.Chinese || '',
    latinName: alternativeFormat.Latin,
    englishName: alternativeFormat.English || '',
    category: alternativeFormat.Category || '',
    nature: alternativeFormat.Nature,
    flavor: alternativeFormat.Flavor,
    meridians: Array.isArray(alternativeFormat.Meridians) ? alternativeFormat.Meridians : [],
    dosage: alternativeFormat.Dosage || '',
    preparation: '',
    functions,
    applications: '',
    contraindications: alternativeFormat.Contraindications ? alternativeFormat.Contraindications.join(', ') : '',
    cautions: alternativeFormat.Cautions ? alternativeFormat.Cautions.join(', ') : '',
    properties: '',
    secondaryActions,
    commonCombinations: commonCombinations,
    pharmacologicalEffects: alternativeFormat.PharmacologicalEffects || [],
    laboratoryEffects: [],
    herbDrugInteractions: []
  };
}

interface HerbImporterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HerbImporter({ isOpen, onClose }: HerbImporterProps) {
  const [jsonData, setJsonData] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertedHerb, setConvertedHerb] = useState<StandardHerbFormat | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createHerbMutation = useMutation({
    mutationFn: async (herb: StandardHerbFormat) => {
      return apiRequest('/api/herbs', {
        method: 'POST',
        body: JSON.stringify(herb),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/herbs'] });
      toast({
        title: 'Hierba importada con éxito',
        description: `Se ha añadido ${convertedHerb?.pinyinName} a la base de datos.`,
      });
      resetForm();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error al importar la hierba',
        description: error.message || 'Ha ocurrido un error al importar la hierba.',
        variant: 'destructive',
      });
    }
  });

  const resetForm = () => {
    setJsonData('');
    setFile(null);
    setConvertedHerb(null);
    setIsProcessing(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    
    // Si es un archivo JSON, leerlo
    if (selectedFile.type === 'application/json') {
      try {
        const text = await selectedFile.text();
        setJsonData(text);
      } catch (error) {
        toast({
          title: 'Error al leer el archivo',
          description: 'No se pudo leer el contenido del archivo JSON.',
          variant: 'destructive',
        });
      }
    } else if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Si es un archivo Word, mostrar un mensaje indicando que no se puede procesar directamente
      toast({
        title: 'Archivo Word detectado',
        description: 'Los archivos Word no pueden ser procesados directamente. Por favor, extrae el contenido JSON y pégalo en el área de texto.',
      });
      setFile(null);
    }
  };

  const handleImport = () => {
    try {
      setIsProcessing(true);
      
      // Intentar parsear el JSON
      const parsedData = JSON.parse(jsonData);
      console.log("Datos parseados:", parsedData);
      
      // Determinar el formato del JSON
      let standardFormat;
      
      // Si ya tiene el formato estándar (detectamos por la presencia de pinyinName en lugar de Pinyin)
      if ('pinyinName' in parsedData) {
        console.log("Formato estándar detectado");
        standardFormat = parsedData;
      } 
      // Si tiene el formato alternativo
      else if ('Pinyin' in parsedData) {
        console.log("Formato alternativo detectado");
        standardFormat = convertHerbFormat(parsedData);
      } 
      // Si no se reconoce el formato
      else {
        throw new Error('Formato de datos no reconocido. El JSON debe tener pinyinName o Pinyin como campo principal.');
      }
      
      console.log("Formato estándar:", standardFormat);
      setConvertedHerb(standardFormat);
      
      // Verificar campos obligatorios
      if (!standardFormat.pinyinName || !standardFormat.latinName) {
        throw new Error('Faltan campos obligatorios: el nombre en pinyin y el nombre latino son requeridos.');
      }
      
      // Enviar a la API
      createHerbMutation.mutate(standardFormat);
      
    } catch (error: any) {
      console.error("Error al importar:", error);
      toast({
        title: 'Error al procesar el JSON',
        description: error.message || 'El formato del JSON no es válido.',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Importar Hierba</DialogTitle>
          <DialogDescription>
            Importa una hierba desde un archivo JSON con formato alternativo o pega el contenido directamente.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 border-muted hover:bg-muted/20"
            >
              {file ? (
                <div className="flex flex-col items-center justify-center pt-5 pb-6 relative w-full">
                  <div className="absolute right-2 top-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.preventDefault();
                        setFile(null);
                      }}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                  <FileUp className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="mb-1 text-sm text-muted-foreground">
                    <span className="font-semibold">{file.name}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="mb-1 text-sm text-muted-foreground">
                    <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Archivos JSON
                  </p>
                </div>
              )}
              <input
                id="file-upload"
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="json-input">
              O pega el contenido JSON:
            </label>
            <Textarea
              id="json-input"
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              placeholder='{"Pinyin": "Herb Name", "Latin": "Latin Name", ...}'
              className="min-h-[200px] font-mono text-sm"
            />
          </div>
        </div>
        
        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!jsonData || isProcessing || createHerbMutation.isPending}
          >
            {isProcessing || createHerbMutation.isPending ? 'Importando...' : 'Importar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};