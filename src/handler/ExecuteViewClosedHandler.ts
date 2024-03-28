import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    IUIKitResponse,
    UIKitViewCloseInteractionContext,
} from "@rocket.chat/apps-engine/definition/uikit";
import { QuickReplyApp } from "../../QuickReplyApp";
import { AiReply } from "../../enum/modals/AiReply";
import { ModalInteractionStorage } from "../storage/ModalInteractionStorage";

export class ExecuteViewClosedHandler {
    private context: UIKitViewCloseInteractionContext;
    constructor(
        protected readonly app: QuickReplyApp,
        protected readonly read: IRead,
        protected readonly http: IHttp,
        protected readonly persistence: IPersistence,
        protected readonly modify: IModify,
        context: UIKitViewCloseInteractionContext
    ) {
        this.context = context;
    }

    public async handleActions(): Promise<IUIKitResponse> {
        const { view } = this.context.getInteractionData();

        const persistenceRead = this.read.getPersistenceReader();
        const modalInteraction = new ModalInteractionStorage(
            this.persistence,
            persistenceRead
        );
        switch (view.id) {
            case AiReply.VIEW_ID: {
                await modalInteraction.clearState(AiReply.PROMPT_INPUT_ACTION);
                await modalInteraction.clearState(
                    AiReply.REPLY_MESSAGE_INPUT_ACTION
                );
                break;
            }
        }

        return this.context.getInteractionResponder().successResponse();
    }
}
