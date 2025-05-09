import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
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
import { FileText, Plus, Search } from "lucide-react";
import Layout from "@/components/Layout";
import { Prescription } from "@shared/schema";

export default function PrescriptionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [, navigate] = useLocation();
  
  const { data: prescriptions, isLoading } = useQuery<Prescription[]>({
    queryKey: ["/api/prescriptions"],
  });

  const filteredPrescriptions = prescriptions?.filter((prescription) => {
    // Si los datos no están disponibles, no filtrar
    if (!prescription.patient || !prescription.formula) return true;
    
    // Verificar si existe el campo diagnosis en el objeto
    const diagnosisText = (prescription as any).diagnosis || '';
    
    return (
      prescription.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      prescription.formula.pinyinName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diagnosisText.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Prescripciones</h1>
          <p className="text-muted-foreground">
            Gestiona las prescripciones de tus pacientes
          </p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => navigate("/prescriptions/new")}
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Prescripción</span>
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por paciente, fórmula, diagnóstico..."
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
          {filteredPrescriptions?.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No se encontraron prescripciones</h3>
              <p className="mt-2 text-muted-foreground">
                Intenta con otra búsqueda o crea una nueva prescripción
              </p>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Fórmula</TableHead>
                    <TableHead>Diagnóstico</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrescriptions?.map((prescription) => (
                    <TableRow key={prescription.id}>
                      <TableCell>{(prescription as any).date || "Sin fecha"}</TableCell>
                      <TableCell>
                        {prescription.patient && (
                          <span 
                            className="text-primary hover:underline cursor-pointer" 
                            onClick={() => navigate(`/patients/${prescription.patient.id}`)}
                          >
                            {prescription.patient.name}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {prescription.formula && (
                          <span 
                            className="text-primary hover:underline cursor-pointer"
                            onClick={() => navigate(`/formulas/${prescription.formula.id}`)}
                          >
                            {prescription.formula.pinyinName}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{(prescription as any).diagnosis || "Sin diagnóstico"}</TableCell>
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
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/prescriptions/${prescription.id}`)}
                        >
                          Ver Detalles
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
