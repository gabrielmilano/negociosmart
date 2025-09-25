import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useNotifications } from '@/contexts/NotificationsContext';
import { addDays, format, isBefore, startOfDay } from 'date-fns';
import { pt } from 'date-fns/locale';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.new';

interface Appointment {
  id: string;
  date: Date;
  time: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

export default function Agendamento() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);

  const { addNotification } = useNotifications();

  const availableTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !time) {
      addNotification({
        title: 'Erro no agendamento',
        message: 'Por favor, selecione uma data e horário.',
        type: 'error'
      });
      return;
    }

    try {
      // Aqui você faria a chamada para a API para salvar o agendamento
      // const response = await api.post('/appointments', { ... });
      
      addNotification({
        title: 'Agendamento confirmado',
        message: `Seu agendamento para ${format(selectedDate, 'dd/MM/yyyy')} às ${time} foi confirmado.`,
        type: 'success'
      });
      
      setSuccess(true);
      resetForm();
    } catch (error) {
      console.error('Error creating appointment:', error);
      addNotification({
        title: 'Erro no agendamento',
        message: 'Não foi possível realizar o agendamento. Tente novamente.',
        type: 'error'
      });
    }
  };

  const resetForm = () => {
    setSelectedDate(undefined);
    setTime('');
    setName('');
    setEmail('');
    setPhone('');
    setNotes('');
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Calendar Section */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Selecione uma data</CardTitle>
              <CardDescription>
                Escolha a data desejada para seu agendamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={pt}
                disabled={(date) => isBefore(date, startOfDay(new Date())) || isBefore(date, addDays(new Date(), -1))}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Form Section */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Detalhes do agendamento</CardTitle>
              <CardDescription>
                Preencha suas informações para confirmar o agendamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Time Selection */}
                <div className="space-y-2">
                  <Label>Horário disponível</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableTimes.map((t) => (
                      <Button
                        key={t}
                        type="button"
                        variant={time === t ? 'default' : 'outline'}
                        onClick={() => setTime(t)}
                      >
                        {t}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    placeholder="Digite seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Phone Input */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                {/* Notes Textarea */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Adicione informações importantes aqui"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {success ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Agendamento confirmado!</AlertTitle>
                    <AlertDescription>
                      Seu agendamento foi realizado com sucesso.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!selectedDate || !time || !name || !email || !phone}
                  >
                    Confirmar agendamento
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
        <iframe
          src="https://calendar.google.com/calendar/embed?src=YOUR_CALENDAR_ID&mode=WEEK"
          style={{ border: 0 }}
          width="100%"
          height="600"
          frameBorder="0"
          scrolling="no"
        ></iframe>
      </div>

      <div className="mt-8 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Agendar Nova Tarefa</h2>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Título da Tarefa
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Digite o título da tarefa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Data
            </label>
            <input
              type="datetime-local"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descrição
            </label>
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              placeholder="Digite a descrição da tarefa"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Agendar
          </button>
        </form>
      </div>
    </div>
  );
}