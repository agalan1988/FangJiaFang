import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Herb, insertHerbSchema } from "@shared/schema";
import { useFieldArray } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Extiende el esquema para validación específica del frontend
const herbSchema = insertHerbSchema.extend({
  // Podemos añadir validaciones adicionales aquí si es necesario
  meridians: insertHerbSchema.shape.meridians,
  functions: insertHerbSchema.shape.functions,
});

// Tipo derivado del esquema para TypeScript
type HerbFormValues = typeof herbSchema._type;

const natureOptions = [
  { label: "Caliente (Hot)", value: "hot" },
  { label: "Templado (Warm)", value: "warm" },
  { label: "Neutral", value: "neutral" },
  { label: "Fresco (Cool)", value: "cool" },
  { label: "Frío (Cold)", value: "cold" },
];

const flavorOptions = [
  { label: "Picante (Acrid)", value: "acrid" },
  { label: "Dulce (Sweet)", value: "sweet" },
  { label: "Amargo (Bitter)", value: "bitter" },
  { label: "Ácido (Sour)", value: "sour" },
  { label: "Salado (Salty)", value: "salty" },
  { label: "Astringente (Astringent)", value: "astringent" },
];

const meridianOptions = [
  { label: "Pulmón (Lung)", value: "lung" },
  { label: "Intestino Grueso (Large Intestine)", value: "large-intestine" },
  { label: "Estómago (Stomach)", value: "stomach" },
  { label: "Bazo (Spleen)", value: "spleen" },
  { label: "Corazón (Heart)", value: "heart" },
  { label: "Intestino Delgado (Small Intestine)", value: "small-intestine" },
  { label: "Vejiga (Bladder)", value: "bladder" },
  { label: "Riñón (Kidney)", value: "kidney" },
  { label: "Pericardio (Pericardium)", value: "pericardium" },
  { label: "Triple Calentador (Triple Burner)", value: "triple-burner" },
  { label: "Vesícula Biliar (Gallbladder)", value: "gallbladder" },
  { label: "Hígado (Liver)", value: "liver" },
];

