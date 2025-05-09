import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Save, User } from "lucide-react";
import Layout from "@/components/Layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Settings() {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  const handleSave = () => {
    setSaveStatus('saving');
    
    // Simulate saving
    setTimeout(() => {
      setSaveStatus('success');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }, 1000);
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Configuración</h1>
        <p className="text-muted-foreground">
          Administra las preferencias y configuración del sistema
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="account">Cuenta</TabsTrigger>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>
                Configura los parámetros generales del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="clinic-name">Nombre de la Clínica</Label>
                <Input id="clinic-name" defaultValue="Centro de Medicina China" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="default-language">Idioma Predeterminado</Label>
                <Select defaultValue="es">
                  <SelectTrigger id="default-language">
                    <SelectValue placeholder="Seleccionar idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">Inglés</SelectItem>
                    <SelectItem value="zh">Chino</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-format">Formato de Fecha</Label>
                <Select defaultValue="dd/mm/yyyy">
                  <SelectTrigger id="date-format">
                    <SelectValue placeholder="Seleccionar formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/mm/yyyy">DD/MM/AAAA</SelectItem>
                    <SelectItem value="mm/dd/yyyy">MM/DD/AAAA</SelectItem>
                    <SelectItem value="yyyy-mm-dd">AAAA-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-save">Guardado Automático</Label>
                  <p className="text-sm text-muted-foreground">
                    Guarda automáticamente los cambios en formularios
                  </p>
                </div>
                <Switch id="auto-save" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="confirm-actions">Confirmar Acciones Importantes</Label>
                  <p className="text-sm text-muted-foreground">
                    Solicitar confirmación para acciones como eliminar o editar
                  </p>
                </div>
                <Switch id="confirm-actions" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información del Usuario</CardTitle>
              <CardDescription>
                Actualiza tu información personal y credenciales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <p className="font-medium">Dr. López</p>
                  <p className="text-sm text-muted-foreground">Medicina Tradicional China</p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto">
                  Cambiar Foto
                </Button>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullname">Nombre Completo</Label>
                  <Input id="fullname" defaultValue="Dr. Manuel López" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" type="email" defaultValue="dr.lopez@medicinachina.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="specialization">Especialización</Label>
                  <Input id="specialization" defaultValue="Medicina Tradicional China" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" defaultValue="+34 612 345 678" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Cambiar Contraseña</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Contraseña Actual</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nueva Contraseña</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Apariencia</CardTitle>
              <CardDescription>
                Personaliza la apariencia visual del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Tema</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border rounded-md p-3 cursor-pointer flex flex-col items-center space-y-2 bg-white">
                    <div className="h-20 w-full rounded bg-white border"></div>
                    <div className="text-sm font-medium">Claro</div>
                  </div>
                  <div className="border rounded-md p-3 cursor-pointer flex flex-col items-center space-y-2 bg-gray-950">
                    <div className="h-20 w-full rounded bg-gray-900 border border-gray-800"></div>
                    <div className="text-sm font-medium text-white">Oscuro</div>
                  </div>
                  <div className="border rounded-md p-3 cursor-pointer flex flex-col items-center space-y-2">
                    <div className="h-20 w-full rounded bg-gradient-to-b from-white to-gray-950"></div>
                    <div className="text-sm font-medium">Sistema</div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Color Principal</Label>
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-blue-500 cursor-pointer flex items-center justify-center ring-2 ring-offset-2 ring-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-teal-500 cursor-pointer"></div>
                  <div className="h-8 w-8 rounded-full bg-purple-500 cursor-pointer"></div>
                  <div className="h-8 w-8 rounded-full bg-amber-500 cursor-pointer"></div>
                  <div className="h-8 w-8 rounded-full bg-red-500 cursor-pointer"></div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="animations">Animaciones</Label>
                  <p className="text-sm text-muted-foreground">
                    Habilitar animaciones en la interfaz
                  </p>
                </div>
                <Switch id="animations" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="compact-mode">Modo Compacto</Label>
                  <p className="text-sm text-muted-foreground">
                    Reduce el espaciado para mostrar más contenido
                  </p>
                </div>
                <Switch id="compact-mode" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>
                Configura las preferencias de notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Notificaciones en la Aplicación</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="new-prescriptions">Nuevas Prescripciones</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe notificaciones cuando se creen nuevas prescripciones
                    </p>
                  </div>
                  <Switch id="new-prescriptions" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="patient-updates">Actualizaciones de Pacientes</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe notificaciones cuando se actualicen datos de pacientes
                    </p>
                  </div>
                  <Switch id="patient-updates" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="formula-changes">Cambios en Fórmulas</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe notificaciones cuando se modifiquen fórmulas
                    </p>
                  </div>
                  <Switch id="formula-changes" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Notificaciones por Correo</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-summary">Resumen Diario</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe un resumen diario de la actividad
                    </p>
                  </div>
                  <Switch id="email-summary" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-appointments">Citas Programadas</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe notificaciones sobre citas próximas
                    </p>
                  </div>
                  <Switch id="email-appointments" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-6">
        {saveStatus === 'success' && (
          <Alert className="max-w-md mr-4 bg-green-50 border-green-200">
            <AlertTitle className="text-green-800">Cambios guardados</AlertTitle>
            <AlertDescription className="text-green-700">
              La configuración se ha actualizado correctamente.
            </AlertDescription>
          </Alert>
        )}
        
        {saveStatus === 'error' && (
          <Alert variant="destructive" className="max-w-md mr-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error al guardar</AlertTitle>
            <AlertDescription>
              Ocurrió un error al guardar la configuración.
            </AlertDescription>
          </Alert>
        )}
        
        <Button onClick={handleSave} disabled={saveStatus === 'saving'}>
          <Save className="mr-2 h-4 w-4" />
          {saveStatus === 'saving' ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </Layout>
  );
}
