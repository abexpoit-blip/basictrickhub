/** Brand for Songmata/Rose-style group security messages */
export const SECURITY_ASSISTANT = "🛡 Basictrick Security Assistant";

export function securityMsg(body: string) {
  return `${SECURITY_ASSISTANT}\n${body}`;
}
