import BgContainer from "../../components/BgContainer";
import Button from "../../components/Button";
import { handleExternalLink, Links } from "../../data/links";
//TODO: use i18n for these texts
const supportText = `Help keep AoTTG 2 running smoothly for players worldwide!

Our Servers:
• US (United States)
• SA (South America)
• EU (Europe)
• CN (China)
• ASIA (Asia)

Your donations directly contribute to maintaining and improving
these servers, ensuring a great gaming experience for all.

100% of donations go towards server costs and improvements.`;

const Servers = () => {
  return (
    <BgContainer title="Support Our Servers" isDark isRightAligned>
      <div className="whitespace-pre-wrap text-gray-300 font-primary text-2xl lg:text-3xl w-full lg:w-2/5 ml-auto flex flex-col gap-12">
        {supportText}
        <Button
          hasBg
          type="secondary"
          onClick={handleExternalLink(Links.Patreon)}
        >
          Support on Patreon
        </Button>
      </div>
    </BgContainer>
  );
};

export default Servers;
