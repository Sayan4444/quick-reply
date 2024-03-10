import {
    IAppAccessors,
    IConfigurationExtend,
    ILogger,
} from "@rocket.chat/apps-engine/definition/accessors";
import { App } from "@rocket.chat/apps-engine/definition/App";
import { IAppInfo } from "@rocket.chat/apps-engine/definition/metadata";
import { ElementBuilder } from "./src/lib/ElementBuilder";
import { BlockBuilder } from "./src/lib/BlockBuilder";
import { IAppUtils } from "./definition/lib/IAppUtils";
import QuickReplyCommand from "./src/slashCommands/QuickReplyCommand";

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

        //     // const commentOnPagesButton: IUIActionButtonDescriptor = {
        //     //     actionId: ActionButton.COMMENT_ON_PAGES_MESSAGE_BOX_ACTION,
        //     //     labelI18n: ActionButton.COMMENT_ON_PAGES_MESSAGE_BOX_ACTION_LABEL,
        //     //     context: UIActionButtonContext.MESSAGE_BOX_ACTION,
        //     // };

        //     // const sendToPageButton: IUIActionButtonDescriptor = {
        //     //     actionId: ActionButton.SEND_TO_PAGE_MESSAGE_ACTION,
        //     //     labelI18n: ActionButton.SEND_TO_PAGE_MESSAGE_ACTION_LABEL,
        //     //     context: UIActionButtonContext.MESSAGE_ACTION,
        //     // };

        //     // const sendToNewPageButton: IUIActionButtonDescriptor = {
        //     //     actionId: ActionButton.SEND_TO_NEW_PAGE_MESSAGE_ACTION,
        //     //     labelI18n: ActionButton.SEND_TO_NEW_PAGE_MESSAGE_ACTION_LABEL,
        //     //     context: UIActionButtonContext.MESSAGE_ACTION,
        //     // };

        //     // configurationExtend.ui.registerButton(commentOnPagesButton);
        //     // configurationExtend.ui.registerButton(sendToPageButton);
        //     // configurationExtend.ui.registerButton(sendToNewPageButton);
        // }
        // public getUtils(): IAppUtils {
        //     return {
        //         elementBuilder: this.elementBuilder,
        //         blockBuilder: this.blockBuilder,
        //     };
    }
}
