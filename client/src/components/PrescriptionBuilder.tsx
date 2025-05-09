import { 
  Trash2, 
  Minus, 
  Plus, 
  X,
  AlertCircle,
  Circle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PrescriptionItem, PrescriptionData } from "@/types";

interface PrescriptionBuilderProps {
  currentPrescription: PrescriptionData;
  updatePrescriptionInfo: (field: string, value: string) => void;
  updateMedicalCondition: (condition: string, value: boolean) => void;
  updateItemQuantity: (index: number, quantity: number) => void;
  removeItemFromPrescription: (index: number) => void;
  clearPrescription: () => void;
  onPreview: () => void;
}

export default function PrescriptionBuilder({
  currentPrescription,
  updatePrescriptionInfo,
  updateMedicalCondition,
  updateItemQuantity,
  removeItemFromPrescription,
  clearPrescription,
  onPreview
}: PrescriptionBuilderProps) {
  
  // Agrupar los elementos por tipo para mostrarlos organizados
  const herbItems = currentPrescription.items.filter(item => item.type === "herb");
  const formulaItems = currentPrescription.items.filter(item => item.type === "formula");
  
  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">Constructor de Prescripción</CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearPrescription}
              className="h-8 px-2 text-xs"
              disabled={currentPrescription.items.length === 0}
            >
              <X className="h-4 w-4 mr-1" /> Limpiar
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={onPreview}
              className="h-8 px-2 text-xs"
              disabled={currentPrescription.items.length === 0}
            >
              Vista Previa
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="prescripcion" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paciente">Datos del Paciente</TabsTrigger>
              <TabsTrigger value="prescripcion">Contenido de Prescripción</TabsTrigger>
            </TabsList>
            
            {/* Tab: Datos del Paciente */}
            <TabsContent value="paciente" className="space-y-4 pt-4">
              <div className="space-y-4">
                {/* Información básica de la prescripción */}
                <div className="border rounded-md p-4 bg-gray-50">
                  <h3 className="font-semibold mb-3">Información de Prescripción</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prescription-number">Número</Label>
                      <Input 
                        id="prescription-number" 
                        value={currentPrescription.number} 
                        onChange={(e) => updatePrescriptionInfo("number", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prescription-date">Fecha</Label>
                      <Input 
                        id="prescription-date" 
                        type="date" 
                        value={currentPrescription.date} 
                        onChange={(e) => updatePrescriptionInfo("date", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Información del paciente */}
                <div className="border rounded-md p-4 bg-gray-50">
                  <h3 className="font-semibold mb-3">Información del Paciente</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="patient-name">Nombre</Label>
                      <Input 
                        id="patient-name" 
                        value={currentPrescription.patientName} 
                        onChange={(e) => updatePrescriptionInfo("patientName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patient-email">Email</Label>
                      <Input 
                        id="patient-email" 
                        type="email" 
                        value={currentPrescription.patientEmail || ""} 
                        onChange={(e) => updatePrescriptionInfo("patientEmail", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patient-phone">Teléfono</Label>
                      <Input 
                        id="patient-phone" 
                        value={currentPrescription.patientPhone || ""} 
                        onChange={(e) => updatePrescriptionInfo("patientPhone", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patient-address">Dirección</Label>
                      <Input 
                        id="patient-address" 
                        value={currentPrescription.patientAddress || ""} 
                        onChange={(e) => updatePrescriptionInfo("patientAddress", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Condiciones médicas */}
                  <div className="mt-4 border-t pt-4">
                    <h4 className="font-medium mb-3">Condiciones Médicas</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="condition-pregnancy" 
                          checked={currentPrescription.medicalConditions.pregnancy} 
                          onCheckedChange={(checked) => 
                            updateMedicalCondition("pregnancy", checked as boolean)
                          }
                        />
                        <Label htmlFor="condition-pregnancy">Embarazo</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="condition-breastfeeding" 
                          checked={currentPrescription.medicalConditions.breastfeeding} 
                          onCheckedChange={(checked) => 
                            updateMedicalCondition("breastfeeding", checked as boolean)
                          }
                        />
                        <Label htmlFor="condition-breastfeeding">Lactancia</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="condition-hypertension" 
                          checked={currentPrescription.medicalConditions.hypertension} 
                          onCheckedChange={(checked) => 
                            updateMedicalCondition("hypertension", checked as boolean)
                          }
                        />
                        <Label htmlFor="condition-hypertension">Hipertensión</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="condition-liverDisease" 
                          checked={currentPrescription.medicalConditions.liverDisease} 
                          onCheckedChange={(checked) => 
                            updateMedicalCondition("liverDisease", checked as boolean)
                          }
                        />
                        <Label htmlFor="condition-liverDisease">Enfermedad Hepática</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="condition-allergies" 
                          checked={currentPrescription.medicalConditions.allergies} 
                          onCheckedChange={(checked) => 
                            updateMedicalCondition("allergies", checked as boolean)
                          }
                        />
                        <Label htmlFor="condition-allergies">Alergias</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Tab: Contenido de Prescripción */}
            <TabsContent value="prescripcion" className="space-y-4 pt-4">
              <div className="mb-4">
                <Label htmlFor="prescription-notes" className="block text-sm font-medium mb-1">Notas de prescripción</Label>
                <Textarea
                  id="prescription-notes"
                  value={currentPrescription.notes}
                  onChange={(e) => updatePrescriptionInfo("notes", e.target.value)}
                  placeholder="Instrucciones especiales..."
                  className="w-full resize-none"
                  rows={2}
                />
              </div>
              
              {/* Elementos de la prescripción */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium mb-3">Elementos de Prescripción</h3>
                
                {currentPrescription.items.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-muted-foreground">
                      Añade hierbas o fórmulas desde la biblioteca a tu prescripción
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Sección de hierbas */}
                    {herbItems.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Hierbas</h4>
                        <div className="space-y-2">
                          {herbItems.map((item, index) => {
                            const originalIndex = currentPrescription.items.findIndex(i => i === item);
                            return (
                              <div 
                                key={`herb-${item.id}-${index}`} 
                                className="flex items-center justify-between p-2 border rounded-md"
                              >
                                <div className="flex-grow">
                                  <p className="font-medium">{item.herb?.pinyinName}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {item.herb?.latinName} {item.herb?.chineseName && `(${item.herb.chineseName})`}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="flex items-center border rounded-md">
                                    <Button
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 rounded-r-none"
                                      onClick={() => updateItemQuantity(originalIndex, item.quantity - 1)}
                                      disabled={item.quantity <= 1}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <Input
                                      className="h-8 w-16 border-0 text-center"
                                      value={item.quantity}
                                      onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        if (!isNaN(value) && value > 0) {
                                          updateItemQuantity(originalIndex, value);
                                        }
                                      }}
                                    />
                                    <Button
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 rounded-l-none"
                                      onClick={() => updateItemQuantity(originalIndex, item.quantity + 1)}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <Button
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-red-500"
                                    onClick={() => removeItemFromPrescription(originalIndex)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Sección de fórmulas */}
                    {formulaItems.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Fórmulas</h4>
                        <div className="space-y-2">
                          {formulaItems.map((item, index) => {
                            const originalIndex = currentPrescription.items.findIndex(i => i === item);
                            return (
                              <div 
                                key={`formula-${item.id}-${index}`} 
                                className="border border-l-2 border-l-yellow-500 rounded-md overflow-hidden"
                              >
                                <div className="flex items-center justify-between p-2">
                                  <div className="flex items-center">
                                    <Circle className="h-4 w-4 mr-2 text-yellow-500 fill-yellow-50/50" />
                                    <div>
                                      <p className="font-medium">{item.formula?.pinyinName || item.formula?.englishName}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {item.formula?.chineseName} {item.formula?.englishName && item.formula?.chineseName && ` - `}
                                        {item.formula?.englishName && `${item.formula.englishName}`}
                                      </p>
                                    </div>
                                    <span className="ml-2 font-semibold text-gray-700">
                                      {item.quantity}g
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className="flex items-center border rounded-md">
                                      <Button
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 rounded-r-none"
                                        onClick={() => updateItemQuantity(originalIndex, item.quantity - 10)}
                                        disabled={item.quantity <= 10}
                                      >
                                        <Minus className="h-4 w-4" />
                                      </Button>
                                      <Input
                                        className="h-8 w-16 border-0 text-center"
                                        value={item.quantity}
                                        onChange={(e) => {
                                          const value = parseInt(e.target.value);
                                          if (!isNaN(value) && value > 0) {
                                            updateItemQuantity(originalIndex, value);
                                          }
                                        }}
                                      />
                                      <Button
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 rounded-l-none"
                                        onClick={() => updateItemQuantity(originalIndex, item.quantity + 10)}
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <Button
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-red-500"
                                      onClick={() => removeItemFromPrescription(originalIndex)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                
                                {/* Mostrar las hierbas de la fórmula si existen */}
                                {item.formula && 'composition' in item.formula && item.formula.composition && (
                                  <div className="px-3 py-2 bg-gray-50 border-t">
                                    <div className="space-y-1 mt-1">
                                      {(() => {
                                        try {
                                          // Procesar los datos de composición
                                          let herbComponents;
                                          
                                          if (typeof item.formula.composition === 'string') {
                                            herbComponents = JSON.parse(item.formula.composition);
                                          } else if (Array.isArray(item.formula.composition)) {
                                            herbComponents = item.formula.composition;
                                          } else if (item.formula.composition && 'herbs' in item.formula.composition && Array.isArray(item.formula.composition.herbs)) {
                                            herbComponents = item.formula.composition.herbs;
                                          } else {
                                            return <p className="text-sm italic">Formato de composición no válido</p>;
                                          }
                                          
                                          // Si herbComponents es un objeto con herbs, usar esa propiedad
                                          const herbs = Array.isArray(herbComponents.herbs) ? herbComponents.herbs : 
                                                       Array.isArray(herbComponents) ? herbComponents : [];
                                          
                                          if (herbs.length > 0) {
                                            return herbs.map((herb: any, idx: number) => {
                                              // Extraer la información de porcentaje del formato de datos
                                              let percentage = 0;
                                              if (herb.percentage) {
                                                percentage = parseFloat(herb.percentage);
                                              } else if (herb.dosage && typeof herb.dosage === 'string') {
                                                const dosageStr = herb.dosage.replace('%', '');
                                                percentage = parseFloat(dosageStr);
                                              }
                                              
                                              // Calcular los gramos proporcionales
                                              const actualGrams = herb.grams || Math.round((percentage * item.quantity / 100) * 10) / 10;
                                              
                                              return (
                                                <div key={`herb-${idx}`} className="flex justify-between border-b last:border-0 border-gray-100 pb-1 last:pb-0">
                                                  <div className="flex items-center">
                                                    <span className="w-5 h-5 inline-flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs mr-2">
                                                      {idx + 1}
                                                    </span>
                                                    <span className="font-medium text-sm">
                                                      {herb.pinyinName || herb.herb || herb.herbName || herb.name || "Hierba sin nombre"}
                                                    </span>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                    {percentage > 0 && (
                                                      <span className="text-xs text-gray-500">
                                                        {Math.round(percentage)}%
                                                      </span>
                                                    )}
                                                    <span className="text-sm font-medium text-primary">
                                                      {actualGrams}g
                                                    </span>
                                                  </div>
                                                </div>
                                              );
                                            });
                                          }
                                          
                                          return <p className="text-sm italic">No hay detalles de la composición</p>;
                                        } catch (error) {
                                          console.error("Error al procesar la composición:", error);
                                          return <p className="text-sm italic">Error al cargar la composición</p>;
                                        }
                                      })()}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Contraindicaciones si existen */}
                                {item.formula?.contraindications && (
                                  <div className="px-3 py-2 border-t bg-red-50">
                                    <div className="flex items-start gap-2">
                                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                                      <div>
                                        <p className="text-sm font-medium text-red-700">Contraindicaciones:</p>
                                        <p className="text-xs text-red-600">{item.formula.contraindications}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}