import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Cpu, Database, Server, Zap, Play, Activity, Clock, Award, ShieldCheck,
  ArrowRight, FileText, CheckCircle, Calendar, RefreshCw
} from "lucide-react";
import { SapUser, ProductionOrder } from "../types";

interface WelcomeViewProps {
  user: SapUser;
  theme: "dark" | "light";
  onNavigateToFabrication: () => void;
}

export default function WelcomeView({ user, theme, onNavigateToFabrication }: WelcomeViewProps) {
  const isDark = theme === "dark";

  // Theming classes
  const cTitle = isDark ? "text-slate-100" : "text-slate-900";
  const cSubtitle = isDark ? "text-slate-400" : "text-slate-600";
  const cCard = isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200/80 shadow-sm";
  const cCardHeader = isDark ? "text-white" : "text-slate-800";
  const cValue = isDark ? "text-teal-400" : "text-teal-600";
  const cStatusBg = isDark ? "bg-slate-950/60" : "bg-slate-50";
  const cGridLabel = isDark ? "text-slate-500" : "text-slate-400";
  const cGridVal = isDark ? "text-slate-200" : "text-slate-800";

  type FilterType = "hoy" | "ayer" | "semana" | "mes" | "ultimos7" | "ultimos15" | "ultimos30";
  const [activeFilter, setActiveFilter] = useState<FilterType>("hoy");
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Helper to format date as YYYY-MM-DD
  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getFilterDates = (filter: FilterType): { startDate: string, endDate: string } => {
    const today = new Date();
    const end = new Date(today);
    const start = new Date(today);

    switch (filter) {
      case "hoy":
        break;
      case "ayer":
        start.setDate(today.getDate() - 1);
        end.setDate(today.getDate() - 1);
        break;
      case "semana":
        const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
        start.setDate(today.getDate() - currentDay); // Go back to Sunday
        break;
      case "mes":
        start.setDate(1); // 1st of the current month
        break;
      case "ultimos7":
        start.setDate(today.getDate() - 7);
        break;
      case "ultimos15":
        start.setDate(today.getDate() - 15);
        break;
      case "ultimos30":
        start.setDate(today.getDate() - 30);
        break;
    }
    return { startDate: formatDate(start), endDate: formatDate(end) };
  };

  const fetchMetrics = async (filter: FilterType) => {
    setIsLoading(true);
    try {
      const { startDate, endDate } = getFilterDates(filter);

      // Use the original endpoint for single days (hoy, ayer), and the new range endpoint for ranges
      let endpoint = `/api/sap/production-orders?date=${startDate}&schema=${user.BD}`;

      if (filter !== "hoy" && filter !== "ayer") {
        endpoint = `/api/sap/production-orders-range?startDate=${startDate}&endDate=${endDate}&schema=${user.BD}`;
      }

      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching metrics:", err);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics(activeFilter);
  }, [activeFilter, user.BD]);

  const activeOrders = orders.filter(o => o.Status !== "Closed");
  const closedOrders = orders.filter(o => o.Status === "Closed").length;
  const countLiberadas = activeOrders.filter(o => o.Status === "Released").length;
  const countPlanificadas = activeOrders.filter(o => o.Status === "Planned").length;
  const totalActivas = activeOrders.length;

  // Real calculations for metrics
  let totalProducido = 0;
  let totalPlanificado = 0;
  let totalComponentesEntregados = 0;

  orders.forEach(order => {
    totalProducido += order.CompletedQty || 0;
    totalPlanificado += order.PlannedQty || 0;

    if (order.Components && Array.isArray(order.Components)) {
      order.Components.forEach(comp => {
        // Exclude packaging materials (starting with ETI or BOL)
        const isPackaging = comp.ItemCode.startsWith("ETI") || comp.ItemCode.startsWith("BOL");
        if (!isPackaging) {
          totalComponentesEntregados += comp.IssuedQty || 0;
        }
      });
    }
  });

  const efficiencyPct = totalPlanificado > 0 ? (totalProducido / totalPlanificado) * 100 : 0;
  const efficiencyValue = orders.length > 0 ? `${efficiencyPct.toFixed(1)}%` : "0.0%";
  const efficiencyWidth = orders.length > 0 ? `${Math.min(100, efficiencyPct)}%` : "0%";

  const yieldPct = totalComponentesEntregados > 0 ? (totalProducido / totalComponentesEntregados) * 100 : 0;
  const mermaValue = orders.length > 0 ? `${yieldPct.toFixed(1)}%` : "0.0%";
  const yieldWidth = orders.length > 0 ? `${Math.min(100, yieldPct)}%` : "0%";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex-1 p-6 space-y-6 overflow-y-auto"
    >
      {/* Welcome Hero Card */}
      <div className={`rounded-3xl p-6 md:p-8 border relative overflow-hidden transition-colors duration-150 ${cCard}`}>
        {/* Abstract absolute glowing effects in dark mode */}
        {isDark && (
          <>
            <div className="absolute top-[-20%] right-[-10%] w-[350px] h-[350px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-30%] left-[-10%] w-[300px] h-[300px] bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />
          </>
        )}

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            {/* <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider border transition-colors ${
                isDark ? "bg-teal-500/10 border-teal-500/30 text-teal-400" : "bg-teal-50 border-teal-200 text-teal-700"
              }`}>
                WORKSPACE GENERAL
              </span>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono border transition-colors ${
                isDark ? "bg-slate-950 text-slate-500 border-slate-850" : "bg-slate-100 text-slate-500 border-slate-200"
              }`}>
                Versión 1.2.0-LTS
              </span>
            </div> */}

            <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tight transition ${cTitle}`}>
              Tandem<span className="text-teal-500">PRO      </span>   Panel de control
            </h1>

            <p className={`text-sm max-w-2xl leading-relaxed transition ${cSubtitle}`}>
              Le damos la bienvenida, <strong className={isDark ? "text-white" : "text-slate-800"}>{user.username}</strong>.
              Este es el centro operativo integrado con SAP Business One.
              Abajo se presenta un resumen ejecutivo de las métricas de hoy.
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={onNavigateToFabrication}
              className={`px-5 py-3 rounded-2xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${isDark
                ? "bg-teal-500 hover:bg-teal-400 text-slate-950 hover:shadow-[0_0_20px_rgba(20,184,166,0.2)]"
                : "bg-teal-600 hover:bg-teal-500 text-white hover:shadow-md"
                }`}
            >
              <Play className="h-4 w-4 fill-current" />
              <span>IR A MÓDULO DE FABRICACIÓN</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2 snap-x hide-scrollbar">
        {[
          { id: "hoy", label: "Hoy" },
          { id: "ayer", label: "Ayer" },
          { id: "semana", label: "Semana Actual" },
          { id: "mes", label: "Mes Actual" },
          { id: "ultimos7", label: "Últ. 7 días" },
          { id: "ultimos15", label: "Últ. 15 días" },
          { id: "ultimos30", label: "Últ. 30 días" },
        ].map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as FilterType)}
              className={`whitespace-nowrap snap-center px-4 py-1.5 rounded-full text-[11px] font-mono font-bold transition-all duration-200 border ${isActive
                ? isDark
                  ? "bg-teal-500/20 border-teal-500 text-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.15)]"
                  : "bg-teal-500 text-white border-teal-600 shadow-md"
                : isDark
                  ? "bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-teal-600"
                }`}
            >
              {filter.label}
            </button>
          );
        })}
        {isLoading && <RefreshCw className="h-4 w-4 text-teal-500 animate-spin ml-2" />}
      </div>

      {/* Main Stats Bento-Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Bento Card 1: Live Efficiency */}
        <div className={`rounded-2xl p-5 border flex flex-col justify-between h-[200px] transition-all ${cCard}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2 ${cCardHeader}`}>
              <Activity className={`h-4 w-4 ${isDark ? "text-teal-400" : "text-teal-600"}`} /> Eficiencia de Planta
            </h3>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${isDark ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700"
              }`}>
              ÓPTIMO
            </span>
          </div>

          <div className="my-3">
            <div className={`text-4xl font-black font-mono tracking-tight ${cValue}`}>
              {orders.length > 0 ? efficiencyValue : "0.0%"}
            </div>
            <p className={`text-[11px] mt-1 ${cSubtitle}`}>
              {/* {orders.length > 0 ? `Calculado en base a ${user.SucursalName} vs receta SAP.` : "No hay órdenes para calcular la eficiencia."} */}
              {orders.length > 0 ? `Calculado en base a lo producido vs lo planificado SAP.` : "No hay órdenes para calcular la eficiencia."}

            </p>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-950 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-emerald-500 h-1.5 rounded-full" style={{ width: efficiencyWidth }} />
          </div>
        </div>

        {/* Bento Card 2: Active Orders Summary */}
        <div className={`rounded-2xl p-5 border flex flex-col justify-between h-[200px] transition-all ${cCard}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2 ${cCardHeader}`}>
              <Database className={`h-4 w-4 ${isDark ? "text-sky-400" : "text-sky-600"}`} /> Órdenes Abiertas SAP
            </h3>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${isDark ? "bg-sky-500/10 border-sky-500/20 text-sky-400" : "bg-sky-50 border-sky-200 text-sky-700"
              }`}>
              OWOR
            </span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <div className={`text-4xl font-black font-mono tracking-tight ${cValue}`}>
              {totalActivas}
            </div>
            <span className={`text-xs ${cSubtitle}`}>Órdenes en período</span>
          </div>

          <div className={`grid grid-cols-3 gap-2 text-[10px] font-mono p-2.5 rounded-lg border transition ${cStatusBg}`}>
            <div className="flex justify-between">
              <span className={cGridLabel}>Liberadas:</span>
              <span className="font-bold text-emerald-500">{countLiberadas}</span>
            </div>
            <div className="flex justify-between">
              <span className={cGridLabel}>Planificadas:</span>
              <span className="font-bold text-amber-500">{countPlanificadas}</span>
            </div>
            <div className="flex justify-between">
              <span className={cGridLabel}>Cerradas:</span>
              <span className="font-bold text-sky-500">{closedOrders}</span>
            </div>
          </div>
        </div>

        {/* Bento Card 3: Merma Index */}
        <div className={`rounded-2xl p-5 border flex flex-col justify-between h-[200px] transition-all ${cCard}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2 ${cCardHeader}`}>
              <Award className={`h-4 w-4 ${isDark ? "text-amber-400" : "text-amber-600"}`} /> RENDIMIENTO DE PRODUCCIÓN
            </h3>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${isDark ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-700"
              }`}>
              IA CALIBRADO
            </span>
          </div>

          <div className="my-3">
            <div className={`text-4xl font-black font-mono tracking-tight ${cValue}`}>
              {orders.length > 0 ? mermaValue : "0.0%"}
            </div>
            <p className={`text-[11px] mt-1 ${cSubtitle}`}>
              {orders.length > 0 ? "Desviación entre productos terminados y lo entregado." : "Sin datos de mermas en este período."}
            </p>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-950 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-amber-500 h-1.5 rounded-full" style={{ width: yieldWidth }} />
          </div>
        </div>

      </div>

      {/* Info & Services Connection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Connection logs and credentials info */}
        <div className="lg:col-span-8 space-y-6">
          <div className={`rounded-2xl p-6 border transition-all ${cCard}`}>
            <h2 className={`text-sm font-bold uppercase tracking-wider font-mono flex items-center gap-2 mb-4 ${cCardHeader}`}>
              <ShieldCheck className="text-emerald-500 h-5 w-5" /> Estado de Conexión del Sistema
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Service 1: SAP Service Layer */}
              <div className={`p-4 rounded-xl border transition ${cStatusBg}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">SAP SERVICE LAYER</span>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
                <div className={`text-xs font-mono font-bold ${cGridVal}`}>CONECTADO</div>
                <p className="text-[10px] text-slate-500 mt-1">Schema: {user.BD}</p>
              </div>

              {/* Service 2: Scales Web Service */}
              <div className={`p-4 rounded-xl border transition ${cStatusBg}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">WS BALANZAS PLANTA</span>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
                <div className={`text-xs font-mono font-bold ${cGridVal}`}>EN LÍNEA (WS API)</div>
                <p className="text-[10px] text-slate-500 mt-1">Puerto: TCP/8081</p>
              </div>

              {/* Service 3: Gemini AI Engine */}
              <div className={`p-4 rounded-xl border transition ${cStatusBg}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">GEMINI PRO AI ENGINE</span>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
                <div className={`text-xs font-mono font-bold ${cGridVal}`}>LISTO (2.5 FLASH)</div>
                <p className="text-[10px] text-slate-500 mt-1">Optimización de mermas</p>
              </div>

            </div>

            <div className={`mt-5 p-4 rounded-xl border border-dashed text-xs font-mono space-y-1.5 transition ${isDark ? "border-slate-800 bg-slate-950/20 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-500"
              }`}>
              <div className={`font-bold uppercase text-[10px] tracking-wider mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Información de Sesión de Usuario:
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>Usuario SAP: <strong className={isDark ? "text-slate-300" : "text-slate-700"}>{user.username}</strong></div>
                <div>Departamento: <strong className={isDark ? "text-slate-300" : "text-slate-700"}>{user.Departamento}</strong></div>
                <div>Sucursal: <strong className={isDark ? "text-slate-300" : "text-slate-700"}>{user.SucursalName}</strong></div>
                <div className="truncate">SessionID: <strong className={isDark ? "text-slate-300" : "text-slate-700"}>{user.SessionID.substring(0, 20)}...</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: User notifications or Quick updates */}
        <div className="lg:col-span-4 space-y-6">
          <div className={`rounded-2xl p-6 border flex flex-col justify-between h-full transition-all ${cCard}`}>
            <div>
              <h2 className={`text-sm font-bold uppercase tracking-wider font-mono flex items-center gap-2 mb-4 ${cCardHeader}`}>
                <Clock className="h-4 w-4 text-slate-400" /> Próximas Funciones
              </h2>
              <div className="space-y-3.5">
                <div className="flex gap-3 items-start">
                  <div className={`p-1.5 rounded-lg border shrink-0 ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <Activity className="h-3.5 w-3.5 text-teal-500" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${cCardHeader}`}>Indicadores en Tiempo Real</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Gráficas de efectividad de operario directo desde básculas.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className={`p-1.5 rounded-lg border shrink-0 ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <FileText className="h-3.5 w-3.5 text-sky-500" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${cCardHeader}`}>Reportes Automatizados</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Exportación de consumos y mermas a PDF y Excel directo por correo.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className={`p-1.5 rounded-lg border shrink-0 ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${cCardHeader}`}>Firma Digital de Consumo</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Aprobaciones biométricas y de supervisor integradas con SAP.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-850 text-[10px] text-slate-500 text-center font-mono">
              TandemPRO v1.2.0 • SAP B1 10.0 PL02 (HANA)
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
