type GV_TYPES = {
  PUB_ADDR: string | undefined;
  LOOP: NodeJS.Timeout | undefined;
  CONSOLE_PREFIX: string;
  CLOUDFLARE: {
    EMAIL: string;
    API_KEY: string;
  };
  DNS: {
    ZONE: string;
    ACCOUNT_ID: string;
    TARGET: string;
  };
};

export const GLOBAL_VARIABLES: GV_TYPES = {
  PUB_ADDR: undefined,
  CONSOLE_PREFIX: "[DDNS]",
  LOOP: undefined,
  CLOUDFLARE: {
    EMAIL: "contact@dustinpalmatier.us",
    API_KEY: "0c884e4ed2436594abxxxxxxd0855ab206",
  },
  DNS: {
    TARGET: "dev-home",
    ACCOUNT_ID: "ad991d154863222de79efcd6cd7922c8",
    ZONE: "127bedd1d7fe2ec4c369599220cd5bf7",
  },
};
