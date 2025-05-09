import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { ArrowLeft, Calendar, Edit, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Layout from "@/components/Layout";

export default function PatientDetail() {
  const { id } = useParams();
  const [_, navigate] = useLocation();

  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ["/api/patients", id],
    enabled: !!id,
  });

  const { data: prescriptions, isLoading: prescriptionsLoading } = useQuery({
    queryKey: ["/api/patients", id, "prescriptions"],
    enabled: !!id,
  });

  if (patientLoading) {
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
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="h-6 bg-muted rounded-md w-1/3 mb-3"></div>
                  <div className="h-20 bg-muted rounded-md"></div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="h-6 bg-muted rounded-md w-1/3 mb-3"></div>
                  <div className="h-40 bg-muted rounded-md"></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!patient) {
    return (
      <Layout>
        <div className="text-center py-10">
          <h3 className="mt-4 text-lg font-medium">Paciente no encontrado</h3>
          <p className="mt-2 text-muted-foreground">
            El paciente que estás buscando no existe o ha sido eliminado
          </p>
          <Button className="mt-4" onClick={() => navigate("/patients")}>
            Volver a la lista de pacientes
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/patients")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{patient.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            <span>Editar</span>
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Nueva Prescripción</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="info" className="mb-6">
        <TabsList>
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="history">Historial Clínico</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescripciones</TabsTrigger>
          <TabsTrigger value="notes">Notas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold mb-3">Información Personal</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Nombre Completo</div>
                      <div>{patient.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Fecha de Nacimiento</div>
                      <div>{patient.birthDate} ({patient.age} años)</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Teléfono</div>
                      <div>{patient.phone}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div>{patient.email}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Dirección</div>
                      <div>{patient.address}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Género</div>
                      <div>{patient.gender}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Ocupación</div>
                      <div>{patient.occupation}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Estado Civil</div>
                      <div>{patient.maritalStatus}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold mb-3">Resumen</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Última Visita</div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {patient.lastVisit}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Total de Visitas</div>
                      <div className="font-medium">{patient.totalVisits}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Diagnósticos Comunes</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {patient.commonDiagnoses.map((diagnosis, index) => (
                          <span key={index} className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs">
                            {diagnosis}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Alergias</div>
                      <div className="text-red-500">{patient.allergies?.join(", ") || "Ninguna reportada"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6 mt-6">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-3">Antecedentes Médicos</h2>
              <div className="space-y-3">
                {patient.medicalHistory?.map((item, index) => (
                  <div key={index} className="pb-3 border-b last:border-0 last:pb-0">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{item.condition}</h3>
                      <span className="text-sm text-muted-foreground">{item.date}</span>
                    </div>
                    <p className="mt-1 text-sm">{item.notes}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-3">Evaluaciones Previas</h2>
              <div className="space-y-4">
                {patient.evaluations?.map((evaluation, index) => (
                  <div key={index} className="pb-4 border-b last:border-0 last:pb-0">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">{evaluation.date}</h3>
                      <span className="text-sm text-muted-foreground">Dr. {evaluation.practitioner}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <div className="text-sm text-muted-foreground">Pulso</div>
                        <div>{evaluation.pulse}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Lengua</div>
                        <div>{evaluation.tongue}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Diagnóstico</div>
                      <div>{evaluation.diagnosis}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Historial de Prescripciones</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Prescripción
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {prescriptionsLoading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded-md w-full"></div>
                  ))}
                </div>
              ) : (
                <>
                  {prescriptions?.length === 0 ? (
                    <div className="text-center py-6">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">No hay prescripciones</h3>
                      <p className="mt-2 text-muted-foreground">
                        Este paciente aún no tiene prescripciones registradas
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Fórmula</TableHead>
                          <TableHead>Diagnóstico</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {prescriptions?.map((prescription) => (
                          <TableRow key={prescription.id}>
                            <TableCell>{prescription.date}</TableCell>
                            <TableCell>
                              <Link href={`/formulas/${prescription.formula.id}`} className="text-primary hover:underline">
                                {prescription.formula.name}
                              </Link>
                            </TableCell>
                            <TableCell>{prescription.diagnosis}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                prescription.status === "active" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-gray-100 text-gray-800"
                              }`}>
                                {prescription.status === "active" ? "Activa" : "Completada"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/prescriptions/${prescription.id}`}>
                                  Ver Detalles
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-6 mt-6">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-3">Notas Clínicas</h2>
              <div className="space-y-4">
                {patient.notes?.map((note, index) => (
                  <div key={index} className="pb-4 border-b last:border-0 last:pb-0">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">{note.date}</h3>
                      <span className="text-sm text-muted-foreground">Dr. {note.author}</span>
                    </div>
                    <p>{note.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
