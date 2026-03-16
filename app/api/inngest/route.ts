import {serve} from "inngest/next";
import {inngest} from "@/lib/inngest/client";
import {sendDailyNewsSummary, sendSignUpEmail} from "@/lib/inngest/functions";

// Webhook/job routes must stay runtime-only and should not be evaluated as static build output.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [sendSignUpEmail, sendDailyNewsSummary],
})
