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
import { SaveMessage } from "../../enum/modals/SaveMessage";
import { createSaveMessageContextualBar } from "../modal/createSaveMessageContextualBar";
import {
    generateAiReply,
    sendHelperNotification,
    sendMessageInRoom,
} from "../helper/message";
import { Messages } from "../../enum/messages";
import { AiReply } from "../../enum/modals/AiReply";
import { createAiReplyContextualBar } from "../modal/createAiReplyContextualBar";

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
        const { actionId } = this.context.getInteractionData();

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
            }
            case SaveMessage.MESSAGE_INPUT_ACTION: {
                return this.handleMessageInputAction(modalInteraction);
            }
            case SaveMessage.DELETE_BUTTON_ACTION: {
                return this.handleDeleteButtonAction(modalInteraction);
            }

            case AiReply.GENERATE_BUTTON_ACTION: {
                return this.handleGenerateAiReply(modalInteraction);
            }

            case AiReply.SEND_BUTTON_ACTION: {
                return this.handleSendAiMessage(modalInteraction);
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

    private async handleSaveMessage(
        modalInteraction: ModalInteractionStorage
    ): Promise<IUIKitResponse> {
        const messageId = await modalInteraction.getInputState(
            SaveMessage.ID_INPUT_ACTION
        );
        const message = await modalInteraction.getInputState(
            SaveMessage.MESSAGE_INPUT_ACTION
        );
        const { user, room } = this.context.getInteractionData();
        //check if message is present
        if (!message || !message.value.trim()) {
            await sendHelperNotification(
                this.read,
                this.modify,
                user,
                room!,
                Messages.NO_MESSAGE
            );
            return this.context.getInteractionResponder().errorResponse();
        }
        //checking if messageId is present
        if (!messageId || !messageId.value.trim()) {
            await sendHelperNotification(
                this.read,
                this.modify,
                user,
                room!,
                Messages.NO_ID
            );
            return this.context.getInteractionResponder().errorResponse();
        }

        //checking if messageId is of one word
        if (messageId.value.trim().split(" ").length > 1) {
            await sendHelperNotification(
                this.read,
                this.modify,
                user,
                room!,
                Messages.SINGLE_WORD_ID
            );
            return this.context.getInteractionResponder().errorResponse();
        }
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
            //checking if messageId is unique
            const isUnique = value.every(
                (reply) => reply.id !== messageId.value
            );
            if (!isUnique) {
                await sendHelperNotification(
                    this.read,
                    this.modify,
                    user,
                    room!,
                    Messages.UNIQUE_ID
                );
                return this.context.getInteractionResponder().errorResponse();
            }
            newValues = [currentReply, ...value];
        }

        await modalInteraction.storeSavedRepliesState(SaveMessage.VIEW_ID, {
            value: newValues,
        });
        await sendHelperNotification(
            this.read,
            this.modify,
            user,
            room!,
            Messages.SAVED
        );
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
    private async handleDeleteButtonAction(
        modalInteraction: ModalInteractionStorage
    ): Promise<IUIKitResponse> {
        const { value: id } = this.context.getInteractionData();
        const savedReplies = await modalInteraction.getSavedRepliesState(
            SaveMessage.VIEW_ID
        );
        if (savedReplies) {
            const { value } = savedReplies;
            const newReplies = value.filter((reply) => reply.id !== id);
            await modalInteraction.storeSavedRepliesState(SaveMessage.VIEW_ID, {
                value: newReplies,
            });
        }
        return this.handleUpdateOfSaveMessageContextualBar(modalInteraction);
    }
    private async handleGenerateAiReply(
        modalInteraction: ModalInteractionStorage
    ): Promise<IUIKitResponse> {
        const { user, triggerId } = this.context.getInteractionData();
        const { value } = (await modalInteraction.getInputState(
            AiReply.PROMPT_INPUT_ACTION
        ))!;
        const response = await generateAiReply(this.read, this.http, value);
        const aiReply = response.data.candidates[0].content.parts[0].text;
        const contextualBar = await createAiReplyContextualBar(
            this.app,
            modalInteraction,
            value,
            aiReply
        );

        await modalInteraction.storeInputState(
            AiReply.REPLY_MESSAGE_INPUT_ACTION,
            {
                value: aiReply,
            }
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
    private async handleSendAiMessage(
        modalInteraction: ModalInteractionStorage
    ): Promise<IUIKitResponse> {
        const { user, triggerId, room } = this.context.getInteractionData();
        const { value } = (await modalInteraction.getInputState(
            AiReply.REPLY_MESSAGE_INPUT_ACTION
        ))!;
        await sendMessageInRoom(this.read, this.modify, user, room!, value);
        return this.context.getInteractionResponder().successResponse();
    }
}
