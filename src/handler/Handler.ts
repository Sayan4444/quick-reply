import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { QuickReplyApp } from "../../QuickReplyApp";
import { IHanderParams, IHandler } from "../../definition/handlers/IHandler";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { ModalInteractionStorage } from "../storage/ModalInteractionStorage";
import { createSaveMessageContextualBar } from "../modal/createSaveMessageContextualBar";
import { SaveMessage } from "../../enum/modals/SaveMessage";
import { generateAiReply, sendHelperNotification } from "../helper/message";
import { Messages } from "../../enum/messages";
import { createAiReplyContextualBar } from "../modal/createAiReplyContextualBar";
import { AiReply } from "../../enum/modals/AiReply";

export class Handler implements IHandler {
    public app: QuickReplyApp;
    public sender: IUser;
    public room: IRoom;
    public read: IRead;
    public modify: IModify;
    public http: IHttp;
    public persis: IPersistence;
    public modalInteraction: ModalInteractionStorage;
    public triggerId?: string;
    public threadId?: string;

    constructor(params: IHanderParams) {
        this.app = params.app;
        this.sender = params.sender;
        this.room = params.room;
        this.read = params.read;
        this.modify = params.modify;
        this.http = params.http;
        this.persis = params.persis;
        this.triggerId = params.triggerId;
        this.threadId = params.threadId;
        const persistenceRead = params.read.getPersistenceReader();
        this.modalInteraction = new ModalInteractionStorage(
            this.persis,
            persistenceRead
        );
    }

    public async saveQuickReply(): Promise<void> {
        const persistenceRead = this.read.getPersistenceReader();
        const modalInteraction = new ModalInteractionStorage(
            this.persis,
            persistenceRead
        );
        await modalInteraction.clearState(SaveMessage.ID_INPUT_ACTION);
        await modalInteraction.clearState(SaveMessage.MESSAGE_INPUT_ACTION);

        const contextualBar = await createSaveMessageContextualBar(
            this.app,
            modalInteraction
        );

        if (contextualBar instanceof Error) {
            this.app.getLogger().error(contextualBar.message);
            return;
        }

        const triggerId = this.triggerId;

        if (triggerId) {
            await this.modify.getUiController().openSurfaceView(
                contextualBar,
                {
                    triggerId,
                },
                this.sender
            );
        }
    }

    public async getMessageById(id: string): Promise<void> {
        const persistenceRead = this.read.getPersistenceReader();
        const modalInteraction = new ModalInteractionStorage(
            this.persis,
            persistenceRead
        );
        const savedReplies = await modalInteraction.getSavedRepliesState(
            SaveMessage.VIEW_ID
        );
        if (!savedReplies) {
            await sendHelperNotification(
                this.read,
                this.modify,
                this.sender,
                this.room,
                Messages.NO_MESSAGE_FOUND_ID
            );
            return;
        }
        const { value } = savedReplies;
        const reply = value.find((reply) => reply.id === id);
        if (!reply) {
            await sendHelperNotification(
                this.read,
                this.modify,
                this.sender,
                this.room,
                Messages.NO_MESSAGE_FOUND_ID
            );
            return;
        }
        await sendHelperNotification(
            this.read,
            this.modify,
            this.sender,
            this.room,
            reply?.message!
        );
    }
    public async deleteMessageById(id: string): Promise<void> {
        const persistenceRead = this.read.getPersistenceReader();
        const modalInteraction = new ModalInteractionStorage(
            this.persis,
            persistenceRead
        );
        const savedReplies = await modalInteraction.getSavedRepliesState(
            SaveMessage.VIEW_ID
        );
        if (savedReplies) {
            const { value } = savedReplies;
            const newReplies = value.filter((reply) => reply.id !== id);
            await modalInteraction.storeSavedRepliesState(SaveMessage.VIEW_ID, {
                value: newReplies,
            });

            await sendHelperNotification(
                this.read,
                this.modify,
                this.sender,
                this.room,
                Messages.DELETE_SUCCESS
            );
        }
    }

    public async generateAiReply(http: IHttp, text: string): Promise<void> {
        const persistenceRead = this.read.getPersistenceReader();
        const modalInteraction = new ModalInteractionStorage(
            this.persis,
            persistenceRead
        );
        await modalInteraction.storeInputState(AiReply.PROMPT_INPUT_ACTION, {
            value: text,
        });
        const contextualBar = await createAiReplyContextualBar(
            this.app,
            modalInteraction,
            text
        );

        if (contextualBar instanceof Error) {
            this.app.getLogger().error(contextualBar.message);
            return;
        }

        const triggerId = this.triggerId;

        if (triggerId) {
            await this.modify.getUiController().openSurfaceView(
                contextualBar,
                {
                    triggerId,
                },
                this.sender
            );
        }
    }
}
