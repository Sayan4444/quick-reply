import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    ICommandUtility,
    ICommandUtilityParams,
} from "../../definition/command/ICommandUtility";
import { CommandParam } from "../../enum/CommandParam";
import { QuickReplyApp } from "../../QuickReplyApp";
import { Handler } from "../handler/Handler";
import { sendHelperNotification } from "../helper/message";
import { Messages } from "../../enum/messages";

export class CommandUtility implements ICommandUtility {
    public app: QuickReplyApp;
    public params: Array<string>;
    public sender: IUser;
    public room: IRoom;
    public read: IRead;
    public modify: IModify;
    public http: IHttp;
    public persis: IPersistence;
    public triggerId?: string;
    public threadId?: string;

    constructor(props: ICommandUtilityParams) {
        this.app = props.app;
        this.params = props.params;
        this.sender = props.sender;
        this.room = props.room;
        this.read = props.read;
        this.modify = props.modify;
        this.http = props.http;
        this.persis = props.persis;
        this.triggerId = props.triggerId;
        this.threadId = props.threadId;
    }

    public async resolveCommand(): Promise<void> {
        const handler = new Handler({
            app: this.app,
            sender: this.sender,
            room: this.room,
            read: this.read,
            modify: this.modify,
            http: this.http,
            persis: this.persis,
            triggerId: this.triggerId,
            threadId: this.threadId,
        });
        switch (this.params.length) {
            case 0: {
                await sendHelperNotification(
                    this.read,
                    this.modify,
                    this.sender,
                    this.room,
                    "Give a command"
                );
                break;
            }
            case 1: {
                await this.handleSingleParam(handler);
                break;
            }
            case 2: {
                await this.handleDualParam(handler);
                break;
            }
            default: {
                await this.handleMultipleParams(handler);
                break;
            }
        }
    }

    private async handleSingleParam(handler: Handler): Promise<void> {
        switch (this.params[0].toLowerCase()) {
            case CommandParam.SAVE: {
                await handler.saveQuickReply();
                break;
            }
            case CommandParam.HELP: {
                await sendHelperNotification(
                    this.read,
                    this.modify,
                    this.sender,
                    this.room,
                    Messages.HELPER_COMMANDS
                );
                break;
            }
            default: {
                await sendHelperNotification(
                    this.read,
                    this.modify,
                    this.sender,
                    this.room,
                    "No such command"
                );
                break;
            }
        }
    }

    private async handleDualParam(handler: Handler): Promise<void> {
        switch (this.params[0].toLowerCase()) {
            case CommandParam.ID: {
                await handler.getMessageById(this.params[1].toLowerCase());
                break;
            }

            default: {
                await sendHelperNotification(
                    this.read,
                    this.modify,
                    this.sender,
                    this.room,
                    "No such command"
                );
                break;
            }
        }
    }

    private async handleMultipleParams(handler: Handler): Promise<void> {
        if (
            this.params[0].toLowerCase() === CommandParam.ID &&
            (this.params[2].toLowerCase() === CommandParam.DELETE ||
                this.params[2].toLowerCase() === CommandParam.SAVE_MESSAGE)
        ) {
            const id = this.params[1].toLowerCase();
            if (this.params[2].toLowerCase() === CommandParam.DELETE) {
                await handler.deleteMessageById(id);
            } else if (
                this.params[2].toLowerCase() === CommandParam.SAVE_MESSAGE
            ) {
                let msg = "";
                for (let i = 3; i < this.params.length; i++) {
                    msg += " " + this.params[i];
                }
                await handler.saveMessageById(id, msg);
            } else {
                await sendHelperNotification(
                    this.read,
                    this.modify,
                    this.sender,
                    this.room,
                    "No such command"
                );
            }
        } else
            await sendHelperNotification(
                this.read,
                this.modify,
                this.sender,
                this.room,
                "No such command"
            );
    }
}
