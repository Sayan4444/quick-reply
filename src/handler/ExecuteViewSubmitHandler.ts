import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    IUIKitResponse,
    UIKitViewSubmitInteractionContext,
} from "@rocket.chat/apps-engine/definition/uikit";
import { QuickReplyApp } from "../../QuickReplyApp";
import { AiReply } from "../../enum/modals/AiReply";
import { ModalInteractionStorage } from "../storage/ModalInteractionStorage";
import { sendMessageInRoom } from "../helper/message";

export class ExecuteViewSubmitHandler {
    private context: UIKitViewSubmitInteractionContext;
    constructor(
        protected readonly app: QuickReplyApp,
        protected readonly read: IRead,
        protected readonly http: IHttp,
        protected readonly persistence: IPersistence,
        protected readonly modify: IModify,
        context: UIKitViewSubmitInteractionContext
    ) {
        this.context = context;
    }

    public async handleActions(): Promise<IUIKitResponse> {
        const { view, user, room } = this.context.getInteractionData();

        const persistenceRead = this.read.getPersistenceReader();
        const modalInteraction = new ModalInteractionStorage(
            this.persistence,
            persistenceRead
        );

        switch (view.id) {
            case AiReply.VIEW_ID: {
                await sendMessageInRoom(
                    this.read,
                    this.modify,
                    user,
                    room!,
                    "All message in room"
                );
                break;
            }
        }

        return this.context.getInteractionResponder().successResponse();
    }
}
