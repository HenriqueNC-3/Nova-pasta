"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Projeto = {
  id: string;
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

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        router.push("/auth/login");
        return;
      }

      const email = userData.user.email;
      setUserEmail(email ?? null);

      // Buscar funcionário com base no e-mail
      const { data: funcionario, error: funcionarioError } = await supabase
        .from("cadastro_funcionarios")
        .select("id, nome")
        .eq("email", email)
        .single();

      if (funcionarioError || !funcionario) {
        console.error("Funcionário não encontrado:", funcionarioError);
        router.push("/auth/login");
        return;
      }

      setFuncionarioNome(funcionario.nome);

      // Buscar projetos do funcionário
      const { data: projetosData, error: projetosError } = await supabase
        .from("projeto_funcionarios")
        .select("projetos(id, nome_projeto)")
        .eq("funcionario_id", funcionario.id);

      if (projetosError) {
        console.error("Erro ao buscar projetos:", projetosError);
        return;
      }

type ProjetoData = {
  projetos: {
    id: string;
    nome_projeto: string;
  } | null;
};

const listaProjetos =
  (projetosData as ProjetoData[] | null)?.map((p) => ({
    id: p.projetos?.id ?? "",
    nome_projeto: p.projetos?.nome_projeto ?? "Projeto sem nome",
  })) || [];


      setProjetos(listaProjetos);
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
                key={projeto.id}
                href={`/projetos/${projeto.id}`}
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

