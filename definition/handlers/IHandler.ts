import { ICommandUtilityParams } from "../command/ICommandUtility";

export interface IHandler extends Omit<ICommandUtilityParams, "params"> {
    saveQuickReply(): Promise<void>;
    getMessageById(id: string): Promise<void>;
}

export type IHanderParams = Omit<ICommandUtilityParams, "params">;
