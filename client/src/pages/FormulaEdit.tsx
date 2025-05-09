import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Formula, insertFormulaSchema } from "@shared/schema";

// Extendemos el esquema para validación específica del frontend
const formulaSchema = insertFormulaSchema.extend({
  // Aseguramos que composition es un array de objetos con propiedades específicas
  composition: z.array(z.object({
    herb: z.string().min(1, "El nombre de la hierba es requerido"),
    chineseName: z.string().optional(),
    dosage: z.string().optional(),
    function: z.string().optional(),
    herbId: z.number().optional(),
  })).optional(),
  // Aseguramos que actions es un array de strings
  actions: z.array(z.string()).optional(),
});

// Tipo derivado del esquema para TypeScript
type FormulaFormValues = z.infer<typeof formulaSchema>;

export default function FormulaEdit() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const isNewFormula = id === "new";

  // Consulta para obtener los datos de la fórmula si estamos editando
  const { data: formula, isLoading } = useQuery<Formula>({
    queryKey: ["/api/formulas", id],
    enabled: !isNewFormula && !!id,
  });

  // Consulta para obtener la lista de hierbas para seleccionar
  const { data: herbs } = useQuery({
    queryKey: ["/api/herbs"],
  });

  // Configuración del formulario con React Hook Form
  const form = useForm<FormulaFormValues>({
    resolver: zodResolver(formulaSchema),
    defaultValues: {
      pinyinName: "",
      chineseName: "",
      englishName: "",
      category: "",
      indications: "",
      contraindications: "",
      composition: [{ herb: "", chineseName: "", dosage: "", function: "" }],
      actions: [""],
    } as any,
  });

  // Field array para gestionar la lista de hierbas en la composición
  const { fields: compositionFields, append: appendComposition, remove: removeComposition } = useFieldArray({
    control: form.control,
    name: "composition",
  });

  // Field array para gestionar la lista de acciones
  const { fields: actionFields, append: appendAction, remove: removeAction } = useFieldArray({
    control: form.control,
    name: "actions",
  } as any); // Usar 'as any' para evitar errores de tipo en el campo

  // Actualiza los valores del formulario cuando se cargan los datos de la fórmula
  useEffect(() => {
    if (formula) {
      // Preparamos la composition para el formulario
      const composition = formula.composition ? 
        (typeof formula.composition === 'string' ? 
          JSON.parse(formula.composition) : 
          formula.composition) : 
        [];

      // Preparamos las actions para el formulario
      const actions = formula.actions || [];

      form.reset({
        ...formula,
        composition,
        actions,
      });
    }
  }, [formula, form]);

  // Mutación para crear o actualizar la fórmula
  const mutation = useMutation({
    mutationFn: async (data: FormulaFormValues) => {
      if (isNewFormula) {
        return await apiRequest("/api/formulas", {
          method: "POST",
          body: JSON.stringify(data),
        });
      } else {
        return await apiRequest(`/api/formulas/${id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: (data) => {
      toast({
        title: isNewFormula ? "Fórmula creada" : "Fórmula actualizada",
        description: `La fórmula ${data.pinyinName} ha sido ${isNewFormula ? "creada" : "actualizada"} correctamente.`,
      });
      // Invalidamos la caché para recargar los datos
      queryClient.invalidateQueries({ queryKey: ["/api/formulas"] });
      // Redirigimos a la página de detalle
      navigate(`/formulas/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Ha ocurrido un error al ${isNewFormula ? "crear" : "actualizar"} la fórmula: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Maneja el envío del formulario
  const onSubmit = (data: FormulaFormValues) => {
    mutation.mutate(data);
  };

  if (isLoading && !isNewFormula) {
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
          <Button variant="ghost" size="icon" onClick={() => navigate("/formulas")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isNewFormula ? "Nueva Fórmula" : `Editar Fórmula: ${formula?.pinyinName}`}
          </h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Información General</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pinyinName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre en Pinyin</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Si Jun Zi Tang" {...field} />
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
                        <Input placeholder="Ej: 四君子汤" {...field} />
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
                        <Input placeholder="Ej: Four Gentlemen Decoction" {...field} value={field.value || ''} />
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
                          <SelectItem value="Qi Tonification Formulas">Fórmulas de Tonificación de Qi</SelectItem>
                          <SelectItem value="Blood Tonification Formulas">Fórmulas de Tonificación de Sangre</SelectItem>
                          <SelectItem value="Digestive Formulas">Fórmulas Digestivas</SelectItem>
                          <SelectItem value="Wind-cold releasing">Liberadoras de Viento-Frío</SelectItem>
                          <SelectItem value="Wind-heat clearing">Liberadoras de Viento-Calor</SelectItem>
                          <SelectItem value="Clear Heat Formulas">Fórmulas para Aclarar Calor</SelectItem>
                          <SelectItem value="Dampness Draining Formulas">Fórmulas para Drenar Humedad</SelectItem>
                          <SelectItem value="Harmonizing Formulas">Fórmulas Armonizantes</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Composición</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendComposition({ herb: "", chineseName: "", dosage: "", function: "" })}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Añadir Hierba</span>
                </Button>
              </div>

              <div className="space-y-4">
                {compositionFields.map((field, index) => (
                  <div key={field.id} className="flex flex-col gap-3 p-4 border rounded-md relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => removeComposition(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`composition.${index}.herb`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre de la Hierba</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: Ren Shen" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`composition.${index}.chineseName`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre Chino</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: 人参" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`composition.${index}.dosage`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dosificación</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: 9g" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`composition.${index}.function`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Función</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: Tonifica el Qi de Bazo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Acciones</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendAction("" as any)}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Añadir Acción</span>
                </Button>
              </div>

              <div className="space-y-3">
                {actionFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`actions.${index}`}
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
                      onClick={() => removeAction(index)}
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
              <h2 className="text-lg font-semibold mb-4">Indicaciones y Contraindicaciones</h2>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="indications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Indicaciones</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descríbelas indicaciones de la fórmula..."
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
                  name="contraindications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraindicaciones</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descríbelas contraindicaciones de la fórmula..."
                          className="min-h-[100px]"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(isNewFormula ? "/formulas" : `/formulas/${id}`)}
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