import { analyticsRouter } from "@/features/analytics/api/router";
import { billingRouter } from "@/features/billing/api/router";
import { httpRequestRouter } from "@/features/blocks/integrations/httpRequest/api/router";
import { getLinkedTypebots } from "@/features/blocks/logic/typebotLink/api/getLinkedTypebots";
import { collaboratorsRouter } from "@/features/collaboration/api/router";
import { customDomainsRouter } from "@/features/customDomains/api/router";
import { folderRouter } from "@/features/folders/api/router";
import { resultsRouter } from "@/features/results/api/router";
import { themeRouter } from "@/features/theme/api/router";
import { typebotRouter } from "@/features/typebot/api/router";
import { publicUserRouter } from "@/features/user/server/routers";
import { publicWhatsAppRouter } from "@/features/whatsapp/router";
import { workspaceRouter } from "@/features/workspace/api/router";
import { router } from "../trpc";

export const publicRouter = router({
  getLinkedTypebots,
  analytics: analyticsRouter,
  workspace: workspaceRouter,
  typebot: typebotRouter,
  httpRequest: httpRequestRouter,
  results: resultsRouter,
  billing: billingRouter,
  theme: themeRouter,
  collaborators: collaboratorsRouter,
  customDomains: customDomainsRouter,
  whatsApp: publicWhatsAppRouter,
  folders: folderRouter,
  user: publicUserRouter,
});

export type PublicRouter = typeof publicRouter;
