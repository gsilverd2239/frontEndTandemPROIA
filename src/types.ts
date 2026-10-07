export interface SapUser {
  SessionID: string;
  user_code: string;
  username: string;
  u_email: string;
  CompnyName: string;
  CompnyAddr: string;
  phone1: string;
  e_mail: string;
  BD: string;
  Sucursal: string;
  Departamento: string;
  SucursalCode: string;
  SucursalName: string;
  origen: number;
  PDF?: string;
  XML?: string;
  IMG?: string;
  isSandbox: boolean;
}

export interface SapConfig {
  serviceLayerUrl: string;
  hanaServer: string;
  hanaUser: string;
  hanaPassword: string;
  isSandbox: boolean;
}

export interface ComponentMaterial {
  ItemCode: string;
  ItemName: string;
  PlannedQty: number;
  IssuedQty: number;
  Warehouse: string;
  LineNum?: number;
}

export interface ActualConsumption {
  ItemCode: string;
  Qty: number;
  notes: string;
}

export interface ThirdPartyTelemetry {
  wsStatus: string;
  finishedQtyRecorded: number;
  machineId: string;
  runHours: number;
  actualConsumption: ActualConsumption[];
  discrepancyAnalyzed: boolean;
}

export interface ProductionOrder {
  DocEntry: number;
  DocNum: number;
  ItemCode: string;
  ItemName: string;
  Status: "Released" | "Planned" | "Closed" | string;
  PlannedQty: number;
  CompletedQty: number;
  Warehouse: string;
  U_Machine: string;
  U_Operator: string;
  PostDate: string;
  DueDate: string;
  Components: ComponentMaterial[];
  ThirdPartyTelemetry?: ThirdPartyTelemetry | null;
  Formula?: string;
  Proceso?: string;
  FechaIni?: string;
  U_HORAINI?: string;
  FechaFin?: string;
  U_HORAFIN?: string;
  TipoProducto?: string;
  Presentacion?: string;
  TamMatriz?: string;
  MallaMolino?: string;
  LineProduccion?: string;
  CantPLC?: number;
  Etiqueta?: string;
  Programacion?: string;
  Negocio?: string;
  U_PRIORIDAD?: string;
}

export interface LogEntry {
  timestamp: string;
  type: "INFO" | "SUCCESS" | "WARN" | "ERROR" | "SL_REQUEST" | "SL_RESPONSE";
  message: string;
  payload?: any;
}

export interface AiOptimizationResult {
  summary: string;
  discrepancyAnalysis: string;
  sapAdjustments: {
    ItemCode: string;
    Planned: number;
    Actual: number;
    Adjustment: number;
    Type: string;
  }[];
  optimizationScore: number;
}
