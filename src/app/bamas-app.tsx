"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/shared/components/app-shell";
import { Button, Empty } from "@/shared/components/ui";
import fixtures from "@/features/campaigns/infrastructure/fixtures.json";
import {
  HomeScreen,
  ExploreScreen,
  DetailScreen,
} from "@/features/campaigns/presentation/campaign-screens";
type Screen = { name: string; id?: string };
export default function BamasApp() {
  const [stack, setStack] = useState<Screen[]>([{ name: "home" }]);
  const [saved, setSaved] = useState<string[]>([]);
  const current = stack[stack.length - 1];
  const navigate = (name: string, id?: string) =>
    setStack((s) => [...s, { name, id }]);
  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        e.key === "Escape" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement).tagName,
        )
      )
        setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  return (
    <AppShell screen={current.name} navigate={navigate}>
      {current.name === "home" ? (
        <HomeScreen campaigns={fixtures.campaigns} navigate={navigate} />
      ) : current.name === "explore" ? (
        <ExploreScreen
          key={current.id}
          initial={current.id}
          campaigns={fixtures.campaigns}
          navigate={navigate}
        />
      ) : current.name === "detail" ? (
        <DetailScreen
          key={current.id}
          campaign={fixtures.campaigns.find((c) => c.id === current.id)}
          navigate={navigate}
          back={back}
          saved={saved.includes(current.id ?? "")}
          toggleSave={() =>
            setSaved((s) =>
              s.includes(current.id ?? "")
                ? s.filter((id) => id !== current.id)
                : [...s, current.id!],
            )
          }
        />
      ) : (
        <Empty>
          <h1>Layar dalam migrasi</h1>
          <p>SIMULASI — bukan transaksi nyata.</p>
          <Button onClick={back}>Kembali</Button>
        </Empty>
      )}
    </AppShell>
  );
}
