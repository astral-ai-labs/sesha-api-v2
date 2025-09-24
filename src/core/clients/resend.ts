import { Resend } from "resend";

const FROM_EMAIL_ADDRESS = "updates@updates.sesha-systems.com";
const FROM_EMAIL_NAME = "Sesha Systems";

const resend = new Resend(process.env.RESEND_API_KEY);

export { resend, FROM_EMAIL_ADDRESS, FROM_EMAIL_NAME };
