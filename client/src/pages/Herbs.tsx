import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Search, Plus, Upload } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import HerbPreview from "@/components/HerbPreview";
import HerbImporter from "@/components/HerbImporter";
import { Herb } from "@shared/schema";

export default function Herbs() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [previewHerb, setPreviewHerb] = useState<any>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // Fetch herbs data
  const { data: herbs, isLoading } = useQuery<Herb[]>({
    queryKey: ["/api/herbs"],
    retry: 1,
  });

  // Delete herb mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/herbs/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/herbs"] });
      toast({
        title: "Hierba eliminada",
        description: "La hierba ha sido eliminada correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar la hierba: ${error.message || "Error desconocido"}`,
        variant: "destructive",
      });
    },
  });

  // Filter herbs based on search term
  const filteredHerbs = herbs?.filter((herb: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      herb.pinyinName?.toLowerCase().includes(searchLower) ||
      herb.chineseName?.toLowerCase().includes(searchLower) ||
      herb.englishName?.toLowerCase().includes(searchLower) ||
      herb.latinName?.toLowerCase().includes(searchLower)
    );
  });

  // Helper function to get the color class based on herb nature
  const getNatureColor = (nature: string | null) => {
    const natureLower = nature?.toLowerCase() || "";
    if (natureLower.includes("caliente") || natureLower.includes("hot")) {
      return "bg-red-600";
    } else if (natureLower.includes("tibia") || natureLower.includes("warm")) {
      return "bg-orange-400";
    } else if (natureLower.includes("neutral") || natureLower.includes("neutra")) {
      return "bg-gray-400";
    } else if (natureLower.includes("fresca") || natureLower.includes("cool")) {
      return "bg-blue-300";
    } else if (natureLower.includes("fría") || natureLower.includes("cold")) {
      return "bg-blue-600";
    }
    return "bg-primary";
  };

  const handleEditHerb = (id: number) => {
    navigate(`/herbs/${id}/edit`);
  };
  
  // Función para eliminar una hierba
  const handleDeleteHerb = (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta hierba? Esta acción no se puede deshacer.")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestión de Hierbas</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setImportDialogOpen(true)}
            >
              <Upload className="mr-2 h-4 w-4" /> Importar
            </Button>
            <Button onClick={() => navigate("/herbs/new")}>
              <Plus className="mr-2 h-4 w-4" /> Nueva Hierba
            </Button>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar hierbas por nombre..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="text-center">Cargando hierbas...</div>
          </div>
        ) : filteredHerbs?.length === 0 ? (
          <div className="flex justify-center items-center py-10">
            <div className="text-center">No se encontraron hierbas que coincidan con la búsqueda</div>
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            {filteredHerbs?.map((herb: any) => (
              <Card key={herb.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-0 flex items-stretch">
                  {/* Barra lateral decorativa con el color de la naturaleza */}
                  <div className={`${getNatureColor(herb.nature)} w-1.5 self-stretch`}></div>
                  
                  {/* Contenido principal */}
                  <div className="flex-grow p-2">
                    <div className="w-full flex justify-between items-center">
                      <div 
                        className="flex-grow flex flex-col w-full pr-1" 
                        onClick={() => setPreviewHerb(herb)}
                      >
                        {/* Estructura de información principal */}
                        <div className="flex flex-col w-full">
                          {/* Fila 1: Nombre en pinyin y características tabuladas */}
                          <div className="grid grid-cols-[1.5fr,1fr,1fr,1fr] gap-1 items-center mb-1">
                            {/* Nombre en pinyin */}
                            <div className="overflow-hidden">
                              <h3 className="font-medium text-primary truncate pr-1">{herb.pinyinName}</h3>
                            </div>
                            
                            {/* Categoría/Grupo */}
                            <div className="overflow-hidden truncate">
                              {herb.category ? (
                                <span className="text-xs font-medium px-1.5 py-0.5 rounded-md border border-gray-200 inline-block whitespace-nowrap overflow-hidden truncate bg-gray-100 max-w-full">
                                  {herb.category}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </div>
                            
                            {/* Sabor */}
                            <div className="overflow-hidden truncate">
                              {herb.flavor ? (
                                <span className="text-xs font-medium px-1.5 py-0.5 rounded-md border border-blue-100 inline-block whitespace-nowrap overflow-hidden truncate bg-blue-50 text-blue-700 max-w-full">
                                  {herb.flavor}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </div>
                            
                            {/* Tropismo (Meridianos) */}
                            <div className="overflow-hidden truncate">
                              {Array.isArray(herb.meridians) && herb.meridians.length > 0 ? (
                                <span className="text-xs font-medium px-1.5 py-0.5 rounded-md border border-green-100 inline-block whitespace-nowrap overflow-hidden truncate bg-green-50 text-green-700 max-w-full">
                                  {herb.meridians.slice(0, 2).join(', ')}{herb.meridians.length > 2 ? '...' : ''}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Fila 2: Nombre chino y latín */}
                          <div className="flex items-center overflow-hidden">
                            <span className="text-sm chinese text-gray-700 truncate">{herb.chineseName}</span>
                            {herb.latinName && (
                              <span className="text-xs text-gray-500 italic ml-1.5 truncate">
                                ({herb.latinName})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Acciones */}
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => navigate(`/herbs/${herb.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteHerb(herb.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Utilizar el componente HerbPreview para mostrar detalles */}
        {previewHerb && (
          <HerbPreview 
            herb={previewHerb} 
            isOpen={!!previewHerb} 
            onClose={() => setPreviewHerb(null)}
            onEdit={handleEditHerb}
          />
        )}
        
        {/* Componente para importar hierbas */}
        <HerbImporter 
          isOpen={importDialogOpen} 
          onClose={() => setImportDialogOpen(false)} 
        />
      </div>
    </Layout>
  );
}