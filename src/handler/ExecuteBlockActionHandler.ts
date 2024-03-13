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
} from "@rocket.chat/apps-engine/definition/accessors";
import { ModalInteractionStorage } from "../storage/ModalInteractionStorage";
import { RoomInteractionStorage } from "../storage/RoomInteraction";
import { SaveMessage } from "../../enum/modals/SaveMessage";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { createSaveMessageContextualBar } from "../modal/createSaveMessageContextualBar";

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
            persistenceRead,
            user.id,
            container.id
        );

        const roomInteractionStorage = new RoomInteractionStorage(
            this.persistence,
            persistenceRead,
            user.id
        );

        switch (actionId) {
            case SaveMessage.SAVE_BUTTON_ACTION: {
                this.handleSaveMessage(
                    modalInteraction,
                    roomInteractionStorage
                );
                break;
            }
            case SaveMessage.ID_INPUT_ACTION: {
                return this.handleIdInputAction(
                    modalInteraction,
                    roomInteractionStorage
                );
                break;
            }
            case SaveMessage.MESSAGE_INPUT_ACTION: {
                return this.handleMessageInputAction(
                    modalInteraction,
                    roomInteractionStorage
                );
                break;
            }
        }
        return this.context.getInteractionResponder().successResponse();
    }

    private async handleIdInputAction(
        modalInteraction: ModalInteractionStorage,
        roomInteractionStorage: RoomInteractionStorage
    ): Promise<IUIKitResponse> {
        const { value, container } = this.context.getInteractionData();

        if (value) {
            await modalInteraction.storeInputElementState(
                SaveMessage.ID_INPUT_ACTION,
                {
                    value,
                }
            );
        } else {
            await modalInteraction.clearInputElementState(
                SaveMessage.ID_INPUT_ACTION
            );
        }

        return this.context.getInteractionResponder().viewErrorResponse({
            viewId: container.id,
            errors: {},
        });
    }
    private async handleMessageInputAction(
        modalInteraction: ModalInteractionStorage,
        roomInteractionStorage: RoomInteractionStorage
    ): Promise<IUIKitResponse> {
        const { value, container } = this.context.getInteractionData();

        if (value) {
            await modalInteraction.storeInputElementState(
                SaveMessage.MESSAGE_INPUT_ACTION,
                {
                    value,
                }
            );
        } else {
            await modalInteraction.clearInputElementState(
                SaveMessage.MESSAGE_INPUT_ACTION
            );
        }

        return this.context.getInteractionResponder().viewErrorResponse({
            viewId: container.id,
            errors: {},
        });
    }

    public async handleSaveMessage(
        modalInteraction: ModalInteractionStorage,
        roomInteractionStorage: RoomInteractionStorage
    ): Promise<IUIKitResponse> {
        const { user, container, triggerId, value } =
            this.context.getInteractionData();
        const roomId = await roomInteractionStorage.getInteractionRoomId();
        const room = (await this.read.getRoomReader().getById(roomId)) as IRoom;
        const messageId = await modalInteraction.getInputElementState(
            SaveMessage.ID_INPUT_ACTION
        );
        const message = await modalInteraction.getInputElementState(
            SaveMessage.MESSAGE_INPUT_ACTION
        );
        await modalInteraction.clearInputElementState(
            SaveMessage.ID_INPUT_ACTION
        );
        await modalInteraction.clearInputElementState(
            SaveMessage.MESSAGE_INPUT_ACTION
        );
        const savedReplies = (await modalInteraction.getInputElementState(
            SaveMessage.VIEW_ID
        )) as { value: [] };

        await modalInteraction.storeInputElementState(SaveMessage.VIEW_ID, {
            value: [
                ...savedReplies?.value,
                {
                    messageId,
                    message,
                },
            ],
        });
        return this.handleUpdateOfSaveMessageContextualBar(
            user,
            room,
            modalInteraction
        );
    }

    private async handleUpdateOfSaveMessageContextualBar(
        user: IUser,
        room: IRoom,
        modalInteraction: ModalInteractionStorage
    ): Promise<IUIKitResponse> {
        const contextualBar = await createSaveMessageContextualBar(
            this.app,
            modalInteraction
        );

        if (contextualBar instanceof Error) {
            this.app.getLogger().error(contextualBar.message);
            return this.context.getInteractionResponder().errorResponse();
        }

        return this.context
            .getInteractionResponder()
            .updateContextualBarViewResponse(contextualBar);
    }
}
