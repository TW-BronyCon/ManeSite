export interface PartnerSite {
  id: string;
  name: string;
  logo: string;
  url: string;
  internal?: boolean;
  width: number;
  height: number;
  altKey?: string;
}

export const partnerSites: PartnerSite[] = [
  {
    id: "twbc",
    name: "TWBC",
    logo: "/img/text-logo-clear.avif",
    url: "/",
    internal: true,
    width: 2362,
    height: 1816,
    altKey: "home.footer.logoAlt",
  },
  {
    id: "bronyfestival",
    name: "Bronyfestival",
    logo: "/img/links/bf.avif",
    url: "https://bronyfestival.com/",
    internal: false,
    width: 200,
    height: 200,
  },
  {
    id: "csbc",
    name: "CSBC",
    logo: "/img/links/csbc.avif",
    url: "https://csbronycarnival.com/",
    internal: false,
    width: 200,
    height: 170,
  },
  {
    id: "mlpcon",
    name: "MLPCON.INFO",
    logo: "/img/links/mlpcon.avif",
    url: "https://mlpcon.info/",
    internal: false,
    width: 1725,
    height: 956,
  },
  {
    id: "malangpony",
    name: "MalangPony",
    logo: "/img/links/MPN.avif",
    url: "https://malangpony.com/",
    internal: false,
    width: 1335,
    height: 483,
  },
  {
    id: "norsehorsecon",
    name: "Norse Horse Con",
    logo: "/img/links/nhc.avif",
    url: "https://www.norsehorsecon.eu/",
    internal: false,
    width: 622,
    height: 200,
  },
];
