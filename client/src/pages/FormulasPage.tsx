import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FlaskRound, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Circle,
  Filter
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Formula } from "@shared/schema";

export default function FormulasPage() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [previewFormula, setPreviewFormula] = useState<any>(null);
  const [expandedActions, setExpandedActions] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>("all");
  
  // Set document title
  useEffect(() => {
    document.title = "Chinese Medicine - Formulas";
  }, []);
  
  // Query to get formulas
  const { data: formulas, isLoading } = useQuery<Formula[]>({
    queryKey: ["/api/formulas"],
    retry: 1,
  });

  // Extract unique categories from formulas
  const categories = useMemo(() => {
    if (!formulas) return [];
    const uniqueCategories = Array.from(
      new Set(
        formulas
          .map(formula => formula.category)
          .filter((category): category is string => Boolean(category))
      )
    );
    return uniqueCategories.sort();
  }, [formulas]);

  // Mutation to delete formulas
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/formulas/${id}`, { 
        method: "DELETE" 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/formulas"] });
      toast({
        title: "Formula deleted",
        description: "The formula has been successfully deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Could not delete formula: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  // Filter formulas based on search term and selected category
  const filteredFormulas = formulas?.filter((formula) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = (
      formula.pinyinName?.toLowerCase().includes(search) || 
      formula.chineseName?.toLowerCase().includes(search) ||
      (formula.category?.toLowerCase().includes(search) || false)
    );
    
    // If there's a selected category and it's not "all", filter by it
    if (selectedCategory && selectedCategory !== "all" && formula.category !== selectedCategory) {
      return false;
    }
    
    return matchesSearch;
  });

  // Handle formula deletion
  const handleDeleteFormula = (id: number) => {
    if (window.confirm("Are you sure you want to delete this formula?")) {
      deleteMutation.mutate(id);
    }
  };

  // Toggle action expansion
  const toggleAction = (index: number) => {
    setExpandedActions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Formulas Management</h1>
          <Button onClick={() => navigate("/formulas/new")}>
            <Plus className="mr-2 h-4 w-4" /> New Formula
          </Button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search formulas by name..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by category:</span>
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedCategory && selectedCategory !== "all" && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedCategory("all")}
                className="h-8 px-2"
              >
                Clear filter
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="text-center">Loading formulas...</div>
          </div>
        ) : filteredFormulas?.length === 0 ? (
          <div className="flex justify-center items-center py-10">
            <div className="text-center">No formulas found matching your search</div>
          </div>
        ) : (
          <>
            {/* Destacado de Wind-cold releasing si está seleccionada esa categoría */}
            {selectedCategory === "Wind-cold releasing" && (
              <Card className="mb-6 bg-gradient-to-r from-blue-50 to-white border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-700 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
                      <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
                      <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
                    </svg>
                    Wind-cold Releasing Formulas
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 mb-4">
                    Wind-cold releasing formulas are used to treat wind-cold invasion syndromes with symptoms 
                    such as chills, mild fever, headache, body aches, absence of sweating, and a tight or 
                    floating pulse.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <div className="border border-blue-200 rounded-md p-3 bg-white">
                      <h4 className="font-semibold text-blue-700 mb-2">Clinical Features</h4>
                      <ul className="text-sm space-y-1 text-gray-700">
                        <li>• Chills more pronounced than fever</li>
                        <li>• Absence of sweating</li>
                        <li>• Headache and body pain</li>
                        <li>• Nasal congestion with clear discharge</li>
                        <li>• Thin white tongue coating</li>
                        <li>• Tight (Jin Mai) and floating (Fu Mai) pulse</li>
                      </ul>
                    </div>
                    <div className="border border-blue-200 rounded-md p-3 bg-white">
                      <h4 className="font-semibold text-blue-700 mb-2">Treatment Principles</h4>
                      <ul className="text-sm space-y-1 text-gray-700">
                        <li>• Release the exterior</li>
                        <li>• Disperse wind-cold</li>
                        <li>• Restore Wei Qi function</li>
                        <li>• Promote controlled sweating</li>
                        <li>• Relieve symptoms such as pain and congestion</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col space-y-2">
              {filteredFormulas?.map((formula: any) => {
                const isWindColdFormula = formula.category === "Wind-cold releasing";
                return (
                  <Card 
                    key={formula.id} 
                    className={`overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${
                      isWindColdFormula ? 'border-blue-200' : ''
                    }`}
                  >
                    <CardContent className="p-0 flex items-stretch">
                      {/* Decorative sidebar */}
                      <div 
                        className={`w-1.5 self-stretch ${
                          isWindColdFormula ? 'bg-blue-500' : 'bg-primary'
                        }`}
                      ></div>
                      
                      {/* Main content */}
                      <div className="flex-grow p-2">
                        <div className="w-full flex justify-between items-center">
                          <div 
                            className="flex-grow flex flex-col w-full pr-1" 
                            onClick={() => setPreviewFormula(formula)}
                          >
                            {/* Estructura tabulada similar a hierbas */}
                            <div className="grid grid-cols-[4fr,2fr] gap-1 items-center">
                              {/* Columna 1: Nombres Pinyin, Chino y Nombre en inglés entre paréntesis */}
                              <div className="flex flex-col">
                                <div className="flex items-center overflow-hidden">
                                  <h3 className={`font-medium truncate ${isWindColdFormula ? 'text-blue-600' : 'text-primary'}`}>
                                    {formula.pinyinName}
                                  </h3>
                                  {isWindColdFormula && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 flex-shrink-0 text-blue-500">
                                      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
                                      <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
                                      <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
                                    </svg>
                                  )}
                                </div>
                                <div className="flex items-center overflow-hidden">
                                  <span className="text-sm chinese text-gray-700 truncate">{formula.chineseName}</span>
                                  {formula.englishName && (
                                    <span className="text-xs text-gray-500 italic ml-1.5 truncate">
                                      ({formula.englishName})
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Columna 3: Categoría */}
                              <div className="text-left">
                                {formula.category && (
                                  <div className={`text-xs px-1.5 py-0.5 rounded-md border border-gray-200 inline-block whitespace-nowrap max-w-full overflow-hidden truncate ${
                                    isWindColdFormula 
                                      ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                      : 'bg-gray-100 border-gray-200'
                                  }`}>
                                    {formula.category}
                                  </div>
                                )}
                              </div>

                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/formulas/${formula.id}/edit`);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFormula(formula.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* Formula preview dialog */}
        {previewFormula && (
          <Dialog open={!!previewFormula} onOpenChange={(open) => !open && setPreviewFormula(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="sticky top-0 bg-white z-10 pb-2">
                <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <div className="flex items-center flex-wrap">
                      <span className="text-xl font-bold mr-2">{previewFormula.pinyinName}</span>
                      <span className="text-lg text-gray-600 chinese">{previewFormula.chineseName}</span>
                    </div>
                    {previewFormula.englishName && (
                      <span className="text-sm italic text-gray-500 font-medium sm:ml-2 mt-1 sm:mt-0">
                        ({previewFormula.englishName})
                      </span>
                    )}
                  </div>
                  {previewFormula.category && (
                    <Badge className="ml-auto mt-2 sm:mt-0" variant="secondary">{previewFormula.category}</Badge>
                  )}
                </DialogTitle>
                <DialogDescription className="space-y-1">
                </DialogDescription>
              </DialogHeader>

              <div className="my-4 overflow-y-visible">
                {/* Composition */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Composition</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(previewFormula.composition && (typeof previewFormula.composition === 'string' 
                      ? JSON.parse(previewFormula.composition) 
                      : previewFormula.composition
                    ))?.map((herb: any, index: number) => (
                      <div key={index} className="p-2 bg-muted/20 rounded-md">
                        <div className="flex justify-between items-center">
                          <div className="font-medium text-sm">{herb.herb}</div>
                          <div className="text-xs text-gray-500 ml-2">{herb.dosage || ''}</div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-sm text-gray-500 italic">No composition information available</div>
                    )}
                  </div>
                </div>

                {/* TCM Actions */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">TCM Actions</h3>
                  <div className="space-y-2">
                    {(previewFormula.actions && (typeof previewFormula.actions === 'string' 
                      ? JSON.parse(previewFormula.actions) 
                      : previewFormula.actions
                    ))?.map((action: string, index: number) => (
                      <div 
                        key={index} 
                        className="flex items-center"
                      >
                        <Circle className="h-3 w-3 mr-2 text-primary" />
                        <div className="font-medium">{action}</div>
                      </div>
                    )) || (
                      <div className="text-sm text-gray-500 italic">No TCM actions information available</div>
                    )}
                  </div>
                </div>

                {/* Clinical Manifestations */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Clinical Manifestations</h3>
                  {previewFormula.clinicalManifestations ? (
                    <p className="text-sm">{typeof previewFormula.clinicalManifestations === 'string' ? 
                      previewFormula.clinicalManifestations.replace(/^\[""\]/, '').trim() : 
                      previewFormula.clinicalManifestations}
                    </p>
                  ) : previewFormula.indications ? (
                    <p className="text-sm">{typeof previewFormula.indications === 'string' ? 
                      previewFormula.indications.replace(/^\[""\]/, '').trim() : 
                      previewFormula.indications}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No clinical manifestations information available</p>
                  )}
                </div>
                
                {/* Clinical Applications */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Clinical Applications</h3>
                  {previewFormula.clinicalApplications ? (
                    <p className="text-sm">{previewFormula.clinicalApplications}</p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No clinical applications information available</p>
                  )}
                </div>

                {/* Contraindications */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Contraindications</h3>
                  {previewFormula.contraindications ? (
                    <p className="text-sm">{previewFormula.contraindications}</p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No contraindications information available</p>
                  )}
                </div>
                
                {/* Cautions */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Cautions</h3>
                  {previewFormula.cautions ? (
                    <p className="text-sm">{previewFormula.cautions}</p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No cautions information available</p>
                  )}
                </div>
                
                {/* Pharmacological Effects */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Pharmacological Effects</h3>
                  {previewFormula.pharmacologicalEffects ? (
                    <div className="flex flex-wrap gap-2 p-3">
                      {(typeof previewFormula.pharmacologicalEffects === 'string' 
                        ? (
                          // Si es un string, intentamos parsearlo como JSON, o lo dividimos por comas
                          (previewFormula.pharmacologicalEffects.startsWith('[') ? 
                            JSON.parse(previewFormula.pharmacologicalEffects) : 
                            previewFormula.pharmacologicalEffects.split(',')
                          )
                        ) 
                        : Array.isArray(previewFormula.pharmacologicalEffects) 
                          ? previewFormula.pharmacologicalEffects 
                          : [previewFormula.pharmacologicalEffects]
                      ).map((effect, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-50">
                          {typeof effect === 'string' ? effect.trim() : String(effect)}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No pharmacological effects information available</p>
                  )}
                </div>
                
                {/* Research */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Research</h3>
                  {previewFormula.research ? (
                    <p className="text-sm">{previewFormula.research}</p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No research information available</p>
                  )}
                </div>
                
                {/* Herb-Drug Interactions */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-base border-b pb-2 text-primary">Herb-Drug Interactions</h3>
                  {previewFormula.herbDrugInteractions ? (
                    <p className="text-sm">{previewFormula.herbDrugInteractions}</p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No herb-drug interactions information available</p>
                  )}
                </div>
              </div>

              <DialogFooter className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setPreviewFormula(null)}>
                  Close
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex items-center gap-2"
                    onClick={() => navigate(`/formulas/${previewFormula.id}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </Button>
                  <Button onClick={() => navigate(`/formulas/${previewFormula.id}`)}>
                    View Details
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
}
