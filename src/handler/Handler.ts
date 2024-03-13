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
import { RoomInteractionStorage } from "../storage/RoomInteraction";
import { IMessage } from "@rocket.chat/apps-engine/definition/messages";
import { ModalInteractionStorage } from "../storage/ModalInteraction";
import { createSaveMessageContextualBar } from "../modal/createSaveMessageContextualBar";
import { SaveMessage } from "../../enum/modals/SaveMessage";

export class Handler implements IHandler {
    public app: QuickReplyApp;
    public sender: IUser;
    public room: IRoom;
    public read: IRead;
    public modify: IModify;
    public http: IHttp;
    public persis: IPersistence;
    public roomInteractionStorage: RoomInteractionStorage;
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
        this.roomInteractionStorage = new RoomInteractionStorage(
            params.persis,
            persistenceRead,
            params.sender.id
        );
    }

    public async saveQuickReply(
        update?: boolean,
        message?: IMessage
    ): Promise<void> {
        const userId = this.sender.id;
        const roomId = this.room.id;

        const persistenceRead = this.read.getPersistenceReader();
        const modalInteraction = new ModalInteractionStorage(
            this.persis,
            persistenceRead,
            userId,
            SaveMessage.VIEW_ID
        );

        await Promise.all([
            this.roomInteractionStorage.storeInteractionRoomId(roomId),
            modalInteraction.clearAllInteractionActionId(),
        ]);

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
}
