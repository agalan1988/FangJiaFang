import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { ArrowLeft, Copy, Edit, Printer, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Layout from "@/components/Layout";

export default function PrescriptionDetail() {
  const { id } = useParams();
  const [_, navigate] = useLocation();

  const { data: prescription, isLoading } = useQuery({
    queryKey: ["/api/prescriptions", id],
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
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between">
                <div className="h-6 bg-muted rounded-md w-1/3"></div>
                <div className="h-6 bg-muted rounded-md w-1/4"></div>
              </div>
              <div className="h-32 bg-muted rounded-md"></div>
              <div className="h-48 bg-muted rounded-md"></div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!prescription) {
    return (
      <Layout>
        <div className="text-center py-10">
          <h3 className="mt-4 text-lg font-medium">Prescripción no encontrada</h3>
          <p className="mt-2 text-muted-foreground">
            La prescripción que estás buscando no existe o ha sido eliminada
          </p>
          <Button className="mt-4" onClick={() => navigate("/prescriptions")}>
            Volver a la lista de prescripciones
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/prescriptions")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Prescripción #{prescription.id}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            <span>Editar</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            <span>Imprimir</span>
          </Button>
          <Button className="flex items-center gap-2">
            <Share className="h-4 w-4" />
            <span>Compartir</span>
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="text-lg font-semibold mb-4">Información de la Prescripción</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="font-medium">Fecha:</div>
                  <div className="col-span-2">{prescription.date}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="font-medium">Paciente:</div>
                  <div className="col-span-2">
                    <Link href={`/patients/${prescription.patient.id}`}>
                      <a className="text-primary hover:underline">
                        {prescription.patient.name}
                      </a>
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="font-medium">Fórmula:</div>
                  <div className="col-span-2">
                    <Link href={`/formulas/${prescription.formula.id}`}>
                      <a className="text-primary hover:underline">
                        {prescription.formula.name}
                      </a>
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="font-medium">Diagnóstico:</div>
                  <div className="col-span-2">{prescription.diagnosis}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="font-medium">Estado:</div>
                  <div className="col-span-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      prescription.status === "active" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {prescription.status === "active" ? "Activa" : "Completada"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-4">Detalles del Tratamiento</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="font-medium">Duración:</div>
                  <div className="col-span-2">{prescription.duration}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="font-medium">Frecuencia:</div>
                  <div className="col-span-2">{prescription.frequency}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="font-medium">Instrucciones:</div>
                  <div className="col-span-2">{prescription.instructions}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="font-medium">Notas:</div>
                  <div className="col-span-2">{prescription.notes || "Sin notas adicionales"}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Composición de la Fórmula</h2>
          <div className="space-y-4">
            {prescription.herbs.map((herb, index) => (
              <div key={index} className="flex items-center border-b pb-3 last:border-0 last:pb-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                  <span className="text-sm">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium">
                    <Link href={`/herbs/${herb.herbId}`}>
                      <a className="text-primary hover:underline">
                        {herb.name}
                      </a>
                    </Link> ({herb.chineseName})
                  </div>
                  <div className="text-sm text-muted-foreground">{herb.function}</div>
                </div>
                <div className="text-right font-semibold">{herb.dosage}</div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <div className="flex justify-between items-center w-full">
            <div>
              <span className="text-sm text-muted-foreground">Creada por: Dr. {prescription.createdBy}</span>
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              <span>Duplicar Prescripción</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Layout>
  );
}
