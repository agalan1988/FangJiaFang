import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useReactToPrint } from "react-to-print";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import LibraryPanel from "@/components/LibraryPanel";
import PrescriptionBuilder from "@/components/PrescriptionBuilder";
import PrintablePrescription from "@/components/PrintablePrescription";
import PrescriptionPreviewDialog from "@/components/PrescriptionPreviewDialog";
import { Herb, Formula, FormulaWithHerbs } from "@shared/schema";
import { PrescriptionData, HerbWithGrams, PrescriptionItem } from "@/types";

export default function NewPrescriptionPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentPrescription, setCurrentPrescription] = useState<PrescriptionData>({
    date: format(new Date(), "yyyy-MM-dd"),
    number: `MCH-${format(new Date(), "yyyyMM")}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    notes: "",
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    patientAddress: "",
    medicalConditions: {
      pregnancy: false,
      breastfeeding: false,
      hypertension: false,
      liverDisease: false,
      allergies: false
    },
    items: []
  });

  // Fetch herbs and formulas
  const { data: herbs = [] } = useQuery<Herb[]>({
    queryKey: ["/api/herbs"],
  });

  const { data: formulas = [] } = useQuery<FormulaWithHerbs[]>({
    queryKey: ["/api/formulas"],
  });
  
  // Mutación para guardar la prescripción
  const savePrescriptionMutation = useMutation({
    mutationFn: async (prescription: any) => {
      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prescription),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al guardar la prescripción');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Prescripción guardada",
        description: "La prescripción ha sido guardada correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      navigate("/prescriptions");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const addHerbToPrescription = (herb: Herb | HerbWithGrams) => {
    const existingItem = currentPrescription.items.find(
      item => item.type === "herb" && item.herb && item.herb.id === herb.id
    );
    
    // Obtener el valor de gramos si existe
    const herbGrams = 'grams' in herb && herb.grams ? herb.grams : null;
    
    if (existingItem) {
      // Si la hierba ya existe en la prescripción, incrementar la cantidad
      const incrementAmount = herbGrams || 1;
      
      setCurrentPrescription(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.type === "herb" && item.herb && item.herb.id === herb.id 
            ? { ...item, quantity: item.quantity + incrementAmount }
            : item
        )
      }));
      
      toast({
        title: "Hierba actualizada",
        description: `La cantidad de ${herb.pinyinName} ha sido incrementada en ${incrementAmount}.`,
      });
    } else {
      // Si hay información de gramos, la usamos como cantidad inicial
      const initialQuantity = herbGrams || 1;
      
      setCurrentPrescription(prev => ({
        ...prev,
        items: [
          ...prev.items,
          {
            id: herb.id,
            type: "herb",
            quantity: initialQuantity,
            herb
          }
        ]
      }));
      
      toast({
        title: "Hierba añadida",
        description: `${herb.pinyinName} ha sido añadida a la prescripción con cantidad ${initialQuantity}.`,
      });
    }
  };

  const addFormulaToPrescription = (formula: FormulaWithHerbs) => {
    // Registro detallado para depuración
    console.log("Añadiendo fórmula a prescripción:", formula);
    console.log("Cantidad especificada:", (formula as any).quantity || 100, "g");
    console.log("Hierbas en fórmula:", formula.herbs);
    
    const existingItem = currentPrescription.items.find(
      item => item.type === "formula" && item.formula && item.formula.id === formula.id
    );

    // IMPORTANTE: Las fórmulas siempre se estandarizan a 100g y los porcentajes se calculan en base a esto
    // Verificar si hay una cantidad específica en la fórmula o usar el valor predeterminado
    const requestedQuantity = (formula as any).totalGrams || (formula as any).quantity || 100;
    
    // Total actual de gramos en la fórmula para calcular el factor de escala
    const sumOfGrams = formula.herbs?.reduce((sum, herb) => sum + (herb.grams || 0), 0) || 0;
    console.log("Total de gramos original:", sumOfGrams, "g");
    console.log("Cantidad solicitada:", requestedQuantity, "g");
    
    if (existingItem) {
      // Si la fórmula ya existe, incrementamos con la cantidad solicitada
      const newQuantity = existingItem.quantity + requestedQuantity;
      console.log("Actualizando fórmula, nueva cantidad:", newQuantity, "g");
      
      // Factor de escala para todas las hierbas basado en la nueva cantidad total
      const ratio = newQuantity / existingItem.quantity;
      
      // Actualizar la fórmula y todas sus hierbas manteniendo sus proporciones 
      const updatedFormula = {
        ...existingItem.formula as FormulaWithHerbs,
        herbs: (existingItem.formula as FormulaWithHerbs).herbs?.map(herb => {
          // Calculamos los nuevos gramos exactos manteniendo la misma proporción
          const scaledGrams = herb.grams ? Math.round((herb.grams * ratio) * 10) / 10 : undefined;
          console.log(`Hierba ${herb.pinyinName}: ${herb.grams}g → ${scaledGrams}g`);
          
          return {
            ...herb,
            // Guardar tanto los gramos escalados como el porcentaje original
            percentage: herb.percentage,
            grams: scaledGrams
          };
        }) || []
      };
      
      // Actualizar el estado con la fórmula actualizada
      setCurrentPrescription(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.type === "formula" && item.formula && item.formula.id === formula.id 
            ? { 
                ...item, 
                quantity: newQuantity,
                formula: updatedFormula
              }
            : item
        )
      }));
      
      toast({
        title: "Fórmula actualizada",
        description: `La cantidad de ${formula.pinyinName} ha sido incrementada a ${newQuantity}g.`,
      });
    } else {
      // Es una nueva fórmula que se añade a la prescripción
      console.log("Añadiendo nueva fórmula con", requestedQuantity, "g");
      
      // Necesitamos calcular los porcentajes exactos basados en 100g (estándar)
      const standardizedHerbs = formula.herbs?.map(herb => {
        // Si no hay gramos, calcular porcentaje por defecto
        if (!herb.grams && !herb.percentage) {
          const defaultPercentage = 100 / (formula.herbs?.length || 1);
          return {
            ...herb,
            percentage: Math.round(defaultPercentage * 10) / 10,
            grams: Math.round((defaultPercentage * requestedQuantity / 100) * 10) / 10
          };
        }
        
        // Si hay porcentaje definido pero no gramos, calcular gramos
        if (herb.percentage && !herb.grams) {
          return {
            ...herb,
            grams: Math.round((herb.percentage * requestedQuantity / 100) * 10) / 10
          };
        }
        
        // Si hay gramos pero no porcentaje, calcular porcentaje relativo a 100g
        if (herb.grams && !herb.percentage) {
          // Normalizar a porcentaje respecto al total
          const percentage = sumOfGrams > 0 
            ? (herb.grams / sumOfGrams) * 100
            : 100 / (formula.herbs?.length || 1);
            
          const exactGrams = Math.round((percentage * requestedQuantity / 100) * 10) / 10;
          
          return {
            ...herb,
            percentage: Math.round(percentage * 10) / 10,
            grams: exactGrams
          };
        }
        
        // Si ambos están definidos, respetar porcentaje y calcular gramos según cantidad solicitada
        const exactGrams = Math.round((herb.percentage * requestedQuantity / 100) * 10) / 10;
        
        return {
          ...herb,
          grams: exactGrams
        };
      }) || [];
      
      // Verificar que la suma de gramos es exactamente igual a la cantidad solicitada
      const calculatedTotal = standardizedHerbs.reduce((sum, herb) => sum + (herb.grams || 0), 0);
      console.log("Total calculado:", calculatedTotal, "g", "Solicitado:", requestedQuantity, "g");
      
      // Registrar cada hierba para depuración
      standardizedHerbs.forEach(herb => {
        console.log(`Hierba: ${herb.pinyinName}, Porcentaje: ${herb.percentage}%, Gramos: ${herb.grams}g`);
      });
      
      // Crear la versión final de la fórmula con valores calculados
      const finalFormula = {
        ...formula,
        totalGrams: requestedQuantity,
        herbs: standardizedHerbs
      };
      
      // Añadir a la prescripción
      setCurrentPrescription(prev => ({
        ...prev,
        items: [
          ...prev.items,
          {
            id: formula.id,
            type: "formula",
            quantity: requestedQuantity,
            formula: finalFormula
          }
        ]
      }));
      
      toast({
        title: "Fórmula añadida",
        description: `${formula.pinyinName} añadida con ${requestedQuantity}g totales.`,
      });
    }
  };
  
  const addFormulaHerbsIndividually = (formula: FormulaWithHerbs) => {
    console.log("===== INICIO: Añadiendo hierbas individuales =====");
    console.log("Fórmula:", formula.pinyinName);
    
    // Verificar que la fórmula tenga hierbas
    if (!formula.herbs || formula.herbs.length === 0) {
      toast({
        title: "Sin hierbas",
        description: "Esta fórmula no contiene hierbas para añadir.",
        variant: "destructive",
      });
      return;
    }
    
    // ==== PASO 1: Preparar los datos de la fórmula ====
    
    // Obtener cantidad solicitada (o usar 100g por defecto)
    const requestedQuantity = (formula as any).totalGrams || (formula as any).quantity || 100;
    console.log("Cantidad solicitada:", requestedQuantity, "g");
    
    // ==== PASO 2: Normalizar porcentajes de las hierbas ====
    
    // Si las hierbas ya tienen porcentajes, usarlos
    // Si no, calcularlos basándonos en los gramos y el total
    const herbsWithPercentages = formula.herbs.map(herb => {
      // Si ya tiene porcentaje definido, utilizarlo
      if (herb.percentage && herb.percentage > 0) {
        return {
          ...herb,
          originalPercentage: herb.percentage
        };
      }
      
      // Si tiene gramos pero no porcentaje, calcular porcentaje
      // basado en el total de la fórmula estándar
      const totalGrams = formula.totalGrams || 
                         formula.herbs.reduce((sum, h) => sum + (h.grams || 0), 0) || 
                         100;
                         
      const calculatedPercentage = herb.grams ? 
                                  (herb.grams / totalGrams) * 100 : 
                                  100 / formula.herbs.length;
                                  
      return {
        ...herb,
        originalPercentage: Math.round(calculatedPercentage * 10) / 10
      };
    });
    
    // Asegurarnos que los porcentajes sumen 100% exacto
    const totalPercentage = herbsWithPercentages.reduce((sum, herb) => 
                            sum + (herb.originalPercentage || 0), 0);
                         
    const normalizedHerbs = herbsWithPercentages.map(herb => {
      // Normalizar para que la suma sea exactamente 100%
      const normalizedPercentage = totalPercentage > 0 ? 
                                   ((herb.originalPercentage || 0) / totalPercentage) * 100 :
                                   100 / herbsWithPercentages.length;
      
      // Calcular los gramos exactos para la cantidad solicitada
      const exactGrams = Math.round((normalizedPercentage * requestedQuantity / 100) * 10) / 10;
      
      return {
        ...herb,
        percentage: Math.round(normalizedPercentage * 10) / 10,
        grams: exactGrams,
        originalPercentage: undefined
      };
    });
    
    // Verificar que la suma de gramos sea correcta
    const totalCalculatedGrams = normalizedHerbs.reduce((sum, herb) => 
                                sum + (herb.grams || 0), 0);
    
    console.log(`VERIFICACIÓN: Total ${totalCalculatedGrams.toFixed(1)}g ≈ ${requestedQuantity}g solicitados`);
    
    // Mostrar cada hierba con su porcentaje y gramos calculados
    normalizedHerbs.forEach(herb => {
      console.log(`${herb.pinyinName}: ${herb.percentage}% = ${herb.grams}g`);
    });
    
    // ==== PASO 3: Añadir las hierbas a la prescripción ====
    normalizedHerbs.forEach(herb => {
      // IMPORTANTE: En las fórmulas importadas, algunas hierbas pueden no tener ID 
      // o tener ID 0, pero igual necesitamos añadirlas
      console.log(`Procesando hierba: ${herb.pinyinName}, ID: ${herb.id || 'no ID'}`);
      
      // Si la hierba no tiene ID asignado, hay que añadirla igualmente por su nombre
      // Buscar si la hierba ya existe en la prescripción (por ID o por nombre)
      const existingItem = currentPrescription.items.find(
        item => item.type === "herb" && item.herb && 
          (
            (herb.id && item.herb.id === herb.id) || 
            (!herb.id && item.herb.pinyinName === herb.pinyinName)
          )
      );
      
      // Si la hierba ya existe, actualizar su cantidad
      if (existingItem) {
        setCurrentPrescription(prev => ({
          ...prev,
          items: prev.items.map(item => 
            // Comparar por ID si existe, o por nombre si no hay ID
            (item.type === "herb" && item.herb && 
              ((herb.id && item.herb.id === herb.id) || 
              (!herb.id && item.herb.pinyinName === herb.pinyinName)))
              ? { 
                  ...item, 
                  quantity: Math.round(((item.quantity || 0) + (herb.grams || 0)) * 10) / 10,
                  herb: {
                    ...item.herb, 
                    // Actualizamos los datos importantes
                    percentage: herb.percentage,
                    grams: herb.grams
                  }
                }
              : item
          )
        }));
      } 
      // Si es una hierba nueva, añadirla a la prescripción
      else {
        setCurrentPrescription(prev => ({
          ...prev,
          items: [
            ...prev.items,
            {
              id: herb.id,
              type: "herb",
              quantity: herb.grams || 0,
              herb: {
                ...herb,
                // Asegurarnos que se guarde el porcentaje y los gramos
                percentage: herb.percentage,
                grams: herb.grams
              }
            }
          ]
        }));
      }
    });
    
    toast({
      title: "Hierbas añadidas",
      description: `${normalizedHerbs.length} hierbas de ${formula.pinyinName} (${requestedQuantity}g total).`,
    });
    
    console.log("===== FIN: Hierbas añadidas correctamente =====");
  };

  const removeItemFromPrescription = (index: number) => {
    setCurrentPrescription(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
    
    toast({
      title: "Elemento eliminado",
      description: "El elemento ha sido eliminado de la prescripción.",
    });
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    
    setCurrentPrescription(prev => {
      const item = prev.items[index];
      
      // Si es una fórmula, necesitamos actualizar los gramos de sus hierbas proporcionalmente
      if (item && item.type === 'formula' && item.formula) {
        const oldQuantity = item.quantity;
        const ratio = quantity / oldQuantity; // Ratio de cambio
        
        // Crear una nueva versión de la fórmula con hierbas actualizadas
        const updatedFormula = {
          ...item.formula,
          herbs: (item.formula as FormulaWithHerbs).herbs?.map(herb => ({
            ...herb,
            // Actualizar los gramos manteniendo el mismo porcentaje
            grams: herb.grams ? Math.round((herb.grams * ratio) * 10) / 10 : undefined,
          })) || []
        };
        
        return {
          ...prev,
          items: prev.items.map((currentItem, i) => 
            i === index ? { 
              ...currentItem, 
              quantity, 
              formula: updatedFormula 
            } : currentItem
          )
        };
      }
      
      // Para hierbas individuales, solo actualizar la cantidad
      return {
        ...prev,
        items: prev.items.map((currentItem, i) => 
          i === index ? { ...currentItem, quantity } : currentItem
        )
      };
    });
  };

  const clearPrescription = () => {
    setCurrentPrescription({
      date: format(new Date(), "yyyy-MM-dd"),
      number: `MCH-${format(new Date(), "yyyyMM")}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      notes: "",
      patientName: "",
      patientEmail: "",
      patientPhone: "",
      patientAddress: "",
      medicalConditions: {
        pregnancy: false,
        breastfeeding: false,
        hypertension: false,
        liverDisease: false,
        allergies: false
      },
      items: []
    });
    
    toast({
      title: "Prescripción limpiada",
      description: "Todos los elementos han sido eliminados de la prescripción.",
    });
  };

  const updatePrescriptionInfo = (field: string, value: string) => {
    setCurrentPrescription(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const updateMedicalCondition = (condition: string, value: boolean) => {
    setCurrentPrescription(prev => ({
      ...prev,
      medicalConditions: {
        ...prev.medicalConditions,
        [condition]: value
      }
    }));
  };

  const handlePrint = useReactToPrint({
    documentTitle: `Prescripcion-${currentPrescription.number}`,
    onAfterPrint: () => {
      toast({
        title: "Impresión iniciada",
        description: "La prescripción se ha enviado a la impresora."
      });
    },
    // @ts-ignore - typings are incorrect for this library
    content: () => printRef.current,
  });

  const handleSavePrescription = () => {
    // Validar datos básicos
    if (!currentPrescription.patientName) {
      toast({
        title: "Error",
        description: "Debes ingresar el nombre del paciente.",
        variant: "destructive",
      });
      return;
    }
    
    if (currentPrescription.items.length === 0) {
      toast({
        title: "Error",
        description: "La prescripción debe contener al menos un elemento.",
        variant: "destructive",
      });
      return;
    }
    
    // Transformar los datos para el backend
    const prescriptionData = {
      date: currentPrescription.date,
      patientId: 1, // TODO: Permitir seleccionar paciente
      diagnosis: "", // Añadir campo de diagnóstico en la interfaz
      notes: currentPrescription.notes,
      status: "active",
      items: currentPrescription.items.map(item => ({
        type: item.type,
        id: item.id,
        quantity: item.quantity
      }))
    };
    
    // Enviar al backend
    savePrescriptionMutation.mutate(prescriptionData);
  };

  // Ocultar la impresión fuera del DOM pero accesible para imprimir
  const hiddenPrintContent = (
    <div className="hidden">
      <div ref={printRef}>
        <PrintablePrescription prescription={currentPrescription} />
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Link href="/prescriptions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Nueva Prescripción</h1>
        </div>
        <Button 
          className="flex items-center gap-1" 
          onClick={handleSavePrescription}
          disabled={currentPrescription.items.length === 0 || !currentPrescription.patientName}
        >
          <Save className="h-4 w-4" />
          <span>Guardar Prescripción</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-[350px,1fr] gap-6">
        {/* Panel de biblioteca */}
        <div>
          <LibraryPanel 
            herbs={herbs}
            formulas={formulas}
            onAddHerb={addHerbToPrescription}
            onAddFormula={addFormulaToPrescription}
            onAddFormulaHerbs={addFormulaHerbsIndividually}
          />
        </div>
        
        {/* Constructor de prescripción */}
        <div>
          <PrescriptionBuilder
            currentPrescription={currentPrescription}
            updatePrescriptionInfo={updatePrescriptionInfo}
            updateMedicalCondition={updateMedicalCondition}
            updateItemQuantity={updateItemQuantity}
            removeItemFromPrescription={removeItemFromPrescription}
            clearPrescription={clearPrescription}
            onPreview={() => setPreviewOpen(true)}
          />
        </div>
      </div>
      
      {/* Diálogo de vista previa */}
      <PrescriptionPreviewDialog
        prescription={currentPrescription}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onPrint={handlePrint}
      />
      
      {/* Contenido oculto para imprimir */}
      {hiddenPrintContent}
    </Layout>
  );
}