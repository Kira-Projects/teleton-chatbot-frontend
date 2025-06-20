/* eslint-disable */
/* eslint-disable react-refresh/only-export-components */

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
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RefreshCcw, Database, Mail, AlertCircle } from "lucide-react"
import { useToast } from "../../hooks/use-toast"
import { config } from "@/config"
import KBStatusMonitor from "./KBStatusMonitor" // Import the new component

// URL base de la API
const API_BASE_URL = config.REST_API

// Types
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

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  uploadDate: string
  status: "uploaded" | "processing" | "processed" | "error" | "moved"
}

interface KBStatus {
  is_generating: boolean
  rag_system_loaded: boolean
  last_generation_time?: string
  documents_count?: number
}

const Admin = () => {
  // Toast notifications
  const { toast } = useToast()

  // Ref for file input

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
    uploadingFiles: false,
  })

  // Estado para mensajes de operación
  const [messages, setMessages] = useState<{
    [key: string]: { text: string; type: "success" | "error" }
  }>({})

  // Estado para consultas sin respuesta
  const [unansweredQueries, setUnansweredQueries] = useState<UnansweredQuery[]>(
    []
  )

  // Estado para KB status (will be updated by the KBStatusMonitor)
  const [, setKbStatus] = useState<KBStatus>({
    is_generating: false,
    rag_system_loaded: false,
    documents_count: 0,
  })

  // Estado para archivos seleccionados

  // Estado para archivos subidos
  const [_, setUploadedFiles] = useState<UploadedFile[]>([])

  // Cargar configuración al iniciar
  useEffect(() => {
    loadSupportConfig()
    loadUnansweredQueries()
    loadUploadedFiles()
  }, [])

  // Handle KB status change from the monitor component
  const handleStatusChange = (newStatus: KBStatus) => {
    setKbStatus(newStatus)
  }

  // Handle generation complete event
  const handleGenerationComplete = () => {
    // Reload uploaded files when generation completes
    loadUploadedFiles()
  }

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
      toast({
        title: "Configuración guardada",
        description: "La configuración de soporte se ha guardado correctamente",
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
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración de soporte",
        variant: "destructive",
      })
    } finally {
      setIsLoading({ ...isLoading, savingConfig: false })
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

  // Cargar archivos subidos
  const loadUploadedFiles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/uploaded-files`)
      console.log("Uploaded files:", response.data.files)
      setUploadedFiles(response.data.files)
    } catch (error) {
      console.error("Error al cargar archivos subidos:", error)
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

      {/* Estado de la KB - Now using the KBStatusMonitor component */}
      <div className="mb-8">
        <KBStatusMonitor
          onStatusChange={handleStatusChange}
          onGenerationComplete={handleGenerationComplete}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Configuración de soporte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Configuración de Soporte
            </CardTitle>
            <CardDescription>Administra el correo de soporte</CardDescription>
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
            <a
              className="block text-blue-500 underline"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://copilotstudio.microsoft.com/environments/Default-cc745815-8878-4368-9496-981c83ae1cdc/bots/7a79a63e-00ae-458a-86fc-d61456ebc248/overview`}
            >
              Ir a CopilotStudio - Agente Teletón Q&A
            </a>
          </CardHeader>
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
