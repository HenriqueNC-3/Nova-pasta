"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface ProjetoFormProps {
  usuario: any; // funcionário logado
  onProjetoAdicionado: () => void;
}

export function ProjetoForm({ usuario, onProjetoAdicionado }: ProjetoFormProps) {
  const supabase = createClient();

  const [nomeProjeto, setNomeProjeto] = useState("");
  const [nomeCliente, setNomeCliente] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prazo, setPrazo] = useState("");
  const [orcamento, setOrcamento] = useState("");
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(false);

  // 🔹 Busca todos os funcionários para alocação
  useEffect(() => {
    const carregarFuncionarios = async () => {
      const { data, error } = await supabase
        .from("cadastro_funcionarios")
        .select("id, nome, setores(nome)");

      if (error) {
        console.error("Erro ao carregar funcionários:", error);
      } else {
        setFuncionarios(data || []);
      }
    };

    carregarFuncionarios();
  }, []);

  const handleSelecionar = (id: string) => {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeProjeto || !nomeCliente) {
      alert("Preencha os campos obrigatórios!");
      return;
    }

    if (selecionados.length === 0) {
      alert("Selecione pelo menos um funcionário para o projeto.");
      return;
    }

    try {
      setCarregando(true);

      // 1️⃣ Insere o projeto
      const { data: projetoInserido, error: projetoErro } = await supabase
        .from("projetos")
        .insert([
          {
            nome_projeto: nomeProjeto,
            nome_cliente: nomeCliente,
            descricao: descricao,
            prazo: prazo || null,
            orcamento: orcamento ? parseFloat(orcamento) : null,
            status: "Em andamento",
          },
        ])
        .select("projeto_id")
        .single();

      if (projetoErro) throw projetoErro;

      // 2️⃣ Cria os vínculos com os funcionários
      const vinculos = selecionados.map((funcionario_id) => ({
        projeto_id: projetoInserido.projeto_id,
        funcionario_id,
      }));

      const { error: relacaoErro } = await supabase
        .from("projeto_funcionarios")
        .insert(vinculos);

      if (relacaoErro) throw relacaoErro;

      alert("Projeto criado e funcionários alocados com sucesso!");
      setNomeProjeto("");
      setNomeCliente("");
      setDescricao("");
      setPrazo("");
      setOrcamento("");
      setSelecionados([]);

      onProjetoAdicionado();
    } catch (err: any) {
      console.error("Erro ao criar projeto:", err);
      alert("Erro ao criar projeto: " + err.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="bg-[#E8BE4D] p-6 rounded-2xl shadow-lg w-full max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-center mb-4">
        Criar Novo Projeto
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Nome do projeto"
          value={nomeProjeto}
          onChange={(e) => setNomeProjeto(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Nome do cliente"
          value={nomeCliente}
          onChange={(e) => setNomeCliente(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <textarea
          placeholder="Descrição do trabalho"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="p-2 border rounded resize-none"
          rows={3}
        />
        <input
          type="date"
          placeholder="Prazo"
          value={prazo}
          onChange={(e) => setPrazo(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Orçamento (R$)"
          value={orcamento}
          onChange={(e) => setOrcamento(e.target.value)}
          className="p-2 border rounded"
        />

        <div className="mt-4 bg-white rounded p-3 shadow-sm">
          <p className="font-semibold mb-2">Selecione os funcionários:</p>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {funcionarios.map((f) => (
              <label
                key={f.id}
                className="flex items-center gap-2 border p-2 rounded cursor-pointer hover:bg-gray-100"
              >
                <input
                  type="checkbox"
                  checked={selecionados.includes(f.id)}
                  onChange={() => handleSelecionar(f.id)}
                />
                <span>
                  {f.nome}{" "}
                  {f.setores?.nome && (
                    <span className="text-sm text-gray-600">
                      ({f.setores.nome})
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={carregando}
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50 mt-4"
        >
          {carregando ? "Criando..." : "Criar projeto e alocar"}
        </button>
      </form>
    </div>
  );
}
