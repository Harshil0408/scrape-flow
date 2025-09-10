import { SetupUser } from "@/actions/billing/setupUser";
import { waitFor } from "@/lib/helper/waitfor"

export default async function SetupPage() {
    return await SetupUser();
}