export default function HerbEdit() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  // Verificar explícitamente si estamos creando una nueva hierba
  const isNewHerb = id === "new" || !id;

  // Consulta para obtener los datos de la hierba si estamos editando
  const { data: herb, isLoading } = useQuery<Herb>({
    queryKey: ["/api/herbs", id],
    enabled: !isNewHerb && !!id,
  });

  // Configuración del formulario con React Hook Form
  const form = useForm<HerbFormValues>({
    resolver: zodResolver(herbSchema),
    defaultValues: {
      pinyinName: "",
      chineseName: "",
      englishName: "",
      latinName: "",
      category: "",
      nature: "",
      flavor: "",
      dosage: "",
      meridians: [],
      functions: [""],
      applications: "",
      contraindications: "",
      pharmacologicalEffects: [],
      laboratoryEffects: [],
      herbDrugInteractions: [],
    },
  });

  // Field array para gestionar la lista de funciones
  const { fields: functionFields, append: appendFunction, remove: removeFunction } = useFieldArray({
    control: form.control,
    name: "functions" as any,
  });

  // Actualiza los valores del formulario cuando se cargan los datos de la hierba
  useEffect(() => {
    if (herb) {
      // Convertimos a un objeto compatible con el formulario
      const formValues: HerbFormValues = {
        pinyinName: herb.pinyinName,
        chineseName: herb.chineseName,
        englishName: herb.englishName || "",
        latinName: herb.latinName || "",
        category: herb.category || "",
        nature: herb.nature || "",
        flavor: herb.flavor || "",
        dosage: herb.dosage || "",
        meridians: herb.meridians || [],
        functions: herb.functions && herb.functions.length > 0 ? herb.functions : [""],
        applications: herb.applications || "",
        contraindications: herb.contraindications || "",
        pharmacologicalEffects: herb.pharmacologicalEffects || [],
        laboratoryEffects: herb.laboratoryEffects || [],
        herbDrugInteractions: herb.herbDrugInteractions || [],
      };
      
      form.reset(formValues);
    }
  }, [herb, form]);

  // Mutación para crear o actualizar la hierba
  const mutation = useMutation({
    mutationFn: async (data: HerbFormValues) => {
      if (isNewHerb) {
        // Para crear una nueva hierba siempre usamos POST
        return await apiRequest("/api/herbs", {
          method: "POST",
          body: JSON.stringify(data),
        });
      } else if (id && id !== 'new') {
        // Solo intentamos actualizar si tenemos un ID válido
        return await apiRequest(`/api/herbs/${id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        });
      } else {
        throw new Error("ID de hierba no válido");
      }
    },
    onSuccess: (data) => {
      toast({
        title: isNewHerb ? "Hierba creada" : "Hierba actualizada",
        description: `La hierba ${data.pinyinName} ha sido ${isNewHerb ? "creada" : "actualizada"} correctamente.`,
      });
      // Invalidamos la caché para recargar los datos
      queryClient.invalidateQueries({ queryKey: ["/api/herbs"] });
      // Redirigimos a la página de detalle
      navigate(`/herbs/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Ha ocurrido un error al ${isNewHerb ? "crear" : "actualizar"} la hierba: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Maneja el envío del formulario
  const onSubmit = (data: HerbFormValues) => {
    mutation.mutate(data);
  };

  if (isLoading && !isNewHerb) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded-md w-72"></div>
          <div className="h-12 bg-muted rounded-md"></div>
          <div className="h-12 bg-muted rounded-md"></div>
          <div className="h-12 bg-muted rounded-md"></div>
          <div className="h-12 bg-muted rounded-md"></div>
          <div className="h-20 bg-muted rounded-md"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/herbs")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isNewHerb ? "Nueva Hierba" : `Editar Hierba: ${herb?.pinyinName}`}
          </h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Información Básica</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="pinyinName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Pinyin</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Ren Shen" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chineseName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Chino</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 人参" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="englishName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre en Inglés</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Ginseng" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="latinName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Latín</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Panax ginseng" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Tonic Herbs">Hierbas Tónicas</SelectItem>
                          <SelectItem value="Clearing Herbs">Hierbas Dispersantes</SelectItem>
                          <SelectItem value="Downward Draining Herbs">Hierbas Drenantes</SelectItem>
                          <SelectItem value="Wind Herbs">Hierbas para el Viento</SelectItem>
                          <SelectItem value="Heat Clearing Herbs">Hierbas para Aclarar Calor</SelectItem>
                          <SelectItem value="Harmonizing Herbs">Hierbas Armonizantes</SelectItem>
                          <SelectItem value="Digestion Herbs">Hierbas Digestivas</SelectItem>
                          <SelectItem value="Astringent Herbs">Hierbas Astringentes</SelectItem>
                          <SelectItem value="Exterior Releasing Herbs">Hierbas Liberadoras Externas</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Naturaleza</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione la naturaleza" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {natureOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="flavor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sabor</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione el sabor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {flavorOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dosage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosificación</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 3-9g" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Meridianos</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {meridianOptions.map((option) => (
                  <FormField
                    key={option.value}
                    control={form.control}
                    name="meridians"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={option.value}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option.value)}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), option.value]
                                  : field.value?.filter(
                                      (value) => value !== option.value
                                    ) || [];
                                field.onChange(updatedValue);
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {option.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Funciones</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendFunction("")}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Añadir Función</span>
                </Button>
              </div>

              <div className="space-y-3">
                {functionFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`functions.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Ej: Tonifica el Qi" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => removeFunction(index)}
                      disabled={functionFields.length <= 1}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Aplicaciones y Contraindicaciones</h2>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="applications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aplicaciones</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe las aplicaciones de la hierba..."
                          className="min-h-[100px]"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Field array para efectos farmacológicos */}
                <div>
                  <FormLabel>Efectos Farmacológicos</FormLabel>
                  <div className="space-y-2 mt-2">
                    {form.watch("pharmacologicalEffects")?.map((_, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder="Ej: Diurético"
                          value={form.watch(`pharmacologicalEffects.${index}`) || ""}
                          onChange={(e) => {
                            const newValues = [...(form.watch("pharmacologicalEffects") || [])];
                            newValues[index] = e.target.value;
                            form.setValue("pharmacologicalEffects", newValues);
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newValues = [...(form.watch("pharmacologicalEffects") || [])];
                            newValues.splice(index, 1);
                            form.setValue("pharmacologicalEffects", newValues);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        const currentValues = form.watch("pharmacologicalEffects") || [];
                        form.setValue("pharmacologicalEffects", [...currentValues, ""]);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Añadir Efecto Farmacológico
                    </Button>
                  </div>
                </div>

                {/* Field array para efectos de laboratorio */}
                <div>
                  <FormLabel>Efectos de Laboratorio</FormLabel>
                  <div className="space-y-2 mt-2">
                    {form.watch("laboratoryEffects")?.map((_, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder="Ej: Reducción de colesterol"
                          value={form.watch(`laboratoryEffects.${index}`) || ""}
                          onChange={(e) => {
                            const newValues = [...(form.watch("laboratoryEffects") || [])];
                            newValues[index] = e.target.value;
                            form.setValue("laboratoryEffects", newValues);
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newValues = [...(form.watch("laboratoryEffects") || [])];
                            newValues.splice(index, 1);
                            form.setValue("laboratoryEffects", newValues);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        const currentValues = form.watch("laboratoryEffects") || [];
                        form.setValue("laboratoryEffects", [...currentValues, ""]);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Añadir Efecto de Laboratorio
                    </Button>
                  </div>
                </div>

                {/* Field array para interacciones con fármacos */}
                <div>
                  <FormLabel>Interacciones con Fármacos</FormLabel>
                  <div className="space-y-2 mt-2">
                    {form.watch("herbDrugInteractions")?.map((_, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder="Ej: Betabloqueantes"
                          value={form.watch(`herbDrugInteractions.${index}`) || ""}
                          onChange={(e) => {
                            const newValues = [...(form.watch("herbDrugInteractions") || [])];
                            newValues[index] = e.target.value;
                            form.setValue("herbDrugInteractions", newValues);
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newValues = [...(form.watch("herbDrugInteractions") || [])];
                            newValues.splice(index, 1);
                            form.setValue("herbDrugInteractions", newValues);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        const currentValues = form.watch("herbDrugInteractions") || [];
                        form.setValue("herbDrugInteractions", [...currentValues, ""]);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Añadir Interacción con Fármacos
                    </Button>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="contraindications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraindicaciones</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe las contraindicaciones de la hierba..."
                          className="min-h-[100px]"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cautions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precauciones</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe las precauciones para el uso de esta hierba..."
                          className="min-h-[100px]"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2 mt-4">
                  <div className="flex flex-col">
                    <Label className="mb-2">Estudios Clínicos e Investigación</Label>
                    {form.watch("clinicalStudiesAndResearch")?.map((_, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder="Ej: Psoriasis"
                          value={form.watch(`clinicalStudiesAndResearch.${index}`) || ""}
                          onChange={(e) => {
                            const newValues = [...(form.watch("clinicalStudiesAndResearch") || [])];
                            newValues[index] = e.target.value;
                            form.setValue("clinicalStudiesAndResearch", newValues);
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newValues = [...(form.watch("clinicalStudiesAndResearch") || [])];
                            newValues.splice(index, 1);
                            form.setValue("clinicalStudiesAndResearch", newValues);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        const currentValues = form.watch("clinicalStudiesAndResearch") || [];
                        form.setValue("clinicalStudiesAndResearch", [...currentValues, ""]);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Añadir Estudio Clínico
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(isNewHerb ? "/herbs" : `/herbs/${id}`)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="flex items-center gap-2">
              {mutation.isPending ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Guardar</span>
            </Button>
          </div>
        </form>
      </Form>
    </Layout>
  );
}