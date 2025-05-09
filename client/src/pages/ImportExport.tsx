import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Download, FileUp, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";
import Layout from "@/components/Layout";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

export default function ImportExport() {
  const { toast } = useToast();
  const [selectedImportFile, setSelectedImportFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [exportProgress, setExportProgress] = useState<{current: number, total: number}>({current: 0, total: 0});
  const [jsonContent, setJsonContent] = useState<string>("");
  const [exportedFileUrl, setExportedFileUrl] = useState<string>("");
  const [exportedFileName, setExportedFileName] = useState<string>("");
  const [exportedData, setExportedData] = useState<any>(null);
  const [showExportedData, setShowExportedData] = useState<boolean>(false);
  
  // Efecto para limpiar las URLs de los blobs cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (exportedFileUrl) {
        URL.revokeObjectURL(exportedFileUrl);
      }
    };
  }, [exportedFileUrl]);
  const [importResults, setImportResults] = useState<{imported: number, skipped: number, errors: string[]}>({
    imported: 0,
    skipped: 0,
    errors: []
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImportFile(e.target.files[0]);
      
      // Leer el contenido del archivo
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setJsonContent(event.target.result as string);
        }
      };
      reader.readAsText(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!jsonContent) {
      toast({
        title: "Error",
        description: "Por favor, selecciona un archivo o ingresa contenido JSON válido",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setImportStatus('loading');
      setImportProgress(10);
      
      // Parsear el JSON
      const data = JSON.parse(jsonContent);
      setImportProgress(30);
      
      // Llamar a la API para importar las fórmulas
      const response = await apiRequest("/api/formulas/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      
      setImportProgress(90);
      
      // Manejar la respuesta
      const results = await response.json();
      setImportResults(results);
      setImportProgress(100);
      setImportStatus('success');
      
      toast({
        title: "Importación exitosa",
        description: `Se importaron ${results.imported} fórmulas correctamente`,
      });
    } catch (error) {
      console.error("Error importing formulas:", error);
      setImportStatus('error');
      toast({
        title: "Error de importación",
        description: "Ocurrió un error al importar las fórmulas. Verifica el formato del JSON.",
        variant: "destructive"
      });
    }
  };

  const handleJsonContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonContent(e.target.value);
  };

  const handleExport = async () => {
    try {
      setExportStatus('loading');
      
      // Obtener las opciones seleccionadas
      const exportHerbs = (document.getElementById('export-herbs') as HTMLInputElement)?.checked;
      const exportFormulas = (document.getElementById('export-formulas') as HTMLInputElement)?.checked;
      const exportPatients = (document.getElementById('export-patients') as HTMLInputElement)?.checked;
      const exportPrescriptions = (document.getElementById('export-prescriptions') as HTMLInputElement)?.checked;
      
      // Determinar el formato
      const formatJSON = (document.getElementById('format-json') as HTMLInputElement)?.checked;
      
      // Recolectar datos
      const data: Record<string, any> = {};
      
      if (exportHerbs) {
        try {
          // Primero, obtenemos la lista de hierbas para saber los IDs
          const herbsResponse = await fetch('/api/herbs');
          const herbsList = await herbsResponse.json();
          console.log('Herbs list to export:', herbsList);
          
          setExportProgress({current: 0, total: herbsList.length});
          
          // Luego, obtenemos los detalles completos de cada hierba
          const detailedHerbs = [];
          
          // Usar un bucle for para poder actualizar el progreso
          for (let i = 0; i < herbsList.length; i++) {
            const herb = herbsList[i];
            try {
              const detailResponse = await fetch(`/api/herbs/${herb.id}`);
              if (!detailResponse.ok) {
                console.warn(`No se pudo obtener detalles para la hierba con ID ${herb.id}`);
                detailedHerbs.push(herb); // Usar versión simplificada si falla
              } else {
                const detailedHerb = await detailResponse.json();
                detailedHerbs.push(detailedHerb);
              }
              // Actualizar el progreso
              setExportProgress({current: i + 1, total: herbsList.length});
            } catch (e) {
              console.error(`Error obteniendo detalles para hierba ${herb.id}:`, e);
              detailedHerbs.push(herb); // En caso de error, usar la versión simplificada
              setExportProgress({current: i + 1, total: herbsList.length});
            }
          }
          
          console.log('Detailed herbs obtained:', detailedHerbs.length);
          data.herbs = detailedHerbs;
        } catch (e) {
          console.error('Error getting herbs data:', e);
          toast({
            title: "Error al obtener hierbas",
            description: "No se pudieron obtener todos los detalles de las hierbas.",
            variant: "destructive"
          });
        }
      }
      
      if (exportFormulas) {
        try {
          // Primero, obtenemos la lista de fórmulas para saber los IDs
          const formulasResponse = await fetch('/api/formulas');
          const formulasList = await formulasResponse.json();
          console.log('Formulas list to export:', formulasList);
          
          // Después de procesar las hierbas, actualizar progreso para fórmulas
          const herbsCount = exportHerbs ? exportProgress.total : 0;
          setExportProgress({
            current: exportProgress.current, 
            total: herbsCount + formulasList.length
          });
          
          // Luego, obtenemos los detalles completos de cada fórmula
          const detailedFormulas = [];
          
          // Usar un bucle for para poder actualizar el progreso
          for (let i = 0; i < formulasList.length; i++) {
            const formula = formulasList[i];
            try {
              const detailResponse = await fetch(`/api/formulas/${formula.id}`);
              if (!detailResponse.ok) {
                console.warn(`No se pudo obtener detalles para la fórmula con ID ${formula.id}`);
                detailedFormulas.push(formula); // Usar versión simplificada si falla
              } else {
                const detailedFormula = await detailResponse.json();
                detailedFormulas.push(detailedFormula);
              }
              // Actualizar el progreso (herbs + fórmulas)
              setExportProgress({
                current: herbsCount + i + 1, 
                total: herbsCount + formulasList.length
              });
            } catch (e) {
              console.error(`Error obteniendo detalles para fórmula ${formula.id}:`, e);
              detailedFormulas.push(formula); // En caso de error, usar la versión simplificada
              setExportProgress({
                current: herbsCount + i + 1, 
                total: herbsCount + formulasList.length
              });
            }
          }
          
          console.log('Detailed formulas obtained:', detailedFormulas.length);
          data.formulas = detailedFormulas;
        } catch (e) {
          console.error('Error getting formulas data:', e);
          toast({
            title: "Error al obtener fórmulas",
            description: "No se pudieron obtener todos los detalles de las fórmulas.",
            variant: "destructive"
          });
        }
      }
      
      if (exportPatients) {
        const patientsResponse = await fetch('/api/patients');
        const patients = await patientsResponse.json();
        data.patients = patients;
      }
      
      if (exportPrescriptions) {
        const prescriptionsResponse = await fetch('/api/prescriptions');
        const prescriptions = await prescriptionsResponse.json();
        data.prescriptions = prescriptions;
      }
      
      // Generar el archivo para descargar
      let fileContent = '';
      let fileName = '';
      let mimeType = '';
      
      if (formatJSON) {
        // Nos aseguramos de tratar correctamente los campos JSON y objetos anidados
        try {
          console.log('Data to be exported:', data);
          // Convertir arrays y objetos anidados a formato string para serializarlos correctamente
          const processedData = structuredClone(data);
          
          // Procesamiento de hierbas
          if (processedData.herbs && processedData.herbs.length > 0) {
            console.log('Procesando', processedData.herbs.length, 'hierbas para exportación');
            try {
              processedData.herbs = processedData.herbs.map((herb: any) => {
                if (!herb) {
                  console.warn('Se encontró una hierba undefined o null');
                  return null;
                }
                
                // Crear un nuevo objeto para evitar referencias circulares
                const processedHerb: any = {};
                
                // Asignar cada propiedad individualmente
                processedHerb.id = herb.id;
                processedHerb.pinyinName = herb.pinyinName || '';
                processedHerb.chineseName = herb.chineseName || '';
                processedHerb.latinName = herb.latinName || '';
                processedHerb.englishName = herb.englishName || '';
                processedHerb.category = herb.category || '';
                processedHerb.nature = herb.nature || '';
                processedHerb.flavor = herb.flavor || '';
                processedHerb.dosage = herb.dosage || '';
                processedHerb.preparation = herb.preparation || '';
                processedHerb.applications = herb.applications || '';
                processedHerb.contraindications = herb.contraindications || '';
                processedHerb.cautions = herb.cautions || '';
                processedHerb.properties = herb.properties || '';
                
                // Procesar arrays
                processedHerb.functions = Array.isArray(herb.functions) ? [...herb.functions] : [];
                processedHerb.meridians = Array.isArray(herb.meridians) ? [...herb.meridians] : [];
                processedHerb.pharmacologicalEffects = Array.isArray(herb.pharmacologicalEffects) ? [...herb.pharmacologicalEffects] : [];
                processedHerb.laboratoryEffects = Array.isArray(herb.laboratoryEffects) ? [...herb.laboratoryEffects] : [];
                processedHerb.herbDrugInteractions = Array.isArray(herb.herbDrugInteractions) ? [...herb.herbDrugInteractions] : [];
                processedHerb.clinicalStudiesAndResearch = Array.isArray(herb.clinicalStudiesAndResearch) ? [...herb.clinicalStudiesAndResearch] : [];
                
                // Procesar objetos JSON
                if (herb.secondaryActions) {
                  // Convertir a string y luego volver a parsear para romper cualquier referencia
                  try {
                    const secondaryActionsStr = JSON.stringify(herb.secondaryActions);
                    processedHerb.secondaryActions = JSON.parse(secondaryActionsStr);
                  } catch (e) {
                    console.error('Error procesando secondaryActions:', e);
                    processedHerb.secondaryActions = [];
                  }
                } else {
                  processedHerb.secondaryActions = [];
                }
                
                if (herb.commonCombinations) {
                  try {
                    const combinationsStr = JSON.stringify(herb.commonCombinations);
                    processedHerb.commonCombinations = JSON.parse(combinationsStr);
                  } catch (e) {
                    console.error('Error procesando commonCombinations:', e);
                    processedHerb.commonCombinations = [];
                  }
                } else {
                  processedHerb.commonCombinations = [];
                }
                
                return processedHerb;
              }).filter(Boolean); // Eliminar cualquier null que se haya generado
              
              console.log('Hierbas procesadas correctamente:', processedData.herbs.length);
            } catch (e) {
              console.error('Error procesando hierbas:', e);
              processedData.herbs = [];
              toast({
                title: "Error al procesar hierbas",
                description: "No se pudieron procesar todas las hierbas para exportación. El archivo puede estar incompleto.",
                variant: "destructive"
              });
            }
          }
          
          // Procesamiento de fórmulas
          if (processedData.formulas && processedData.formulas.length > 0) {
            console.log('Procesando', processedData.formulas.length, 'fórmulas para exportación');
            try {
              processedData.formulas = processedData.formulas.map((formula: any) => {
                if (!formula) {
                  console.warn('Se encontró una fórmula undefined o null');
                  return null;
                }
                
                // Crear un nuevo objeto para evitar referencias circulares
                const processedFormula: any = {};
                
                // Asignar cada propiedad individualmente
                processedFormula.id = formula.id;
                processedFormula.pinyinName = formula.pinyinName || '';
                processedFormula.chineseName = formula.chineseName || '';
                processedFormula.englishName = formula.englishName || '';
                processedFormula.category = formula.category || '';
                processedFormula.indications = formula.indications || '';
                processedFormula.contraindications = formula.contraindications || '';
                
                // Procesar arrays
                processedFormula.actions = Array.isArray(formula.actions) ? [...formula.actions] : [];
                
                // Procesar objetos JSON (composición de la fórmula)
                if (formula.composition) {
                  try {
                    const compositionStr = JSON.stringify(formula.composition);
                    processedFormula.composition = JSON.parse(compositionStr);
                  } catch (e) {
                    console.error('Error procesando composition:', e);
                    processedFormula.composition = [];
                  }
                } else {
                  processedFormula.composition = [];
                }
                
                return processedFormula;
              }).filter(Boolean); // Eliminar cualquier null que se haya generado
              
              console.log('Fórmulas procesadas correctamente:', processedData.formulas.length);
            } catch (e) {
              console.error('Error procesando fórmulas:', e);
              processedData.formulas = [];
              toast({
                title: "Error al procesar fórmulas",
                description: "No se pudieron procesar todas las fórmulas para exportación. El archivo puede estar incompleto.",
                variant: "destructive"
              });
            }
          }
          
          // Guardar los datos procesados para la vista previa
          setExportedData(processedData);
          
          // Convertir a texto JSON
          fileContent = JSON.stringify(processedData, null, 2);
          console.log('File content length:', fileContent.length);
        } catch (e) {
          console.error('Error serializing data:', e);
          toast({
            title: "Error de serialización",
            description: "Hubo un problema al convertir los datos a formato JSON. Detalles: " + (e as Error).message,
            variant: "destructive"
          });
          fileContent = JSON.stringify({ error: "No se pudieron exportar los datos completos" });
        }
        fileName = 'export-data.json';
        mimeType = 'application/json';
      } else {
        // Convertir a CSV (simplificado, solo para hierbas)
        try {
          if (data.herbs && data.herbs.length > 0) {
            // Extraer solo los campos básicos para el CSV
            const flattenedHerbs = data.herbs.map((herb: any) => ({
              id: herb.id,
              pinyinName: herb.pinyinName || '',
              chineseName: herb.chineseName || '',
              latinName: herb.latinName || '',
              englishName: herb.englishName || '',
              category: herb.category || '',
              nature: herb.nature || '',
              flavor: herb.flavor || '',
              dosage: herb.dosage || ''
            }));
            
            const headers = Object.keys(flattenedHerbs[0]).join(',');
            const rows = flattenedHerbs.map((herb: any) => 
              Object.values(herb).map(val => 
                typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
              ).join(',')
            );
            fileContent = [headers, ...rows].join('\n');
          }
        } catch (e) {
          console.error('Error converting to CSV:', e);
          toast({
            title: "Error de conversión",
            description: "Hubo un problema al convertir los datos a formato CSV.",
            variant: "destructive"
          });
          fileContent = "Error,No se pudieron exportar los datos";
        }
        fileName = 'export-data.csv';
        mimeType = 'text/csv';
      }
      
      // Crear un blob y un enlace de descarga
      // Debugging - asegurarnos de que el contenido no esté vacío
      if (!fileContent || fileContent.length === 0) {
        console.error('Error: Se está intentando crear un archivo vacío');
        toast({
          title: "Error de exportación",
          description: "No hay datos para exportar. Por favor, verifica que haya datos disponibles.",
          variant: "destructive"
        });
        setExportStatus('error');
        return;
      }
      
      console.log('Tamaño del archivo a exportar:', fileContent.length, 'bytes');
      
      // Crear el blob con el contenido del archivo
      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      console.log('Blob URL creada:', url);
      
      // Guardar la URL del blob para la descarga
      setExportedFileUrl(url);
      setExportedFileName(fileName);
      
      setExportStatus('success');
    } catch (error) {
      console.error('Error during export:', error);
      setExportStatus('error');
      toast({
        title: "Error de exportación",
        description: "Ocurrió un error al exportar los datos. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Importar/Exportar Datos</h1>
        <p className="text-muted-foreground">
          Gestiona la importación y exportación de datos del sistema
        </p>
      </div>

      <Tabs defaultValue="import" className="space-y-4">
        <TabsList>
          <TabsTrigger value="import">Importar</TabsTrigger>
          <TabsTrigger value="export">Exportar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Importar Datos</CardTitle>
              <CardDescription>
                Importa datos desde un archivo JSON o CSV. Asegúrate de usar el formato correcto.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="import-file">Seleccionar Archivo</Label>
                  <Input
                    id="import-file"
                    type="file"
                    accept=".json,.csv"
                    onChange={handleFileChange}
                    disabled={importStatus === 'loading'}
                  />
                  {selectedImportFile && (
                    <p className="text-sm text-muted-foreground">
                      Archivo seleccionado: {selectedImportFile.name} ({Math.round(selectedImportFile.size / 1024)} KB)
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="json-content">O pegar contenido JSON</Label>
                  <Textarea
                    id="json-content"
                    placeholder='{"NOMBRE_FORMULA": {"grupo": "...", "ingredientes": [...]}}'
                    value={jsonContent}
                    onChange={handleJsonContentChange}
                    rows={8}
                    className="font-mono text-sm"
                    disabled={importStatus === 'loading'}
                  />
                </div>
              </div>
              
              <div className="space-y-2 border-t pt-4">
                <h3 className="font-medium">Opciones de Importación</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="replace" />
                    <Label htmlFor="replace">Reemplazar datos existentes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="validate" defaultChecked />
                    <Label htmlFor="validate">Validar datos antes de importar</Label>
                  </div>
                </div>
              </div>
              
              {importStatus === 'loading' && (
                <div className="space-y-2">
                  <Label>Progreso de importación</Label>
                  <Progress value={importProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    Importando datos... {importProgress}% completado
                  </p>
                </div>
              )}
              
              {importStatus === 'success' && (
                <div className="space-y-4">
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Importación Exitosa</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Se importaron {importResults.imported} fórmulas correctamente.
                    </AlertDescription>
                  </Alert>
                  
                  {importResults.skipped > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Se omitieron {importResults.skipped} elementos:</h4>
                      <div className="max-h-40 overflow-y-auto text-xs border rounded-md p-2 bg-gray-50">
                        {importResults.errors.map((error, index) => (
                          <div key={index} className="text-red-600 mb-1">{error}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {importStatus === 'error' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error en la Importación</AlertTitle>
                  <AlertDescription>
                    Ocurrió un error durante la importación. Por favor, verifica el formato del archivo.
                  </AlertDescription>
                </Alert>
              )}
              
              <Button
                onClick={handleImport}
                disabled={(!selectedImportFile && !jsonContent) || importStatus === 'loading'}
                className="w-full"
              >
                {importStatus === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <FileUp className="mr-2 h-4 w-4" />
                    Iniciar Importación
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exportar Datos</CardTitle>
              <CardDescription>
                Exporta los datos del sistema a un archivo JSON o CSV.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Seleccionar Datos a Exportar</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="export-herbs" defaultChecked />
                    <Label htmlFor="export-herbs">Hierbas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="export-formulas" defaultChecked />
                    <Label htmlFor="export-formulas">Fórmulas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="export-patients" defaultChecked />
                    <Label htmlFor="export-patients">Pacientes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="export-prescriptions" defaultChecked />
                    <Label htmlFor="export-prescriptions">Prescripciones</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Formato de Exportación</h3>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="format-json" name="format" value="json" defaultChecked className="h-4 w-4" />
                    <Label htmlFor="format-json">JSON</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="format-csv" name="format" value="csv" className="h-4 w-4" />
                    <Label htmlFor="format-csv">CSV</Label>
                  </div>
                </div>
              </div>
              
              {exportStatus === 'loading' && (
                <div className="space-y-2">
                  <Label>Progreso de exportación</Label>
                  <Progress 
                    value={exportProgress.total > 0 
                      ? (exportProgress.current / exportProgress.total) * 100 
                      : 0} 
                    className="h-2" 
                  />
                  <p className="text-sm text-muted-foreground">
                    Obteniendo detalles para exportación... {exportProgress.current} de {exportProgress.total} elementos
                  </p>
                </div>
              )}
              
              {exportStatus === 'success' && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Exportación Exitosa</AlertTitle>
                  <AlertDescription className="text-green-700 flex flex-wrap items-center gap-1">
                    Los datos han sido exportados correctamente. 
                    <Button 
                      variant="link" 
                      className="text-primary font-medium px-1 m-0 h-auto hover:underline"
                      onClick={() => {
                        // Crear un elemento de descarga temporal
                        const a = document.createElement('a');
                        a.href = exportedFileUrl;
                        a.download = exportedFileName;
                        document.body.appendChild(a);
                        a.click();
                        
                        // Limpiar después de la descarga
                        setTimeout(() => {
                          document.body.removeChild(a);
                        }, 100);
                      }}
                    >
                      Descargar archivo
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="ml-2 px-2 py-0 h-7"
                          onClick={() => setShowExportedData(true)}
                        >
                          <Eye className="h-4 w-4 mr-1" /> Ver datos
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Datos Exportados</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4 mt-4">
                          {exportedData && exportedData.herbs && exportedData.herbs.length > 0 && (
                            <div className="space-y-2">
                              <h3 className="text-lg font-medium">Hierbas ({exportedData.herbs.length})</h3>
                              <div className="border rounded-md overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>ID</TableHead>
                                      <TableHead>Nombre Pinyin</TableHead>
                                      <TableHead>Nombre Chino</TableHead>
                                      <TableHead>Nombre Latín</TableHead>
                                      <TableHead>Naturaleza</TableHead>
                                      <TableHead>Sabor</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {exportedData.herbs.slice(0, 10).map((herb: any) => (
                                      <TableRow key={herb.id}>
                                        <TableCell>{herb.id}</TableCell>
                                        <TableCell>{herb.pinyinName}</TableCell>
                                        <TableCell>{herb.chineseName}</TableCell>
                                        <TableCell>{herb.latinName}</TableCell>
                                        <TableCell>{herb.nature}</TableCell>
                                        <TableCell>{herb.flavor}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                  {exportedData.herbs.length > 10 && (
                                    <TableCaption>
                                      Mostrando 10 de {exportedData.herbs.length} hierbas
                                    </TableCaption>
                                  )}
                                </Table>
                              </div>
                            </div>
                          )}
                          
                          {exportedData && exportedData.formulas && exportedData.formulas.length > 0 && (
                            <div className="space-y-2">
                              <h3 className="text-lg font-medium">Fórmulas ({exportedData.formulas.length})</h3>
                              <div className="border rounded-md overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>ID</TableHead>
                                      <TableHead>Nombre Pinyin</TableHead>
                                      <TableHead>Nombre Chino</TableHead>
                                      <TableHead>Categoría</TableHead>
                                      <TableHead>Acciones</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {exportedData.formulas.slice(0, 10).map((formula: any) => (
                                      <TableRow key={formula.id}>
                                        <TableCell>{formula.id}</TableCell>
                                        <TableCell>{formula.pinyinName}</TableCell>
                                        <TableCell>{formula.chineseName}</TableCell>
                                        <TableCell>{formula.category}</TableCell>
                                        <TableCell>
                                          {Array.isArray(formula.actions) 
                                            ? formula.actions.slice(0, 2).join(", ") + (formula.actions.length > 2 ? "..." : "") 
                                            : ""}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                  {exportedData.formulas.length > 10 && (
                                    <TableCaption>
                                      Mostrando 10 de {exportedData.formulas.length} fórmulas
                                    </TableCaption>
                                  )}
                                </Table>
                              </div>
                            </div>
                          )}
                          
                          {exportedData && exportedData.patients && exportedData.patients.length > 0 && (
                            <div className="space-y-2">
                              <h3 className="text-lg font-medium">Pacientes ({exportedData.patients.length})</h3>
                              <div className="border rounded-md overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>ID</TableHead>
                                      <TableHead>Nombre</TableHead>
                                      <TableHead>Identificador</TableHead>
                                      <TableHead>Teléfono</TableHead>
                                      <TableHead>Email</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {exportedData.patients.slice(0, 10).map((patient: any) => (
                                      <TableRow key={patient.id}>
                                        <TableCell>{patient.id}</TableCell>
                                        <TableCell>{patient.name}</TableCell>
                                        <TableCell>{patient.identifier}</TableCell>
                                        <TableCell>{patient.phone}</TableCell>
                                        <TableCell>{patient.email}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                  {exportedData.patients.length > 10 && (
                                    <TableCaption>
                                      Mostrando 10 de {exportedData.patients.length} pacientes
                                    </TableCaption>
                                  )}
                                </Table>
                              </div>
                            </div>
                          )}
                          
                          <div className="text-sm text-muted-foreground">
                            <p>Los datos completos están disponibles en el archivo exportado.</p>
                            <p>Datos incluidos en el archivo: {Object.keys(exportedData || {}).join(", ")}</p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </AlertDescription>
                </Alert>
              )}
              
              {exportStatus === 'error' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error en la Exportación</AlertTitle>
                  <AlertDescription>
                    Ocurrió un error durante la exportación. Por favor, inténtalo de nuevo.
                  </AlertDescription>
                </Alert>
              )}
              
              <Button
                onClick={handleExport}
                disabled={exportStatus === 'loading'}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                {exportStatus === 'loading' ? 'Exportando...' : 'Iniciar Exportación'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
