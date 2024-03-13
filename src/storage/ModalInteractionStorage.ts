import { IModalInteractionStorage } from "../../definition/lib/IModalInteraction";
import {
    IPersistence,
    IPersistenceRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from "@rocket.chat/apps-engine/definition/metadata";
export class ModalInteractionStorage implements IModalInteractionStorage {
    constructor(
        private readonly persistence: IPersistence,
        private readonly persistenceRead: IPersistenceRead
    ) {}

    public async storeState(key: string, value: object): Promise<void> {
        // you get key and value
        // you find it in the storage
        // if it exists, you update it
        // if it doesn't exist, you create it
        // const association = new RocketChatAssociationRecord(
        //     RocketChatAssociationModel.USER,
        //     associate
        // );
        // const oldState = await this.persistenceRead.readByAssociation(association);
        // if (oldState.length)
        //     await this.persistence.updateByAssociations(
        //         [association],
        //         state,
        //         true
        //     );
    }

    // public async getInputElementState(
    //     associate: string
    // ): Promise<object | undefined> {
    //     const association = new RocketChatAssociationRecord(
    //         RocketChatAssociationModel.USER,
    //         `${this.userId}#${this.viewId}#${associate}`
    //     );

    //     const [result] = (await this.persistenceRead.readByAssociation(
    //         association
    //     )) as Array<object>;

    //     return result;
    // }

    // public async clearInputElementState(associate: string): Promise<void> {
    //     const association = new RocketChatAssociationRecord(
    //         RocketChatAssociationModel.USER,
    //         `${this.userId}#${this.viewId}#${associate}`
    //     );

    //     await this.persistence.removeByAssociation(association);
    // }
}
