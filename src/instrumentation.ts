export async function register() {
  if (
    process.env.NODE_ENV === "development" &&
    process.env.API_TLS_INSECURE === "true"
  ) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }
}
