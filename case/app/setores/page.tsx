"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { UsuarioForm } from "@/components/sign-up-form";
import { ProjetoForm } from "@/components/projetos";
import Banner from "@/components/banner"; // Corrigido (com letra maiúscula no componente React)

export default function PaginaSetores() {
  const supabase = createClient();

  const [usuario, setUsuario] = useState<any>(null);
  const [setores, setSetores] = useState<{ id: string; nome: string }[]>([]);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [isDiretoria, setIsDiretoria] = useState(false);
  const [diretoriaId, setDiretoriaId] = useState<string | null>(null);
  const [erroMsg, setErroMsg] = useState("");

  // 1️⃣ Carrega setores
  const carregarSetores = async () => {
    const { data, error } = await supabase
      .from("setores")
      .select("id, nome")
      .order("nome", { ascending: true });
    if (error) console.error("Erro ao carregar setores:", error);
    setSetores(data || []);
  };

  // 2️⃣ Busca ID da Diretoria
  const buscarDiretoria = async () => {
    const { data, error } = await supabase
      .from("setores")
      .select("id")
      .eq("nome", "Diretoria")
      .single();

    if (error) {
      console.error("Erro ao buscar diretoria:", error);
      return null;
    }

    setDiretoriaId(data.id);
    return data.id;
  };

  // 3️⃣ Carrega usuário logado
  const carregarUsuario = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Erro ao obter usuário logado:", userError);
      return;
    }

    const { data, error } = await supabase
      .from("cadastro_funcionarios")
      .select("id, nome, email, setor_id, setores!inner(nome)")
      .eq("email", user.email)
      .single();

    if (error) {
      console.error("Erro ao carregar funcionário:", error);
      return;
    }

    setUsuario(data);
    setIsDiretoria(data.setores.nome === "Diretoria");
    return data;
  };

  // 4️⃣ Carrega projetos
  const carregarProjetos = async (funcionario: any, diretoriaId: string) => {
    try {
      let projetosData: any[] = [];

      if (funcionario.setor_id === diretoriaId) {
        const { data, error } = await supabase.from("projetos").select("*");
        if (error) throw error;
        projetosData = data || [];
      } else {
        const { data, error } = await supabase
          .from("projeto_funcionarios")
          .select(
            `
            projetos:projeto_id (
              projeto_id,
              nome_projeto,
              nome_cliente,
              descricao,
              status,
              prazo,
              orcamento
            )
          `
          )
          .eq("funcionario_id", funcionario.id);

        if (error) throw error;
        projetosData = (data || []).map((row: any) => row.projetos).filter(Boolean);
      }

      setProjetos(projetosData);
    } catch (err: any) {
      console.error("Erro ao carregar projetos:", err);
      setErroMsg(err?.message ?? JSON.stringify(err));
    }
  };

  // 5️⃣ Remover projeto (Diretoria)
  const removerProjeto = async (projetoId: number) => {
    if (!confirm("Deseja realmente remover este projeto?")) return;
    const { error } = await supabase.from("projetos").delete().eq("projeto_id", projetoId);
    if (error) {
      console.error("Erro ao remover projeto:", error);
      alert("Erro ao remover projeto: " + error.message);
    } else {
      if (usuario && diretoriaId) carregarProjetos(usuario, diretoriaId);
    }
  };

  // 6️⃣ Carregamento inicial
  useEffect(() => {
    (async () => {
      await carregarSetores();
      const dirId = await buscarDiretoria();
      if (!dirId) return;
      const funcionario = await carregarUsuario();
      if (funcionario) await carregarProjetos(funcionario, dirId);
    })();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a3557] text-black">
      {/* 🟡 Banner fixo no topo */}
      <Banner />

      {/* Conteúdo principal */}
      <div className="flex justify-center items-start flex-grow py-12">
        <div className="bg-[#E8BE4D] text-black rounded-2xl shadow-2xl w-full max-w-5xl p-10 flex flex-col gap-8 transition-all duration-300 hover:shadow-yellow-200/50">
          <h1 className="text-3xl font-extrabold text-center text-white drop-shadow-sm">
            Painel de Setores
          </h1>

          {usuario && (
            <div className="text-center bg-white/70 rounded-lg p-4 font-medium shadow-inner">
              <p>
                <strong>Usuário:</strong> {usuario.nome}{" "}
                <span className="text-gray-700">({usuario.setores.nome})</span>
              </p>
            </div>
          )}

          {/* Diretoria: cadastrar funcionário */}
          {isDiretoria && (
            <div className="bg-white rounded-xl shadow p-5 border border-yellow-200">
              <h2 className="text-xl font-semibold mb-3 text-center">
                Cadastro de Funcionário
              </h2>
              <UsuarioForm
                setores={setores}
                onUsuarioAdicionado={() =>
                  diretoriaId && carregarProjetos(usuario, diretoriaId)
                }
              />
            </div>
          )}

          {/* Cadastrar projeto */}
          {usuario && (
            <div className="bg-white rounded-xl shadow p-5 border border-yellow-200">
              <h2 className="text-xl font-semibold mb-3 text-center">
                Cadastro de Projeto
              </h2>
              <ProjetoForm
                usuario={usuario}
                isDiretoria={isDiretoria}
                onProjetoAdicionado={() =>
                  diretoriaId && carregarProjetos(usuario, diretoriaId)
                }
              />
            </div>
          )}

          {/* Listagem de projetos */}
          <div className="bg-white rounded-xl shadow p-5 border border-yellow-200">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Projetos Atuais
            </h2>

            {projetos.length === 0 ? (
              <p className="text-center text-gray-600">Nenhum projeto encontrado.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {projetos.map((p) => (
                  <div
                    key={p.projeto_id}
                    className="bg-gray-100 p-4 rounded-lg flex justify-between items-center shadow-sm hover:bg-gray-200 transition"
                  >
                    <div>
                      <strong className="text-lg">{p.nome_projeto}</strong>{" "}
                      <span className="text-gray-700">– {p.nome_cliente}</span>
                      <p className="text-sm text-gray-600 mt-1">
                        Status: {p.status} | Prazo: {p.prazo ?? "Não definido"}
                      </p>
                    </div>
                    {isDiretoria && (
                      <button
                        onClick={() => removerProjeto(p.projeto_id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {erroMsg && <p className="text-red-600 text-center mt-4">{erroMsg}</p>}
        </div>
      </div>
    </div>
  );
}

