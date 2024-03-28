import { IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { LLMSetting } from "../../config/settings";

export async function getCredentials(read: IRead) {
    return (await read
        .getEnvironmentReader()
        .getSettings()
        .getValueById(LLMSetting.GEMINI_API_KEY)) as string;
}
