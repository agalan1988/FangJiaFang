import { Link, useLocation } from "wouter";
import { 
  Leaf, 
  FlaskRound, 
  Users, 
  FileText, 
  LayoutDashboard, 
  Sparkles, 
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const [location] = useLocation();
  
  const handleClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="p-4">
      <nav className="space-y-2">
        <Link href="/" onClick={handleClick}>
          <a className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:text-primary",
            isActive("/") && "bg-secondary"
          )}>
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </a>
        </Link>
        <Link href="/herbs" onClick={handleClick}>
          <a className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:text-primary",
            isActive("/herbs") && "bg-secondary"
          )}>
            <Leaf className="h-5 w-5" />
            Hierbas
          </a>
        </Link>
        <Link href="/formulas" onClick={handleClick}>
          <a className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:text-primary",
            isActive("/formulas") && "bg-secondary"
          )}>
            <FlaskRound className="h-5 w-5" />
            Fórmulas
          </a>
        </Link>
        <Link href="/patients" onClick={handleClick}>
          <a className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:text-primary",
            isActive("/patients") && "bg-secondary"
          )}>
            <Users className="h-5 w-5" />
            Pacientes
          </a>
        </Link>
        <Link href="/prescriptions" onClick={handleClick}>
          <a className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:text-primary",
            isActive("/prescriptions") && "bg-secondary"
          )}>
            <FileText className="h-5 w-5" />
            Prescripciones
          </a>
        </Link>
      </nav>
      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="mb-2 text-sm font-medium">Herramientas</h3>
        <nav className="space-y-2">
          <Link href="/import-export" onClick={handleClick}>
            <a className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:text-primary",
              isActive("/import-export") && "bg-secondary"
            )}>
              <Sparkles className="h-5 w-5" />
              Importar/Exportar
            </a>
          </Link>
          <Link href="/settings" onClick={handleClick}>
            <a className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:text-primary",
              isActive("/settings") && "bg-secondary"
            )}>
              <Settings className="h-5 w-5" />
              Configuración
            </a>
          </Link>
        </nav>
      </div>
    </div>
  );
}
