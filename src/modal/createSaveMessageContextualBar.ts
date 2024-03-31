import { IUIKitSurfaceViewParam } from "@rocket.chat/apps-engine/definition/accessors";
import { QuickReplyApp } from "../../QuickReplyApp";
import { ModalInteractionStorage } from "../storage/ModalInteractionStorage";
import { Block, SectionBlock, TextObjectType } from "@rocket.chat/ui-kit";
import { inputElementComponent } from "./common/inputElementComponent";
import {
    ButtonStyle,
    UIKitSurfaceType,
} from "@rocket.chat/apps-engine/definition/uikit";
import { SaveMessage } from "../../enum/modals/SaveMessage";
import { ButtonInSectionComponent } from "./common/buttonInSectionComponent";

export async function createSaveMessageContextualBar(
    app: QuickReplyApp,
    modalInteraction: ModalInteractionStorage
): Promise<IUIKitSurfaceViewParam | Error> {
    const { elementBuilder, blockBuilder } = app.getUtils();

    const blocks: Block[] = [];

    const idInput = inputElementComponent(
        {
            app,
            label: SaveMessage.ID_INPUT_LABEL,
            placeholder: SaveMessage.ID_INPUT_PLACEHOLDER,
            optional: false,
            dispatchActionConfigOnInput: true,
            initialValue: "",
        },
        {
            actionId: SaveMessage.ID_INPUT_ACTION,
            blockId: SaveMessage.ID_INPUT_BLOCK,
        }
    );
    const messageInput = inputElementComponent(
        {
            app,
            label: SaveMessage.MESSAGE_INPUT_LABEL,
            placeholder: SaveMessage.MESSAGE_INPUT_PLACEHOLDER,
            multiline: true,
            optional: false,
            initialValue: "",
            dispatchActionConfigOnInput: true,
        },
        {
            actionId: SaveMessage.MESSAGE_INPUT_ACTION,
            blockId: SaveMessage.MESSAGE_INPUT_BLOCK,
        }
    );

    const saveMessageButton = ButtonInSectionComponent(
        {
            app,
            buttonText: SaveMessage.SAVE_BUTTON_TEXT,
            style: ButtonStyle.PRIMARY,
        },
        {
            actionId: SaveMessage.SAVE_BUTTON_ACTION,
            blockId: SaveMessage.SAVE_BUTTON_BLOCK,
        }
    );
    const divider = blockBuilder.createDividerBlock();
    const mandatoryBlocks: Block[] = [
        idInput,
        messageInput,
        saveMessageButton,
        divider,
    ];
    blocks.push(...mandatoryBlocks);
    const savedReplies = await modalInteraction.getSavedRepliesState(
        SaveMessage.VIEW_ID
    );
    if (savedReplies) {
        const { value } = savedReplies;
        value.forEach((reply) => {
            const id = blockBuilder.createContextBlock({
                contextElements: [`Reply id:- **${reply.id}**`],
            });
            const message: SectionBlock = blockBuilder.createSectionBlock({
                text: `Message:- ${reply.message}`,
            });
            const deleteMessageButton = ButtonInSectionComponent(
                {
                    app,
                    buttonText: SaveMessage.DELETE_BUTTON_TEXT,
                    style: ButtonStyle.DANGER,
                    value: reply.id,
                },
                {
                    actionId: SaveMessage.DELETE_BUTTON_ACTION,
                    blockId: SaveMessage.DELETE_BUTTON_BLOCK,
                }
            );
            blocks.push(id, message, deleteMessageButton, divider);
        });
    }

    const close = elementBuilder.addButton(
        { text: SaveMessage.CLOSE_BUTTON_TEXT, style: ButtonStyle.DANGER },
        {
            actionId: SaveMessage.CLOSE_ACTION,
            blockId: SaveMessage.CLOSE_BLOCK,
        }
    );

    return {
        id: SaveMessage.VIEW_ID,
        type: UIKitSurfaceType.CONTEXTUAL_BAR,
        title: {
            type: TextObjectType.MRKDWN,
            text: SaveMessage.TITLE,
        },
        blocks,
        close,
    };
}
