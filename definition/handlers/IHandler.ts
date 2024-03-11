import { RoomInteractionStorage } from "../../src/storage/RoomInteraction";
import { ICommandUtilityParams } from "../command/ICommandUtility";

export interface IHandler extends Omit<ICommandUtilityParams, "params"> {
    roomInteractionStorage: RoomInteractionStorage;
    saveQuickReply(): Promise<void>;
}

export type IHanderParams = Omit<ICommandUtilityParams, "params">;
