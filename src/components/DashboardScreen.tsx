import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Database, Server, Cpu, Play, CheckCircle, AlertTriangle, FileText,
  Terminal, ShieldCheck, LogOut, RefreshCw, BarChart2, Award, Zap,
  Layers, Package, Check, Clipboard, HelpCircle, FileSpreadsheet, Calendar,
  Sun, Moon, Home, ChevronDown, ChevronRight, Menu, X, Edit, Loader2
} from "lucide-react";
import { SapUser, ProductionOrder, LogEntry, AiOptimizationResult } from "../types";
import WelcomeView from "./WelcomeView";

// UDF options mappings for displaying and editing
export const UdfMaps = {
  Proceso: {
    "1": "En Linea",
    "2": "Concluido"
  },
  TipoProducto: {
    "N": "Ninguno",
    "L": "Linea",
    "E": "Especifico",
    "R": "Reproceso"
  },
  Presentacion: {
    "H": "Harinado",
    "P": "Peletizado"
  },
  TamMatriz: {
    "0": "Ninguno",
    "4,5": "4,5",
    "6": "6"
  },
  MallaMolino: {
    "-": "-",
    "2": "2",
    "3": "3",
    "4,5": "4,5",
    "6": "6",
    "1,5": "1,5"
  },
  LineProduccion: {
    "1": "Linea 1",
    "2": "Linea 2",
    "3": "Linea 3",
    "4": "Linea 4"
  },
  Etiqueta: {
    "BLANCO": "Blanco",
    "ROSADO": "Rosado",
    "NARANJA": "Naranja",
    "VERDE": "Verde",
    "AZUL": "Azul",
    "AMARILLO": "Amarillo"
  },
  Programacion: {
    "PLANIFICADO": "Planificado",
    "ADELANTADO": "Adelantado",
    "NOPLANIFICADO": "NOPLANIFICADO"
  },
  Negocio: {
    "GRA": "Granusa",
    "PRY": "Pryme",
    "FDL": "Feed Lot"
  },
  U_PRIORIDAD: {
    "N": "Normal",
    "A": "Alta"
  }
};

const getUdfDisplay = (field: keyof typeof UdfMaps, value: string | undefined) => {
  if (!value) return "—";
  const map = UdfMaps[field];
  return (map as any)[value] || value;
};

const formatHour = (hour: string | undefined) => {
  if (!hour) return "—";
  const clean = hour.replace(":", "").trim();
  if (clean.length === 4) {
    return `${clean.substring(0, 2)}:${clean.substring(2, 4)}`;
  }
  return hour;
};

