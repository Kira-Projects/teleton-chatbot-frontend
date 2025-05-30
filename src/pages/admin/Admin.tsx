import { useState, useEffect, useRef } from "react"
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
import {
  RefreshCcw,
  Database,
  Mail,
  AlertCircle,
  Upload,
  FileText,
  File,
  FileSpreadsheet,
  X,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
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
  const fileInputRef = useRef<HTMLInputElement>(null)

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
  const [kbStatus, setKbStatus] = useState<KBStatus>({
    is_generating: false,
    rag_system_loaded: false,
    documents_count: 0,
  })

  // Estado para archivos seleccionados
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  // Estado para archivos subidos
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  // Estado para progreso de subida
  const [uploadProgress, setUploadProgress] = useState(0)

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

  // Generar base de conocimiento
  const generateKnowledgeBase = async () => {
    try {
      setIsLoading({ ...isLoading, generatingKB: true })
      await axios.post(`${API_BASE_URL}/generate-kb`, {})
      setMessages({
        ...messages,
        generateKB: {
          text: "Generación de base de conocimiento iniciada",
          type: "success",
        },
      })
      toast({
        title: "Proceso iniciado",
        description: "La generación de la base de conocimiento ha comenzado",
      })
      loadUploadedFiles() // Refresh the uploaded files list after starting generation
    } catch (error) {
      console.error("Error al iniciar generación de KB:", error)
      setMessages({
        ...messages,
        generateKB: {
          text: "Error al iniciar generación de base de conocimiento",
          type: "error",
        },
      })
      toast({
        title: "Error",
        description:
          "No se pudo iniciar la generación de la base de conocimiento",
        variant: "destructive",
      })
    } finally {
      setIsLoading({ ...isLoading, generatingKB: false })
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

  // Manejador de selección de archivos
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Validar tipos de archivos permitidos
    const allowedTypes = [
      "application/pdf", // PDF
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
    ]

    const validFiles: File[] = []
    const invalidFiles: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (allowedTypes.includes(file.type)) {
        validFiles.push(file)
      } else {
        invalidFiles.push(file.name)
      }
    }

    // Mostrar mensaje de error si hay archivos inválidos
    if (invalidFiles.length > 0) {
      toast({
        title: "Archivos no permitidos",
        description: `Solo se permiten archivos PDF, DOCX y XLSX. Archivos rechazados: ${invalidFiles.join(
          ", "
        )}`,
        variant: "destructive",
      })
    }

    // Actualizar lista de archivos seleccionados
    setSelectedFiles((prevFiles) => [...prevFiles, ...validFiles])

    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Remover archivo de la lista de seleccionados
  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
  }

  const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Subir archivos seleccionados
  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return

    try {
      setIsLoading({ ...isLoading, uploadingFiles: true })
      setUploadProgress(0)

      // Crear FormData para la subida
      const formData = new FormData()
      selectedFiles.forEach((file) => {
        formData.append("files", file)
      })

      // Configurar el progreso de la subida
      const config = {
        onUploadProgress: (progressEvent: any) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          setUploadProgress(percentCompleted)
        },
      }

      // Enviar archivos al servidor
      await axios.post(`${API_BASE_URL}/upload-files`, formData, config)
      await sleep(10000)

      // Limpiar lista de archivos seleccionados
      setSelectedFiles([])
      setUploadProgress(0)

      // Recargar lista de archivos subidos
      loadUploadedFiles()

      toast({
        title: "Archivos subidos",
        description: `${selectedFiles.length} archivo(s) subidos correctamente`,
      })
    } catch (error) {
      console.error("Error al subir archivos:", error)
      toast({
        title: "Error",
        description: "No se pudieron subir los archivos",
        variant: "destructive",
      })
    } finally {
      setIsLoading({ ...isLoading, uploadingFiles: false })
    }
  }

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  // Obtener icono para tipo de archivo
  const getFileIcon = (type: string) => {
    if (type.includes("pdf"))
      return <FileText className="w-5 h-5 text-red-500" />
    else if (type.includes("wordprocessingml"))
      return <File className="w-5 h-5 text-blue-500" />
    else if (type.includes("spreadsheetml"))
      return <FileSpreadsheet className="w-5 h-5 text-green-500" />
    else return <File className="w-5 h-5" />
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
              href={`https://drive.google.com/drive/folders/1LYnZlKV7ZMdc8JwBMGsNW2aPPtgERbIU?usp=sharing`}
            >
              Ver Archivos desde Google Drive
            </a>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Subida de archivos */}
              <div className="p-4 border border-dashed rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Subir documentos</h3>
                  <p className="text-xs text-gray-500">Solo PDF, DOCX, XLSX</p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.docx,.xlsx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="hidden"
                  disabled={kbStatus.is_generating || isLoading.uploadingFiles}
                />

                <Button
                  variant="outline"
                  className="w-full mb-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={kbStatus.is_generating || isLoading.uploadingFiles}
                >
                  <Upload className="mr-2 h-4 w-4" /> Seleccionar archivos
                </Button>

                {/* Lista de archivos seleccionados */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2 mt-2 mb-3">
                    <p className="text-xs font-medium">
                      Archivos seleccionados:
                    </p>
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-sm"
                      >
                        <div className="flex items-center">
                          {getFileIcon(file.type)}
                          <span className="ml-2 truncate max-w-[180px]">
                            {file.name}
                          </span>
                          <span className="ml-2 text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSelectedFile(index)}
                          disabled={isLoading.uploadingFiles}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Botón para subir */}
                {selectedFiles.length > 0 && (
                  <>
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={uploadFiles}
                      disabled={
                        isLoading.uploadingFiles || kbStatus.is_generating
                      }
                    >
                      {isLoading.uploadingFiles ? (
                        <>
                          <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" /> Subir archivo
                        </>
                      )}
                    </Button>

                    {/* Barra de progreso */}
                    {isLoading.uploadingFiles && (
                      <Progress value={uploadProgress} className="mt-2" />
                    )}
                  </>
                )}
              </div>

              {/* Lista de archivos subidos */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <h3 className="text-sm font-medium">
                      Documentos subidos ({uploadedFiles.length})
                    </h3>
                  </div>
                  <ScrollArea className="h-[150px] rounded-md border p-2">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2 border-b text-sm"
                      >
                        <div className="flex items-center">
                          {getFileIcon(file.type)}
                          <span className="ml-2 truncate max-w-[180px]">
                            {file.name}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`
                            ${
                              file.status === "uploaded"
                                ? "bg-blue-50 text-blue-800"
                                : ""
                            }
                            ${
                              file.status === "processing"
                                ? "bg-yellow-50 text-yellow-500"
                                : ""
                            }
                            ${
                              file.status === "processed"
                                ? "bg-green-50 text-green-500"
                                : ""
                            }
                            ${
                              file.status === "moved"
                                ? "bg-green-50 text-green-800"
                                : ""
                            }
                            ${
                              file.status === "error"
                                ? "bg-red-50 text-red-800"
                                : ""
                            }
                          `}
                        >
                          {file.status === "uploaded"
                            ? "Subido a Google Drive"
                            : file.status === "processing"
                            ? "Procesando"
                            : file.status === "processed"
                            ? "Procesado"
                            : file.status === "moved"
                            ? "Aprendido por el chatbot"
                            : file.status === "error"
                            ? "Error en subida"
                            : ""}
                        </Badge>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}

              {/* Botón para generar KB */}
              <Button
                className="w-full"
                variant="default"
                onClick={generateKnowledgeBase}
                disabled={kbStatus.is_generating || isLoading.uploadingFiles}
              >
                {kbStatus.is_generating ? (
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
