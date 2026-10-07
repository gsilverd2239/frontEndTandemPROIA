import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Database, Lock, User, Eye, EyeOff, Server, AlertCircle, CheckCircle, RefreshCw, Sun, Moon, Factory, Package, Briefcase, Warehouse, Award } from "lucide-react";
import { SapConfig, SapUser } from "../types";

interface LoginScreenProps {
  onLoginSuccess: (user: SapUser) => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
}

export default function LoginScreen({ onLoginSuccess, theme, toggleTheme }: LoginScreenProps) {
  // Credentials State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedSchema, setSelectedSchema] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // SAP Server Configuration State
  const [config, setConfig] = useState<SapConfig>({
    serviceLayerUrl: "https://172.19.0.88:50000/b1s/v1",
    hanaServer: "172.19.0.88:30015",
    hanaUser: "SYSTEM",
    hanaPassword: "Admin123",
    isSandbox: false,
  });

  // UI State
  const [schemas, setSchemas] = useState<{ DbName: string; cpnyName: string }[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSchemas, setIsFetchingSchemas] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" | "info" | null }>({ text: "", type: null });

  // Load Saved Settings on Mount
  useEffect(() => {
    // Load config from backend
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data) setConfig(data);
      })
      .catch((err) => console.error("Error cargando config:", err));

    // Load credentials from localStorage if remembered
    const savedUser = localStorage.getItem("tandempro_user");
    const savedPass = localStorage.getItem("tandempro_pass");
    const savedSchema = localStorage.getItem("tandempro_schema");
    const savedRemember = localStorage.getItem("tandempro_remember");

    // The selected schema is always remembered and loaded, regardless of rememberMe
    if (savedSchema) {
      setSelectedSchema(savedSchema);
    }

    if (savedRemember === "true") {
      setRememberMe(true);
      if (savedUser) setUsername(savedUser);
      if (savedPass) setPassword(savedPass);
    } else {
      setRememberMe(false);
    }
  }, []);

  // Fetch Schemas whenever config mode changes (or on mount)
  useEffect(() => {
    loadSchemas();
  }, [config.isSandbox, config.hanaServer]);

  const loadSchemas = async () => {
    setIsFetchingSchemas(true);
    try {
      const res = await fetch("/api/sap/schemas");
      if (res.ok) {
        const data = await res.json();
        setSchemas(data);
        if (data.length > 0) {
          // Default to first schema or restore saved schema if matches
          const savedSchema = localStorage.getItem("tandempro_schema");
          const schemaExists = data.some((s: any) => s.DbName === savedSchema);
          setSelectedSchema(schemaExists && savedSchema ? savedSchema : data[0].DbName);
        }
      } else {
        throw new Error("Respuesta de esquemas no exitosa");
      }
    } catch (err: any) {
      console.error("Error fetching schemas:", err);
      // Fallback schemas so UI never crashes
      const fallback = [
        { DbName: "SBO_TANDEMPRO_PROD", cpnyName: "TandemPRO S.A. - Producción (Local Fallback)" },
        { DbName: "SBO_TANDEMPRO_TEST", cpnyName: "TandemPRO S.A. - Pruebas (Local Fallback)" },
      ];
      setSchemas(fallback);
      setSelectedSchema(fallback[0].DbName);
    } finally {
      setIsFetchingSchemas(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "Guardando configuración de servidores...", type: "info" });
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setMessage({ text: "Configuración actualizada. Recargando esquemas...", type: "success" });
        await loadSchemas();
        setTimeout(() => setMessage({ text: "", type: null }), 3000);
      } else {
        throw new Error("No se pudo guardar la configuración");
      }
    } catch (err: any) {
      setMessage({ text: `Error al guardar: ${err.message}`, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !selectedSchema) {
      setMessage({ text: "Por favor complete todos los campos requeridos.", type: "error" });
      return;
    }

    setIsLoading(true);
    setMessage({ text: "Conectando al Service Layer de SAP Business One...", type: "info" });

    try {
      const res = await fetch("/api/sap/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          schema: selectedSchema,
          serviceLayerUrl: config.serviceLayerUrl,
          isSandbox: config.isSandbox,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage({ text: "¡Autenticación exitosa con SAP B1!", type: "success" });

        // Save to localStorage if rememberMe is enabled (only applies to user/pass)
        if (rememberMe) {
          localStorage.setItem("tandempro_user", username);
          localStorage.setItem("tandempro_pass", password);
          localStorage.setItem("tandempro_remember", "true");
        } else {
          localStorage.removeItem("tandempro_user");
          localStorage.removeItem("tandempro_pass");
          localStorage.setItem("tandempro_remember", "false");
        }

        // Schema is ALWAYS remembered, regardless of rememberMe
        if (selectedSchema) {
          localStorage.setItem("tandempro_schema", selectedSchema);
        }

        // Delay slightly for visual effect
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 1200);
      } else {
        setMessage({ text: data.error || "Fallo en la conexión. Verifique sus credenciales.", type: "error" });
      }
    } catch (err: any) {
      setMessage({ text: `Error de red: ${err.message}`, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="login_fullscreen" className={`relative min-h-screen flex items-center justify-center overflow-hidden font-sans transition-colors duration-150 ${theme === "dark"
      ? "bg-gradient-to-br from-slate-900 via-slate-950 to-zinc-900"
      : "bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]"
      }`}>
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        type="button"
        className={`absolute top-4 right-4 p-2.5 rounded-xl border transition-all duration-150 flex items-center justify-center z-50 ${theme === "dark"
          ? "bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-300"
          : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm"
          }`}
        title={theme === "dark" ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
      >
        {theme === "dark" ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5 text-indigo-600" />}
      </button>

      {/* Abstract Grid background for a high-tech corporate appearance */}
      <div className={`absolute inset-0 bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] transition-opacity duration-150 ${theme === "dark"
        ? "bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] opacity-40"
        : "bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] opacity-20"
        }`}></div>

      {/* Decorative Ambient Lights */}
      <div className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl transition-opacity duration-150 ${theme === "dark" ? "bg-teal-500/10" : "bg-teal-500/5"}`}></div>
      <div className={`absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl transition-opacity duration-150 ${theme === "dark" ? "bg-sky-500/10" : "bg-sky-500/5"}`}></div>

      <div className="relative w-full max-w-5xl px-4 flex flex-col md:flex-row gap-8 items-center justify-center z-10">

        {/* Left Side: Brand presentation and current version */}
        <div className="flex-1 text-left hidden md:block max-w-md">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono mb-4 transition-colors duration-150 ${theme === "dark"
              ? "border-teal-500/30 bg-teal-500/5 text-teal-400"
              : "border-teal-500/20 bg-teal-50/50 text-teal-600"
              }`}>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75 animate-duration-1000"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              SBO Service Layer Active
            </div> */}
            <h1 className={`text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight transition-colors duration-150 ${theme === "dark" ? "text-white" : "text-slate-900"
              }`}>
              Tandem<span className="text-teal-500">PRO</span>
            </h1>
            <p className={`mt-4 text-base leading-relaxed transition-colors duration-150 ${theme === "dark" ? "text-slate-400" : "text-slate-600"
              }`}>
              La plataforma industrial inteligente integrada a <strong className={theme === "dark" ? "text-slate-200" : "text-slate-800"}>SAP Business One.</strong>
            </p>

            <div className={`mt-8 space-y-4 font-mono text-xs transition-colors duration-150 ${theme === "dark" ? "text-slate-500" : "text-slate-500"}`}>
              <div className="flex items-center gap-3">
                <Factory className={`h-4 w-4 ${theme === "dark" ? "text-teal-500" : "text-teal-600"}`} />
                <span className={theme === "dark" ? "text-slate-500" : "text-slate-600"}>Orden de Producción</span>
              </div>
              <div className="flex items-center gap-3">
                <Server className={`h-4 w-4 ${theme === "dark" ? "text-teal-500" : "text-teal-600"}`} />
                <span className={theme === "dark" ? "text-slate-500" : "text-slate-600"}>Consumo de Terceros</span>
              </div>
              <div className="flex items-center gap-3">
                <Warehouse className={`h-4 w-4 ${theme === "dark" ? "text-sky-500" : "text-sky-600"}`} />
                <span className={theme === "dark" ? "text-slate-500" : "text-slate-600"}>Compras, Movimientos de inventario</span>
              </div>
              <div className="flex items-center gap-3">
                <Award className={`h-4 w-4 ${theme === "dark" ? "text-amber-500" : "text-amber-600"}`} />
                <span className={theme === "dark" ? "text-slate-500" : "text-slate-600"}>Control de calidad</span>
              </div>
            </div>

            <div className={`mt-12 pt-6 border-t text-xs flex justify-between transition-colors duration-150 ${theme === "dark" ? "border-slate-800 text-slate-600" : "border-slate-200 text-slate-400"
              }`}>
              <span>Desarrollado por TI Grupo Pettengill © {new Date().getFullYear()}</span>
              <span>v1.0.4 </span>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Centered Credentials Form Modal */}
        <motion.div
          id="login_modal_container"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`w-full max-w-md border rounded-2xl shadow-2xl overflow-hidden transition-all duration-150 ${theme === "dark"
            ? "bg-slate-900/90 border-slate-800 backdrop-blur-md"
            : "bg-white border-slate-200/80 shadow-slate-200/50"
            }`}
        >
          {/* Header */}
          <div className={`p-6 border-b flex items-center justify-between transition-colors duration-150 ${theme === "dark"
            ? "border-slate-800 bg-slate-950/50"
            : "border-slate-200 bg-slate-50/50"
            }`}>
            <div>
              <div className={`md:hidden text-lg font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                Tandem<span className="text-teal-500">PRO</span>
              </div>
              <p className={`text-xs mt-1 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}><strong className={theme === "dark" ? "text-slate-200" : "text-slate-800"}>Bienvenido,</strong> inicie sesión para continuar</p>
            </div>
            {/* <button
              onClick={() => setShowConfig(!showConfig)}
              type="button"
              className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-all duration-150 ${
                showConfig 
                  ? "bg-teal-500/15 border-teal-500/40 text-teal-300" 
                  : theme === "dark"
                  ? "bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  : "bg-slate-100 border-slate-200/80 hover:bg-slate-200 text-slate-600 hover:text-slate-800"
              }`}
              title="Configurar conexión con el servidor SAP"
              id="btn_toggle_config"
            >
              <Settings className="h-4 w-4 animate-spin-slow" />
              <span>Ajustes</span>
          </button> */}
          </div>

          {/* Alert messages inside modal */}
          {message.text && (
            <div className={`px-6 py-3 border-b text-xs flex items-center gap-2 ${message.type === "error"
              ? (theme === "dark" ? "bg-red-500/10 border-red-500/20 text-red-300" : "bg-red-50 border-red-200 text-red-600")
              : message.type === "success"
                ? (theme === "dark" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-700")
                : (theme === "dark" ? "bg-teal-500/10 border-teal-500/20 text-teal-300" : "bg-teal-50 border-teal-200 text-teal-700")
              }`}>
              {message.type === "error" ? (
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
              ) : message.type === "success" ? (
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
              ) : (
                <RefreshCw className="h-4 w-4 animate-spin flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Sliding panel for DB and Service Layer Config (chekBD equivalent) */}
          {showConfig ? (
            <form onSubmit={handleSaveConfig} className={`p-6 space-y-4 border-b text-slate-300 transition-colors duration-150 ${theme === "dark" ? "bg-slate-950/40 border-slate-800" : "bg-slate-50/50 border-slate-200"
              }`}>
              <h3 className={`text-sm font-semibold flex items-center gap-2 mb-2 font-mono ${theme === "dark" ? "text-white" : "text-slate-800"}`}>
                <Server className="h-4 w-4 text-teal-500" /> Parámetros del Servidor SAP
              </h3>

              <div>
                <label className={`block text-[11px] font-mono uppercase mb-1 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Modo de Operación</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, isSandbox: true })}
                    className={`py-1.5 px-3 rounded text-xs font-semibold transition-all duration-150 ${config.isSandbox
                      ? "bg-teal-600 text-white font-semibold"
                      : theme === "dark" ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                      }`}
                  >
                    Simulador Sandbox
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, isSandbox: false })}
                    className={`py-1.5 px-3 rounded text-xs font-semibold transition-all duration-150 ${!config.isSandbox
                      ? "bg-teal-600 text-white font-semibold"
                      : theme === "dark" ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                      }`}
                  >
                    Service Layer Real
                  </button>
                </div>
              </div>

              {!config.isSandbox && (
                <>
                  <div>
                    <label className={`block text-[11px] font-mono uppercase ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Service Layer URL</label>
                    <input
                      type="text"
                      className={`mt-1 w-full text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-teal-500 font-mono border transition ${theme === "dark" ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-800"
                        }`}
                      value={config.serviceLayerUrl}
                      onChange={(e) => setConfig({ ...config, serviceLayerUrl: e.target.value })}
                      placeholder="https://172.19.0.88:50000/b1s/v1"
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-[11px] font-mono uppercase ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Servidor HANA (IP:Port)</label>
                    <input
                      type="text"
                      className={`mt-1 w-full text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-teal-500 font-mono border transition ${theme === "dark" ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-800"
                        }`}
                      value={config.hanaServer}
                      onChange={(e) => setConfig({ ...config, hanaServer: e.target.value })}
                      placeholder="172.19.0.88:30015"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={`block text-[11px] font-mono uppercase ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>HANA User</label>
                      <input
                        type="text"
                        className={`mt-1 w-full text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-teal-500 font-mono border transition ${theme === "dark" ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-800"
                          }`}
                        value={config.hanaUser}
                        onChange={(e) => setConfig({ ...config, hanaUser: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-[11px] font-mono uppercase ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>HANA Password</label>
                      <input
                        type="password"
                        className={`mt-1 w-full text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-teal-500 font-mono border transition ${theme === "dark" ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-800"
                          }`}
                        value={config.hanaPassword}
                        onChange={(e) => setConfig({ ...config, hanaPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfig(false)}
                  className={`px-3 py-1.5 rounded text-xs transition ${theme === "dark" ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                    }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded text-xs bg-teal-600 hover:bg-teal-500 text-white font-semibold transition flex items-center gap-1"
                >
                  {isLoading ? "Guardando..." : "Guardar y Conectar"}
                </button>
              </div>
            </form>
          ) : null}

          {/* Core Login Credentials Form */}
          <form onSubmit={handleLogin} className="p-6 space-y-4">

            {/* Schema Selector (cbSchema combo equivalent) */}
            <div>
              <label htmlFor="cbSchema" className={`block text-xs font-medium mb-1.5 flex justify-between transition-colors duration-150 ${theme === "dark" ? "text-slate-400" : "text-slate-600"
                }`}>
                <span>Esquema</span>
                {isFetchingSchemas && <span className="text-[10px] text-teal-500 font-mono flex items-center gap-1"><RefreshCw className="h-3 w-3 animate-spin" /> Cargando...</span>}
              </label>
              <div className="relative">
                <Database className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <select
                  id="cbSchema"
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition border ${theme === "dark" ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
                    }`}
                  value={selectedSchema}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedSchema(val);
                    if (val) {
                      localStorage.setItem("tandempro_schema", val);
                    }
                  }}
                  disabled={isFetchingSchemas}
                >
                  {schemas.map((schema) => (
                    <option key={schema.DbName} value={schema.DbName}>
                      {schema.cpnyName} [{schema.DbName}]
                    </option>
                  ))}
                  {schemas.length === 0 && (
                    <option value="">No hay esquemas disponibles</option>
                  )}
                </select>
              </div>
            </div>

            {/* Username Input (txtUser) */}
            <div>
              <label htmlFor="txtUser" className={`block text-xs font-medium mb-1.5 transition-colors duration-150 ${theme === "dark" ? "text-slate-400" : "text-slate-600"
                }`}>
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="txtUser"
                  type="text"
                  placeholder="manager"
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition border ${theme === "dark"
                    ? "bg-slate-950 border-slate-800 text-white placeholder-slate-600"
                    : "bg-white border-slate-200 text-slate-800 placeholder-slate-400"
                    }`}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              {/* <p className={`text-[10px] mt-1 font-mono transition-colors duration-150 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>Prueba: manager / admin</p> */}
            </div>

            {/* Password Input (txtPass) */}
            <div>
              <label htmlFor="txtPass" className={`block text-xs font-medium mb-1.5 transition-colors duration-150 ${theme === "dark" ? "text-slate-400" : "text-slate-600"
                }`}>
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="txtPass"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-10 py-2 text-sm rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition border ${theme === "dark"
                    ? "bg-slate-950 border-slate-800 text-white placeholder-slate-600"
                    : "bg-white border-slate-200 text-slate-800 placeholder-slate-400"
                    }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-2.5 focus:outline-none transition-colors duration-150 ${theme === "dark" ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
                    }`}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Toggle and status (tswRemember equivalent) */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  id="tswRemember"
                  type="checkbox"
                  className={`rounded focus:ring-0 focus:ring-offset-0 h-4 w-4 ${theme === "dark" ? "bg-slate-950 border-slate-800 text-teal-500" : "bg-white border-slate-200 text-teal-600"
                    }`}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className={`text-xs transition-colors duration-150 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Recordar sesión</span>
              </label>
            </div>

            {/* Login Action (btnLogin) */}
            <button
              id="btnLogin"
              type="submit"
              disabled={isLoading || isFetchingSchemas}
              className={`w-full py-2.5 mt-4 font-bold rounded-xl transition-all duration-150 transform active:scale-98 shadow-lg flex items-center justify-center gap-2 ${theme === "dark"
                ? "bg-teal-500 hover:bg-teal-400 disabled:bg-slate-850 disabled:text-slate-500 text-slate-950 shadow-teal-500/10 hover:shadow-teal-500/20"
                : "bg-teal-600 hover:bg-teal-500 disabled:bg-slate-100 disabled:text-slate-400 text-white shadow-teal-600/10 hover:shadow-teal-600/20"
                }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-current" />
                  <span>Conectando a SAP...</span>
                </>
              ) : (
                <span>Ingresar</span>
              )}
            </button>
          </form>

          {/* Modal Footer with metadata version checks */}
          <div className={`px-6 py-4 border-t flex items-center justify-between text-[10px] font-mono transition-colors duration-150 ${theme === "dark" ? "border-slate-800 bg-slate-950/40 text-slate-500" : "border-slate-200 bg-slate-50 text-slate-400"
            }`}>
            {/* <span>Servicio: REST API (JSON)</span>
            <span>Estable: v1.0.4 == BPRO</span> */}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
