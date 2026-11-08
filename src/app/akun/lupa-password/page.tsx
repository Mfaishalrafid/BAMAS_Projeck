import { RecoveryScreen } from "@/features/auth/presentation/recovery-screen";
import type { Metadata } from "next";
export const metadata: Metadata = {
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <RecoveryScreen mode="forgot" />;
}
