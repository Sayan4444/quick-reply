import {
    IHttp,
    IModify,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { getCredentials } from "./getCredentials";

export async function sendHelperNotification(
    read: IRead,
    modify: IModify,
    user: IUser,
    room: IRoom,
    message: string
): Promise<void> {
    const appUser = (await read.getUserReader().getAppUser()) as IUser;

    const helperMessage = modify
        .getCreator()
        .startMessage()
        .setRoom(room)
        .setSender(appUser)
        .setText(message)
        .setGroupable(false);

    return read.getNotifier().notifyUser(user, helperMessage.getMessage());
}

export async function sendMessageInRoom(
    modify: IModify,
    user: IUser,
    room: IRoom,
    message: string
): Promise<void> {
    const messageStructure = modify.getCreator().startMessage();
    messageStructure.setSender(user).setRoom(room).setText(message);
    await modify.getCreator().finish(messageStructure);
}

export async function generateAiReply(read: IRead, http: IHttp, text: string) {
    const url =
        "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=";
    const key = await getCredentials(read);
    const prompt =
        "You need to generate a reply for this message with high accuracy under 20 words keeping it as short as possible.Your reply will be directly shown to the end user and not a developer so write professionally.The message is :-";
    return await http.post(url + key, {
        data: {
            contents: [
                {
                    parts: [
                        {
                            text: prompt + text,
                        },
                    ],
                },
            ],
        },
    });
}
