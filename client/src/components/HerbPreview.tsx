import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Circle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

// Interfaces necesarias para los tipos de datos
interface HerbCombination {
  herbs?: string[];
  herb?: string;
  formula?: string;
}

interface TertiaryAction {
  description: string;
  combinations?: HerbCombination[];
}

interface SecondaryAction {
  primaryFunction: string;
  action: string;
  combinations?: HerbCombination[];
  tertiaryActions?: TertiaryAction[];
}

// Define los tipos de combinaciones comunes que pueden aparecer
interface CommonCombinationOld {
  herb: string;
  application: string;
}

interface CommonCombinationNew {
  indication: string;
  combination: string;
}

type CommonCombination = CommonCombinationOld | CommonCombinationNew;

interface Herb {
  id: number;
  pinyinName: string;
  chineseName: string;
  englishName?: string;
  latinName?: string;
  category?: string;
  nature?: string;
  flavor?: string;
  dosage?: string;
  meridians?: string[];
  functions?: string[];
  secondaryActions?: SecondaryAction[];
  applications?: string;
  commonCombinations?: CommonCombination[];
  contraindications?: string;
  cautions?: string;
  properties?: string;
  pharmacologicalEffects?: string[];
  laboratoryEffects?: string[];
  herbDrugInteractions?: string[];
  clinicalStudiesAndResearch?: string[];
}

interface HerbPreviewProps {
  herb: Herb;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (id: number) => void;
}

// Convertir siglas de meridianos a nombres completos
function getFullMeridianName(meridian: string): string {
  const meridianMap: Record<string, string> = {
    'LU': 'Lung',
    'UB': 'Urinary Bladder',
    'KD': 'Kidney',
    'HT': 'Heart',
    'ST': 'Stomach',
    'SP': 'Spleen',
    'LV': 'Liver',
    'LI': 'Large Intestine',
    'SI': 'Small Intestine',
    'GB': 'Gallbladder',
    'SJ': 'San Jiao',
    'PC': 'Pericardium',
    'BL': 'Urinary Bladder',
    'TE': 'Triple Burner'
  };

  // Comprobar si el meridiano es una sigla conocida
  if (meridianMap[meridian]) {
    return meridianMap[meridian];
  }
  
  // Devolver el meridiano original si no se encuentra
  return meridian;
}

// Obtener clase de color basada en la naturaleza de la hierba
function getNatureColorClass(nature: string): string {
  const natureLower = nature.toLowerCase();
  if (natureLower.includes('hot') || natureLower.includes('caliente')) {
    return 'bg-red-600 text-white';
  } else if (natureLower.includes('warm') || natureLower.includes('tibia')) {
    return 'bg-orange-400 text-orange-800';
  } else if (natureLower.includes('neutral') || natureLower.includes('neutra')) {
    return 'bg-gray-400 text-white';
  } else if (natureLower.includes('cool') || natureLower.includes('fresca')) {
    return 'bg-blue-300 text-blue-800';
  } else if (natureLower.includes('cold') || natureLower.includes('fría')) {
    return 'bg-blue-600 text-white';
  }
  return 'bg-gray-300 text-gray-800'; // Default
}

// Obtener solo el color de fondo basado en la naturaleza para viñetas
function getNatureColor(nature: string | undefined | null): string {
  if (!nature) return 'bg-primary/60';
  
  const natureLower = nature.toLowerCase();
  if (natureLower.includes('hot') || natureLower.includes('caliente')) {
    return 'bg-red-600';
  } else if (natureLower.includes('warm') || natureLower.includes('tibia')) {
    return 'bg-orange-400';
  } else if (natureLower.includes('neutral') || natureLower.includes('neutra')) {
    return 'bg-gray-400';
  } else if (natureLower.includes('cool') || natureLower.includes('fresca')) {
    return 'bg-blue-300';
  } else if (natureLower.includes('cold') || natureLower.includes('fría')) {
    return 'bg-blue-600';
  }
  return 'bg-primary/60'; // Default
}

