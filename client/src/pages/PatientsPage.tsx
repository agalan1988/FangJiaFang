import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users } from "lucide-react";
import Layout from "@/components/Layout";
import { Patient } from "@shared/schema";

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: patients, isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const filteredPatients = patients?.filter((patient) => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Pacientes</h1>
          <p className="text-muted-foreground">
            Gestiona la información de tus pacientes
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Nuevo Paciente</span>
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar pacientes por nombre, email, teléfono..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded-md w-full"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-md w-full"></div>
          ))}
        </div>
      ) : (
        <>
          {filteredPatients?.length === 0 ? (
            <div className="text-center py-10">
              <Users className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No se encontraron pacientes</h3>
              <p className="mt-2 text-muted-foreground">
                Intenta con otra búsqueda o añade un nuevo paciente
              </p>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Edad</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Última Visita</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients?.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">
                        <Link href={`/patients/${patient.id}`}>
                          <a className="text-primary hover:underline">
                            {patient.name}
                          </a>
                        </Link>
                      </TableCell>
                      <TableCell>{patient.age} años</TableCell>
                      <TableCell>{patient.phone}</TableCell>
                      <TableCell>{patient.email}</TableCell>
                      <TableCell>{patient.lastVisit}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/patients/${patient.id}`}>
                            <a>Ver Detalles</a>
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
