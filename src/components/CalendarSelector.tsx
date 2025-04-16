import { useState, useCallback } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { config } from '@/config';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CalendarSelectorProps {
  onSchedule: (date: string, time: string) => void;
}

const CalendarSelector = ({ onSchedule }: CalendarSelectorProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const fetchAvailableSlots = useCallback(async (date: Date) => {
    setIsLoadingSlots(true);
    const formattedDate = date.toISOString().split('T')[0];
    
    try {
      const response = await fetch(`${config.REST_API}/api/appointments/slots/${formattedDate}`);
      if (!response.ok) throw new Error('Error fetching slots');
      
      const slots = await response.json();
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  const handleDateSelect = async (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    setSelectedTime(undefined);
    await fetchAvailableSlots(date);
  };

  return (
    <div className="flex flex-col space-y-4 p-4 bg-white">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left font-normal">
            {selectedDate ? selectedDate.toLocaleDateString() : "Selecciona una fecha"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => 
              date < new Date() || 
              date.getDay() === 0 || 
              date.getDay() === 6
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {selectedDate && (
        <div className="space-y-4">
          <Select 
            value={selectedTime} 
            onValueChange={setSelectedTime}
            disabled={isLoadingSlots || availableSlots.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                isLoadingSlots 
                  ? "Cargando horarios..."
                  : availableSlots.length === 0 
                    ? "No hay horarios disponibles" 
                    : "Selecciona un horario"
              } />
            </SelectTrigger>
            <SelectContent position="popper">
              {availableSlots.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedTime && (
            <Button 
              onClick={() => onSchedule(selectedDate.toISOString().split('T')[0], selectedTime)}
              className="w-full bg-[#E84855] hover:bg-[#d13844]"
            >
              Confirmar Hora
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarSelector;