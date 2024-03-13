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
import { ICommandUtilityParams } from "../../definition/command/ICommandUtility";
import { CommandUtility } from "./CommandUtility";

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
        const params = context.getArguments();
        const sender = context.getSender();
        const room = context.getRoom();
        const triggerId = context.getTriggerId();
        const threadId = context.getThreadId();

        const commandUtilityParams: ICommandUtilityParams = {
            params,
            sender,
            room,
            triggerId,
            threadId,
            read,
            modify,
            http,
            persis,
            app: this.app,
        };

        const commandUtility = new CommandUtility(commandUtilityParams);
        await commandUtility.resolveCommand();
    }
}
