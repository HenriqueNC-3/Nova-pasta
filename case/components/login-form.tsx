"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.push("/protected");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Um erro aconteceu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-8 rounded-xl shadow-2xl w-[400px] flex flex-col items-center text-gray-900 border border-yellow-700">
        <CardHeader>
          <Image
          src = "/7548c7bd-f2ba-4ed2-84dc-3b8fa77786e7.jpg"
          alt = "Logo"
          width = {200}
          height = {200}
          className = "mx-auto mb-4"
          />
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email"></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="E-mail"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white text-yellow-700 font-semibold py-3 rounded-lg shadow-sm hover:opacity-95 transition disabled:opacity-60"

                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password"></Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Senha"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white text-yellow-700 font-semibold py-3 rounded-lg shadow-sm hover:opacity-95 transition disabled:opacity-60"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full w-full bg-white text-yellow-700 font-semibold py-3 rounded-lg shadow-sm hover:opacity-95 transition disabled:opacity-60" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div> 
          </form>
        </CardContent>
      </Card>
      </div>
  );
}
