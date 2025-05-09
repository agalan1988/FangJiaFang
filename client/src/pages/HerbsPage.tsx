import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Leaf, Plus, Search } from "lucide-react";
import Layout from "@/components/Layout";
import { Herb } from "@shared/schema";

export default function HerbsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: herbs, isLoading } = useQuery<Herb[]>({
    queryKey: ["/api/herbs"],
  });

  const filteredHerbs = herbs?.filter((herb) => 
    (herb.pinyinName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
    (herb.chineseName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (herb.latinName?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Hierbas</h1>
          <p className="text-muted-foreground">
            Gestiona y explora la base de datos de hierbas medicinales chinas
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Nueva Hierba</span>
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar hierbas por nombre, propiedad..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-6 bg-muted rounded-md w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded-md w-2/4 mb-2"></div>
                <div className="h-4 bg-muted rounded-md w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredHerbs?.map((herb) => (
            <Link key={herb.id} href={`/herbs/${herb.id}`}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Leaf className="h-4 w-4 mr-2 text-primary" />
                    {herb.pinyinName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-1">
                    <span className="font-semibold">Chino:</span> {herb.chineseName}
                  </p>
                  <p className="text-sm mb-1">
                    <span className="font-semibold">Latín:</span> {herb.latinName}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Categoría:</span> {herb.category}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {filteredHerbs?.length === 0 && !isLoading && (
        <div className="text-center py-10">
          <Leaf className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No se encontraron hierbas</h3>
          <p className="mt-2 text-muted-foreground">
            Intenta con otra búsqueda o añade una nueva hierba
          </p>
        </div>
      )}
    </Layout>
  );
}
