const StructuredData = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: "Attack on Titan Tribute Game 2",
    alternateName: "AoTTG 2",
    description:
      "A fan-made sequel to the original Attack on Titan Tribute Game featuring ODM gear gameplay.",
    genre: ["Action", "Anime", "Fan Game"],
    gamePlatform: ["Windows", "Mac", "Linux"],
    applicationCategory: "Game",
    operatingSystem: ["Windows", "MacOS", "Linux"],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };

  return <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>;
};

export default StructuredData;
