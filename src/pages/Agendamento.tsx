import { useRequireAuth } from '../hooks/useAuth.new';

export default function Agendamento() {
  const { user } = useRequireAuth('eletrica');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Agendamento</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
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