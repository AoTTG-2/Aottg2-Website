import { Links, playGameLink } from "../data/links";

const StructuredData = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "@id": "https://aottg2.com/#videogame",
    name: "Attack on Titan Tribute Game 2",
    alternateName: ["AoTTG 2", "Aottg2"],
    url: "https://aottg2.com/",
    image: "https://aottg2.com/image.png",
    description:
      "A free fan-made sequel to the original Attack on Titan Tribute Game featuring fast ODM gear gameplay and community servers.",
    genre: ["Action", "Anime", "Fan Game"],
    gamePlatform: ["Windows", "Mac", "Linux", "Web Browser"],
    applicationCategory: "Game",
    operatingSystem: ["Windows", "MacOS", "Linux"],
    inLanguage: "en",
    isAccessibleForFree: true,
    playMode: "MultiPlayer",
    sameAs: [
      Links.Facebook,
      Links.YouTube,
      Links.Twitter,
      Links.Discord,
      Links.Patreon,
      Links.TikTok,
      playGameLink,
    ],
    publisher: {
      "@type": "Organization",
      name: "AoTTG2 Development Team",
      url: "https://aottg2.com/",
      sameAs: [Links.YouTube, Links.Discord, Links.Twitter],
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: playGameLink,
    },
  };

  return <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>;
};

export default StructuredData;
