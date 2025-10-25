"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Banner from "@/components/banner";

type Projeto = {
  projeto_id: number;
  nome_projeto: string;
  nome_cliente: string;
  descricao: string;
  prazo: string;
  status: string;
  orcamento: number;
};

export default function ProtectedPage() {
  const router = useRouter();
  const supabase = createClient();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [funcionarioNome, setFuncionarioNome] = useState<string | null>(null);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState<Projeto | null>(null);
  const [loading, setLoading] = useState(true);
  const [abrindo, setAbrindo] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserAndData = async () => {
      setLoading(true);

      // 🔒 Verifica usuário logado
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        router.push("/auth/login");
        return;
      }

      const email = userData.user.email;
      setUserEmail(email ?? null);

      // 👤 Busca funcionário pelo e-mail
      const { data: funcionario, error: funcError } = await supabase
        .from("cadastro_funcionarios")
        .select("id, nome")
        .eq("email", email)
        .single();

      if (funcError || !funcionario) {
        console.error("Funcionário não encontrado:", funcError);
        router.push("/auth/login");
        return;
      }

      setFuncionarioNome(funcionario.nome);

      // 🔗 Busca os relacionamentos na tabela projeto_funcionarios
      const { data: relacoes, error: relError } = await supabase
        .from("projeto_funcionarios")
        .select("projeto_id")
        .eq("funcionario_id", funcionario.id);

      if (relError) {
        console.error("Erro ao buscar relações:", relError);
        return;
      }

      const projetoIds = relacoes.map((r) => r.projeto_id);

      if (projetoIds.length === 0) {
        setProjetos([]);
        setLoading(false);
        return;
      }

      // 📦 Busca os projetos correspondentes
      const { data: projetosData, error: projError } = await supabase
        .from("projetos")
        .select("*")
        .in("projeto_id", projetoIds);

      if (projError) {
        console.error("Erro ao buscar projetos:", projError);
        return;
      }

      setProjetos(projetosData || []);
      setLoading(false);
    };

    fetchUserAndData();
  }, [router, supabase]);

  // 👁️ Função para abrir/fechar os detalhes do projeto
  const handleVerDetalhes = (projeto: Projeto) => {
    if (projetoSelecionado?.projeto_id === projeto.projeto_id) {
      // Se já estiver aberto, fecha
      setProjetoSelecionado(null);
      setAbrindo(null);
    } else {
      // Abre novo projeto
      setAbrindo(projeto.projeto_id);
      setTimeout(() => {
        setProjetoSelecionado(projeto);
        setAbrindo(null);
      }, 300);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-yellow-700 font-bold">
        Carregando seus projetos...
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-6">
      <div className="fixed top-0 left-0 w-full z-50">
      <Banner />
      </div>
      <div className="bg-[#E8BE4D] w-full max-w-4xl rounded-xl p-10 text-center shadow-lg">
        <h1 className="text-4xl font-bold mb-4 text-white">
          Olá, Bem-Vindo(a){funcionarioNome ? `, ${funcionarioNome}` : ""}!
        </h1>
        <p className="text-lg text-white mb-8">
          Aqui estão os seus projetos
        </p>

        <div className="flex flex-col gap-6 items-center w-full">
          {projetos.length > 0 ? (
            projetos.map((projeto) => (
              <div
                key={projeto.projeto_id}
                className="w-full bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <button
                  onClick={() => handleVerDetalhes(projeto)}
                  className="w-full bg-white text-yellow-700 font-semibold py-3 hover:bg-yellow-50 transition"
                >
                  {projeto.nome_projeto}
                </button>

                {projetoSelecionado?.projeto_id === projeto.projeto_id && (
                  <div
                    className={`bg-[#0B2C48] text-white p-6 text-left transition-all duration-300 ${
                      abrindo === projeto.projeto_id ? "opacity-0" : "opacity-100"
                    }`}
                  >
                    <p><strong>Cliente:</strong> {projeto.nome_cliente}</p>
                    <p><strong>Descrição:</strong> {projeto.descricao}</p>
                    <p>
                      <strong>Prazo:</strong>{" "}
                      {new Date(projeto.prazo).toLocaleDateString("pt-BR")}
                    </p>
                    <p><strong>Status:</strong> {projeto.status}</p>
                    <p>
                      <strong>Orçamento:</strong> R${" "}
                      {projeto.orcamento.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-white">Nenhum projeto atribuído a você ainda.</p>
          )}
        </div>
      </div>
    </main>
  );
}
