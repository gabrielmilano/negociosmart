export default function Settings() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">
          Personalize suas preferências e configurações da conta
        </p>
      </div>
      
      <div className="grid gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Em construção</h2>
          <p className="text-muted-foreground">
            Esta página está sendo desenvolvida. Em breve você poderá configurar suas preferências aqui.
          </p>
        </div>
      </div>
    </div>
  );
}