import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserInfo } from "../types";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";

interface UserFormProps {
  onSubmit: (userInfo: UserInfo) => void;
}

const UserForm = ({ onSubmit }: UserFormProps) => {
  const [formData, setFormData] = useState<UserInfo>({
    name: '',
    rut: '',
    institute: '',
    specialty: '',
    email: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4 p-4 bg-white">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre Completo</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="rut">RUT</Label>
        <Input
          id="rut"
          value={formData.rut}
          onChange={(e) => setFormData(prev => ({ ...prev, rut: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="institute">Instituto Teletón</Label>
        <Select onValueChange={(value) => setFormData(prev => ({ ...prev, institute: value }))} required>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un instituto" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="santiago">Santiago</SelectItem>
            <SelectItem value="valparaiso">Valparaíso</SelectItem>
            <SelectItem value="concepcion">Concepción</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialty">Especialidad</Label>
        <Select onValueChange={(value) => setFormData(prev => ({ ...prev, specialty: value }))} required>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una especialidad" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="kinesiologia">Kinesiología</SelectItem>
            <SelectItem value="terapia_ocupacional">Terapia Ocupacional</SelectItem>
            <SelectItem value="fonoaudiologia">Fonoaudiología</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full bg-[#E84855] hover:bg-[#d13844] mt-auto">
        Continuar
      </Button>
    </form>
  );
};

export default UserForm;