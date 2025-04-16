import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, X } from "lucide-react";
import type { Message, UserInfo } from '../types';
import UserForm from './UserForm';
import CalendarSelector from './CalendarSelector';
import { config } from '@/config';

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'chat' | 'form' | 'calendar'>('chat');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollInterval = useRef<NodeJS.Timeout>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, []);

  const resetChat = () => {
    setMessages([{
      id: '1',
      content: '¡Hola! Soy el asistente virtual de Teletón. ¿En qué puedo ayudarte hoy?',
      sender: 'bot',
      timestamp: new Date(),
      type: 'options',
      options: [
        'Quiero agendar una hora',
        'Información sobre Teletón',
        'Proceso de ingreso',
        'Donaciones'
      ]
    }]);
    setCurrentView('chat');
    setUserInfo(null);
    if (pollInterval.current) {
      clearInterval(pollInterval.current);
    }
  };

  useEffect(() => {
    resetChat();
  }, []);

  const startPolling = () => {
    if (pollInterval.current) {
      clearInterval(pollInterval.current);
    }

    pollInterval.current = setInterval(async () => {
      try {
        const response = await fetch(`${config.REST_API}/api/chat/check-reply`);
        const data = await response.json();

        if (data.hasReply && data.message) {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            content: data.message,
            sender: 'bot',
            timestamp: new Date(),
            type: 'options',
            options: [
              'Quiero agendar una hora',
              'Información sobre Teletón',
              'Proceso de ingreso',
              'Donaciones'
            ]
          }]);
          setIsLoading(false);
          if (pollInterval.current) {
            clearInterval(pollInterval.current);
          }
        }
      } catch (error) {
        console.error('Error checking reply:', error);
      }
    }, 5000);
  };

  const handleUserFormSubmit = (formData: UserInfo) => {
    setUserInfo(formData);
    setCurrentView('calendar');
  };

  const handleAppointmentSchedule = async (date: string, time: string) => {
    if (!userInfo) return;

    setCurrentView('chat');
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      content: `Procesando agendamiento:\nFecha: ${date} ${time}\nEmail: ${userInfo.email}`,
      sender: 'bot',
      timestamp: new Date()
    }]);

    try {
      await fetch(`${config.REST_API}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          time,
          ...userInfo
        }),
      });

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: 'Tu agendamiento ha sido registrado. Recibirás un correo de confirmación pronto.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'options',
        options: [
          'Agendar otra hora',
          'Finalizar'
        ]
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: 'Hubo un error al procesar tu agendamiento. Por favor, intenta nuevamente.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'options',
        options: ['Intentar nuevamente']
      }]);
    }
  };

  const handleOptionClick = async (option: string) => {
    if (isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: option,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    if (option === 'Quiero agendar una hora' || option === 'Intentar nuevamente') {
      setCurrentView('form');
      return;
    }

    if (option === 'Finalizar') {
      resetChat();
      return;
    }

    setIsLoading(true);

    try {
      await fetch(`${config.REST_API}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: option }),
      });

      startPolling();
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      await fetch(`${config.REST_API}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputValue }),
      });
      
      startPolling();
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  if (currentView === 'form') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold">Ingresa tus datos</h3>
          <Button variant="ghost" size="icon" onClick={resetChat}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <UserForm onSubmit={handleUserFormSubmit} />
      </div>
    );
  }

  if (currentView === 'calendar') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold">Selecciona fecha y hora</h3>
          <Button variant="ghost" size="icon" onClick={resetChat}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CalendarSelector onSchedule={handleAppointmentSchedule} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-[#E84855] text-white'
                    : 'bg-gray-100'
                }`}
              >
                {message.content}
                {message.type === 'options' && message.options && (
                  <div className="mt-2 space-y-2">
                    {message.options.map((option) => (
                      <Button
                        key={option}
                        variant="outline"
                        className="w-full justify-start text-left"
                        onClick={() => handleOptionClick(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                Escribiendo...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Escribe tu mensaje..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend} 
            className="bg-[#E84855] hover:bg-[#d13844]"
            disabled={isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;