const HerbPreview: React.FC<HerbPreviewProps> = ({ 
  herb, 
  isOpen, 
  onClose, 
  onEdit 
}) => {
  const [expandedActions, setExpandedActions] = useState<number[]>([]);

  const toggleAction = (index: number) => {
    setExpandedActions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white z-10 pb-2">
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="flex items-center flex-wrap">
                <span className="text-xl font-bold mr-2">{herb.pinyinName}</span>
                <span className="text-lg text-gray-600 chinese">{herb.chineseName}</span>
              </div>
              {herb.latinName && (
                <span className="text-sm italic text-gray-500 font-medium sm:ml-2 mt-1 sm:mt-0">
                  ({herb.latinName})
                </span>
              )}
            </div>
            {herb.category && (
              <Badge className="ml-auto mt-2 sm:mt-0" variant="secondary">{herb.category}</Badge>
            )}
          </DialogTitle>
          <DialogDescription className="space-y-1">
            {herb.englishName && <div className="text-sm text-gray-600 italic">{herb.englishName}</div>}
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 overflow-y-visible">
          {/* Información básica */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">Naturaleza</h3>
              {herb.nature ? (
                <Badge 
                  className={`${getNatureColorClass(herb.nature)} font-medium`}
                >
                  {herb.nature}
                </Badge>
              ) : (
                <p className="font-medium">No especificada</p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">Sabor</h3>
              <p className="font-medium">{herb.flavor || "No especificado"}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">Dosificación</h3>
              <p className="font-medium">{herb.dosage || "No especificada"}</p>
            </div>
          </div>

          {/* Meridianos */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Tropismo de Meridianos</h3>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(herb.meridians) && herb.meridians.length > 0 ? 
                herb.meridians.map((meridian: string, index: number) => {
                  const fullMeridianName = getFullMeridianName(meridian);
                  const meridianKey = fullMeridianName.replace(/\s+/g, '-');
                  return (
                    <Badge 
                      key={index} 
                      variant="outline"
                      className={`meridian-badge meridian-${meridianKey}`}
                    >
                      {fullMeridianName}
                    </Badge>
                  );
                }) : 
                <p className="text-muted-foreground">No especificado</p>
              }
            </div>
          </div>

          {/* TCM Actions */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">TCM Actions</h3>
            
            {/* Funciones como acciones principales */}
            {Array.isArray(herb.functions) && herb.functions.length > 0 && (
              <div className="space-y-4">
                {herb.functions.map((func: string, index: number) => (
                  <div key={index} className="mb-3">
                    <div 
                      className="p-2 flex justify-between items-center cursor-pointer hover:bg-muted/20 transition-colors rounded-md"
                      onClick={() => toggleAction(index)}
                    >
                      <div className="flex items-center gap-2">
                        <Circle className="h-3 w-3 mr-0 text-primary fill-primary" />
                        <h4 className="font-bold text-gray-900">{func}</h4>
                      </div>
                      <div className="text-gray-500">
                        {expandedActions.includes(index) ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                    
                    {expandedActions.includes(index) && (
                      <div className="p-3 pt-2">
                        {/* Acciones secundarias */}
                        {Array.isArray(herb.secondaryActions) && herb.secondaryActions
                          .filter((action) => action.primaryFunction === func)
                          .map((action, idx) => (
                            <div key={idx} className="mb-3 last:mb-0">
                              <div className="mb-2 pl-3 py-1 border-l-2 border-primary/30">
                                {/* Acción secundaria */}
                                <div className="flex flex-col space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Circle className="h-2 w-2 mr-0 text-primary fill-primary/80" />
                                    <h5 className="font-medium text-sm mb-1 text-gray-900">{action.action}</h5>
                                  </div>
                                    
                                  {/* Combinaciones de la acción secundaria (solo si no hay terciarias) */}
                                  {Array.isArray(action.combinations) && action.combinations.length > 0 && 
                                   !Array.isArray(action.tertiaryActions) && (
                                    <div className="pl-2 mt-1 mb-2">
                                      <div className="flex flex-col gap-2">
                                        {/* Mostrar 'Usar individualmente' primero si existe */}
                                        {action.combinations.some((combo) => 
                                          Array.isArray(combo.herbs) && combo.herbs && combo.herbs.length === 1 && combo.herbs[0] === "Individually"
                                        ) && (
                                          <span className="inline px-1.5 py-1 text-xs font-medium text-gray-600 italic">
                                            Usar individualmente
                                          </span>
                                        )}

                                        {/* Mostrar las combinaciones de hierbas */}
                                        <div className="flex flex-wrap gap-1">
                                          {action.combinations.filter((combo) => 
                                            !(Array.isArray(combo.herbs) && combo.herbs && combo.herbs.length === 1 && combo.herbs[0] === "Individually")
                                          ).map((combo, comboIdx) => (
                                            <span key={comboIdx} className="inline-flex px-1.5 py-1">
                                              {Array.isArray(combo.herbs) && combo.herbs ? (
                                                <div className="flex flex-nowrap items-center">
                                                  {combo.herbs.map((herb, herbIdx) => (
                                                    <React.Fragment key={herbIdx}>
                                                      <Badge className="text-xs bg-white text-primary border border-primary font-medium text-[10px] py-0.5 whitespace-nowrap">{herb}</Badge>
                                                      {herbIdx < (combo.herbs?.length || 0) - 1 && (
                                                        <span className="mx-0.5 text-gray-400">+</span>
                                                      )}
                                                    </React.Fragment>
                                                  ))}
                                                  {combo.formula && (
                                                    <div className="ml-3 pl-3 border-l">
                                                      <span className="text-[10px] font-medium text-gray-500">Fórmula: </span>
                                                      <span className="text-[10px] font-medium text-primary">{combo.formula}</span>
                                                    </div>
                                                  )}
                                                </div>
                                              ) : (
                                                <div className="flex items-center">
                                                  <Badge className="text-xs bg-white text-primary border border-primary font-medium text-[10px] py-0.5 whitespace-nowrap">{combo.herb}</Badge>
                                                  {combo.formula && (
                                                    <div className="ml-3 pl-3 border-l">
                                                      <span className="text-[10px] font-medium text-gray-500">Fórmula: </span>
                                                      <span className="text-[10px] font-medium text-primary">{combo.formula}</span>
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                    
                                  {/* Acciones terciarias (si existen) */}
                                  {Array.isArray(action.tertiaryActions) && action.tertiaryActions.length > 0 && (
                                    <div className="space-y-2">
                                      {action.tertiaryActions.map((tertiary, tertiaryIdx) => (
                                        <div key={tertiaryIdx} className="mb-2 pl-4 border-l border-primary/20 py-1">
                                          {/* Acción terciaria */}
                                          <div className="flex items-center gap-2">
                                            <ChevronRight className="h-3 w-3 text-primary fill-primary/60" />
                                            <div className="text-sm italic text-gray-700 mb-1">{tertiary.description}</div>
                                          </div>
                                            
                                          {/* Combinaciones para esta acción terciaria */}
                                          {Array.isArray(tertiary.combinations) && tertiary.combinations.length > 0 && (
                                            <div className="pl-2 mt-1">
                                              <div className="flex flex-col gap-2">
                                                {/* Mostrar 'Usar individualmente' primero si existe */}
                                                {tertiary.combinations.some((combo) => 
                                                  Array.isArray(combo.herbs) && combo.herbs && combo.herbs.length === 1 && combo.herbs[0] === "Individually"
                                                ) && (
                                                  <span className="inline px-1.5 py-1 text-xs font-medium text-gray-600 italic">
                                                    Usar individualmente
                                                  </span>
                                                )}

                                                {/* Mostrar las combinaciones de hierbas */}
                                                <div className="flex flex-wrap gap-1">
                                                  {tertiary.combinations.filter((combo) => 
                                                    !(Array.isArray(combo.herbs) && combo.herbs && combo.herbs.length === 1 && combo.herbs[0] === "Individually")
                                                  ).map((combo, comboIdx) => (
                                                    <span key={comboIdx} className="inline-flex px-1.5 py-1">
                                                      {Array.isArray(combo.herbs) && combo.herbs && combo.herbs.length > 0 ? (
                                                        <div className="flex flex-nowrap items-center">
                                                          {combo.herbs.map((herb, herbIdx) => (
                                                            <React.Fragment key={herbIdx}>
                                                              <Badge className="text-xs bg-white text-primary border border-primary font-medium text-[10px] py-0.5 whitespace-nowrap">{herb}</Badge>
                                                              {herbIdx < (combo.herbs?.length ?? 0) - 1 && (
                                                                <span className="mx-0.5 text-gray-400">+</span>
                                                              )}
                                                            </React.Fragment>
                                                          ))}
                                                          {combo.formula && (
                                                            <div className="ml-3 pl-3 border-l">
                                                              <span className="text-[10px] font-medium text-gray-500">Fórmula: </span>
                                                              <span className="text-[10px] font-medium text-primary">{combo.formula}</span>
                                                            </div>
                                                          )}
                                                        </div>
                                                      ) : (
                                                        <div className="flex items-center">
                                                          <Badge className="text-xs bg-white text-primary border border-primary font-medium text-[10px] py-0.5 whitespace-nowrap">{combo.herb}</Badge>
                                                          {combo.formula && (
                                                            <div className="ml-3 pl-3 border-l">
                                                              <span className="text-[10px] font-medium text-gray-500">Fórmula: </span>
                                                              <span className="text-[10px] font-medium text-primary">{combo.formula}</span>
                                                            </div>
                                                          )}
                                                        </div>
                                                      )}
                                                    </span>
                                                  ))}
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Si no hay funciones específicas pero sí aplicaciones generales */}
            {(!Array.isArray(herb.functions) || herb.functions.length === 0) && herb.applications && (
              <div className="p-4 border rounded-lg">
                <p className="text-sm">{herb.applications}</p>
              </div>
            )}
          </div>

          {/* Combinaciones comunes (como acordeón) */}
          {Array.isArray(herb.commonCombinations) && herb.commonCombinations.length > 0 && (
            <div className="mb-6">
              <div 
                className="p-2 flex justify-between items-center cursor-pointer hover:bg-muted/20 transition-colors rounded-md border-b pb-2"
                onClick={() => toggleAction(-1)} // Usamos -1 como ID para combinaciones comunes
              >
                <h3 className="font-semibold text-base text-primary">Combinaciones Comunes</h3>
                <div className="text-gray-500">
                  {expandedActions.includes(-1) ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </div>
              </div>
              
              {expandedActions.includes(-1) && (
                <div className="border rounded-md overflow-hidden mt-3">
                  <div className="space-y-4 p-4">
                    {herb.commonCombinations.map((combo, index) => {
                      // Extraer los valores según el tipo de combinación
                      const indication = ('indication' in combo) 
                        ? (combo as CommonCombinationNew).indication
                        : (combo as CommonCombinationOld).application;
                      
                      const combinationStr = ('combination' in combo) 
                        ? (combo as CommonCombinationNew).combination 
                        : (combo as CommonCombinationOld).herb;
                      
                      // Dividir la cadena de combinación en hierbas individuales
                      const herbsArray = combinationStr.split('+').map(h => h.trim());
                      
                      return (
                        <div key={index} className="mb-2 pl-4 border-l border-primary/20 py-1">
                          {/* Indicación */}
                          <div className="flex items-center gap-2 mb-2">
                            <ChevronRight className="h-3 w-3 text-primary fill-primary/60" />
                            <div className="text-sm italic text-gray-700">{indication}</div>
                          </div>
                          
                          {/* Combinación de hierbas */}
                          <div className="pl-2 mt-1">
                            <div className="flex flex-wrap items-center">
                              {herbsArray.map((herb, herbIdx) => (
                                <React.Fragment key={herbIdx}>
                                  <Badge className="text-xs bg-white text-primary border border-primary font-medium text-[10px] py-0.5 whitespace-nowrap m-1">{herb}</Badge>
                                  {herbIdx < herbsArray.length - 1 && (
                                    <span className="text-gray-400 flex items-center justify-center">+</span>
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pharmacological Effects */}
          {Array.isArray(herb.pharmacologicalEffects) && herb.pharmacologicalEffects.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2 text-base border-b pb-2 text-primary">Pharmacological Effects</h3>
              <div className="flex flex-wrap gap-2 p-3">
                {herb.pharmacologicalEffects.map((effect, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50">
                    {effect}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Efectos de laboratorio */}
          {Array.isArray(herb.laboratoryEffects) && herb.laboratoryEffects.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2 text-base border-b pb-2 text-primary">Efectos de Laboratorio</h3>
              <div className="flex flex-wrap gap-2 p-3">
                {herb.laboratoryEffects.map((effect, index) => (
                  <Badge key={index} variant="outline" className="bg-green-50">
                    {effect}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Interacciones con fármacos */}
          {Array.isArray(herb.herbDrugInteractions) && herb.herbDrugInteractions.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2 text-base border-b pb-2 text-primary">Interacciones con Fármacos</h3>
              <div className="flex flex-wrap gap-2 p-3">
                {herb.herbDrugInteractions.map((interaction, index) => (
                  <Badge key={index} variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                    {interaction}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Contraindications */}
          {herb.contraindications && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2 text-base border-b pb-2 text-primary">Contraindications</h3>
              <div className="p-3 bg-red-50 border border-red-100 rounded-md">
                <p className="text-sm text-red-800">{herb.contraindications}</p>
              </div>
            </div>
          )}

          {/* Cautions */}
          {herb.cautions && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2 text-base border-b pb-2 text-primary">Cautions</h3>
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-md">
                <p className="text-sm text-amber-800">{herb.cautions}</p>
              </div>
            </div>
          )}
          
          {/* Estudios clínicos e investigación */}
          {Array.isArray(herb.clinicalStudiesAndResearch) && herb.clinicalStudiesAndResearch.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2 text-base border-b pb-2 text-primary">Estudios Clínicos e Investigación</h3>
              <div className="flex flex-wrap gap-2 p-3">
                {herb.clinicalStudiesAndResearch.map((study, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                    {study}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6 gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cerrar
          </Button>
          {onEdit && (
            <Button 
              onClick={() => {
                onClose();
                onEdit(herb.id);
              }}
            >
              Editar Hierba
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HerbPreview;