import {
    IUIKitResponse,
    UIKitBlockInteractionContext,
} from "@rocket.chat/apps-engine/definition/uikit";
import { QuickReplyApp } from "../../QuickReplyApp";
import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
    IUIKitSurfaceViewParam,
} from "@rocket.chat/apps-engine/definition/accessors";
import { ModalInteractionStorage } from "../storage/ModalInteractionStorage";
import { RoomInteractionStorage } from "../storage/RoomInteraction";
import { SaveMessage } from "../../enum/modals/SaveMessage";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { createSaveMessageContextualBar } from "../modal/createSaveMessageContextualBar";
import { ISavedReplies } from "../../definition/lib/IModalInteraction";

export class ExecuteBlockActionHandler {
    private context: UIKitBlockInteractionContext;
    constructor(
        protected readonly app: QuickReplyApp,
        protected readonly read: IRead,
        protected readonly http: IHttp,
        protected readonly persistence: IPersistence,
        protected readonly modify: IModify,
        context: UIKitBlockInteractionContext
    ) {
        this.context = context;
    }

    public async handleActions(): Promise<IUIKitResponse> {
        const { actionId, user, room, container, blockId } =
            this.context.getInteractionData();

        const persistenceRead = this.read.getPersistenceReader();
        const modalInteraction = new ModalInteractionStorage(
            this.persistence,
            persistenceRead
        );

        switch (actionId) {
            case SaveMessage.SAVE_BUTTON_ACTION: {
                this.handleSaveMessage(modalInteraction);
                break;
            }
            case SaveMessage.ID_INPUT_ACTION: {
                return this.handleIdInputAction(modalInteraction);
                break;
            }
            case SaveMessage.MESSAGE_INPUT_ACTION: {
                return this.handleMessageInputAction(modalInteraction);
                break;
            }
        }
        return this.context.getInteractionResponder().successResponse();
    }

    private async handleIdInputAction(
        modalInteraction: ModalInteractionStorage
    ): Promise<IUIKitResponse> {
        const { value, container } = this.context.getInteractionData();

        if (value) {
            await modalInteraction.storeInputState(
                SaveMessage.ID_INPUT_ACTION,
                {
                    value,
                }
            );
        } else {
            await modalInteraction.clearState(SaveMessage.ID_INPUT_ACTION);
        }

        return this.context.getInteractionResponder().viewErrorResponse({
            viewId: container.id,
            errors: {},
        });
    }
    private async handleMessageInputAction(
        modalInteraction: ModalInteractionStorage
    ): Promise<IUIKitResponse> {
        const { value, container } = this.context.getInteractionData();

        if (value) {
            await modalInteraction.storeInputState(
                SaveMessage.MESSAGE_INPUT_ACTION,
                {
                    value,
                }
            );
        } else {
            await modalInteraction.clearState(SaveMessage.MESSAGE_INPUT_ACTION);
        }

        return this.context.getInteractionResponder().viewErrorResponse({
            viewId: container.id,
            errors: {},
        });
    }

    public async handleSaveMessage(
        modalInteraction: ModalInteractionStorage
    ): Promise<IUIKitResponse> {
        const messageId = await modalInteraction.getInputState(
            SaveMessage.ID_INPUT_ACTION
        );
        const message = await modalInteraction.getInputState(
            SaveMessage.MESSAGE_INPUT_ACTION
        );
        if (!message || !messageId)
            return this.context.getInteractionResponder().errorResponse();
        console.log(messageId);

        // await modalInteraction.clearState(SaveMessage.ID_INPUT_ACTION);
        // await modalInteraction.clearState(SaveMessage.MESSAGE_INPUT_ACTION);
        const currentReply = { id: messageId.value, message: message.value };
        const oldValue = await modalInteraction.getSavedRepliesState(
            SaveMessage.VIEW_ID
        );
        let newValues;
        if (!oldValue) newValues = [currentReply];
        else {
            const { value } = oldValue;
            newValues = [currentReply, ...value];
        }

        await modalInteraction.storeSavedRepliesState(SaveMessage.VIEW_ID, {
            value: newValues,
        });
        return this.handleUpdateOfSaveMessageContextualBar(modalInteraction);
    }

    private async handleUpdateOfSaveMessageContextualBar(
        modalInteraction: ModalInteractionStorage
    ): Promise<IUIKitResponse> {
        const { user, triggerId } = this.context.getInteractionData();

        const contextualBar = await createSaveMessageContextualBar(
            this.app,
            modalInteraction
        );
        if (contextualBar instanceof Error) {
            this.app.getLogger().error(contextualBar.message);
            return this.context.getInteractionResponder().errorResponse();
        }

        await this.modify.getUiController().updateSurfaceView(
            contextualBar,
            {
                triggerId,
            },
            user
        );
        return this.context.getInteractionResponder().successResponse();
    }
}
