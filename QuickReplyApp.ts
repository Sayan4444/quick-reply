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
    UIKitBlockInteractionContext,
} from "@rocket.chat/apps-engine/definition/uikit";
import { ExecuteBlockActionHandler } from "./src/handler/ExecuteBlockActionHandler";

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

        this.elementBuilder = new ElementBuilder(this.getID());
        this.blockBuilder = new BlockBuilder(this.getID());
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
}
