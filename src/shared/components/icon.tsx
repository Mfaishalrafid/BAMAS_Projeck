import {
  House,
  Search,
  Heart,
  Plus,
  UserRound,
  ChevronLeft,
  BadgeCheck,
  MapPin,
  Bell,
  Share2,
  GraduationCap,
  Droplets,
  ShieldCheck,
  Wheat,
  Clock,
  Waves,
  Stethoscope,
  HandHelping,
  Compass,
  ReceiptText,
  type LucideIcon,
} from "lucide-react";
const icons: Record<string, LucideIcon> = {
  home: House,
  search: Search,
  heart: Heart,
  plus: Plus,
  user: UserRound,
  back: ChevronLeft,
  check: BadgeCheck,
  pin: MapPin,
  bell: Bell,
  share: Share2,
  book: GraduationCap,
  water: Droplets,
  shield: ShieldCheck,
  food: Wheat,
  clock: Clock,
  waves: Waves,
  health: Stethoscope,
  social: HandHelping,
  compass: Compass,
  receipt: ReceiptText,
};
export function Icon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  const Component = icons[name] ?? Heart;
  return (
    <Component
      aria-hidden="true"
      className={className}
      size={20}
      strokeWidth={1.8}
    />
  );
}
