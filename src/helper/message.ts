import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { IMessageAttachment } from "@rocket.chat/apps-engine/definition/messages";

export async function sendHelperNotification(
    read: IRead,
    modify: IModify,
    user: IUser,
    room: IRoom,
    message: string
): Promise<void> {
    const appUser = (await read.getUserReader().getAppUser()) as IUser;
    const attachment: IMessageAttachment = {
        color: "#000000",
        text: message,
    };

    const helperMessage = modify
        .getCreator()
        .startMessage()
        .setRoom(room)
        .setSender(appUser)
        .setText(message)
        .setAttachments([attachment])
        .setGroupable(false);

    return read.getNotifier().notifyUser(user, helperMessage.getMessage());
}
