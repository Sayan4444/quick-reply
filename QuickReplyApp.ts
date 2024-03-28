import {
    IAppAccessors,
    IConfigurationExtend,
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { App } from "@rocket.chat/apps-engine/definition/App";
import { IAppInfo } from "@rocket.chat/apps-engine/definition/metadata";
import { ElementBuilder } from "./src/lib/ElementBuilder";
import { BlockBuilder } from "./src/lib/BlockBuilder";
import { IAppUtils } from "./definition/lib/IAppUtils";
import QuickReplyCommand from "./src/commands/QuickReplyCommand";
import {
    IUIKitResponse,
    UIKitActionButtonInteractionContext,
    UIKitBlockInteractionContext,
    UIKitViewCloseInteractionContext,
    UIKitViewSubmitInteractionContext,
} from "@rocket.chat/apps-engine/definition/uikit";
import { ExecuteBlockActionHandler } from "./src/handler/ExecuteBlockActionHandler";
import {
    IUIActionButtonDescriptor,
    UIActionButtonContext,
} from "@rocket.chat/apps-engine/definition/ui";
import { ActionButton } from "./enum/ActionButtons";
import { ExecuteActionButtonHandler } from "./src/handler/ExecuteActionButtonHandler";
import { ExecuteViewClosedHandler } from "./src/handler/ExecuteViewClosedHandler";
import { ExecuteViewSubmitHandler } from "./src/handler/ExecuteViewSubmitHandler";
import { LLMSetting, settings } from "./config/settings";

export class QuickReplyApp extends App {
    private elementBuilder: ElementBuilder;
    private blockBuilder: BlockBuilder;
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }
    public async initialize(
        configurationExtend: IConfigurationExtend
    ): Promise<void> {
        await configurationExtend.slashCommands.provideSlashCommand(
            new QuickReplyCommand(this)
        );

        await configurationExtend.settings.provideSetting(settings);

        this.elementBuilder = new ElementBuilder(this.getID());
        this.blockBuilder = new BlockBuilder(this.getID());

        const aiReply: IUIActionButtonDescriptor = {
            actionId: ActionButton.AI_REPLY_ACTION,
            labelI18n: ActionButton.AI_REPLY_LABEL,
            context: UIActionButtonContext.MESSAGE_ACTION,
        };
        configurationExtend.ui.registerButton(aiReply);
    }

    public getUtils(): IAppUtils {
        return {
            elementBuilder: this.elementBuilder,
            blockBuilder: this.blockBuilder,
        };
    }

    public async executeBlockActionHandler(
        context: UIKitBlockInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ): Promise<IUIKitResponse> {
        const handler = new ExecuteBlockActionHandler(
            this,
            read,
            http,
            persistence,
            modify,
            context
        );

        return await handler.handleActions();
    }

    public async executeActionButtonHandler(
        context: UIKitActionButtonInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ): Promise<IUIKitResponse> {
        const handler = new ExecuteActionButtonHandler(
            this,
            read,
            http,
            persistence,
            modify,
            context
        );

        return await handler.handleActions();
    }

    public async executeViewSubmitHandler(
        context: UIKitViewSubmitInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ): Promise<IUIKitResponse> {
        const handler = new ExecuteViewSubmitHandler(
            this,
            read,
            http,
            persistence,
            modify,
            context
        );

        return await handler.handleActions();
    }

    public async executeViewClosedHandler(
        context: UIKitViewCloseInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ): Promise<IUIKitResponse> {
        const handler = new ExecuteViewClosedHandler(
            this,
            read,
            http,
            persistence,
            modify,
            context
        );

        return await handler.handleActions();
    }
}
