import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";
import { Formula } from "@shared/schema";

export default function FormulaDetail() {
  const { id } = useParams();
  const [_, navigate] = useLocation();

  const { data: formula, isLoading } = useQuery<Formula>({
    queryKey: ["/api/formulas", id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 bg-muted rounded-md"></div>
              <div className="h-8 bg-muted rounded-md w-48"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-24 bg-muted rounded-md"></div>
              <div className="h-9 w-36 bg-muted rounded-md"></div>
            </div>
          </div>
          <div className="h-10 bg-muted rounded-md w-72"></div>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="h-6 bg-muted rounded-md w-1/3 mb-3"></div>
                <div className="h-20 bg-muted rounded-md"></div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="h-6 bg-muted rounded-md w-1/3 mb-3"></div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <div className="h-10 w-10 bg-muted rounded-md"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-muted rounded-md w-1/3 mb-1"></div>
                      <div className="h-4 bg-muted rounded-md w-2/3"></div>
                    </div>
                    <div className="h-6 w-16 bg-muted rounded-md"></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  if (!formula) {
    return (
      <Layout>
        <div className="text-center py-10">
          <h3 className="mt-4 text-lg font-medium">Fórmula no encontrada</h3>
          <p className="mt-2 text-muted-foreground">
            La fórmula que estás buscando no existe o ha sido eliminada
          </p>
          <Button className="mt-4" onClick={() => navigate("/formulas")}>
            Volver a la lista de fórmulas
          </Button>
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
          <h1 className="text-2xl font-bold">{formula.pinyinName} ({formula.chineseName})</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => navigate(`/formulas/${id}/edit`)}
          >
            <Edit className="h-4 w-4" />
            <span>Editar</span>
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Crear Prescripción</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="composition" className="mb-6">
        <TabsList>
          <TabsTrigger value="composition">Composición</TabsTrigger>
          <TabsTrigger value="actions">Acciones e Indicaciones</TabsTrigger>
          <TabsTrigger value="modifications">Modificaciones</TabsTrigger>
          <TabsTrigger value="notes">Notas Clínicas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="composition" className="space-y-6 mt-6">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-3">Información General</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="font-medium">Nombre Chino:</div>
                  <div className="col-span-2">{formula.chineseName}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="font-medium">Categoría:</div>
                  <div className="col-span-2">{formula.category || 'No especificada'}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="font-medium">Método:</div>
                  <div className="col-span-2">{formula.method || 'No especificado'}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="font-medium">Fuente Clásica:</div>
                  <div className="col-span-2">{formula.source || 'No especificada'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-3">Composición</h2>
              <div className="space-y-4">
                {formula.composition && Array.isArray(formula.composition) ? (
                  formula.composition.map((herb, index) => (
                    <div key={index} className="flex items-center border-b pb-3 last:border-0 last:pb-0">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                        <span className="text-sm">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          {herb.herbId ? (
                            <a 
                              href={`/herbs/${herb.herbId}`} 
                              className="text-primary hover:underline"
                            >
                              {herb.herb}
                            </a>
                          ) : (
                            <span>{herb.herb}</span>
                          )} 
                          {herb.chineseName && ` (${herb.chineseName})`}
                        </div>
                        {herb.function && <div className="text-sm text-muted-foreground">{herb.function}</div>}
                      </div>
                      <div className="text-right font-semibold">{herb.dosage || ''}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">Sin datos de composición disponibles</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-3">Preparación</h2>
              {formula.preparation ? (
                <p>{formula.preparation}</p>
              ) : (
                <p className="text-muted-foreground italic">Sin instrucciones de preparación disponibles</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6 mt-6">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-3">Acciones</h2>
              <div className="space-y-2">
                {formula.actions && Array.isArray(formula.actions) && formula.actions.length > 0 ? (
                  formula.actions.map((action, index) => (
                    <p key={index}>• {action}</p>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">Sin acciones disponibles</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-3">Indicaciones</h2>
              <div className="space-y-2">
                {formula.indications && Array.isArray(formula.indications) && formula.indications.length > 0 ? (
                  formula.indications.map((indication, index) => (
                    <p key={index}>• {indication}</p>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">Sin indicaciones disponibles</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-3">Contraindicaciones</h2>
              <div className="space-y-2">
                {formula.contraindications && Array.isArray(formula.contraindications) && formula.contraindications.length > 0 ? (
                  formula.contraindications.map((contraindication, index) => (
                    <p key={index}>• {contraindication}</p>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">Sin contraindicaciones disponibles</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modifications" className="space-y-6 mt-6">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-3">Modificaciones Comunes</h2>
              <div className="space-y-4">
                {formula.modifications && Array.isArray(formula.modifications) && formula.modifications.length > 0 ? (
                  formula.modifications.map((mod, index) => (
                    <div key={index} className="pb-3 border-b last:border-0 last:pb-0">
                      <h3 className="font-medium mb-2">{mod.condition}</h3>
                      <div className="pl-4 space-y-1">
                        {mod.changes && Array.isArray(mod.changes) && mod.changes.map((change, idx) => (
                          <p key={idx}>• {change}</p>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">Sin modificaciones disponibles</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-6 mt-6">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-3">Notas Clínicas</h2>
              <div className="space-y-3">
                {formula.clinicalNotes ? (
                  <p>{formula.clinicalNotes}</p>
                ) : (
                  <p className="text-muted-foreground italic">Sin notas clínicas disponibles</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-3">Referencias</h2>
              <div className="text-sm space-y-1">
                {formula.references && Array.isArray(formula.references) && formula.references.length > 0 ? (
                  formula.references.map((reference, index) => (
                    <p key={index}>• {reference}</p>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">Sin referencias disponibles</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
