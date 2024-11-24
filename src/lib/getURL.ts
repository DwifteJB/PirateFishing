const DEV_URL = import.meta.env.VITE_DEV_URL;
const PROD_URL = import.meta.env.VITE_PROD_URL;

const DEV_WS_URL = import.meta.env.VITE_DEV_WS_URL;
const PROD_WS_URL = import.meta.env.VITE_PROD_WS_URL;

export const URL = process.env.NODE_ENV === "development" ? DEV_URL : PROD_URL;
export const WS_URL =
  process.env.NODE_ENV === "development" ? DEV_WS_URL : PROD_WS_URL;

export default URL;
