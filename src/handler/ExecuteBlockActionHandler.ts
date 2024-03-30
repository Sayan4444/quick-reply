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
import { Handler } from "./Handler";

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
        const { actionId, user, room, triggerId, message } =
            this.context.getInteractionData();

        const handler = new Handler({
            app: this.app,
            sender: user,
            room: room!,
            read: this.read,
            modify: this.modify,
            http: this.http,
            persis: this.persistence,
            triggerId,
        });

        const persistenceRead = this.read.getPersistenceReader();
        const modalInteraction = new ModalInteractionStorage(
            this.persistence,
            persistenceRead
        );
        switch (actionId) {
            case SaveMessage.SAVE_BUTTON_ACTION: {
                this.handleSaveMessage(modalInteraction, handler);
                break;
            }
            case SaveMessage.ID_INPUT_ACTION:
            case SaveMessage.MESSAGE_INPUT_ACTION:
            case AiReply.PROMPT_INPUT_ACTION:
            case AiReply.REPLY_MESSAGE_INPUT_ACTION: {
                return this.handleInputAction(modalInteraction, actionId);
            }
            case SaveMessage.DELETE_BUTTON_ACTION: {
                return this.handleDeleteButtonAction(modalInteraction, handler);
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

    private async handleInputAction(
        modalInteraction: ModalInteractionStorage,
        actionId: string
    ): Promise<IUIKitResponse> {
        const { value, container } = this.context.getInteractionData();

        if (value) {
            await modalInteraction.storeInputState(actionId, {
                value,
            });
        } else {
            await modalInteraction.clearState(actionId);
        }

        return this.context.getInteractionResponder().viewErrorResponse({
            viewId: container.id,
            errors: {},
        });
    }

    private async handleSaveMessage(
        modalInteraction: ModalInteractionStorage,
        handler: Handler
    ): Promise<IUIKitResponse> {
        const { user, room } = this.context.getInteractionData();
        const messageId = await modalInteraction.getInputState(
            SaveMessage.ID_INPUT_ACTION
        );

        const message = await modalInteraction.getInputState(
            SaveMessage.MESSAGE_INPUT_ACTION
        );
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
        await handler.saveMessageById(messageId.value, message.value);
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
        modalInteraction: ModalInteractionStorage,
        handler: Handler
    ): Promise<IUIKitResponse> {
        const { value: id } = this.context.getInteractionData();
        await handler.deleteMessageById(id!);
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
