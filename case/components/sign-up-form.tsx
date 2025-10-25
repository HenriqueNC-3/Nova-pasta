"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface UsuarioFormProps {
  setores: { id: string; nome: string }[]; 
  onUsuarioAdicionado: () => void;        
}

export function UsuarioForm({ setores, onUsuarioAdicionado }: UsuarioFormProps) {
  const supabase = createClient();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [setorId, setSetorId] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!setorId) {
      alert("Escolha um setor para o usuário.");
      return;
    }

    // 1️⃣ Criar o usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (authError) {
      alert("Erro ao criar autenticação do usuário: " + authError.message);
      return;
    }

    // 2️⃣ Inserir dados na tabela `cadastro_funcionarios`
    const { error: dbError } = await supabase
      .from("cadastro_funcionarios")
      .insert([{ 
        nome, 
        email, 
        senha, // opcional, se você quiser guardar a senha em texto? (não recomendado)
        setor_id: setorId,
        auth_id: authData.user?.id // salvar o ID do Auth se quiser linkar
      }]);

    if (dbError) {
      alert("Erro ao adicionar usuário na tabela: " + dbError.message);
    } else {
      alert("Usuário adicionado com sucesso!");
      setNome("");
      setEmail("");
      setSenha("");
      setSetorId("");
      onUsuarioAdicionado();
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-gray-100 p-4 rounded-lg shadow">
          <input
            type="text"
            placeholder="Nome do usuário"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="p-2 border rounded"
            required
          />
          <input
            type="email"
            placeholder="Email do usuário"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="p-2 border rounded"
            required
          />
          <select
            value={setorId}
            onChange={(e) => setSetorId(e.target.value)}
            className="p-2 border rounded"
            required
          >
            <option value="">Escolha o setor</option>
            {setores.map((setor) => (
              <option key={setor.id} value={setor.id}>
                {setor.nome}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          >
            Adicionar usuário
          </button>
        </form>
      </div>
    </div>
  );
}
