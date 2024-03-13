export interface IModalInteractionStorage {
    storeState(key: string, value: object): Promise<void>; //store or update state
    // getState(associate: string): Promise<object | undefined>;
    // clearState(associate: string): Promise<void>;
    // updateState(associate: string, state: object): Promise<void>; //internal
}
