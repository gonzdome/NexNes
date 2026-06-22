'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ReportService } from "@/services/report.service";

export default function DashboardPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast.error('Por favor, preencha o título e o corpo da mensagem!');
      return;
    }

    setLoading(true);

    try {
      const result = await ReportService.requestReport({ title, content });

      if (result.success) {
        toast.success("🎉 Mensagem enviada para a fila!", {
          description: `Job #${result.jobId} criado com sucesso.`,
        });
        setTitle('');
        setContent(''); // Limpa o formulário
      } else {
        throw new Error(result.message || 'Erro ao processar');
      }
    } catch (error) {
      toast.error("Não foi possível adicionar à fila.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-4">
      <Card className="w-[450px] shadow-2xl border-slate-800 bg-slate-900/50 backdrop-blur-md text-slate-100">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Gerador de E-mails Assíncronos
          </CardTitle>
          <CardDescription className="text-slate-400">
            O destinatário será o e-mail configurado na sua .env do sistema.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSendReport}>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="title" className="text-slate-300 font-medium">Título (Assunto)</Label>
              <Input
                id="title"
                type="text"
                placeholder="Ex: Atualização do Sistema ou Relatório Semanal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-slate-950/50 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-indigo-500"
                required
              />
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="content" className="text-slate-300 font-medium">Corpo da Mensagem</Label>
              {/* Usando um textarea estilizado para mensagens longas */}
              <textarea
                id="content"
                rows={5}
                placeholder="Escreva o conteúdo do e-mail aqui..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex w-full rounded-md border border-slate-800 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                required
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold transition-all shadow-lg shadow-indigo-500/20"
              type="submit"
              disabled={loading}
            >
              {loading ? "Adicionando à fila..." : "Enviar via Fila (Redis)"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}