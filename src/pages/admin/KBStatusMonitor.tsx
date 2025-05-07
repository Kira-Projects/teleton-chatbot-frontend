import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Badge } from "@/components/ui/badge"
import { RefreshCcw } from "lucide-react"
import { useToast } from "../../hooks/use-toast"
import { config } from "@/config"

// URL base de la API
const API_BASE_URL = config.REST_API

// Define KBStatus interface
interface KBStatus {
  is_generating: boolean
  rag_system_loaded: boolean
  last_generation_time?: string
  documents_count?: number
}

interface KBStatusMonitorProps {
  onStatusChange?: (status: KBStatus) => void
  onGenerationComplete?: () => void
}

const KBStatusMonitor = ({
  onStatusChange,
  onGenerationComplete,
}: KBStatusMonitorProps) => {
  // Toast notifications
  const { toast } = useToast()

  // State for status of the KB
  const [kbStatus, setKbStatus] = useState<KBStatus>({
    is_generating: false,
    rag_system_loaded: false,
    documents_count: 0,
  })

  // Use a ref to track the previous state
  const prevGeneratingRef = useRef<boolean>(false)

  // Poll KB status
  useEffect(() => {
    // Initial load
    loadKbStatus()

    // Set up polling interval
    const intervalId = setInterval(() => {
      loadKbStatus()
    }, 5000) // Poll every 5 seconds

    // Clean up interval on unmount
    return () => clearInterval(intervalId)
  }, [])

  // Effect to detect when generation completes
  useEffect(() => {
    // Check if generation just completed (was generating before, not generating now)
    if (prevGeneratingRef.current && !kbStatus.is_generating) {
      console.log("Generation completed!")

      // Show completion toast
      toast({
        title: "Proceso completado",
        description: "La base de conocimiento se ha generado correctamente",
      })

      // Call the callback if provided
      if (onGenerationComplete) {
        onGenerationComplete()
      }
    }

    // Update the ref to current value for next comparison
    prevGeneratingRef.current = kbStatus.is_generating

    // Notify parent of status change
    if (onStatusChange) {
      onStatusChange(kbStatus)
    }
  }, [kbStatus.is_generating, toast, onStatusChange, onGenerationComplete])

  // Load KB status from API
  const loadKbStatus = async () => {
    try {
      const response = await axios.get<KBStatus>(`${API_BASE_URL}/kb-status`)

      console.log("Status API response:", response.data)
      console.log("Current state is_generating:", kbStatus.is_generating)
      console.log("API is_generating:", response.data.is_generating)

      // Update state with response data
      setKbStatus({
        is_generating: response.data.is_generating,
        rag_system_loaded: response.data.rag_system_loaded,
        documents_count: response.data.documents_count,
        last_generation_time: response.data.last_generation_time,
      })
    } catch (error) {
      console.error("Error al verificar estado de la KB:", error)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <Badge
          className={`px-3 py-1 ${
            kbStatus.rag_system_loaded
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {kbStatus.rag_system_loaded
            ? "Sistema RAG cargado"
            : "Sistema RAG no cargado"}
        </Badge>

        {kbStatus.is_generating && (
          <Badge className="px-3 py-1 flex items-center gap-2 bg-blue-100 text-blue-800">
            <RefreshCcw className="w-4 h-4 animate-spin" />
            Generando base de conocimiento
          </Badge>
        )}

        {kbStatus.documents_count !== undefined &&
          kbStatus.documents_count > 0 && (
            <Badge className="px-3 py-1 bg-purple-100 text-purple-800">
              {kbStatus.documents_count} documentos indexados
            </Badge>
          )}
      </div>
    </div>
  )
}

export default KBStatusMonitor
