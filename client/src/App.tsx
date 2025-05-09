import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import HerbsPage from "@/pages/HerbsPage";
import Herbs from "@/pages/Herbs";
import HerbDetail from "@/pages/HerbDetail";
import HerbEdit from "@/pages/HerbEdit";
import FormulasPage from "@/pages/FormulasPage";
import FormulaDetail from "@/pages/FormulaDetail";
import FormulaEdit from "@/pages/FormulaEdit";
import PatientsPage from "@/pages/PatientsPage";
import PatientDetail from "@/pages/PatientDetail";
import PrescriptionsPage from "@/pages/PrescriptionsPage";
import PrescriptionDetail from "@/pages/PrescriptionDetail";
import NewPrescriptionPage from "@/pages/NewPrescriptionPage";
import ImportExport from "@/pages/ImportExport";
import Settings from "@/pages/Settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/herbs" component={Herbs} />
      <Route path="/herbs-old" component={HerbsPage} />
      <Route path="/herbs/new" component={HerbEdit} />
      <Route path="/herbs/:id/edit" component={HerbEdit} />
      <Route path="/herbs/:id" component={HerbDetail} />
      <Route path="/formulas" component={FormulasPage} />
      <Route path="/formulas/new" component={FormulaEdit} />
      <Route path="/formulas/:id/edit" component={FormulaEdit} />
      <Route path="/formulas/:id" component={FormulaDetail} />
      <Route path="/patients" component={PatientsPage} />
      <Route path="/patients/:id" component={PatientDetail} />
      <Route path="/prescriptions" component={PrescriptionsPage} />
      <Route path="/prescriptions/new" component={NewPrescriptionPage} />
      <Route path="/prescriptions/:id" component={PrescriptionDetail} />
      <Route path="/import-export" component={ImportExport} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
