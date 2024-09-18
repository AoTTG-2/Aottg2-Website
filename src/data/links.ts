export const playGameLink = "https://aottg2.itch.io/aottg2"
export const creditJson = "https://raw.githubusercontent.com/AoTTG-2/Aottg2-Unity/main/Assets/Resources/Data/Info/CreditsInfo.json"

export const handleExternalLink = (link: string) => (event: React.MouseEvent) => {
  event.preventDefault();
  window.open(link, '_blank', 'noopener,noreferrer');
};

//Social Links
export const Links = {
    Facebook: "https://www.facebook.com/AoTTG2",
    YouTube: "https://www.youtube.com/@aottg2official",
    Patreon: "https://www.patreon.com/aottg2",
    Discord: "https://discord.gg/aottg-2-681641241125060652",
    Twitter: "https://x.com/AoTTG2",
    TikTok: "https://www.tiktok.com/@aottg2",
}
