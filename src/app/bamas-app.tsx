"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/shared/components/app-shell";
import { Button, Empty } from "@/shared/components/ui";
import {
  HomeScreen,
  ExploreScreen,
  DetailScreen,
} from "@/features/campaigns/presentation/campaign-screens";
import {
  DonateScreen,
  PaymentScreen,
  SuccessScreen,
  HistoryScreen,
} from "@/features/donations/presentation/donation-screens";
import { useDemo } from "@/features/demo/application/use-demo";
import type { DonationInput } from "@/features/donations/domain/donation";
import { CreateScreen } from "@/features/campaigns/presentation/create-screen";
import { AdminScreen } from "@/features/admin/presentation/admin-screen";
import {
  ProfileScreen,
  MyCampaignsScreen,
} from "@/features/profile/presentation/profile-screen";
type Screen = { name: string; id?: string };
export default function BamasApp() {
  const [stack, setStack] = useState<Screen[]>([{ name: "home" }]);
  const { state, dispatch, ready, storageError } = useDemo();
  const current = stack[stack.length - 1];
  const navigate = (name: string, id?: string) =>
    setStack((s) =>
      ["home", "explore", "create", "history", "profile"].includes(name)
        ? [{ name, id }]
        : [...s, { name, id }],
    );
  const back = () =>
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : [{ name: "home" }]));
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
  useEffect(() => {
    const id = new URLSearchParams(location.search).get("campaign");
    if (id) {
      // Read the share link after hydration, keeping server/client initial markup identical.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStack([{ name: "home" }, { name: "detail", id }]);
    }
  }, []);
  const createDonation = (input: DonationInput) => {
    const id = crypto.randomUUID();
    dispatch({
      type: "createDonation",
      donation: {
        ...input,
        id,
        createdAt: Date.now(),
        code: `SIM-${id.slice(0, 8).toUpperCase()}`,
        status: "pending",
      },
    });
    setStack((s) => [...s.slice(0, -1), { name: "payment", id }]);
  };
  let content: React.ReactNode;
  switch (current.name) {
    case "create":
      content = (
        <CreateScreen
          back={back}
          submit={(input) => {
            dispatch({
              type: "createCampaign",
              input,
              id: `campaign-${crypto.randomUUID()}`,
            });
            setStack([{ name: "profile" }, { name: "myCampaigns" }]);
          }}
        />
      );
      break;
    case "admin":
      content = (
        <AdminScreen
          campaigns={state.campaigns}
          donations={state.donations}
          back={back}
          review={(id, approve) =>
            dispatch({ type: "reviewCampaign", id, approve })
          }
        />
      );
      break;
    case "profile":
      content = (
        <ProfileScreen
          campaigns={state.campaigns}
          donations={state.donations}
          saved={state.saved}
          navigate={navigate}
          reset={() => dispatch({ type: "reset" })}
        />
      );
      break;
    case "myCampaigns":
      content = (
        <MyCampaignsScreen
          campaigns={state.campaigns}
          navigate={navigate}
          back={back}
        />
      );
      break;

    case "home":
      content = <HomeScreen campaigns={state.campaigns} navigate={navigate} />;
      break;
    case "explore":
      content = (
        <ExploreScreen
          key={current.id}
          initial={current.id}
          campaigns={state.campaigns}
          navigate={navigate}
        />
      );
      break;
    case "detail":
      content = (
        <DetailScreen
          key={current.id}
          campaign={state.campaigns.find((c) => c.id === current.id)}
          navigate={navigate}
          back={back}
          saved={state.saved.includes(current.id ?? "")}
          toggleSave={() => dispatch({ type: "save", id: current.id! })}
        />
      );
      break;
    case "donate":
      content = (
        <DonateScreen
          key={current.id}
          campaign={state.campaigns.find((c) => c.id === current.id)}
          back={back}
          submit={createDonation}
        />
      );
      break;
    case "payment":
      content = (
        <PaymentScreen
          donation={state.donations.find((d) => d.id === current.id)}
          back={back}
          pay={() => {
            dispatch({ type: "pay", id: current.id! });
            setStack((s) => [
              ...s.slice(0, -1),
              { name: "success", id: current.id },
            ]);
          }}
          cancel={() => {
            dispatch({ type: "cancel", id: current.id! });
            navigate("history");
          }}
        />
      );
      break;
    case "success":
      content = (
        <SuccessScreen
          donation={state.donations.find((d) => d.id === current.id)}
          home={() => navigate("home")}
          history={() => navigate("history")}
        />
      );
      break;
    case "history":
      content = (
        <HistoryScreen
          donations={state.donations}
          campaigns={state.campaigns}
          open={(id) => navigate("payment", id)}
        />
      );
      break;
    default:
      content = (
        <Empty>
          <h1>Layar dalam migrasi</h1>
          <Button onClick={back}>Kembali</Button>
        </Empty>
      );
  }
  return (
    <AppShell screen={current.name} navigate={navigate}>
      {storageError && (
        <p role="alert" className="notice">
          Penyimpanan perangkat tidak tersedia. Perubahan hanya bertahan selama
          sesi ini.
        </p>
      )}
      {ready ? (
        content
      ) : (
        <p className="notice" role="status">
          Memuat data simulasi…
        </p>
      )}
    </AppShell>
  );
}
