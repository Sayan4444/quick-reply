import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    ISlashCommand,
    ISlashCommandPreview,
    ISlashCommandPreviewItem,
    SlashCommandContext,
} from "@rocket.chat/apps-engine/definition/slashcommands";
import { QuickReplyApp } from "../../QuickReplyApp";

export default class QuickReplyCommand implements ISlashCommand {
    constructor(private readonly app: QuickReplyApp) {}

    public command = "quick-reply";
    public i18nDescription = "Quick Reply Description";
    public i18nParamsExample = "Quick Reply Params ";
    public providesPreview = false;

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence
    ): Promise<void> {
        console.log("QuickReplyCommand");
    }
}
