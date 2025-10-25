"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { HiBars3, HiXMark, HiHome, HiClipboardDocument, HiUser } from "react-icons/hi2";
import { LogoutButton } from "@/components/logout-button";

export default function Navbar() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className="w-full bg-gray-900 text-white flex items-center justify-between px-6 py-3 shadow-md relative">
      {/* Logo e nome da empresa */}
      <div className="flex items-center gap-3">
        <Image
          src="/7548c7bd-f2ba-4ed2-84dc-3b8fa77786e7.jpg" 
          alt="Logo da empresa"
          width={40}
          height={40}
          className="rounded-full"
        />
        <span className="font-bold text-lg">MEJEforma</span>
      </div>

      {/* Botão do menu */}
      <button
        onClick={() => setMenuAberto(!menuAberto)}
        className="hover:text-gray-300 transition md:hidden"
      >
        {menuAberto ? <HiXMark size={26} /> : <HiBars3 size={26} />}
      </button>

      {/* Menu padrão (desktop) */}
      <nav className="hidden md:flex items-center gap-8">
        <Link href="/protected" className="flex items-center gap-2 hover:text-yellow-400 transition">
          <HiHome size={20} />
          <span>Home</span>
        </Link>
        <Link href="/setores" className="flex items-center gap-2 hover:text-yellow-400 transition">
          <HiClipboardDocument size={20} />
          <span>Setores</span>
        </Link>
        <div className="flex items-center gap-2 hover:text-yellow-400 transition">
          <LogoutButton />
        </div>
      </nav>

      {/* Menu lateral (mobile) */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-gray-800 shadow-2xl transform transition-transform duration-300 z-50 ${
          menuAberto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <span className="text-lg font-semibold">Menu</span>
          <button onClick={() => setMenuAberto(false)} className="hover:text-yellow-400">
            <HiXMark size={24} />
          </button>
        </div>

        <div className="flex flex-col gap-6 p-6 text-lg">
          <Link
            href="/protected"
            className="flex items-center gap-3 hover:text-yellow-400 transition"
            onClick={() => setMenuAberto(false)}
          >
            <HiHome size={22} /> Home
          </Link>

          <Link
            href="/setores"
            className="flex items-center gap-3 hover:text-yellow-400 transition"
            onClick={() => setMenuAberto(false)}
          >
            <HiClipboardDocument size={22} /> Setores
          </Link>
          <div className="mt-auto pt-6 border-t border-gray-700 flex items-center gap-2 hover:text-yellow-400 transition">
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Fundo escurecido ao abrir o menu */}
      {menuAberto && (
        <div
          onClick={() => setMenuAberto(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        ></div>
      )}
    </header>
  );
}
