"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Projeto = {
  projeto_id: number;
  nome_projeto: string;
};

export default function ProtectedPage() {
  const router = useRouter();
  const supabase = createClient();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [funcionarioNome, setFuncionarioNome] = useState<string | null>(null);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndData = async () => {
      setLoading(true);

      // Pega o usuário logado
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        router.push("/auth/login");
        return;
      }

      const email = userData.user.email;
      setUserEmail(email ?? null);

      // Busca o funcionário pelo e-mail
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

      // Busca os relacionamentos na tabela projeto_funcionarios
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

      // Busca os projetos correspondentes
      const { data: projetosData, error: projError } = await supabase
        .from("projetos")
        .select("projeto_id, nome_projeto")
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-yellow-700 font-bold">
        Carregando seus projetos...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B2C48] flex flex-col items-center justify-start p-6">
      <div className="bg-[#E8BE4D] w-full max-w-4xl rounded-xl p-10 text-center shadow-lg">
        <h1 className="text-4xl font-bold mb-4 text-white">
          Olá, Bem-Vindo(a){funcionarioNome ? `, ${funcionarioNome}` : ""}!
        </h1>
        <p className="text-lg text-white mb-8">
          Aqui estão os seus projetos
        </p>

        <div className="flex flex-col gap-4 items-center">
          {projetos.length > 0 ? (
            projetos.map((projeto) => (
              <Link
                key={projeto.projeto_id}
                href={`/projetos/${projeto.projeto_id}`}
                className="w-64 bg-white text-yellow-700 font-semibold py-3 rounded-lg shadow hover:opacity-90 transition"
              >
                {projeto.nome_projeto}
              </Link>
            ))
          ) : (
            <p className="text-white">Nenhum projeto atribuído a você ainda.</p>
          )}
        </div>
      </div>
    </main>
  );
}
