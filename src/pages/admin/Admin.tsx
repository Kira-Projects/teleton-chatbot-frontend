import { useState, useEffect } from "react"
import axios from "axios"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  RefreshCcw,
  Database,
  Mail,
  HardDrive,
  AlertCircle,
} from "lucide-react"

// URL base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

interface SupportConfig {
  support_email: string
  support_phone: string
  fallback_message: string
}

interface UnansweredQuery {
  query: string
  session_id: string
  timestamp: string
  processed: boolean
  source: string
}

const Admin = () => {
  // Estados para configuración de soporte
  const [supportConfig, setSupportConfig] = useState<SupportConfig>({
    support_email: "",
    support_phone: "",
    fallback_message: "",
  })

  // Estados para operaciones
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({
    loadingConfig: false,
    savingConfig: false,
    generatingKB: false,
    loadingGDrive: false,
    loadingQueries: false,
  })

  // Estado para mensajes de operación
  const [messages, setMessages] = useState<{
    [key: string]: { text: string; type: "success" | "error" }
  }>({})

  // Estado para consultas sin respuesta
  const [unansweredQueries, setUnansweredQueries] = useState<UnansweredQuery[]>(
    []
  )

  // Estado para status de la KB
  const [kbStatus, setKbStatus] = useState({
    is_generating: false,
    rag_system_loaded: false,
  })

  // Cargar configuración al iniciar
  useEffect(() => {
    loadSupportConfig()
    loadKbStatus()
    loadUnansweredQueries()

    // Verificar estado de la KB cada 10 segundos
    const intervalId = setInterval(() => {
      loadKbStatus()
    }, 10000)

    return () => clearInterval(intervalId)
  }, [])

  // Cargar configuración de soporte
  const loadSupportConfig = async () => {
    try {
      setIsLoading({ ...isLoading, loadingConfig: true })
      const response = await axios.get(`${API_BASE_URL}/support-config`)
      setSupportConfig(response.data)
      setMessages({
        ...messages,
        loadConfig: {
          text: "Configuración cargada correctamente",
          type: "success",
        },
      })
    } catch (error) {
      console.error("Error al cargar configuración:", error)
      setMessages({
        ...messages,
        loadConfig: { text: "Error al cargar la configuración", type: "error" },
      })
    } finally {
      setIsLoading({ ...isLoading, loadingConfig: false })
    }
  }

  // Guardar configuración de soporte
  const saveSupportConfig = async () => {
    try {
      setIsLoading({ ...isLoading, savingConfig: true })
      await axios.post(`${API_BASE_URL}/support-config`, supportConfig)
      setMessages({
        ...messages,
        saveConfig: {
          text: "Configuración guardada correctamente",
          type: "success",
        },
      })
    } catch (error) {
      console.error("Error al guardar configuración:", error)
      setMessages({
        ...messages,
        saveConfig: {
          text: "Error al guardar la configuración",
          type: "error",
        },
      })
    } finally {
      setIsLoading({ ...isLoading, savingConfig: false })
    }
  }

  // Generar base de conocimiento
  const generateKnowledgeBase = async () => {
    try {
      setIsLoading({ ...isLoading, generatingKB: true })
      await axios.post(`${API_BASE_URL}/generate-kb`)
      setMessages({
        ...messages,
        generateKB: {
          text: "Generación de base de conocimiento iniciada",
          type: "success",
        },
      })
    } catch (error) {
      console.error("Error al iniciar generación de KB:", error)
      setMessages({
        ...messages,
        generateKB: {
          text: "Error al iniciar generación de base de conocimiento",
          type: "error",
        },
      })
    } finally {
      setIsLoading({ ...isLoading, generatingKB: false })
      // Recargar estado de la KB
      setTimeout(() => loadKbStatus(), 2000)
    }
  }

  // Cargar documentos de Google Drive
  const loadFromGDrive = async () => {
    try {
      setIsLoading({ ...isLoading, loadingGDrive: true })
      await axios.post(`${API_BASE_URL}/load-from-gdrive`)
      setMessages({
        ...messages,
        loadGDrive: {
          text: "Descarga de documentos de Google Drive iniciada",
          type: "success",
        },
      })
    } catch (error) {
      console.error("Error al iniciar descarga desde Google Drive:", error)
      setMessages({
        ...messages,
        loadGDrive: {
          text: "Error al iniciar descarga desde Google Drive",
          type: "error",
        },
      })
    } finally {
      setIsLoading({ ...isLoading, loadingGDrive: false })
      // Recargar estado de la KB
      setTimeout(() => loadKbStatus(), 2000)
    }
  }

  // Cargar estado de la KB
  const loadKbStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/kb-status`)
      setKbStatus(response.data)
    } catch (error) {
      console.error("Error al verificar estado de la KB:", error)
    }
  }

  // Cargar consultas sin respuesta
  const loadUnansweredQueries = async () => {
    try {
      setIsLoading({ ...isLoading, loadingQueries: true })
      const response = await axios.get(`${API_BASE_URL}/unanswered-queries`)
      setUnansweredQueries(response.data.queries)
    } catch (error) {
      console.error("Error al cargar consultas sin respuesta:", error)
      setMessages({
        ...messages,
        loadQueries: {
          text: "Error al cargar consultas sin respuesta",
          type: "error",
        },
      })
    } finally {
      setIsLoading({ ...isLoading, loadingQueries: false })
    }
  }

  // Marcar consulta como procesada
  const markQueryAsProcessed = async (query: string) => {
    try {
      await axios.post(`${API_BASE_URL}/mark-processed`, [query])
      // Actualizar la lista de consultas
      loadUnansweredQueries()
    } catch (error) {
      console.error("Error al marcar consulta como procesada:", error)
    }
  }

  // Manejador de cambios en inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setSupportConfig({ ...supportConfig, [name]: value })
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">
        Panel de Administración - Teletón RAG
      </h1>

      {/* Estado de la KB */}
      <div className="mb-8 flex items-center gap-4">
        <Badge className="px-3 py-1">
          {kbStatus.rag_system_loaded
            ? "Sistema RAG cargado"
            : "Sistema RAG no cargado"}
        </Badge>

        {kbStatus.is_generating && (
          <Badge className="px-3 py-1 flex items-center gap-2">
            <RefreshCcw className="w-4 h-4 animate-spin" />
            Generando base de conocimiento
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Configuración de soporte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Configuración de Soporte
            </CardTitle>
            <CardDescription>
              Administra el correo de soporte y mensajes de fallback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="support_email">Correo de soporte</Label>
                <Input
                  id="support_email"
                  name="support_email"
                  value={supportConfig.support_email}
                  onChange={handleInputChange}
                  placeholder="soporte@teleton.cl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="support_phone">Teléfono de soporte</Label>
                <Input
                  id="support_phone"
                  name="support_phone"
                  value={supportConfig.support_phone}
                  onChange={handleInputChange}
                  placeholder="+56912345678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fallback_message">Mensaje de fallback</Label>
                <Textarea
                  id="fallback_message"
                  name="fallback_message"
                  value={supportConfig.fallback_message}
                  onChange={handleInputChange}
                  placeholder="En estos momentos no dispongo de esa información..."
                  rows={4}
                />
                {/* Use {phone} para incluir el número de teléfono. */}
                <p className="text-sm text-gray-500">
                  Use para incluir el número de teléfono.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={loadSupportConfig}
              disabled={isLoading.loadingConfig}
            >
              {isLoading.loadingConfig ? (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> Cargando
                </>
              ) : (
                "Recargar"
              )}
            </Button>
            <Button
              onClick={saveSupportConfig}
              disabled={isLoading.savingConfig}
            >
              {isLoading.savingConfig ? (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> Guardando
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Acciones de la base de conocimiento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Gestión de Base de Conocimiento
            </CardTitle>
            <CardDescription>
              Administra la base de conocimiento del sistema RAG
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                className="w-full"
                variant="default"
                onClick={loadFromGDrive}
                disabled={isLoading.loadingGDrive || kbStatus.is_generating}
              >
                {isLoading.loadingGDrive ? (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Descargando...
                  </>
                ) : (
                  <>
                    <HardDrive className="mr-2 h-4 w-4" /> Descargar Documentos
                    de Google Drive
                  </>
                )}
              </Button>

              <Button
                className="w-full"
                variant="default"
                onClick={generateKnowledgeBase}
                disabled={isLoading.generatingKB || kbStatus.is_generating}
              >
                {isLoading.generatingKB ? (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Generando...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" /> Generar Base de
                    Conocimiento
                  </>
                )}
              </Button>

              {messages.generateKB && (
                <div
                  className={`p-3 rounded text-sm ${
                    messages.generateKB.type === "success"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {messages.generateKB.text}
                </div>
              )}

              {messages.loadGDrive && (
                <div
                  className={`p-3 rounded text-sm ${
                    messages.loadGDrive.type === "success"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {messages.loadGDrive.text}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Consultas sin respuesta */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Consultas sin Respuesta
            </CardTitle>
            <CardDescription>
              Consultas que el sistema no pudo responder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">
                Total: {unansweredQueries.length} consultas sin procesar
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={loadUnansweredQueries}
                disabled={isLoading.loadingQueries}
              >
                {isLoading.loadingQueries ? (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Cargando
                  </>
                ) : (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4" /> Actualizar
                  </>
                )}
              </Button>
            </div>

            <ScrollArea className="h-[300px] rounded-md border p-4">
              {unansweredQueries.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <p>No hay consultas sin respuesta</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {unansweredQueries.map((query, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Badge variant="outline" className="mb-2">
                            {query.source || "API"}
                          </Badge>
                          <p className="text-sm text-gray-500">
                            ID: {query.session_id}
                          </p>
                          <p className="text-sm text-gray-500">
                            Fecha: {new Date(query.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markQueryAsProcessed(query.query)}
                        >
                          Marcar como procesada
                        </Button>
                      </div>
                      <p className="font-medium">{query.query}</p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Admin
