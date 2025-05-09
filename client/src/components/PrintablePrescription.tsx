import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Circle } from "lucide-react";
import { PrescriptionData } from "@/types";
import { FormulaWithHerbs } from "@shared/schema";

interface PrintablePrescriptionProps {
  prescription: PrescriptionData;
}

export default function PrintablePrescription({ prescription }: PrintablePrescriptionProps) {
  const formatDisplayDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'dd/MM/yyyy', { locale: es });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="p-2 font-sans">
      <div className="bg-white p-6 max-w-3xl mx-auto shadow-sm border border-gray-100 rounded-md min-h-[85vh] flex flex-col justify-between">
        {/* Contenido Principal (Flex-grow para que ocupe todo el espacio disponible) */}
        <div className="flex-grow">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent mb-1">MediCina</h1>
              <p className="text-gray-600 text-xs">Prescripción de Medicina China Tradicional</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-xs text-gray-700">Fecha: <span>{formatDisplayDate(prescription.date)}</span></p>
              <p className="font-medium text-xs text-gray-700">Prescripción #: <span className="text-primary font-semibold">{prescription.number}</span></p>
            </div>
          </div>
          
          {/* Datos paciente y prescripción sin tabs */}
          <div className="print:hidden mb-4">
            {/* Datos del Paciente siempre visibles */}
            {prescription.patientName || prescription.patientEmail || prescription.patientPhone || prescription.patientAddress ? (
              <div className="p-3 bg-gray-50 rounded-md border border-gray-100 mb-4">
                <h3 className="font-semibold text-sm mb-2 text-gray-700">Información del Paciente</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {prescription.patientName && (
                    <div>
                      <span className="font-medium text-gray-600">Nombre: </span>
                      <span className="text-gray-800">{prescription.patientName}</span>
                    </div>
                  )}
                  {prescription.patientPhone && (
                    <div>
                      <span className="font-medium text-gray-600">Teléfono: </span>
                      <span className="text-gray-800">{prescription.patientPhone}</span>
                    </div>
                  )}
                  {prescription.patientEmail && (
                    <div className="col-span-2">
                      <span className="font-medium text-gray-600">Email: </span>
                      <span className="text-gray-800">{prescription.patientEmail}</span>
                    </div>
                  )}
                  {prescription.patientAddress && (
                    <div className="col-span-2">
                      <span className="font-medium text-gray-600">Dirección: </span>
                      <span className="text-gray-800">{prescription.patientAddress}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-2 mb-4">
                <p className="text-gray-500 text-sm">No hay datos del paciente</p>
              </div>
            )}
            
            {/* Título de la prescripción */}
            <div className="border-b border-gray-200 pb-3 mb-3">
              <h2 className="text-base font-semibold mb-2 text-primary">Prescripción Medicinal</h2>
              <p className="mb-2 italic text-gray-600 text-xs">Esta prescripción deberá ser preparada por un especialista en formulación de hierbas chinas.</p>
            </div>
          </div>
          
          {/* Datos del paciente para la versión imprimible */}
          <div className="hidden print:block mb-4">
            {prescription.patientName || prescription.patientEmail || prescription.patientPhone || prescription.patientAddress ? (
              <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
                <h3 className="font-semibold text-sm mb-2 text-gray-700">Datos del Paciente</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {prescription.patientName && (
                    <div>
                      <span className="font-medium text-gray-600">Nombre: </span>
                      <span className="text-gray-800">{prescription.patientName}</span>
                    </div>
                  )}
                  {prescription.patientPhone && (
                    <div>
                      <span className="font-medium text-gray-600">Teléfono: </span>
                      <span className="text-gray-800">{prescription.patientPhone}</span>
                    </div>
                  )}
                  {prescription.patientEmail && (
                    <div className="col-span-2">
                      <span className="font-medium text-gray-600">Email: </span>
                      <span className="text-gray-800">{prescription.patientEmail}</span>
                    </div>
                  )}
                  {prescription.patientAddress && (
                    <div className="col-span-2">
                      <span className="font-medium text-gray-600">Dirección: </span>
                      <span className="text-gray-800">{prescription.patientAddress}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
          
          {/* Main Content - Fórmulas y Hierbas unificadas */}
          <div className="mb-6 bg-white border border-gray-100 rounded-md">
            <h3 className="font-semibold px-3 pt-3 pb-2 text-gray-800 border-b border-gray-100">Fórmulas y Hierbas</h3>
            
            {prescription.items.length === 0 ? (
              <div className="flex items-center justify-center p-3 text-sm">
                <p className="text-gray-500 italic">No hay elementos en esta prescripción.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {prescription.items.map((item, index) => (
                  <div key={`${item.type}-${item.id}-${index}`} className={`px-3 py-2 border-l-2 ${item.type === 'formula' ? 'border-l-yellow-500' : 'border-l-primary'}`}>
                    {item.type === 'formula' && item.formula ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Circle className="h-2 w-2 mr-2 text-yellow-500 fill-yellow-50/50" />
                            <div>
                              <p className="font-semibold text-gray-800">{item.formula.pinyinName || item.formula.englishName}</p>
                              <p className="text-xs text-gray-600 italic">
                                {item.formula.englishName}
                              </p>
                            </div>
                            <span className="ml-2 font-semibold text-gray-700">
                              {item.quantity}g
                            </span>
                          </div>
                        </div>
                        
                        {/* Composición de la fórmula */}
                        {item.formula && 'composition' in item.formula && item.formula.composition && (
                          <div className="ml-4 pl-2 border-l border-gray-100">
                            <div className="space-y-1 mt-1">
                              {(() => {
                                try {
                                  // Procesar composición 
                                  let herbComponents;
                                  if (typeof item.formula.composition === 'string') {
                                    herbComponents = JSON.parse(item.formula.composition);
                                  } else if (Array.isArray(item.formula.composition)) {
                                    herbComponents = item.formula.composition;
                                  } else {
                                    return <div className="text-xs text-red-500">Formato no válido</div>;
                                  }
                                  
                                  return herbComponents.map((herb: any, idx: number) => {
                                    // Extraer la información de porcentaje del formato de datos
                                    let percentage = 0;
                                    if (herb.percentage) {
                                      percentage = parseFloat(herb.percentage);
                                    } else if (herb.dosage && typeof herb.dosage === 'string') {
                                      const dosageStr = herb.dosage.replace('%', '');
                                      percentage = parseFloat(dosageStr);
                                    }
                                    
                                    // Calcular los gramos proporcionales
                                    const actualGrams = Math.round((percentage * item.quantity / 100) * 10) / 10;
                                    
                                    return (
                                      <div key={`herb-${idx}`} className="flex items-center border-b border-gray-50 pb-1 last:border-0 last:pb-0">
                                        <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2">
                                          <span className="text-[0.6rem]">{idx + 1}</span>
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center">
                                            <div>
                                              <div className="font-medium text-xs">
                                                {herb.pinyinName || herb.herb || herb.herbName || herb.name || "Hierba sin nombre"}
                                              </div>
                                              {herb.latinName && (
                                                <p className="text-[0.6rem] text-gray-500 italic">{herb.latinName}</p>
                                              )}
                                            </div>
                                            <div className="ml-auto flex items-center">
                                              <span className="text-xs text-gray-500 mr-1">
                                                {Math.round(percentage)}%
                                              </span>
                                              <span className="font-semibold text-xs text-primary">
                                                {actualGrams}g
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  });
                                } catch (error) {
                                  console.error("Error procesando composición de fórmula:", error);
                                  return <div className="text-xs text-red-500">Error al procesar componentes</div>;
                                }
                              })()}
                            </div>
                          </div>
                        )}
                      </>
                    ) : item.herb ? (
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <Circle className="h-2 w-2 mr-2 text-primary fill-primary/10" />
                            <div>
                              <p className="font-semibold text-gray-800">{item.herb.pinyinName}</p>
                              <p className="text-xs text-gray-600 italic">
                                {item.herb.latinName}
                              </p>
                            </div>
                            <span className="ml-2 font-semibold text-gray-700">
                              {item.quantity}g
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Instructions */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2 text-gray-800 text-sm border-b border-gray-100 pb-1">Instrucciones</h3>
            <div className="text-gray-700 text-sm px-1">
              {prescription.notes ? (
                <p>{prescription.notes}</p>
              ) : (
                <p className="italic text-gray-500 text-xs">No hay instrucciones especiales para esta prescripción.</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer - Always at bottom due to flex layout */}
        <div className="pt-3 border-t border-gray-100 text-center text-xs text-gray-400 mt-auto">
          <p className="mb-0.5">MediCina - Aplicación para Terapeutas de Medicina China</p>
          <p className="text-2xs">Documento generado el {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
        </div>
      </div>
    </div>
  );
}