import { Facebook, Instagram, Linkedin } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

export const socials: Array<{
  name: string;
  url: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}> = [
  {
    name: "Facebook",
    url: "https://www.facebook.com/share/1MGuV3hTWj/",
    Icon: Facebook,
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/novelexporters",
    Icon: Instagram,
  },
  {
    name: "LinkedIn",
    url: "https://in.linkedin.com/in/novel-exporters-660b74379",
    Icon: Linkedin,
  },
];
