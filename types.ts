
export interface MenuItem {
  id: string;
  label: string;
  icon: string; // URL or Lucide name
  color: string;
}

export interface PrayerTime {
  name: string;
  time: string;
  isNext: boolean;
}

export interface HeadlineItem {
  id: string;
  category: string;
  title: string;
  image: string;
}
