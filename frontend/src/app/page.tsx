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
        toast.success("Mensagem enviada para a fila!", { description: `Job #${result.jobId} criado com sucesso.`, });
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
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden font-sans select-none">
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-[480px] border border-slate-800/80 bg-slate-900/40 backdrop-blur-xl text-slate-100 shadow-2xl overflow-hidden rounded-xl">
        <CardHeader className="space-y-2 pb-6 pt-8 px-8">
          <CardTitle className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-50 via-slate-200 to-slate-400 bg-clip-text text-transparent font-sans">
            Gerador de E-mails Assíncronos
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm leading-relaxed font-sans">
            O destinatário será o e-mail configurado na sua <code className="text-indigo-300 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/40 text-xs font-mono font-bold">.env</code> do sistema.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSendReport}>
          <CardContent className="space-y-5 pb-6 px-8">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-300 text-xs font-semibold uppercase tracking-wider font-sans">
                Título (Assunto)
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Ex: Atualização do Sistema ou Relatório Semanal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 bg-slate-950/60 border-slate-800/80 text-slate-200 placeholder:text-slate-700 focus-visible:ring-1 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 transition-all font-sans rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-slate-300 text-xs font-semibold uppercase tracking-wider font-sans">
                Corpo da Mensagem
              </Label>
              <textarea
                id="content"
                rows={5}
                placeholder="Escreva o conteúdo do e-mail aqui..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex w-full rounded-lg border border-slate-800/80 bg-slate-950/60 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all font-sans"
                required
              />
            </div>
          </CardContent>

          <CardFooter className="pt-2 pb-8 px-8 bg-transparent border-t-0">
            <Button
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-slate-50 font-semibold transition-all shadow-lg shadow-indigo-600/10 active:scale-[0.99] font-sans rounded-lg text-sm"
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