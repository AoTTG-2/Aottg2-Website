import React from "react";
import BgContainer from "../../components/BgContainer";
import { Links } from "../../data/links";
import {
  FaFacebookF,
  FaYoutube,
  FaTwitter,
  FaDiscord,
  FaPatreon,
  FaTiktok,
} from "react-icons/fa";

interface SocialLink {
  url: string;
  icon: React.ElementType;
  label: string;
}

const socialLinks: SocialLink[] = [
  {
    url: Links.Facebook,
    icon: FaFacebookF,
    label: "Facebook",
  },
  {
    url: Links.YouTube,
    icon: FaYoutube,
    label: "YouTube",
  },
  {
    url: Links.Twitter,
    icon: FaTwitter,
    label: "Twitter",
  },
  {
    url: Links.Discord,
    icon: FaDiscord,
    label: "Discord",
  },
  {
    url: Links.Patreon,
    icon: FaPatreon,
    label: "Patreon",
  },
  {
    url: Links.TikTok,
    icon: FaTiktok,
    label: "TikTok",
  },
];

const Footer: React.FC = () => {
  return (
    <>
      <BgContainer isDark shouldShowCrack={false} isFooter>
        <div className="flex flex-col text-white font-tertiary text-center items-center justify-center gap-8 text-xl">
          <div className="flex flex-row space-x-6">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                aria-label={link.label}
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl hover:text-gray-300 transition-colors duration-300 transform hover:scale-110 active:scale-95 z-50"
              >
                <link.icon />
              </a>
            ))}
          </div>
          <div>
            <p>AoTTG 2 - A Fan Project</p>
            <p className="text-sm mt-2">
              Inspired by Feng Lee's original creation. Made with ❤️ by
              volunteers.
            </p>
            <p className="text-sm mt-2 text-gray-400 opacity-75">
              Website developed by gisketch
            </p>
          </div>
        </div>
      </BgContainer>
    </>
  );
};

export default Footer;
