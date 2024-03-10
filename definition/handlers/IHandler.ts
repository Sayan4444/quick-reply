import { RoomInteractionStorage } from "../../src/storage/RoomInteraction";
import { ICommandUtilityParams } from "../command/ICommandUtility";

export interface IHandler extends Omit<ICommandUtilityParams, "params"> {
    roomInteractionStorage: RoomInteractionStorage;
    createNotionDatabase(): Promise<void>;
    commentOnPages(): Promise<void>;
    createNotionPageOrRecord(): Promise<void>;
    changeNotionWorkspace(): Promise<void>;
    shareNotionPage(): Promise<void>;
}

export type IHanderParams = Omit<ICommandUtilityParams, "params">;