const formatDecimal = (num: number | undefined) => {
  if (num === undefined || num === null) return "—";
  return num.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

interface DashboardScreenProps {
  user: SapUser;
  onLogout: () => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
}

export default function DashboardScreen({ user, onLogout, theme, toggleTheme }: DashboardScreenProps) {
  const isDark = theme === "dark";

  // Dynamic CSS helper classes for perfect theming
  const cBg = isDark ? "bg-slate-950 text-slate-100" : "bg-[#f4f7fa] text-slate-800";
  const cHeader = isDark ? "bg-slate-900 border-b border-slate-800" : "bg-white border-b border-slate-200/80 shadow-xs";
  const cHeaderTitle = isDark ? "text-white" : "text-slate-900 font-extrabold";
  const cHeaderSpan = isDark ? "border-slate-700 bg-slate-950 text-slate-400" : "border-slate-200 bg-slate-100 text-slate-600 font-medium";
  const cHeaderSubtitle = isDark ? "text-slate-400 font-mono" : "text-slate-500 font-mono";

  const cSessionBox = isDark ? "bg-slate-950 border border-slate-800/80 text-slate-200" : "bg-[#f8fafc] border border-slate-200 text-slate-600 shadow-2xs";
  const cSessionTitle = isDark ? "text-slate-400" : "text-slate-400 font-semibold";
  const cSessionText = isDark ? "text-slate-200" : "text-slate-700 font-medium";

  const cUserBox = isDark ? "bg-slate-950 border border-slate-800/80" : "bg-white border border-slate-200 shadow-2xs";
  const cAvatar = isDark ? "bg-teal-500/10 border-teal-500/30 text-teal-400" : "bg-teal-50 border-teal-200 text-teal-600 font-bold";
  const cUserTitle = isDark ? "text-white" : "text-slate-800 font-bold";
  const cUserSub = isDark ? "text-slate-500" : "text-slate-400 font-medium";

  const cLogoutBtn = isDark
    ? "bg-slate-800/60 border-slate-700/60 hover:bg-red-500/10 hover:border-red-500/30 text-slate-400 hover:text-red-400"
    : "bg-slate-100 border-slate-200/80 hover:bg-red-50 hover:border-red-100 text-slate-600 hover:text-red-600 shadow-2xs";

  // Card & Card Items
  const cCard = isDark ? "bg-slate-900 border border-slate-800 shadow-md" : "bg-white border border-slate-200 shadow-sm";
  const cCardTitle = isDark ? "text-white font-bold" : "text-slate-800 font-extrabold";
  const cCardSubtitle = isDark ? "text-slate-400 font-mono" : "text-slate-500 font-mono";
  const cCardHeaderBorder = isDark ? "border-b border-slate-800" : "border-b border-slate-100";
  const cDatePicker = isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100";
  const cDatePickerBtn = isDark ? "bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800" : "bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 border-slate-200 shadow-2xs";

  // List rows
  const cOrderUnselected = isDark ? "bg-slate-950/40 border-slate-800/80 hover:bg-slate-950/80 hover:border-slate-700 text-slate-300" : "bg-slate-50/50 border-slate-200/70 hover:bg-slate-50 hover:border-slate-300 text-slate-700";
  const cOrderSelected = isDark ? "bg-teal-500/5 border-teal-500/50 shadow-md ring-1 ring-teal-500/20 text-white" : "bg-emerald-50/40 border-teal-500 shadow-sm ring-1 ring-teal-500/15 text-slate-900";
  const cOrderText = isDark ? "text-white" : "text-slate-800 font-bold";
  const cOrderSubtitle = isDark ? "text-slate-200" : "text-slate-700 font-medium";
  const cOrderMeta = isDark ? "text-slate-400" : "text-slate-500 font-medium";
  const cOrderProgressBg = isDark ? "bg-slate-950" : "bg-slate-100";

  // Details screen
  const cDetailHeaderBorder = isDark ? "border-b border-slate-800" : "border-b border-slate-100";
  const cDetailTitle = isDark ? "text-teal-400" : "text-teal-600";
  const cDetailSubtext = isDark ? "text-slate-500" : "text-slate-400 font-medium";
  const cDetailHeading = isDark ? "text-white" : "text-slate-800 font-extrabold";
  const cDetailCode = isDark ? "text-slate-400" : "text-slate-500 font-mono";

  const cSpecsGrid = isDark ? "bg-slate-950/40 border border-slate-800/60" : "bg-slate-50/70 border border-slate-200/80";
  const cSpecsLabel = isDark ? "text-slate-500" : "text-slate-400 font-medium";
  const cSpecsValue = isDark ? "text-slate-200" : "text-slate-700 font-semibold";

  const cMfgSpecsHeading = isDark ? "text-teal-400/80" : "text-teal-600";
  const cSpecsItem = isDark ? "bg-slate-950/30 border border-slate-800/40" : "bg-[#f8fafc] border border-slate-200/60 shadow-2xs";
  const cSpecsItemLabel = isDark ? "text-slate-500" : "text-slate-400 font-semibold";
  const cSpecsItemVal = isDark ? "text-slate-200" : "text-slate-850 font-semibold";
  const cSpecsFormulaVal = isDark ? "text-teal-400" : "text-teal-600 font-bold";

  const cSpecsTemporalBox = isDark ? "bg-slate-950/40 border border-slate-800/80" : "bg-slate-50/70 border border-slate-200/80";
  const cSpecsTemporalHeading = isDark ? "text-slate-400" : "text-slate-500 font-bold";
  const cSpecsTemporalLabel = isDark ? "text-slate-500" : "text-slate-400 font-semibold";
  const cSpecsTemporalVal = isDark ? "text-slate-200" : "text-slate-700 font-semibold";
  const cSpecsTemporalTime = isDark ? "text-teal-400" : "text-teal-600 font-semibold";

  const cBOMHeading = isDark ? "text-slate-400" : "text-slate-500 font-bold";
  const cBOMItemBox = isDark ? "bg-slate-950/60 border border-slate-800/80" : "bg-[#f8fafc] border border-slate-200/60 shadow-2xs hover:bg-slate-50";
  const cBOMItemCode = isDark ? "text-slate-200" : "text-slate-800 font-bold";
  const cBOMItemName = isDark ? "text-slate-500" : "text-slate-405 font-medium";
  const cBOMItemQty = isDark ? "text-slate-400" : "text-slate-600 font-semibold";
  const cBOMItemIssued = isDark ? "text-slate-500" : "text-slate-400 font-medium";

  const cPullWSBtn = isDark
    ? "bg-slate-950 border-slate-800 hover:border-teal-500/50 hover:bg-teal-500/5 text-teal-400"
    : "bg-[#f8fafc] border-slate-200 hover:border-teal-500/40 hover:bg-teal-50/30 text-teal-600 shadow-2xs font-semibold";

  // Tabbed Pane
  const cTabHeaderBorder = isDark ? "border-b border-slate-800 bg-slate-950/50" : "border-b border-slate-100 bg-slate-50/60";
  const cTabButtonBorder = isDark ? "border-r border-slate-800" : "border-r border-slate-100";
  const cTabButtonActive = isDark ? "bg-slate-900 text-white border-b-2 border-b-teal-500" : "bg-white text-slate-900 border-b-2 border-b-teal-600 shadow-2xs font-semibold";
  const cTabButtonInactive = isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600";
  const cBadgeIntegration = isDark ? "border-teal-500/30 bg-teal-500/5 text-teal-400" : "border-teal-500/20 bg-teal-50 text-teal-600 font-bold shadow-2xs";

  // Tab 1: SAP content
  const cTabTitle = isDark ? "text-white" : "text-slate-800 font-extrabold";
  const cTabParagraph = isDark ? "text-slate-400" : "text-slate-500 font-medium";
  const cTradBox = isDark ? "border-slate-800 bg-slate-950/20 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-500";
  const cTradTitle = isDark ? "text-slate-300" : "text-slate-700 font-bold";
  const cActionBox = isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50/80 border border-slate-200 rounded-xl";
  const cActionText = isDark ? "text-slate-400" : "text-slate-500 font-medium";
  const cActionSub = isDark ? "text-slate-500" : "text-slate-400 font-mono";
  const cActionBtn = isDark ? "bg-teal-600 hover:bg-teal-500 text-slate-950" : "bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-2xs";
  const cActionBtnInactive = isDark ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-slate-200 hover:bg-slate-300 text-slate-700 shadow-2xs";

  // Tab 2: Comparison content
  const cCompBadge = isDark ? "text-slate-500 bg-slate-950 border-slate-800" : "text-slate-400 bg-slate-50 border-slate-200/80 font-semibold";
  const cCompTitleBox = isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border border-slate-200/60 shadow-2xs";
  const cCompTitleLabel = isDark ? "text-slate-400" : "text-slate-505 font-bold";
  const cCompPlanText = isDark ? "text-slate-200" : "text-slate-600 font-semibold";
  const cCompRealText = isDark ? "text-teal-400" : "text-teal-600 font-bold";
  const cCompGridHeader = isDark ? "text-slate-500" : "text-slate-400 font-semibold";

  const cCompRowBox = isDark ? "bg-slate-950 border-slate-850" : "bg-slate-50/60 border border-slate-200/60 shadow-2xs";
  const cCompRowCode = isDark ? "text-slate-200" : "text-slate-800 font-bold";
  const cCompRowName = isDark ? "text-slate-500" : "text-slate-400 font-medium";
  const cCompRowPlan = isDark ? "text-slate-400" : "text-slate-600 font-semibold";
  const cCompRowReal = isDark ? "text-teal-400" : "text-teal-600 font-semibold";
  const cCompRowDevExcess = isDark ? "text-amber-400" : "text-amber-600";
  const cCompRowDevSavings = isDark ? "text-emerald-400" : "text-emerald-600";
  const cCompRowDevZero = isDark ? "text-slate-400" : "text-slate-500";
  const cCompRowSub = isDark ? "text-slate-500" : "text-slate-400 font-medium";

  // Tab 3: AI Engine
  const cAILoadingTitle = isDark ? "text-white" : "text-slate-800 font-bold";
  const cAILoadingSub = isDark ? "text-slate-500" : "text-slate-400 font-medium";
  const cAIBadge = isDark ? "bg-teal-500/5 border-teal-500/20 text-teal-400" : "bg-teal-50 border border-teal-200 text-teal-600 font-bold shadow-2xs";

  const cAIResultHeaderBox = isDark ? "border-teal-500/20 bg-teal-500/5" : "border-teal-500/20 bg-teal-50/60 shadow-2xs";
  const cAIResultHeaderLabel = isDark ? "text-slate-400" : "text-slate-505 font-bold";
  const cAIResultHeaderSub = isDark ? "text-slate-300" : "text-slate-600 font-medium";
  const cAIResultScoreBox = isDark ? "bg-slate-950 border-slate-800" : "bg-white border border-slate-200/80 shadow-xs";
  const cAIResultScoreLabel = isDark ? "text-slate-500" : "text-slate-400 font-bold";
  const cAIResultScoreVal = isDark ? "text-teal-400" : "text-teal-600 font-black";
  const cAIResultOptimizedBadge = isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold";

  const cAIMarkdownBox = isDark ? "border-slate-800 bg-slate-950/40" : "border-slate-200 bg-slate-50 text-slate-700";

  const cAIPropHeader = isDark ? "text-slate-400" : "text-slate-500 font-extrabold";
  const cAIPropCard = isDark ? "bg-slate-950 border border-slate-850" : "bg-white border border-slate-200/80 shadow-2xs";
  const cAIPropCode = isDark ? "text-slate-200" : "text-slate-800 font-extrabold";
  const cAIPropLabel = isDark ? "text-slate-400" : "text-slate-505 font-medium";
  const cAIPropVal = isDark ? "text-amber-400" : "text-amber-600 font-bold";
  const cAIPropType = isDark ? "text-slate-500" : "text-slate-400 font-medium";

  const cAIRegisterText = isDark ? "text-slate-500" : "text-slate-400 font-medium";
  const cAIRegisterBtn = isDark ? "bg-teal-500 hover:bg-teal-400 disabled:bg-slate-850 disabled:text-slate-500 text-slate-950 font-black" : "bg-teal-600 hover:bg-teal-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-extrabold shadow-2xs";

  // Terminal Logs Bottom
  const cTerminalCard = isDark ? "bg-slate-900 border border-slate-800" : "bg-white border border-slate-200/80 shadow-sm";
  const cTerminalTitle = isDark ? "text-slate-400" : "text-slate-505 font-bold";
  const cTerminalClearBtn = isDark ? "border-slate-800 bg-slate-950 text-slate-500 hover:text-slate-300" : "border-slate-200 bg-slate-50 text-slate-400 hover:text-slate-600 shadow-2xs font-semibold";
  const cTerminalOutputBox = isDark ? "bg-slate-950 border-slate-850" : "bg-slate-950 border border-slate-900 shadow-2xs"; // Keep logs console dark for rich tech style!

  // Selected Date State (Defaults to current date YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  // Production Data State
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);

  // Interactive UI State
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isPullingWs, setIsPullingWs] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState<"sap" | "telemetry" | "ai">("sap");

  // Batches and final quantity state
  const [componentBatches, setComponentBatches] = useState<Record<string, any[]>>({});
  const [selectedBatches, setSelectedBatches] = useState<Record<string, Record<string, number>>>({});
  const [finalProductQuantity, setFinalProductQuantity] = useState<number>(0);
  const [finalProductBatch, setFinalProductBatch] = useState<string>("");
  const [isEditingConsumptions, setIsEditingConsumptions] = useState(false);
  const [actualConsumptions, setActualConsumptions] = useState<Record<string, number>>({});

  // Production execution state
  const [showProductionModal, setShowProductionModal] = useState(false);
  const [productionSteps, setProductionSteps] = useState<{ title: string, status: 'pending' | 'loading' | 'success' | 'error', message?: string }[]>([]);

  // UDF editing states
  const [isEditingUdfs, setIsEditingUdfs] = useState(false);
  const [isSavingUdfs, setIsSavingUdfs] = useState(false);
  const [udfError, setUdfError] = useState<string | null>(null);
  const [udfFormState, setUdfFormState] = useState({
    Formula: "",
    Proceso: "",
    FechaIni: "",
    U_HORAINI: "",
    FechaFin: "",
    U_HORAFIN: "",
    TipoProducto: "",
    Presentacion: "",
    TamMatriz: "",
    MallaMolino: "",
    LineProduccion: "",
    CantPLC: 0,
    Etiqueta: "",
    Programacion: "",
    Negocio: "",
    U_PRIORIDAD: ""
  });

  // Autocomplete formulas search states
  const [formulas, setFormulas] = useState<Array<{ Codigo: string; Nombre: string }>>([]);
  const [isLoadingFormulas, setIsLoadingFormulas] = useState(false);
  const [showFormulaSuggestions, setShowFormulaSuggestions] = useState(false);

  useEffect(() => {
    if (isEditingUdfs && formulas.length === 0) {
      const fetchFormulas = async () => {
        setIsLoadingFormulas(true);
        try {
          const res = await fetch(`/api/sap/formulas?schema=${user.BD}`);
          if (res.ok) {
            const data = await res.json();
            setFormulas(data);
          }
        } catch (err) {
          console.error("Error fetching formulas:", err);
        } finally {
          setIsLoadingFormulas(false);
        }
      };
      fetchFormulas();
    }
  }, [isEditingUdfs, formulas.length, user.BD]);

  const handleOpenEditUdfs = () => {
    if (!selectedOrder) return;
    setUdfError(null);
    setUdfFormState({
      Formula: selectedOrder.Formula || "",
      Proceso: selectedOrder.Proceso || "",
      FechaIni: selectedOrder.FechaIni ? selectedOrder.FechaIni.substring(0, 10) : "",
      U_HORAINI: selectedOrder.U_HORAINI || "",
      FechaFin: selectedOrder.FechaFin ? selectedOrder.FechaFin.substring(0, 10) : "",
      U_HORAFIN: selectedOrder.U_HORAFIN || "",
      TipoProducto: selectedOrder.TipoProducto || "",
      Presentacion: selectedOrder.Presentacion || "",
      TamMatriz: selectedOrder.TamMatriz || "",
      MallaMolino: selectedOrder.MallaMolino || "",
      LineProduccion: selectedOrder.LineProduccion || "",
      CantPLC: selectedOrder.CantPLC || 0,
      Etiqueta: selectedOrder.Etiqueta || "",
      Programacion: selectedOrder.Programacion || "",
      Negocio: selectedOrder.Negocio || "",
      U_PRIORIDAD: selectedOrder.U_PRIORIDAD || "N"
    });
    setIsEditingUdfs(true);
  };

  const handleSaveUdfs = async () => {
    if (!selectedOrder) return;
    setIsSavingUdfs(true);
    setUdfError(null);
    try {
      const isStringEqual = (val1: any, val2: any) => {
        return (val1 || "").toString().trim() === (val2 || "").toString().trim();
      };

      const isDateEqual = (val1: string, val2: string) => {
        const d1 = val1 ? val1.substring(0, 10) : "";
        const d2 = val2 ? val2.substring(0, 10) : "";
        return d1 === d2;
      };

      const isNumberEqual = (val1: any, val2: any) => {
        const n1 = val1 !== undefined && val1 !== null ? Number(val1) : 0;
        const n2 = val2 !== undefined && val2 !== null ? Number(val2) : 0;
        return n1 === n2;
      };

      const changedSLFields: Record<string, any> = {};

      if (!isStringEqual(selectedOrder.Formula, udfFormState.Formula)) {
        changedSLFields.U_FORMULA = udfFormState.Formula;
      }
      if (!isStringEqual(selectedOrder.Proceso, udfFormState.Proceso)) {
        changedSLFields.U_PROCESO = udfFormState.Proceso;
      }
      if (!isDateEqual(selectedOrder.FechaIni, udfFormState.FechaIni)) {
        changedSLFields.U_FECHAINI = udfFormState.FechaIni || "";
      }
      if (!isStringEqual(selectedOrder.U_HORAINI, udfFormState.U_HORAINI)) {
        changedSLFields.U_HORAINI = udfFormState.U_HORAINI;
      }
      if (!isDateEqual(selectedOrder.FechaFin, udfFormState.FechaFin)) {
        changedSLFields.U_FECHADFIN = udfFormState.FechaFin || "";
      }
      if (!isStringEqual(selectedOrder.U_HORAFIN, udfFormState.U_HORAFIN)) {
        changedSLFields.U_HORAFIN = udfFormState.U_HORAFIN;
      }
      if (!isStringEqual(selectedOrder.TipoProducto, udfFormState.TipoProducto)) {
        changedSLFields.U_TipoProducto = udfFormState.TipoProducto;
      }
      if (!isStringEqual(selectedOrder.Presentacion, udfFormState.Presentacion)) {
        changedSLFields.U_Presentacion = udfFormState.Presentacion;
      }
      if (!isStringEqual(selectedOrder.TamMatriz, udfFormState.TamMatriz)) {
        changedSLFields.U_TamanoMatriz = udfFormState.TamMatriz;
      }
      if (!isStringEqual(selectedOrder.MallaMolino, udfFormState.MallaMolino)) {
        changedSLFields.U_MallaMolino = udfFormState.MallaMolino;
      }
      if (!isStringEqual(selectedOrder.LineProduccion, udfFormState.LineProduccion)) {
        changedSLFields.U_LineaProduccion = udfFormState.LineProduccion;
      }
      if (!isNumberEqual(selectedOrder.CantPLC, udfFormState.CantPLC)) {
        changedSLFields.U_CANTPLC = udfFormState.CantPLC;
      }
      if (!isStringEqual(selectedOrder.Etiqueta, udfFormState.Etiqueta)) {
        changedSLFields.U_Etiqueta = udfFormState.Etiqueta;
      }
      if (!isStringEqual(selectedOrder.Programacion, udfFormState.Programacion)) {
        changedSLFields.U_PROGRAMACION = udfFormState.Programacion;
      }
      if (!isStringEqual(selectedOrder.Negocio, udfFormState.Negocio)) {
        changedSLFields.U_UN = udfFormState.Negocio;
      }
      if (!isStringEqual(selectedOrder.U_PRIORIDAD, udfFormState.U_PRIORIDAD)) {
        changedSLFields.U_PRIORIDAD = udfFormState.U_PRIORIDAD;
      }

      if (Object.keys(changedSLFields).length === 0) {
        setIsEditingUdfs(false);
        return;
      }

      const res = await fetch(`/api/sap/production-orders/${selectedOrder.DocNum}/udfs`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          DocEntry: selectedOrder.DocEntry,
          SessionID: user.SessionID,
          isSandbox: user.isSandbox,
          changes: changedSLFields,
          allValues: udfFormState
        })
      });

      if (res.ok) {
        // Update local orders list
        setOrders(prevOrders => prevOrders.map(o => o.DocNum === selectedOrder.DocNum ? { ...o, ...udfFormState } : o));
        // Update selected order details
        setSelectedOrder(prev => prev ? { ...prev, ...udfFormState } : null);
        setIsEditingUdfs(false);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setUdfError(errorData.error || `Error ${res.status}: Falló el Service Layer.`);
      }
    } catch (err: any) {
      console.error("Error updating UDFs:", err);
      setUdfError(err.message || "Error al conectar con el servidor.");
    } finally {
      setIsSavingUdfs(false);
    }
  };

  // Terminal Logs State
  const [terminalLogs, setTerminalLogs] = useState<LogEntry[]>([]);

  // Telemetry & AI results state
  const [pulledTelemetry, setPulledTelemetry] = useState<any | null>(null);
  const [aiResult, setAiResult] = useState<AiOptimizationResult | null>(null);
  const [successResult, setSuccessResult] = useState<string | null>(null);

  // Produccion WS Data State
  const [wsProduccionData, setWsProduccionData] = useState<{ summary: any[], detailed: any[] } | null>(null);
  const [isPullingWsProduccion, setIsPullingWsProduccion] = useState(false);

  // Sidebar & Navigation States
  const [activeMenu, setActiveMenu] = useState<"home" | "fabricacion">("home");
  const [produccionExpanded, setProduccionExpanded] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Fetch batches logic moved to handleEditConsumptions

  useEffect(() => {
    if (selectedOrder) {
      setFinalProductQuantity(selectedOrder.CompletedQty || 0);
      setFinalProductBatch("");
      setIsEditingConsumptions(false);
      setActualConsumptions({});
      setComponentBatches({});
      setSelectedBatches({});
    }
  }, [selectedOrder]);

  // Poll backend terminal logs and load orders on mount / date change
  useEffect(() => {
    loadOrders(selectedDate);
    loadLogs();

    const interval = setInterval(() => {
      loadLogs();
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedDate]);

  const loadOrders = async (dateParam?: string) => {
    const dateToLoad = typeof dateParam === 'string' ? dateParam : selectedDate;
    setIsLoadingOrders(true);
    try {
      const res = await fetch(`/api/sap/production-orders?date=${dateToLoad}&schema=${user.BD}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        if (data.length > 0) {
          // Default select the first active released order
          const defaultOrder = data.find((o: any) => o.Status === "Released") || data[0];
          setSelectedOrder(defaultOrder);
          // If there's an active order, load its state
          if (defaultOrder.ThirdPartyTelemetry && defaultOrder.ThirdPartyTelemetry.wsStatus === "Ready") {
            setPulledTelemetry(defaultOrder.ThirdPartyTelemetry);
          } else {
            setPulledTelemetry(null);
          }
          setAiResult(null);
          setSuccessResult(null);
        } else {
          setSelectedOrder(null);
          setPulledTelemetry(null);
          setAiResult(null);
          setSuccessResult(null);
        }
      }
    } catch (err) {
      console.error("Error loading production orders:", err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const loadLogs = async () => {
    try {
      const res = await fetch("/api/logs");
      if (res.ok) {
        const data = await res.json();
        setTerminalLogs(data);
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
    }
  };

  const clearTerminalLogs = async () => {
    try {
      await fetch("/api/logs/clear", { method: "POST" });
      setTerminalLogs([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectOrder = (order: ProductionOrder) => {
    setSelectedOrder(order);
    setAiResult(null);
    setSuccessResult(null);
    setWsProduccionData(null);
    if (order.ThirdPartyTelemetry) {
      setPulledTelemetry(order.ThirdPartyTelemetry);
      setActiveTab("telemetry");
    } else {
      setPulledTelemetry(null);
      setActiveTab("sap");
    }
  };

  const handlePullExternalWS = async () => {
    if (!selectedOrder) return;
    setIsPullingWs(true);
    setAiResult(null);
    setSuccessResult(null);
    try {
      const res = await fetch(`/api/sap/third-party-ws/${selectedOrder.DocNum}`);
      if (res.ok) {
        const data = await res.json();
        setPulledTelemetry(data);
        setActiveTab("telemetry");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPullingWs(false);
    }
  };

  const handlePullWsProduccion = async () => {
    if (!selectedOrder) return;
    setIsPullingWsProduccion(true);
    try {
      // we assume selectedOrder.controle exists or use DocNum for now
      const controle = selectedOrder.DocNum || "13791";
      const res = await fetch(`/api/produccion/ws/${controle}?isSandbox=${user.isSandbox}`);
      if (res.ok) {
        const data = await res.json();
        setWsProduccionData(data);
        return data;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPullingWsProduccion(false);
    }
    return null;
  };

  const [isClosingOrder, setIsClosingOrder] = useState(false);

  const handleCloseOrder = async () => {
    if (!selectedOrder) return;
    
    const hasExit = selectedOrder.Components.some((c: any) => c.IssuedQty > 0);
    const hasEntry = selectedOrder.CompletedQty > 0;

    if (!hasExit || !hasEntry) {
      alert("Para cerrar la orden de producción, debe tener registrada al menos una salida (consumo) y una entrada (recibo).");
      return;
    }

    if (!confirm(`¿Está seguro que desea cerrar la orden de producción nro ${selectedOrder.DocNum}?`)) {
      return;
    }

    setIsClosingOrder(true);
    try {
      const res = await fetch(`/api/sap/production-orders/${selectedOrder.DocEntry}/close`, {
        method: "PATCH",
        headers: {
          "x-sap-session-id": user.SessionID
        }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Error al cerrar la orden");
      }
      alert("Orden cerrada exitosamente en SAP.");
      selectedOrder.Status = "Closed";
      await loadOrders();
    } catch (err: any) {
      alert(`Ocurrió un error al cerrar la orden: ${err.message}`);
    } finally {
      setIsClosingOrder(false);
    }
  };

  const handleEditConsumptions = async () => {
    setIsEditingConsumptions(true);
    let wsData = wsProduccionData;
    if (!wsData) {
      wsData = await handlePullWsProduccion();
    }

    const newConsumptions: Record<string, number> = {};
    const newBatches: Record<string, any[]> = {};
    const newSelected: Record<string, Record<string, number>> = {};

    if (selectedOrder?.Components) {
      selectedOrder.Components.forEach(comp => {
        const matched = wsData?.summary?.find((s: any) => s.ItemCode === comp.ItemCode);
        if (matched && matched.pesoDosado) {
          newConsumptions[comp.ItemCode] = Number(matched.pesoDosado);
        } else {
          newConsumptions[comp.ItemCode] = comp.PlannedQty || 0;
        }
      });
      setActualConsumptions(newConsumptions);

      for (const comp of selectedOrder.Components) {
        try {
          const res = await fetch(`/api/sap/batches?schema=${user.BD}&itemCode=${comp.ItemCode}&warehouse=${comp.Warehouse}`);
          if (res.ok) {
            const data = await res.json();
            newBatches[comp.ItemCode] = data;
            newSelected[comp.ItemCode] = {};

            let remaining = newConsumptions[comp.ItemCode];
            if (data.length > 0) {
              for (const b of data) {
                if (remaining <= 0) break;
                const toTake = Math.min(b.Quantity, remaining);
                newSelected[comp.ItemCode][b.SysNumber.toString()] = toTake;
                remaining -= toTake;
              }
              if (remaining > 0) {
                newSelected[comp.ItemCode][data[0].SysNumber.toString()] = (newSelected[comp.ItemCode][data[0].SysNumber.toString()] || 0) + remaining;
              }
            }
          }
        } catch (err) {
          console.error(err);
        }
      }
      setComponentBatches(newBatches);
      setSelectedBatches(newSelected);
    }
  };

  const handleGenerateProduction = async () => {
    if (!selectedOrder) return;

    // Validate
    if (finalProductQuantity <= 0) {
      alert("La cantidad del producto final debe ser mayor a 0.");
      return;
    }
    if (!finalProductBatch.trim()) {
      alert("Debe ingresar un lote para el producto final.");
      return;
    }
    let batchError = false;
    selectedOrder.Components.forEach(c => {
      const needed = actualConsumptions[c.ItemCode] || 0;
      if (needed > 0) {
        const allocs = selectedBatches[c.ItemCode] || {};
        const totalAllocated = Object.values(allocs).reduce((acc, v) => acc + (Number(v) || 0), 0);
        if (Math.abs(totalAllocated - needed) > 0.01) {
          batchError = true;
        }
      }
    });

    if (batchError) {
      alert("La suma de cantidades en los lotes debe coincidir con la cantidad a consumir para todos los componentes.");
      return;
    }

    setProductionSteps([
      { title: "Entrega de Componentes (Salida)", status: "loading" },
      { title: "Reporte de Terminación (Entrada)", status: "pending" }
    ]);
    setShowProductionModal(true);

    try {
      // 1. InventoryGenExits
      const exitPayload = {
        DocType: "dDocument_Items",
        DocDate: selectedOrder.PostDate || new Date().toISOString().split('T')[0],
        DocDueDate: selectedOrder.DueDate || new Date().toISOString().split('T')[0],
        Comments: "Entrega de componentes realizada por TandemProIA",
        DocumentLines: [...selectedOrder.Components].sort((a, b) => (a.LineNum || 0) - (b.LineNum || 0)).filter(c => actualConsumptions[c.ItemCode] > 0).map((c, i) => {
          const allocs = selectedBatches[c.ItemCode] || {};
          const batchNumbers = Object.entries(allocs)
            .filter(([sysNumber, qty]) => qty > 0)
            .map(([sysNumber, qty]) => {
              const bObj = componentBatches[c.ItemCode]?.find(x => x.SysNumber.toString() === sysNumber);
              return {
                BatchNumber: bObj ? bObj.DistNumber : sysNumber,
                SystemSerialNumber: bObj ? Number(bObj.SysNumber) : Number(sysNumber),
                Quantity: qty
              };
            });

          return {
            BaseLine: (c.LineNum !== undefined && c.LineNum !== null) ? c.LineNum : i,
            ItemType: "dit_Item",
            Quantity: actualConsumptions[c.ItemCode],
            WarehouseCode: c.Warehouse,
            AccountCode: "1.01.05.001.001",
            BaseType: 202,
            BaseEntry: selectedOrder.DocEntry,
            BatchNumbers: batchNumbers
          };
        })
      };

      const exitRes = await fetch("/api/sap/inventory-gen-exits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-sap-session-id": user.SessionID
        },
        body: JSON.stringify(exitPayload)
      });
      const exitData = await exitRes.json();

      if (!exitRes.ok || !exitData.success) {
        throw new Error(exitData.error || "Error al realizar salida de mercancías.");
      }

      setProductionSteps([
        { title: "Entrega de Componentes (Salida)", status: "success", message: `Salida generada: ${exitData.docNum || exitData.data?.DocNum}` },
        { title: "Reporte de Terminación (Entrada)", status: "loading" }
      ]);

      // 2. InventoryGenEntries
      const entryPayload = {
        DocType: "dDocument_Items",
        DocDate: selectedOrder.PostDate || new Date().toISOString().split('T')[0],
        DocDueDate: selectedOrder.DueDate || new Date().toISOString().split('T')[0],
        Comments: "Termination report realizada por TandemProIA",
        DocumentLines: [
          {
            //ItemCode: selectedOrder.ItemCode,
            //ItemDescription: selectedOrder.ProdName,
            Quantity: finalProductQuantity,
            WarehouseCode: selectedOrder.Warehouse,
            AccountCode: "1.01.05.001.001",
            BaseType: 202,
            BaseEntry: selectedOrder.DocEntry,
            BatchNumbers: [
              {
                BatchNumber: finalProductBatch.trim(),
                Quantity: finalProductQuantity
              }
            ]
          }
        ]
      };

      const entryRes = await fetch("/api/sap/inventory-gen-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-sap-session-id": user.SessionID
        },
        body: JSON.stringify(entryPayload)
      });
      const entryData = await entryRes.json();

      if (!entryRes.ok || !entryData.success) {
        throw new Error(entryData.error || "Error al realizar entrada de mercancías.");
      }

      setProductionSteps([
        { title: "Entrega de Componentes (Salida)", status: "success", message: `Salida generada: ${exitData.docNum || exitData.data?.DocNum}` },
        { title: "Reporte de Terminación (Entrada)", status: "success", message: `Entrada generada: ${entryData.docNum || entryData.data?.DocNum}` }
      ]);

    } catch (error: any) {
      console.error(error);
      setProductionSteps(prev => prev.map(p => p.status === 'loading' ? { ...p, status: 'error', message: error.message } : p));
    }
  };

  const handleAiOptimize = async () => {
    if (!selectedOrder || !pulledTelemetry) return;
    setIsOptimizing(true);
    setActiveTab("ai");
    try {
      const res = await fetch("/api/ai/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docNum: selectedOrder.DocNum,
          plannedComponents: selectedOrder.Components,
          actualConsumed: pulledTelemetry.actualConsumption,
          completedQty: pulledTelemetry.finishedQtyRecorded,
          plannedQty: selectedOrder.PlannedQty
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleRegisterSAP = async () => {
    if (!selectedOrder || !pulledTelemetry) return;
    setIsRegistering(true);
    try {
      const res = await fetch("/api/sap/register-production", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docNum: selectedOrder.DocNum,
          completedQty: pulledTelemetry.finishedQtyRecorded,
          itemsConsumed: pulledTelemetry.actualConsumption.map((c: any) => ({
            ItemCode: c.ItemCode,
            Qty: c.Qty
          }))
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSuccessResult(data.message);
        // Refresh local orders list with updated completed counts
        await loadOrders(selectedDate);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRegistering(false);
    }
  };

  // Render markdown inline without external dependencies
  const renderMarkdown = (md: string) => {
    return md.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("### ")) {
        return (
          <h4 key={idx} className={`text-xs font-bold mt-4 mb-1.5 font-mono uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-teal-400" : "text-teal-650 font-extrabold"}`}>
            <Layers className={`h-3.5 w-3.5 ${isDark ? "text-teal-500" : "text-teal-600"}`} /> {trimmed.slice(4)}
          </h4>
        );
      }
      if (trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
        return (
          <h3 key={idx} className={`text-sm font-bold mt-5 mb-2 font-mono border-b pb-1 ${isDark ? "text-white border-slate-800" : "text-slate-800 border-slate-200 font-extrabold"}`}>
            {trimmed.replace(/^#+\s+/, "")}
          </h3>
        );
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return (
          <li key={idx} className={`text-xs ml-4 list-disc my-1 font-sans ${isDark ? "text-slate-300" : "text-slate-650 font-semibold"}`}>
            {trimmed.slice(2)}
          </li>
        );
      }
      if (trimmed === "") return <div key={idx} className="h-2"></div>;

      // Parse Bold text **text** -> <strong>text</strong>
      const parts = line.split("**");
      if (parts.length > 1) {
        return (
          <p key={idx} className={`text-xs my-1 leading-relaxed ${isDark ? "text-slate-300" : "text-slate-650 font-medium"}`}>
            {parts.map((part, pIdx) => pIdx % 2 === 1 ? (
              <strong key={pIdx} className={`${isDark ? "text-teal-300" : "text-teal-600"} font-semibold`}>{part}</strong>
            ) : part)}
          </p>
        );
      }

      return <p key={idx} className={`text-xs my-1 leading-relaxed ${isDark ? "text-slate-300" : "text-slate-650"}`}>{line}</p>;
    });
  };

  // Sidebar Styling Classes
  const cSidebarBg = isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200/80 text-slate-800 shadow-xs";
  const cSidebarLogoText = isDark ? "text-white" : "text-slate-900 font-black";
  const cSidebarItemActive = isDark ? "bg-teal-500/10 border-teal-500/30 text-teal-400 font-bold" : "bg-teal-50 border-teal-200 text-teal-700 font-bold shadow-2xs";
  const cSidebarItemInactive = isDark ? "text-slate-400 hover:text-slate-200 hover:bg-slate-85/10" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60";
  const cSidebarDivider = isDark ? "border-slate-800/80" : "border-slate-100";
  const cSidebarHeaderLabel = isDark ? "text-slate-500 font-mono" : "text-slate-400 font-mono font-bold";

  const renderSidebarContent = () => (
    <div className="h-full flex flex-col justify-between">
      <div>
        {/* Sidebar Header with Logo */}
        <div className={`p-4 flex items-center justify-between ${cSidebarDivider} border-b`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg border transition ${isDark ? "bg-teal-500/10 border-teal-500/30" : "bg-teal-50 border-teal-200"}`}>
              <Cpu className={`h-5 w-5 ${isDark ? "text-teal-400" : "text-teal-600"}`} />
            </div>
            {(!sidebarCollapsed || mobileSidebarOpen) && (
              <div className="flex flex-col">
                <span className={`text-sm font-black tracking-tight ${cSidebarLogoText}`}>Tandem<span className="text-teal-500">PRO</span></span>
                <span className="text-[9px] text-slate-400 font-mono leading-none">Control Center</span>
              </div>
            )}
          </div>
          {/* Collapse button on mobile only */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-1 rounded-lg text-slate-400 hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sidebar Menu Navigation */}
        <div className="p-3 space-y-4">
          <div>
            {(!sidebarCollapsed || mobileSidebarOpen) && (
              <span className={`px-2 text-[9px] tracking-wider uppercase ${cSidebarHeaderLabel}`}>Navegación</span>
            )}
            <div className="mt-1.5 space-y-1">
              {/* Home Option */}
              <button
                onClick={() => {
                  setActiveMenu("home");
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border text-xs transition-all duration-150 ${activeMenu === "home" ? cSidebarItemActive : cSidebarItemInactive
                  } ${sidebarCollapsed && !mobileSidebarOpen ? "justify-center" : "justify-start"}`}
                title="Inicio / General"
              >
                <Home className="h-4 w-4" />
                {(!sidebarCollapsed || mobileSidebarOpen) && <span>Inicio</span>}
              </button>
            </div>
          </div>

          <div>
            {(!sidebarCollapsed || mobileSidebarOpen) && (
              <div className={`px-2 flex items-center justify-between ${cSidebarHeaderLabel} text-[9px] tracking-wider uppercase`}>
                <span>PRODUCCIÓN</span>
                <button
                  onClick={() => setProduccionExpanded(!produccionExpanded)}
                  className="p-0.5 rounded hover:bg-slate-800/30 text-slate-400 hover:text-slate-200"
                >
                  {produccionExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </button>
              </div>
            )}

            {produccionExpanded && (
              <div className="mt-1.5 space-y-1">
                <button
                  onClick={() => {
                    setActiveMenu("fabricacion");
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border text-xs transition-all duration-150 ${activeMenu === "fabricacion" ? cSidebarItemActive : cSidebarItemInactive
                    } ${sidebarCollapsed && !mobileSidebarOpen ? "justify-center pl-1" : "justify-start pl-4"}`}
                  title="Módulo de Fabricación"
                >
                  <Cpu className="h-4 w-4" />
                  {(!sidebarCollapsed || mobileSidebarOpen) && <span className="truncate">Módulo de Fabricación</span>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Footer context & collapse trigger */}
      <div className={`p-3 ${cSidebarDivider} border-t space-y-2`}>
        {(!sidebarCollapsed || mobileSidebarOpen) ? (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/20 border border-slate-800/10">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center border text-xs font-bold shrink-0 ${cAvatar}`}>
              {(() => {
                const parts = (user.username || "").trim().split(/\s+/);
                if (parts.length >= 2 && parts[0] && parts[1]) {
                  return (parts[0][0] + parts[1][0]).toUpperCase();
                }
                return (user.username || "").substring(0, 2).toUpperCase();
              })()}
            </div>
            <div className="overflow-hidden">
              <div className={`font-semibold text-[11px] truncate leading-tight ${cSidebarLogoText}`}>{user.username}</div>
              <div className="text-[9px] text-slate-500 truncate mt-0.5">{user.SucursalName}</div>
            </div>
          </div>
        ) : null}

        {/* Desktop Sidebar Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`w-full hidden md:flex items-center justify-center py-1.5 rounded-lg border text-[10px] font-mono tracking-wider text-slate-500 hover:text-slate-300 transition ${isDark ? "bg-slate-950/40 border-slate-850 hover:bg-slate-900" : "bg-slate-50 border-slate-200 hover:bg-slate-100"}`}
        >
          {sidebarCollapsed ? "»" : "« RECOGER"}
        </button>
      </div>
    </div>
  );

  const filteredFormulas = formulas.filter(f => {
    const term = udfFormState.Formula.toLowerCase().trim();
    if (!term) return true;
    return f.Codigo.toLowerCase().includes(term) || f.Nombre.toLowerCase().includes(term);
  });

  return (
    <div className={`h-screen w-screen flex overflow-hidden font-sans transition-colors duration-150 ${cBg}`}>

      {/* Mobile Drawer Navigation overlay & panel */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed top-0 bottom-0 left-0 w-64 z-50 md:hidden border-r shadow-2xl ${cSidebarBg}`}
            >
              {renderSidebarContent()}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Embedded Sidebar */}
      <aside className={`hidden md:block h-full border-r shrink-0 transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-64"} ${cSidebarBg}`}>
        {renderSidebarContent()}
      </aside>

      {/* Main Right Content Panel */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Top Professional Header Banner */}
        <header className={`px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-20 shadow-lg transition-colors duration-150 ${cHeader}`}>
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Hamburger Trigger */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className={`md:hidden p-2 rounded-xl border transition ${isDark ? "bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white" : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-950"
                }`}
              title="Abrir Menú"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className={`p-2.5 rounded-xl border transition ${isDark ? "bg-teal-500/10 border-teal-500/30" : "bg-teal-50 border-teal-200"}`}>
              <Cpu className={`h-6 w-6 animate-pulse ${isDark ? "text-teal-400" : "text-teal-600"}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-xl font-extrabold tracking-tight transition ${cHeaderTitle}`}>Tandem<span className="text-teal-500">PRO</span></h1>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border transition ${cHeaderSpan}`}>
                  {activeMenu === "home" ? "Inicio" : "Módulo de Fabricación"}
                </span>
              </div>
              <p className={`text-xs mt-0.5 transition ${cHeaderSubtitle}`}>{user.CompnyName} • Schema: <span className={isDark ? "text-slate-300" : "text-slate-700 font-bold"}>{user.BD}</span></p>
            </div>
          </div>

          {/* User context info and SAP session identifier */}
          <div className="flex flex-wrap items-center gap-3 self-stretch sm:self-auto justify-end">
            {/* <div className={`rounded-xl px-4 py-1.5 text-right font-mono text-xs max-w-xs hidden md:block border transition ${cSessionBox}`}>
              <div className={`text-[10px] flex items-center justify-end gap-1 ${cSessionTitle}`}>
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                <span>SESIÓN SAP ACTIVA</span>
              </div>
              <div className={`mt-0.5 truncate text-[11px] font-semibold transition ${cSessionText}`} title={user.SessionID}>
                ID: {user.SessionID.substring(0, 15)}...
              </div>
            </div> */}

            <div className={`rounded-xl px-4 py-1.5 text-left text-xs flex items-center gap-2.5 border transition ${cUserBox}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center border transition ${cAvatar}`}>
                {(() => {
                  const parts = (user.username || "").trim().split(/\s+/);
                  if (parts.length >= 2 && parts[0] && parts[1]) {
                    return (parts[0][0] + parts[1][0]).toUpperCase();
                  }
                  return (user.username || "").substring(0, 2).toUpperCase();
                })()}
              </div>
              <div>
                <div className={`font-semibold text-xs leading-tight transition ${cUserTitle}`}>{user.username}</div>
                <div className={`text-[10px] mt-0.5 font-mono transition ${cUserSub}`}>{user.Departamento} • {user.SucursalName}</div>
              </div>
            </div>

            {/* Sun/Moon Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              type="button"
              className={`p-2.5 rounded-xl border transition-all duration-150 flex items-center justify-center gap-1.5 text-xs font-semibold ${isDark
                ? "bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-300"
                : "bg-slate-100 border-slate-200/80 hover:bg-slate-200 text-slate-700 shadow-xs"
                }`}
              title={isDark ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
              <span className="hidden sm:inline">{isDark ? "Claro" : "Oscuro"}</span>
            </button>

            <button
              onClick={onLogout}
              className={`p-2.5 border rounded-xl transition-all duration-150 flex items-center gap-1.5 text-xs font-semibold ${cLogoutBtn}`}
              title="Desconectarse de SAP y cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>

        {/* Main Grid Workspace */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeMenu === "home" ? (
            <WelcomeView
              user={user}
              theme={theme}
              onNavigateToFabrication={() => setActiveMenu("fabricacion")}
            />
          ) : (
            <div className="flex-1 overflow-y-auto flex flex-col">
              <main className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT COLUMN: SAP Production Orders & Selected BOM (4 Columns width) */}
                <div className="lg:col-span-5 flex flex-col gap-6">

                  {/* SAP Production Orders Card */}
                  <div className={`rounded-2xl p-5 flex flex-col h-[320px] shadow-md transition-colors duration-150 ${cCard}`}>
                    <div className="flex items-center justify-between mb-4 gap-2">
                      <h2 className={`text-sm font-bold uppercase tracking-wider font-mono flex items-center gap-2 transition ${isDark ? "text-white" : "text-slate-800"}`}>
                        <Database className={`h-4 w-4 ${isDark ? "text-teal-400" : "text-teal-600"}`} /> Órdenes en SAP B1 (OWOR)
                      </h2>
                      <div className="flex items-center gap-2">
                        <div className={`relative flex items-center border rounded-lg px-2.5 py-1 text-xs font-mono transition cursor-pointer select-none min-w-[125px] ${cDatePicker}`}>
                          <Calendar className={`h-3.5 w-3.5 mr-1.5 shrink-0 ${isDark ? "text-teal-400" : "text-teal-600"}`} />
                          <span>
                            {(() => {
                              if (!selectedDate) return "";
                              const parts = selectedDate.split("-");
                              return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : selectedDate;
                            })()}
                          </span>
                          <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                            title="Filtrar por fecha de contabilización (PostDate)"
                          />
                        </div>
                        <button
                          onClick={() => loadOrders(selectedDate)}
                          className={`p-1.5 rounded-lg border transition ${cDatePickerBtn}`}
                          title="Sincronizar Órdenes de SAP"
                          disabled={isLoadingOrders}
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${isLoadingOrders ? "animate-spin text-teal-400" : ""}`} />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                      {orders.map((order) => {
                        const isSelected = selectedOrder?.DocNum === order.DocNum;
                        const statusColors: any = {
                          Released: isDark ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold",
                          Planned: isDark ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-700 font-bold",
                          Closed: isDark ? "bg-slate-800 border-slate-700 text-slate-500" : "bg-slate-100 border-slate-200 text-slate-500"
                        };
                        const statusNames: any = {
                          Released: "Liberada",
                          Planned: "Planificada",
                          Closed: "Cerrada"
                        };

                        return (
                          <div
                            key={order.DocNum}
                            onClick={() => handleSelectOrder(order)}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 ${isSelected
                              ? cOrderSelected
                              : cOrderUnselected
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-bold font-mono transition ${isSelected ? (isDark ? "text-white" : "text-emerald-950 font-bold") : (isDark ? "text-white" : "text-slate-800")}`}>OP-{order.DocNum}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${statusColors[order.Status] || ""}`}>
                                {statusNames[order.Status] || order.Status}
                              </span>
                            </div>

                            <h3 className={`text-xs font-semibold mt-2 line-clamp-1 transition ${isSelected ? (isDark ? "text-slate-200" : "text-slate-900 font-bold") : (isDark ? "text-slate-200" : "text-slate-700")}`}>{order.ItemName}</h3>

                            <div className={`grid grid-cols-2 gap-2 mt-3 text-[10px] font-mono transition ${cOrderMeta}`}>
                              <div>
                                <span>Cant: <strong>{order.CompletedQty} / {order.PlannedQty}</strong></span>
                              </div>
                              <div className="text-right">
                                <span>Máq: <strong>{order.U_Machine}</strong></span>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className={`w-full rounded-full h-1 mt-2.5 overflow-hidden transition ${cOrderProgressBg}`}>
                              <div
                                className={`h-1 transition-all duration-300 ${isDark ? "bg-teal-400" : "bg-emerald-500"}`}
                                style={{ width: `${Math.min(100, (order.CompletedQty / order.PlannedQty) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                      {orders.length === 0 && !isLoadingOrders && (
                        <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
                          No hay órdenes disponibles en este esquema.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Active Order Details and standard BOM materials (WOR1) */}
                  <div className={`rounded-2xl p-5 flex-1 flex flex-col shadow-md min-h-[340px] max-h-[600px] overflow-hidden transition ${cCard}`}>
                    {selectedOrder ? (
                      <div className="flex-1 flex flex-col h-full overflow-hidden">
                        <div className={`pb-3 mb-3 shrink-0 transition ${cDetailHeaderBorder}`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-mono font-bold transition ${cDetailTitle}`}>DETALLE DE ORDEN</span>
                            <span className={`text-[10px] font-mono transition ${cDetailSubtext}`}>DocEntry: {selectedOrder.DocEntry}</span>
                          </div>
                          <h3 className={`text-base font-bold mt-1 transition ${cDetailHeading}`}>OP-{selectedOrder.DocNum}</h3>
                          <p className={`text-xs mt-0.5 font-mono transition ${cDetailCode}`}>{selectedOrder.ItemCode} - {selectedOrder.ItemName}</p>
                        </div>

                        {/* Scrollable container for parameters to allow adding more data */}
                        <div className="flex-1 overflow-y-auto pr-1 space-y-4">

                          {/* Standard grid info */}
                          <div className={`grid grid-cols-2 gap-3 text-xs p-3 rounded-xl border font-mono transition ${cSpecsGrid}`}>
                            <div className="space-y-1">
                              <span className={`block text-[10px] uppercase transition ${cSpecsLabel}`}>Almacén de Entrega</span>
                              <span className={`font-semibold flex items-center gap-1 transition ${cSpecsValue}`}>
                                <Package className="h-3.5 w-3.5 text-slate-400" /> {selectedOrder.Warehouse}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <span className={`block text-[10px] uppercase transition ${cSpecsLabel}`}>Operador Responsable</span>
                              <span className={`font-semibold transition ${cSpecsValue}`}>{selectedOrder.U_Operator || "No asignado"}</span>
                            </div>
                            <div className="space-y-1">
                              <span className={`block text-[10px] uppercase transition ${cSpecsLabel}`}>Fecha Contabilización</span>
                              <span className={`transition ${cSpecsValue}`}>{selectedOrder.PostDate}</span>
                            </div>
                            <div className="space-y-1">
                              <span className={`block text-[10px] uppercase transition ${cSpecsLabel}`}>Fecha Vencimiento</span>
                              <span className={`transition ${cSpecsValue}`}>{selectedOrder.DueDate}</span>
                            </div>
                          </div>

                          {/* NUEVOS CAMPOS DE LA ORDEN DE FABRICACIÓN (OWOR) */}
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <h4 className={`text-[10px] font-bold uppercase tracking-wider font-mono transition ${cMfgSpecsHeading}`}>
                                Especificaciones de Manufactura (HANA)
                              </h4>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={handleCloseOrder}
                                  disabled={selectedOrder.Status === "Closed" || isClosingOrder}
                                  className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-mono font-bold px-2 py-1 rounded-md border border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/15 disabled:opacity-50 transition shadow-2xs"
                                >
                                  {isClosingOrder ? "Cerrando..." : "Cerrar Orden"}
                                </button>
                                <button
                                  onClick={handleOpenEditUdfs}
                                  className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-mono font-bold px-2 py-1 rounded-md border border-teal-500/20 text-teal-500 bg-teal-500/5 hover:bg-teal-500/15 transition shadow-2xs"
                                >
                                  <Edit className="h-3 w-3" /> Modificar UDFs
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                              <div className={`rounded-lg p-2 transition border ${cSpecsItem}`}>
                                <span className={`block text-[9px] uppercase tracking-wider transition ${cSpecsItemLabel}`}>Unidad de Negocio</span>
                                <span className={`font-medium truncate block transition ${cSpecsItemVal}`}>{getUdfDisplay("Negocio", selectedOrder.Negocio)}</span>
                              </div>

                              <div className={`rounded-lg p-2 transition border ${cSpecsItem}`}>
                                <span className={`block text-[9px] uppercase tracking-wider transition ${cSpecsItemLabel}`}>Línea Producción</span>
                                <span className={`font-medium truncate block transition ${cSpecsItemVal}`}>{getUdfDisplay("LineProduccion", selectedOrder.LineProduccion)}</span>
                              </div>

                              <div className={`rounded-lg p-2 col-span-2 transition border ${cSpecsItem}`}>
                                <span className={`block text-[9px] uppercase tracking-wider transition ${cSpecsItemLabel}`}>Fórmula</span>
                                <span className={`font-semibold text-xs font-mono truncate block transition ${cSpecsFormulaVal}`}>{selectedOrder.Formula || "—"}</span>
                              </div>

                              <div className={`rounded-lg p-2 transition border ${cSpecsItem}`}>
                                <span className={`block text-[9px] uppercase tracking-wider transition ${cSpecsItemLabel}`}>Proceso</span>
                                <span className={`truncate block transition ${cSpecsItemVal}`}>{getUdfDisplay("Proceso", selectedOrder.Proceso)}</span>
                              </div>

                              <div className={`rounded-lg p-2 transition border ${cSpecsItem}`}>
                                <span className={`block text-[9px] uppercase tracking-wider transition ${cSpecsItemLabel}`}>Tipo Producto</span>
                                <span className={`truncate block transition ${cSpecsItemVal}`}>{getUdfDisplay("TipoProducto", selectedOrder.TipoProducto)}</span>
                              </div>

                              <div className={`rounded-lg p-2 transition border ${cSpecsItem}`}>
                                <span className={`block text-[9px] uppercase tracking-wider transition ${cSpecsItemLabel}`}>Presentación</span>
                                <span className={`truncate block transition ${cSpecsItemVal}`}>{getUdfDisplay("Presentacion", selectedOrder.Presentacion)}</span>
                              </div>

                              <div className={`rounded-lg p-2 transition border ${cSpecsItem}`}>
                                <span className={`block text-[9px] uppercase tracking-wider transition ${cSpecsItemLabel}`}>Tamaño de Matriz</span>
                                <span className={`truncate block transition ${cSpecsItemVal}`}>{getUdfDisplay("TamMatriz", selectedOrder.TamMatriz)}</span>
                              </div>

                              <div className={`rounded-lg p-2 transition border ${cSpecsItem}`}>
                                <span className={`block text-[9px] uppercase tracking-wider transition ${cSpecsItemLabel}`}>Malla de Molino</span>
                                <span className={`truncate block transition ${cSpecsItemVal}`}>{getUdfDisplay("MallaMolino", selectedOrder.MallaMolino)}</span>
                              </div>

                              <div className={`rounded-lg p-2 transition border ${cSpecsItem}`}>
                                <span className={`block text-[9px] uppercase tracking-wider transition ${cSpecsItemLabel}`}>Cantidad PLC</span>
                                <span className={`font-semibold transition ${cSpecsItemVal}`}>{formatDecimal(selectedOrder.CantPLC)}</span>
                              </div>

                              <div className={`rounded-lg p-2 col-span-2 transition border ${cSpecsItem}`}>
                                <span className={`block text-[9px] uppercase tracking-wider transition ${cSpecsItemLabel}`}>Programación</span>
                                <span className={`truncate block transition ${cSpecsItemVal}`}>{getUdfDisplay("Programacion", selectedOrder.Programacion)}</span>
                              </div>

                              <div className={`rounded-lg p-2 col-span-2 transition border ${cSpecsItem}`}>
                                <span className={`block text-[9px] uppercase tracking-wider transition ${cSpecsItemLabel}`}>Etiqueta</span>
                                <span className={`truncate block transition ${cSpecsItemVal}`}>{getUdfDisplay("Etiqueta", selectedOrder.Etiqueta)}</span>
                              </div>

                              <div className={`rounded-lg p-2 col-span-2 transition border ${cSpecsItem}`}>
                                <span className={`block text-[9px] uppercase tracking-wider transition ${cSpecsItemLabel}`}>Prioridad</span>
                                <span className={`truncate block transition font-bold ${selectedOrder.U_PRIORIDAD === "A" ? "text-rose-500" : "text-slate-400"}`}>
                                  {getUdfDisplay("U_PRIORIDAD", selectedOrder.U_PRIORIDAD)}
                                </span>
                              </div>
                            </div>

                            {/* Tiempos programados */}
                            <div className={`rounded-xl p-3 space-y-2 text-xs font-mono border transition ${cSpecsTemporalBox}`}>
                              <span className={`block text-[10px] uppercase font-bold tracking-wider transition ${cSpecsTemporalHeading}`}>Programación Temporal</span>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-0.5">
                                  <span className={`text-[9px] uppercase transition ${cSpecsTemporalLabel}`}>Inicio Estimado</span>
                                  <div className={`transition ${cSpecsTemporalVal}`}>
                                    <div>{selectedOrder.FechaIni ? (() => {
                                      const dateObj = new Date(selectedOrder.FechaIni);
                                      if (isNaN(dateObj.getTime())) return selectedOrder.FechaIni;
                                      const y = dateObj.getFullYear();
                                      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
                                      const d = String(dateObj.getDate()).padStart(2, '0');
                                      return `${d}/${m}/${y}`;
                                    })() : "—"}</div>
                                    <div className={`text-[10px] font-bold transition ${cSpecsTemporalTime}`}>Hora: {formatHour(selectedOrder.U_HORAINI)}</div>
                                  </div>
                                </div>
                                <div className="space-y-0.5">
                                  <span className={`text-[9px] uppercase transition ${cSpecsTemporalLabel}`}>Fin Estimado</span>
                                  <div className={`transition ${cSpecsTemporalVal}`}>
                                    <div>{selectedOrder.FechaFin ? (() => {
                                      const dateObj = new Date(selectedOrder.FechaFin);
                                      if (isNaN(dateObj.getTime())) return selectedOrder.FechaFin;
                                      const y = dateObj.getFullYear();
                                      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
                                      const d = String(dateObj.getDate()).padStart(2, '0');
                                      return `${d}/${m}/${y}`;
                                    })() : "—"}</div>
                                    <div className={`text-[10px] font-bold transition ${cSpecsTemporalTime}`}>Hora: {formatHour(selectedOrder.U_HORAFIN)}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Materials BOM (WOR1 Table) */}
                          <div className="space-y-2">
                            <h4 className={`text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5 transition ${cBOMHeading}`}>
                              <Clipboard className="h-3.5 w-3.5 text-slate-500" /> Estructura de Materiales SAP (WOR1)
                            </h4>
                            <div className="space-y-2">
                              {[...selectedOrder.Components].sort((a, b) => (a.LineNum || 0) - (b.LineNum || 0)).map((comp) => (
                                <div key={comp.ItemCode} className={`p-2.5 rounded-lg border flex items-center justify-between text-xs font-mono transition ${cBOMItemBox}`}>
                                  <div className="text-left">
                                    <div className={`font-semibold transition ${cBOMItemCode}`}>{comp.ItemCode}</div>
                                    <div className={`text-[10px] truncate max-w-[200px] transition ${cBOMItemName}`}>{comp.ItemName} - ({comp.Warehouse})</div>
                                  </div>
                                  <div className="text-right">
                                    <div className={`font-bold transition ${cBOMItemQty}`}>Plan: {comp.PlannedQty}</div>
                                    <div className={`text-[10px] transition ${cBOMItemIssued}`}>Emitido: {comp.IssuedQty} • {comp.Warehouse}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* External WS Pull Button Trigger */}
                        {!selectedOrder.ThirdPartyTelemetry && (
                          <div className={`pt-3 mt-3 border-t shrink-0 transition ${cDetailHeaderBorder}`}>
                            <button
                              onClick={handlePullExternalWS}
                              disabled={isPullingWs || selectedOrder.Status === "Closed"}
                              className={`w-full py-2 border font-mono text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${cPullWSBtn}`}
                            >
                              {isPullingWs ? (
                                <>
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                  <span>CONSULTANDO WEB SERVICE...</span>
                                </>
                              ) : (
                                <>
                                  <Server className="h-4 w-4" />
                                  <span>PULL TELEMETRÍA (WS EXTERNO)</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs font-mono py-12">
                        <Database className="h-10 w-10 text-slate-700 mb-2 animate-pulse" />
                        <span>Seleccione una orden para ver detalles</span>
                      </div>
                    )}
                  </div>

                </div>

                {/* RIGHT COLUMN: Interactive WS comparison, AI optimization, and logs (7 Columns width) */}
                <div className="lg:col-span-7 flex flex-col gap-6">

                  {/* Main workspace tabs */}
                  <div className={`rounded-2xl flex-1 flex flex-col h-[480px] overflow-hidden shadow-md transition ${cCard}`}>

                    {/* Tab Headers */}
                    <div className={`flex justify-between items-center pr-3 transition ${cTabHeaderBorder}`}>
                      <div className="flex">
                        <button
                          onClick={() => setActiveTab("sap")}
                          className={`px-5 py-3.5 text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition ${cTabButtonBorder} ${activeTab === "sap" ? cTabButtonActive : cTabButtonInactive
                            }`}
                        >
                          <Server className="h-4 w-4" />
                          <span>WS/PLC (Producido)</span>
                        </button>
                        <button
                          onClick={() => setActiveTab("telemetry")}
                          disabled={!pulledTelemetry}
                          className={`px-5 py-3.5 text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition disabled:opacity-30 ${cTabButtonBorder} ${activeTab === "telemetry" ? cTabButtonActive : cTabButtonInactive
                            }`}
                        >
                          <Database className="h-4 w-4" />
                          <span>Producido SAP (Entrada/Consumo)</span>
                        </button>
                        <button
                          onClick={() => setActiveTab("ai")}
                          disabled={!pulledTelemetry}
                          className={`px-5 py-3.5 text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition disabled:opacity-30 ${cTabButtonBorder} ${activeTab === "ai" ? cTabButtonActive : cTabButtonInactive
                            }`}
                        >
                          {/* <Cpu className="h-4 w-4" />
                          <span>Optimización IA</span> */}
                        </button>
                      </div>

                      {/* Status flag on integration */}
                      {pulledTelemetry && (
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono transition ${cBadgeIntegration}`}>
                          <Zap className="h-3 w-3 animate-pulse" />
                          <span>INTEGRACIÓN OK</span>
                        </div>
                      )}
                    </div>

                    {/* Tab Contents */}
                    <div className="flex-1 p-5 overflow-y-auto">
                      <AnimatePresence mode="wait">
                        {activeTab === "sap" && (
                          <motion.div
                            key="sap-tab"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-4 text-left h-full flex flex-col justify-between"
                          >
                            <div className="h-full flex flex-col">
                              <div className="flex justify-between items-start mb-4 shrink-0">
                                <div>
                                  <h3 className={`text-base font-bold flex items-center gap-2 transition ${cTabTitle}`}>
                                    <Layers className={`h-5 w-5 ${isDark ? "text-teal-400" : "text-teal-600"}`} /> Datos WS/PLC Producción
                                  </h3>
                                  <p className={`text-xs mt-1 leading-relaxed transition ${cTabParagraph}`}>
                                    Datos importados desde Web Service externo (PLC) asociados a esta orden de producción.
                                  </p>
                                </div>
                                <button
                                  onClick={handlePullWsProduccion}
                                  disabled={isPullingWsProduccion || !selectedOrder}
                                  className={`px-4 py-2 font-bold text-xs rounded-xl font-mono transition flex items-center gap-1.5 ${cActionBtn}`}
                                >
                                  {isPullingWsProduccion ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Server className="h-3.5 w-3.5" />}
                                  <span>{isPullingWsProduccion ? "CARGANDO..." : "CARGAR DESDE WS"}</span>
                                </button>
                              </div>

                              {wsProduccionData && wsProduccionData.summary && wsProduccionData.summary.length > 0 && (
                                <div className="space-y-6 flex-1 overflow-y-auto pr-2 pb-10">
                                  {/* Resumen */}
                                  <div>
                                    <h4 className={`text-xs font-bold uppercase tracking-wider font-mono mb-2 transition ${cTabTitle}`}>
                                      Resumen (Agrupado por Material)
                                    </h4>
                                    <div className="overflow-x-auto rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                                      <table className="w-full text-xs font-mono text-left">
                                        <thead className={isDark ? "bg-slate-900/50 text-slate-400" : "bg-slate-50 text-slate-500"}>
                                          <tr>
                                            <th className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 font-semibold">Código MP PLC</th>
                                            <th className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 font-semibold">Código SAP</th>
                                            <th className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 font-semibold">Nombre SAP</th>
                                            <th className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 font-semibold text-right">Cant. Solicitada</th>
                                            <th className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 font-semibold text-right">Cant. Entregada</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                                          {[...wsProduccionData.summary]
                                            .sort((a, b) => {
                                              const codA = a.codProdMP?.toString() || "";
                                              const codB = b.codProdMP?.toString() || "";
                                              return codA.localeCompare(codB, undefined, { numeric: true });
                                            })
                                            .map((row: any, idx: number) => (
                                              <tr key={idx} className={`transition ${isDark ? 'hover:bg-slate-800/40 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}>
                                                <td className="px-3 py-2">{row.codProdMP}</td>
                                                <td className="px-3 py-2 font-bold">{row.ItemCode}</td>
                                                <td className="px-3 py-2 truncate max-w-[150px]" title={row.ItemName}>{row.ItemName}</td>
                                                <td className="px-3 py-2 text-right">{formatDecimal(row.pesoSolicitado)}</td>
                                                <td className="px-3 py-2 text-right font-semibold text-teal-600 dark:text-teal-400">{formatDecimal(row.pesoDosado)}</td>
                                              </tr>
                                            ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>

                                  {/* Detallado */}
                                  <div>
                                    <h4 className={`text-xs font-bold uppercase tracking-wider font-mono mb-2 transition ${cTabTitle}`}>
                                      Detalle de Producción
                                    </h4>
                                    <div className="overflow-x-auto rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                                      <table className="w-full text-xs font-mono text-left whitespace-nowrap">
                                        <thead className={isDark ? "bg-slate-900/50 text-slate-400" : "bg-slate-50 text-slate-500"}>
                                          <tr>
                                            <th className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 font-semibold">Batelada</th>
                                            <th className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 font-semibold">Cod MP PLC</th>
                                            <th className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 font-semibold">Código SAP</th>
                                            <th className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 font-semibold">Inicio Prod.</th>
                                            <th className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 font-semibold">Fin Prod.</th>
                                            <th className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 font-semibold">Inicio Batelada</th>
                                            <th className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 font-semibold">Fin Batelada</th>
                                            <th className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 font-semibold">Lote MP</th>
                                            <th className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 font-semibold">Lote PA</th>
                                            <th className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 font-semibold text-right">Solicitada</th>
                                            <th className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 font-semibold text-right">Entregada</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                                          {wsProduccionData.detailed.map((row: any, idx: number) => (
                                            <tr key={idx} className={`transition ${isDark ? 'hover:bg-slate-800/40 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}>
                                              <td className="px-3 py-2">{row.numeroBatelada}</td>
                                              <td className="px-3 py-2">{row.codProdMP}</td>
                                              <td className="px-3 py-2 font-bold">{row.ItemCode}</td>
                                              <td className="px-3 py-2">{row.dataInicialProducao}</td>
                                              <td className="px-3 py-2">{row.dataFinalProducao}</td>
                                              <td className="px-3 py-2">{row.dataInicialBatelada}</td>
                                              <td className="px-3 py-2">{row.dataFinalBatelada}</td>
                                              <td className="px-3 py-2">{row.numeroLoteMP}</td>
                                              <td className="px-3 py-2">{row.numeroLotePA}</td>
                                              <td className="px-3 py-2 text-right">{row.pesoSolicitado}</td>
                                              <td className="px-3 py-2 text-right font-semibold text-teal-600 dark:text-teal-400">{row.pesoDosado}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {wsProduccionData && (!wsProduccionData.summary || wsProduccionData.summary.length === 0) && (
                                <div className="mt-8 text-center text-slate-500 font-mono text-sm py-8 border border-dashed rounded-xl border-slate-200 dark:border-slate-800">
                                  No hay datos de producción disponibles para este lote en el WS.
                                </div>
                              )}
                              {!wsProduccionData && (
                                <div className="mt-8 text-center text-slate-400 font-mono text-xs py-10">
                                  Haga clic en 'CARGAR DESDE WS' para obtener la telemetría del PLC.
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}

                        {activeTab === "telemetry" && pulledTelemetry && selectedOrder && (
                          <motion.div
                            key="telemetry-tab"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-4 text-left h-full flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                <div>
                                  <h3 className={`text-base font-bold flex items-center gap-2 transition ${cTabTitle}`}>
                                    <Server className={`h-5 w-5 ${isDark ? "text-sky-400" : "text-sky-600"}`} /> Comparador de Consumos SAP: Planificado vs Consumido
                                  </h3>
                                  <p className={`text-xs mt-1 transition ${cTabParagraph}`}>
                                    Análisis comparativo de los materiales teóricos (BOM SAP) versus los pesos reales por báscula registrados por el sistema de planta.
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  {!isEditingConsumptions && (
                                    <button
                                      onClick={handleEditConsumptions}
                                      className={`px-4 py-2 font-bold text-xs rounded-xl font-mono transition flex items-center gap-1.5 ${cActionBtn}`}
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                      <span>Sincronizar PLC y Editar</span>
                                    </button>
                                  )}
                                </div>

                                {/* Telemetry info badge */}
                                <div className={`text-right font-mono text-[10px] px-3 py-1.5 border rounded-lg transition shrink-0 ${cCompBadge}`}>
                                  <div>Máquina: <strong>{pulledTelemetry.machineId}</strong></div>
                                  <div>Horas Run: <strong>{pulledTelemetry.runHours} hrs</strong></div>
                                </div>
                              </div>

                              {/* Product finished output comparison */}
                              <div className={`mt-4 p-3 rounded-xl border flex items-center justify-between text-xs font-mono transition ${cCompTitleBox}`}>
                                <span className={`transition ${cCompTitleLabel}`}>PRODUCTO FINAL ({selectedOrder.ItemCode}):</span>
                                <div className="flex items-center gap-4">
                                  <div className={`transition ${cCompPlanText}`}>Plan SAP: <strong>{selectedOrder.PlannedQty} u</strong></div>
                                  <div className={`transition ${cCompRealText} flex items-center gap-2`}>
                                    <span>Lote:</span>
                                    {isEditingConsumptions ? (
                                      <input
                                        type="text"
                                        value={finalProductBatch}
                                        onChange={(e) => setFinalProductBatch(e.target.value)}
                                        placeholder="Ej: LOTE-123"
                                        className="w-28 px-2 py-1 text-left border rounded bg-transparent font-bold text-teal-600 dark:text-teal-400 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                      />
                                    ) : (
                                      <strong>{finalProductBatch || "-"}</strong>
                                    )}
                                    <span className="ml-2">Real WS:</span>
                                    {isEditingConsumptions ? (
                                      <input
                                        type="number"
                                        value={finalProductQuantity}
                                        onChange={(e) => setFinalProductQuantity(Number(e.target.value))}
                                        className="w-20 px-2 py-1 text-right border rounded bg-transparent font-bold text-teal-600 dark:text-teal-400 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                      />
                                    ) : (
                                      <strong>{finalProductQuantity}</strong>
                                    )} <strong className="ml-1">u</strong>
                                  </div>
                                </div>
                              </div>

                              {/* Components raw materials comparison grid table */}
                              <div className="mt-4 space-y-2">
                                <div className={`grid grid-cols-12 gap-2 text-[10px] font-mono uppercase px-2 transition ${cCompGridHeader}`}>
                                  <span className="col-span-4">Materia Prima Componente</span>
                                  <span className="col-span-3">Lote</span>
                                  <span className="col-span-2 text-right">Plan SAP</span>
                                  <span className="col-span-1 text-right">Real WS</span>
                                  <span className="col-span-2 text-right">Desviación (Merma)</span>
                                </div>

                                {[...selectedOrder.Components].sort((a, b) => (a.LineNum || 0) - (b.LineNum || 0)).map((comp) => {
                                  // const actual = pulledTelemetry.actualConsumption.find((c: any) => c.ItemCode === comp.ItemCode);
                                  const actual = comp.IssuedQty

                                  // const actualQty = actual ? actual.Qty : 0;
                                  const actualQty = actual ? actual : 0
                                  const diff = actualQty - comp.PlannedQty;
                                  const pct = comp.PlannedQty > 0 ? (diff / comp.PlannedQty) * 100 : 0;
                                  const isExcess = diff > 0;
                                  const isSavings = diff < 0;

                                  return (
                                    <div key={comp.ItemCode} className={`grid grid-cols-12 gap-2 p-2 rounded-lg text-xs font-mono items-center transition ${cCompRowBox}`}>
                                      <div className="col-span-4 text-left">
                                        <div className={`font-bold transition ${cCompRowCode}`}>{comp.ItemCode}</div>
                                        <div className={`text-[9px] truncate transition ${cCompRowName}`} title={`${comp.ItemName} - (${comp.Warehouse})`}>
                                          {comp.ItemName} - ({comp.Warehouse})
                                        </div>
                                      </div>
                                      <div className="col-span-3">
                                        {isEditingConsumptions ? (
                                          componentBatches[comp.ItemCode] && componentBatches[comp.ItemCode].length > 0 ? (
                                            <div className="space-y-1">
                                              {componentBatches[comp.ItemCode].map((b: any) => {
                                                const batchSys = b.SysNumber.toString();
                                                const qty = selectedBatches[comp.ItemCode]?.[batchSys] || 0;
                                                return (
                                                  <div key={batchSys} className="flex items-center gap-1">
                                                    <span className="text-[9px] truncate flex-1" title={b.DistNumber}>
                                                      {b.DistNumber} <span className="opacity-50">({b.Quantity})</span>
                                                    </span>
                                                    <input
                                                      type="number"
                                                      value={qty || ''}
                                                      placeholder="0"
                                                      onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        setSelectedBatches(prev => ({
                                                          ...prev,
                                                          [comp.ItemCode]: {
                                                            ...(prev[comp.ItemCode] || {}),
                                                            [batchSys]: val
                                                          }
                                                        }));
                                                      }}
                                                      className="w-14 px-1 py-0.5 text-right text-[10px] border rounded bg-transparent dark:border-slate-700 border-slate-300 outline-none focus:ring-1 focus:ring-teal-500"
                                                    />
                                                  </div>
                                                );
                                              })}
                                              {(() => {
                                                const totalAllocated = Object.values(selectedBatches[comp.ItemCode] || {}).reduce((acc, v) => acc + (Number(v) || 0), 0);
                                                const needed = actualConsumptions[comp.ItemCode] || 0;
                                                const isOk = Math.abs(totalAllocated - needed) < 0.01;
                                                return (
                                                  <div className={`text-[9px] text-right font-bold ${isOk ? 'text-teal-500' : 'text-red-500'}`}>
                                                    Asignado: {totalAllocated.toFixed(2)} / {needed.toFixed(2)}
                                                  </div>
                                                );
                                              })()}
                                            </div>
                                          ) : (
                                            <span className="text-[10px] text-slate-400 italic">Sin lotes</span>
                                          )
                                        ) : (
                                          <span className="text-[10px] text-slate-500">-</span>
                                        )}
                                      </div>
                                      <div className={`col-span-2 text-right font-semibold transition ${cCompRowPlan}`}>{comp.PlannedQty}</div>
                                      <div className={`col-span-1 text-right font-semibold transition ${cCompRowReal}`}>
                                        {isEditingConsumptions ? (
                                          <input
                                            type="number"
                                            value={actualConsumptions[comp.ItemCode] !== undefined ? actualConsumptions[comp.ItemCode] : ''}
                                            onChange={(e) => setActualConsumptions({ ...actualConsumptions, [comp.ItemCode]: Number(e.target.value) })}
                                            className="w-full min-w-[60px] px-1 py-1 text-right border rounded bg-transparent dark:border-slate-700 border-slate-300 outline-none focus:ring-1 focus:ring-teal-500"
                                          />
                                        ) : (
                                          actualQty
                                        )}
                                      </div>
                                      <div className="col-span-2 text-right flex flex-col justify-center">
                                        <span className={`font-bold transition ${isExcess ? cCompRowDevExcess : isSavings ? cCompRowDevSavings : cCompRowDevZero}`}>
                                          {isExcess ? "+" : ""}{diff} ({pct.toFixed(1)}%)
                                        </span>
                                        {/* {actual?.notes && <span className={`text-[8px] font-sans truncate transition ${cCompRowSub}`} title={actual.notes}>{actual.notes}</span>} */}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Footer interactive bar with AI optimization triggers */}
                            <div className={`border-t pt-4 mt-4 flex justify-between gap-3 items-center transition ${cTabHeaderBorder}`}>
                              <div className={`text-xs max-w-sm hidden md:block transition ${cTabParagraph}`}>
                                {isEditingConsumptions
                                  ? "Revise y confirme las cantidades de los componentes y seleccione el lote correspondiente antes de generar la producción."
                                  : "Se detectaron mermas y mermas técnicas en componentes clave. Se recomienda ejecutar la optimización de IA."}
                              </div>
                              <div className="flex gap-2 self-end w-full md:w-auto">
                                {isEditingConsumptions && selectedOrder?.Status !== "Closed" && (
                                  <button
                                    onClick={handleGenerateProduction}
                                    className="flex-1 md:flex-initial px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl font-mono transition flex items-center justify-center gap-1.5 shadow-2xs"
                                  >
                                    <Server className="h-4 w-4" />
                                    <span>EJECUTAR PRODUCCIÓN</span>
                                  </button>
                                )}
                                <button
                                  onClick={handleAiOptimize}
                                  disabled={isOptimizing}
                                  className="flex-1 md:flex-initial px-4 py-2 bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-400 hover:to-sky-500 text-slate-950 font-bold text-xs rounded-xl font-mono transition flex items-center justify-center gap-1.5 shadow-2xs"
                                >
                                  {/*<Cpu className="h-4 w-4" />
                                   <span>ANALIZAR DISCREPANCIAS POR IA</span> */}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {activeTab === "ai" && pulledTelemetry && selectedOrder && (
                          <motion.div
                            key="ai-tab"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-4 text-left h-full flex flex-col justify-between"
                          >
                            {isOptimizing ? (
                              <div className="flex-1 flex flex-col items-center justify-center py-10 font-mono text-center">
                                <Cpu className={`h-12 w-12 animate-spin mb-4 ${isDark ? "text-teal-400" : "text-teal-600"}`} />
                                <h4 className={`text-sm font-bold uppercase tracking-wider transition ${cAILoadingTitle}`}>Ejecutando Inteligencia Artificial TandemPRO</h4>
                                <p className={`text-xs mt-2 max-w-sm leading-relaxed transition ${cAILoadingSub}`}>
                                  Gemini está evaluando los consumos de material reales contra la receta maestra de SAP, calibrando mermas técnicas y proponiendo registros automáticos optimizados.
                                </p>
                                <div className={`mt-4 flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] transition ${cAIBadge}`}>
                                  <Zap className="h-3 w-3 animate-pulse" />
                                  <span>Modelo: gemini-2.5-flash (Paid Engine)</span>
                                </div>
                              </div>
                            ) : aiResult ? (
                              <div className="space-y-4">
                                {/* Executive Header Panel with Score */}
                                <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl gap-3 transition border ${cAIResultHeaderBox}`}>
                                  <div className="space-y-1">
                                    <h4 className={`text-xs font-bold font-mono uppercase tracking-wider transition ${cAIResultHeaderLabel}`}>Puntaje de Rendimiento Planta</h4>
                                    <p className={`text-xs font-sans leading-relaxed transition ${cAIResultHeaderSub}`}>{aiResult.summary}</p>
                                  </div>

                                  <div className={`rounded-xl px-4 py-3 border text-center font-mono flex-shrink-0 self-center sm:self-auto transition ${cAIResultScoreBox}`}>
                                    <div className={`text-[9px] uppercase transition ${cAIResultScoreLabel}`}>EFICIENCIA</div>
                                    <div className={`text-2xl font-black mt-0.5 transition ${cAIResultScoreVal}`}>{aiResult.optimizationScore}%</div>
                                    <div className={`inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.5 rounded text-[8px] font-bold transition ${cAIResultOptimizedBadge}`}>
                                      <Award className="h-2.5 w-2.5" /> OPTIMIZADO
                                    </div>
                                  </div>
                                </div>

                                {/* Discrepancy analysis markdown section */}
                                <div className={`p-4 rounded-xl border text-xs overflow-y-auto max-h-[160px] font-sans scrollbar-thin transition ${cAIMarkdownBox}`}>
                                  {renderMarkdown(aiResult.discrepancyAnalysis)}
                                </div>

                                {/* Recommended stock adjustments inside SAP */}
                                <div className="space-y-2">
                                  <h4 className={`text-[10px] font-bold font-mono uppercase tracking-wider transition ${cAIPropHeader}`}>Ajustes Propuestos en SAP B1 (WOR1 / OGenExits):</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    {aiResult.sapAdjustments.map((adj) => (
                                      <div key={adj.ItemCode} className={`p-2.5 rounded-lg font-mono text-[10px] transition ${cAIPropCard}`}>
                                        <div className={`font-bold transition ${cAIPropCode}`}>{adj.ItemCode}</div>
                                        <div className={`mt-1 transition ${cAIPropLabel}`}>Ajuste: <strong className={cAIPropVal}>+{adj.Adjustment}</strong></div>
                                        <div className={`text-[8px] truncate mt-0.5 transition ${cAIPropType}`} title={adj.Type}>{adj.Type}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Registration panel in SAP */}
                                <div className={`border-t pt-4 mt-2 flex justify-between items-center gap-4 transition ${cTabHeaderBorder}`}>
                                  <div className={`text-[10px] font-mono uppercase transition ${cAIRegisterText}`}>
                                    Proceder con el registro del consumo real medido para evitar desajustes físicos de stock.
                                  </div>
                                  <button
                                    onClick={handleRegisterSAP}
                                    disabled={isRegistering || selectedOrder.Status === "Closed" || selectedOrder.ThirdPartyTelemetry?.discrepancyAnalyzed}
                                    className={`px-5 py-2.5 disabled:bg-slate-800 disabled:text-slate-500 rounded-xl font-mono transition flex items-center justify-center gap-1.5 self-end whitespace-nowrap ${cAIRegisterBtn}`}
                                  >
                                    {isRegistering ? (
                                      <>
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        <span>REGISTRANDO EN SAP...</span>
                                      </>
                                    ) : selectedOrder.Status === "Closed" || selectedOrder.ThirdPartyTelemetry?.discrepancyAnalyzed ? (
                                      <>
                                        <Check className="h-4 w-4 text-emerald-600" />
                                        <span>REGISTRADO EXITOSAMENTE</span>
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="h-4 w-4" />
                                        <span>REGISTRAR EN SAP B1</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs font-mono py-10">
                                <Cpu className="h-10 w-10 text-slate-700 mb-2 animate-pulse" />
                                <span>Presione 'Analizar Discrepancias' para que la IA evalúe la telemetría externa.</span>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Notification tray on successful SAP registration */}
                    {successResult && (
                      <div className="bg-emerald-500/10 border-t border-emerald-500/20 p-4 flex items-center gap-3 animate-fade-in text-left">
                        <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                        <div className="text-xs">
                          <div className="font-bold text-emerald-300">¡Ajustes Registrados en SAP Business One Service Layer!</div>
                          <p className="text-slate-300 mt-0.5">{successResult}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SBO Service Layer Live Terminal Transaction Logs (Anti-AI-Slop real log tray) */}
                  <div className={`rounded-2xl p-5 flex flex-col h-[220px] shadow-md transition ${cTerminalCard}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className={`text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2 transition ${cTerminalTitle}`}>
                        <Terminal className={`h-4 w-4 animate-pulse ${isDark ? "text-sky-400" : "text-sky-600"}`} /> Consola de Transacciones SAP Service Layer (Live)
                      </h2>
                      <button
                        onClick={clearTerminalLogs}
                        className={`text-[10px] font-mono transition px-2 py-0.5 rounded border ${cTerminalClearBtn}`}
                      >
                        Limpiar Consola
                      </button>
                    </div>

                    <div className={`flex-1 rounded-xl p-3 font-mono text-[10px] overflow-y-auto space-y-1.5 scrollbar-thin text-left select-text transition ${cTerminalOutputBox}`}>
                      {terminalLogs.map((log, idx) => {
                        const logStyles: any = {
                          INFO: "text-slate-400",
                          SUCCESS: "text-emerald-400 font-bold",
                          WARN: "text-amber-400",
                          ERROR: "text-red-400 font-bold",
                          SL_REQUEST: "text-sky-300",
                          SL_RESPONSE: "text-teal-400",
                        };

                        return (
                          <div key={idx} className="leading-relaxed border-b border-slate-900/40 pb-1.5 last:border-0">
                            <div className="flex items-start gap-1.5">
                              <span className="text-slate-600 flex-shrink-0">[{log.timestamp}]</span>
                              <span className={`${logStyles[log.type] || "text-slate-300"} flex-shrink-0 font-bold`}>{log.type}:</span>
                              <span className="text-slate-300">{log.message}</span>
                            </div>
                            {log.payload && (
                              <pre className="mt-1 pl-4 text-[9px] text-slate-500 overflow-x-auto bg-slate-900/40 p-1.5 rounded">
                                {JSON.stringify(log.payload, null, 2)}
                              </pre>
                            )}
                          </div>
                        );
                      })}
                      {terminalLogs.length === 0 && (
                        <div className="h-full flex items-center justify-center text-slate-600 text-[10px]">
                          Esperando transacciones de SAP...
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </main>
            </div>
          )}

        </div>
      </div>

      {/* UDF Edit Modal */}
      <AnimatePresence>
        {isEditingUdfs && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingUdfs(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`relative w-full max-w-2xl rounded-2xl border p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition ${isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
                }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b pb-4 mb-4 border-slate-800">
                <div>
                  <h3 className={`text-xs font-black tracking-tight font-mono text-teal-500`}>
                    MODIFICAR ESPECIFICACIONES DE MANUFACTURA
                  </h3>
                  <p className="text-xs text-slate-450 font-medium mt-1 font-mono">
                    Orden OP-{selectedOrder?.DocNum} • {selectedOrder?.ItemName}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditingUdfs(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Error warning banner */}
              {udfError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2 font-mono">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                  <span>{udfError}</span>
                </div>
              )}

              {/* Form body */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin text-xs font-mono">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  {/* Negocio */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 text-[10px] uppercase font-bold">Unidad de Negocio (U_UN)</label>
                    <select
                      value={udfFormState.Negocio}
                      onChange={(e) => setUdfFormState({ ...udfFormState, Negocio: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border text-xs transition ${isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                    >
                      <option value="">— Seleccione —</option>
                      {Object.entries(UdfMaps.Negocio).map(([val, label]) => (
                        <option key={val} value={val}>{label} ({val})</option>
                      ))}
                    </select>
                  </div>

                  {/* Prioridad */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 text-[10px] uppercase font-bold">Prioridad (U_PRIORIDAD)</label>
                    <select
                      value={udfFormState.U_PRIORIDAD}
                      onChange={(e) => setUdfFormState({ ...udfFormState, U_PRIORIDAD: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border text-xs transition ${isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                    >
                      {Object.entries(UdfMaps.U_PRIORIDAD).map(([val, label]) => (
                        <option key={val} value={val}>{label} ({val})</option>
                      ))}
                    </select>
                  </div>

                  {/* LineProduccion */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 text-[10px] uppercase font-bold">Línea de Producción (U_LineaProduccion)</label>
                    <select
                      value={udfFormState.LineProduccion}
                      onChange={(e) => setUdfFormState({ ...udfFormState, LineProduccion: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border text-xs transition ${isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                    >
                      <option value="">— Seleccione —</option>
                      {Object.entries(UdfMaps.LineProduccion).map(([val, label]) => (
                        <option key={val} value={val}>{label} ({val})</option>
                      ))}
                    </select>
                  </div>

                  {/* Formula */}
                  <div className="space-y-1.5 md:col-span-2 relative">
                    <label className="text-slate-400 text-[10px] uppercase font-bold">Fórmula (U_FORMULA)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={udfFormState.Formula}
                        onChange={(e) => {
                          setUdfFormState({ ...udfFormState, Formula: e.target.value });
                          setShowFormulaSuggestions(true);
                        }}
                        onFocus={() => setShowFormulaSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowFormulaSuggestions(false), 200)}
                        className={`w-full p-2.5 pr-8 rounded-lg border text-xs transition ${isDark ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-teal-500" : "bg-slate-50 border-slate-200 text-slate-700 focus:border-teal-500"
                          }`}
                        placeholder="Escriba código o nombre de fórmula..."
                      />
                      {isLoadingFormulas && (
                        <div className="absolute right-2.5 top-2.5">
                          <Loader2 className="animate-spin h-4 w-4 text-teal-500" />
                        </div>
                      )}
                    </div>

                    {showFormulaSuggestions && (
                      <div className={`absolute z-50 left-0 right-0 mt-1 max-h-52 overflow-y-auto rounded-lg border shadow-xl ${isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                        }`}>
                        {isLoadingFormulas ? (
                          <div className="p-3 text-xs text-slate-400 italic text-center">
                            Cargando fórmulas desde SAP HANA...
                          </div>
                        ) : filteredFormulas.length === 0 ? (
                          <div className="p-3 text-xs text-slate-400 text-center">
                            No se encontraron fórmulas
                          </div>
                        ) : (
                          filteredFormulas.slice(0, 50).map((f) => (
                            <button
                              key={f.Codigo}
                              type="button"
                              onClick={() => {
                                setUdfFormState({ ...udfFormState, Formula: f.Codigo });
                                setShowFormulaSuggestions(false);
                              }}
                              className={`w-full text-left p-2.5 text-xs border-b last:border-b-0 transition flex flex-col gap-0.5 ${isDark
                                ? "border-slate-800/50 hover:bg-teal-500/10 text-slate-200 hover:text-teal-400"
                                : "border-slate-100 hover:bg-teal-50/50 text-slate-700 hover:text-teal-600"
                                }`}
                            >
                              <div className="font-bold font-mono text-teal-500">{f.Codigo}</div>
                              <div className="text-[10px] text-slate-400 truncate">{f.Nombre}</div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Proceso */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 text-[10px] uppercase font-bold">Proceso (U_PROCESO)</label>
                    <select
                      value={udfFormState.Proceso}
                      onChange={(e) => setUdfFormState({ ...udfFormState, Proceso: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border text-xs transition ${isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                    >
                      <option value="">— Seleccione —</option>
                      {Object.entries(UdfMaps.Proceso).map(([val, label]) => (
                        <option key={val} value={val}>{label} ({val})</option>
                      ))}
                    </select>
                  </div>

                  {/* TipoProducto */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 text-[10px] uppercase font-bold">Tipo Producto (U_TipoProducto)</label>
                    <select
                      value={udfFormState.TipoProducto}
                      onChange={(e) => setUdfFormState({ ...udfFormState, TipoProducto: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border text-xs transition ${isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                    >
                      <option value="">— Seleccione —</option>
                      {Object.entries(UdfMaps.TipoProducto).map(([val, label]) => (
                        <option key={val} value={val}>{label} ({val})</option>
                      ))}
                    </select>
                  </div>

                  {/* Presentacion */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 text-[10px] uppercase font-bold">Presentación (U_Presentacion)</label>
                    <select
                      value={udfFormState.Presentacion}
                      onChange={(e) => setUdfFormState({ ...udfFormState, Presentacion: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border text-xs transition ${isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                    >
                      <option value="">— Seleccione —</option>
                      {Object.entries(UdfMaps.Presentacion).map(([val, label]) => (
                        <option key={val} value={val}>{label} ({val})</option>
                      ))}
                    </select>
                  </div>

                  {/* TamMatriz */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 text-[10px] uppercase font-bold">Tamaño Matriz (U_TamanoMatriz)</label>
                    <select
                      value={udfFormState.TamMatriz}
                      onChange={(e) => setUdfFormState({ ...udfFormState, TamMatriz: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border text-xs transition ${isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                    >
                      <option value="">— Seleccione —</option>
                      {Object.entries(UdfMaps.TamMatriz).map(([val, label]) => (
                        <option key={val} value={val}>{label} ({val})</option>
                      ))}
                    </select>
                  </div>

                  {/* MallaMolino */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 text-[10px] uppercase font-bold">Malla de Molino (U_MallaMolino)</label>
                    <select
                      value={udfFormState.MallaMolino}
                      onChange={(e) => setUdfFormState({ ...udfFormState, MallaMolino: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border text-xs transition ${isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                    >
                      <option value="">— Seleccione —</option>
                      {Object.entries(UdfMaps.MallaMolino).map(([val, label]) => (
                        <option key={val} value={val}>{label} ({val})</option>
                      ))}
                    </select>
                  </div>

                  {/* CantPLC */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 text-[10px] uppercase font-bold">Cantidad PLC (U_CANTPLC)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={udfFormState.CantPLC}
                      onChange={(e) => setUdfFormState({ ...udfFormState, CantPLC: Number(e.target.value) })}
                      className={`w-full p-2.5 rounded-lg border text-xs transition ${isDark ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-teal-500" : "bg-slate-50 border-slate-200 text-slate-700 focus:border-teal-500"
                        }`}
                      placeholder="0,00"
                    />
                  </div>

                  {/* Programacion */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 text-[10px] uppercase font-bold">Programación (U_PROGRAMACION)</label>
                    <select
                      value={udfFormState.Programacion}
                      onChange={(e) => setUdfFormState({ ...udfFormState, Programacion: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border text-xs transition ${isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                    >
                      <option value="">— Seleccione —</option>
                      {Object.entries(UdfMaps.Programacion).map(([val, label]) => (
                        <option key={val} value={val}>{label} ({val})</option>
                      ))}
                    </select>
                  </div>

                  {/* Etiqueta */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 text-[10px] uppercase font-bold">Etiqueta (U_Etiqueta)</label>
                    <select
                      value={udfFormState.Etiqueta}
                      onChange={(e) => setUdfFormState({ ...udfFormState, Etiqueta: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border text-xs transition ${isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                    >
                      <option value="">— Seleccione —</option>
                      {Object.entries(UdfMaps.Etiqueta).map(([val, label]) => (
                        <option key={val} value={val}>{label} ({val})</option>
                      ))}
                    </select>
                  </div>

                  {/* FechaIni */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 text-[10px] uppercase font-bold">Fecha Inicio (U_FECHAINI)</label>
                    <input
                      type="date"
                      value={udfFormState.FechaIni}
                      onChange={(e) => setUdfFormState({ ...udfFormState, FechaIni: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border text-xs transition ${isDark ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-teal-500" : "bg-slate-50 border-slate-200 text-slate-700 focus:border-teal-500"
                        }`}
                    />
                  </div>

                  {/* U_HORAINI */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 text-[10px] uppercase font-bold">Hora Inicio (U_HORAINI)</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={udfFormState.U_HORAINI}
                      onChange={(e) => setUdfFormState({ ...udfFormState, U_HORAINI: e.target.value.replace(/\D/g, "") })}
                      className={`w-full p-2.5 rounded-lg border text-xs transition ${isDark ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-teal-500" : "bg-slate-50 border-slate-200 text-slate-700 focus:border-teal-500"
                        }`}
                      placeholder="0800"
                    />
                    <p className="text-[9px] text-slate-500 text-left">Formato: 4 dígitos (Ej: 0800 para 08:00)</p>
                  </div>

                  {/* FechaFin */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 text-[10px] uppercase font-bold">Fecha Fin (U_FECHADFIN)</label>
                    <input
                      type="date"
                      value={udfFormState.FechaFin}
                      onChange={(e) => setUdfFormState({ ...udfFormState, FechaFin: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border text-xs transition ${isDark ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-teal-500" : "bg-slate-50 border-slate-200 text-slate-700 focus:border-teal-500"
                        }`}
                    />
                  </div>

                  {/* U_HORAFIN */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 text-[10px] uppercase font-bold">Hora Fin (U_HORAFIN)</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={udfFormState.U_HORAFIN}
                      onChange={(e) => setUdfFormState({ ...udfFormState, U_HORAFIN: e.target.value.replace(/\D/g, "") })}
                      className={`w-full p-2.5 rounded-lg border text-xs transition ${isDark ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-teal-500" : "bg-slate-50 border-slate-200 text-slate-700 focus:border-teal-500"
                        }`}
                      placeholder="1630"
                    />
                    <p className="text-[9px] text-slate-500 text-left">Formato: 4 dígitos (Ej: 1630 para 16:30)</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t pt-4 mt-6 border-slate-800 flex justify-end gap-3 shrink-0">
                <button
                  onClick={() => setIsEditingUdfs(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${isDark ? "bg-slate-800 hover:bg-slate-750 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                    }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveUdfs}
                  disabled={isSavingUdfs}
                  className={`px-5 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center justify-center gap-1.5 ${isDark ? "bg-teal-500 hover:bg-teal-400 text-slate-950 disabled:bg-slate-800 disabled:text-slate-600" : "bg-teal-600 hover:bg-teal-500 text-white disabled:bg-slate-100 disabled:text-slate-400"
                    }`}
                >
                  {isSavingUdfs ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>GUARDANDO...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>GUARDAR ESPECIFICACIONES</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Production Generation Modal */}
      <AnimatePresence>
        {showProductionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`w-full max-w-xl rounded-2xl flex flex-col shadow-2xl overflow-hidden border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
            >
              <div className={`p-5 flex justify-between items-center border-b ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-sky-500/20 flex items-center justify-center border border-teal-500/30">
                    <Server className="h-5 w-5 text-teal-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Generando Producción</h2>
                    <p className="text-xs text-slate-500">Ejecutando operaciones en SAP Service Layer</p>
                  </div>
                </div>
                {productionSteps.every(s => s.status !== 'loading') && (
                  <button onClick={() => setShowProductionModal(false)} className="p-2 rounded-xl hover:bg-slate-800/50 text-slate-400 hover:text-white transition">
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="p-6 space-y-4">
                {productionSteps.map((step, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border flex items-start gap-4 ${isDark ? "bg-slate-950/50 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <div className="shrink-0 mt-0.5">
                      {step.status === 'pending' && <div className="h-5 w-5 rounded-full border-2 border-slate-500" />}
                      {step.status === 'loading' && <RefreshCw className="h-5 w-5 text-sky-500 animate-spin" />}
                      {step.status === 'success' && <CheckCircle className="h-5 w-5 text-emerald-500" />}
                      {step.status === 'error' && <X className="h-5 w-5 text-red-500" />}
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-sm font-bold ${step.status === 'pending' ? 'text-slate-500' : ''}`}>{step.title}</h4>
                      {step.message && (
                        <p className={`text-xs mt-1 font-mono ${step.status === 'error' ? 'text-red-400' : 'text-slate-400'}`}>
                          {step.message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 border-t border-slate-800 flex justify-end gap-3">
                {productionSteps.every(s => s.status !== 'loading') && (
                  <button
                    onClick={() => {
                      setShowProductionModal(false);
                      if (productionSteps.every(s => s.status === 'success')) {
                        // Optional: Reload orders or reset state
                        setActiveTab("sap");
                        loadOrders();
                      }
                    }}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition ${productionSteps.every(s => s.status === 'success')
                      ? "bg-teal-600 hover:bg-teal-500 text-white"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                      }`}
                  >
                    {productionSteps.every(s => s.status === 'success') ? "FINALIZAR" : "CERRAR"}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
