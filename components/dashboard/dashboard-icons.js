import {
    IconBible,
    IconBroadcast,
    IconCalendarWeek,
    IconChevronRight,
    IconClockHour3,
    IconFlame,
    IconHeartDollar,
    IconLayoutGrid,
    IconMapPin,
    IconMessageReport,
    IconPlayerPlay,
    IconPray,
    IconSettings,
    IconShieldCheck,
    IconSpeakerphone,
    IconUserCircle,
    IconUsersGroup,
} from "@tabler/icons-react";

const ICON_MAP = {
  content: IconSpeakerphone,
  docs: IconMessageReport,
  finance: IconHeartDollar,
  live: IconBroadcast,
  media: IconPlayerPlay,
  people: IconUsersGroup,
  planning: IconCalendarWeek,
  prayer: IconPray,
  profile: IconUserCircle,
  security: IconShieldCheck,
  settings: IconSettings,
  time: IconClockHour3,
  location: IconMapPin,
  beliefs: IconBible,
  youth: IconFlame,
  grid: IconLayoutGrid,
};

export function getDashboardIcon(iconKey) {
  return ICON_MAP[iconKey] || IconLayoutGrid;
}

export { IconChevronRight };
