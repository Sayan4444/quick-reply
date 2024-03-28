import {
    ISetting,
    SettingType,
} from "@rocket.chat/apps-engine/definition/settings";

export enum LLMSetting {
    GEMINI_API_KEY = "gemini-api-key",
}

export const settings: ISetting = {
    id: LLMSetting.GEMINI_API_KEY,
    type: SettingType.PASSWORD,
    packageValue: "",
    required: true,
    public: false,
    i18nLabel: "GeminiApiKey",
    i18nPlaceholder: "ClientSecretPlaceholder",
    hidden: false,
    multiline: false,
};
