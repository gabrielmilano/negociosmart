export default function Logs() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Logs</h1>
        <p className="text-muted-foreground">
          Monitore execuções e visualize histórico de atividades
        </p>
      </div>
      
      <div className="grid gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Em construção</h2>
          <p className="text-muted-foreground">
            Esta página está sendo desenvolvida. Em breve você poderá visualizar logs detalhados aqui.
          </p>
        </div>
      </div>
    </div>
  );
}