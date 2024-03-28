import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    IUIKitResponse,
    UIKitActionButtonInteractionContext,
} from "@rocket.chat/apps-engine/definition/uikit";
import { Handler } from "./Handler";
import { IMessage } from "@rocket.chat/apps-engine/definition/messages";
import { QuickReplyApp } from "../../QuickReplyApp";
import { ActionButton } from "../../enum/ActionButtons";
import { sendHelperNotification } from "../helper/message";

export class ExecuteActionButtonHandler {
    private context: UIKitActionButtonInteractionContext;
    constructor(
        protected readonly app: QuickReplyApp,
        protected readonly read: IRead,
        protected readonly http: IHttp,
        protected readonly persistence: IPersistence,
        protected readonly modify: IModify,
        context: UIKitActionButtonInteractionContext
    ) {
        this.context = context;
    }

    public async handleActions(): Promise<IUIKitResponse> {
        const { actionId, user, room, triggerId, message } =
            this.context.getInteractionData();

        const handler = new Handler({
            app: this.app,
            sender: user,
            room: room,
            read: this.read,
            modify: this.modify,
            http: this.http,
            persis: this.persistence,
            triggerId,
        });

        switch (actionId) {
            case ActionButton.AI_REPLY_ACTION: {
                if (!message || !message.text) {
                    sendHelperNotification(
                        this.read,
                        this.modify,
                        user,
                        room,
                        "Please provide a message to generate an AI reply."
                    );
                    return this.context
                        .getInteractionResponder()
                        .errorResponse();
                }
                await handler.generateAiReply(this.http, message.text);

                break;
            }
        }

        return this.context.getInteractionResponder().successResponse();
    }
}
