import { Disc3, Star, Music2, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { textStyles } from "@/components/ui/text-styles";

interface Stats {
  albumsEcoutes: number;
  albumsNotes: number;
  tracksNotees: number;
  heures: number;
}

export default function WelcomeBanner({
  pseudo,
  message,
  stats,
}: {
  pseudo: string;
  message: string;
  stats: Stats;
}) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center gap-6 xl:gap-0 mb-6 justify-between">
      {/* Gauche — message bievenue (1/2) */}
      <div className="xl:w-1/2 shrink-0">
        <h1 className={`${textStyles.pageTitle} text-text-primary`}>
          {message},&nbsp;
          <span className="text-text-green">{pseudo}.</span>
        </h1>
        <p className={`${textStyles.caption} text-text-secondary mt-1.5`}>
          Voici un aperçu de ton activité musicale.
        </p>
      </div>

      {/* Droite — 4 stats (1/2) */}
      <div className="xl:w-1/2 grid grid-cols-2 gap-px bg-border lg:flex lg:bg-transparent lg:gap-0 lg:divide-x lg:divide-border">
        <StatWidget
          icon={Disc3}
          value={stats.albumsEcoutes}
          label="Albums écoutés"
        />
        <StatWidget
          icon={Star}
          value={stats.albumsNotes}
          label="Albums notés"
        />
        <StatWidget
          icon={Music2}
          value={stats.tracksNotees}
          label="Tracks notées"
        />
        <StatWidget
          icon={Clock}
          value={`${stats.heures} h`}
          label="Heures d'écoute"
        />
      </div>
    </div>
  );
}

function StatWidget({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: number | string;
  label: string;
}) {
  return (
    <div className="lg:flex-1 flex flex-row gap-3 items-center lg:justify-center bg-bg-primary lg:bg-transparent px-4 py-3 lg:px-0 lg:py-0">
      <Icon size={30} className="text-text-green" />
      <div className="flex flex-col gap-0.5">
        <span className={`${textStyles.sectionTitle} text-text-primary`}>
          {value}
        </span>
        <span className={`${textStyles.caption} text-text-secondary`}>
          {label}
        </span>
      </div>
    </div>
  );
}
