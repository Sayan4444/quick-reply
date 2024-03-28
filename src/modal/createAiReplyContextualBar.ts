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
import { AiReply } from "../../enum/modals/AiReply";

export async function createAiReplyContextualBar(
    app: QuickReplyApp,
    modalInteraction: ModalInteractionStorage,
    prompt: string,
    response?: string
): Promise<IUIKitSurfaceViewParam | Error> {
    const { elementBuilder, blockBuilder } = app.getUtils();

    const blocks: Block[] = [];

    const promptMessage = inputElementComponent(
        {
            app,
            label: AiReply.PROMPT_INPUT_LABEL,
            placeholder: "",
            optional: false,
            dispatchActionConfigOnInput: true,
            initialValue: prompt,
        },
        {
            actionId: AiReply.PROMPT_INPUT_ACTION,
            blockId: AiReply.PROMPT_INPUT_BLOCK,
        }
    );
    const generateReplyButton = ButtonInSectionComponent(
        {
            app,
            buttonText: AiReply.GENERATE_BUTTON_TEXT,
            style: ButtonStyle.PRIMARY,
        },
        {
            actionId: AiReply.GENERATE_BUTTON_ACTION,
            blockId: AiReply.GENERATE_BUTTON_BLOCK,
        }
    );
    blocks.push(promptMessage, generateReplyButton);
    if (response) {
        const replyMessage = inputElementComponent(
            {
                app,
                label: AiReply.REPLY_MESSAGE_LABEL,
                placeholder: "",
                multiline: true,
                optional: false,
                initialValue: response,
                dispatchActionConfigOnInput: true,
            },
            {
                actionId: AiReply.REPLY_MESSAGE_INPUT_ACTION,
                blockId: AiReply.REPLY_MESSAGE_INPUT_BLOCK,
            }
        );
        const sendAiReplyButton = ButtonInSectionComponent(
            {
                app,
                buttonText: AiReply.SEND_BUTTON_TEXT,
                style: ButtonStyle.PRIMARY,
            },
            {
                actionId: AiReply.SEND_BUTTON_ACTION,
                blockId: AiReply.SEND_BUTTON_BLOCK,
            }
        );
        blocks.push(replyMessage, sendAiReplyButton);
    }

    const close = elementBuilder.addButton(
        { text: AiReply.CLOSE_BUTTON_TEXT, style: ButtonStyle.DANGER },
        {
            actionId: AiReply.CLOSE_ACTION,
            blockId: AiReply.CLOSE_BLOCK,
        }
    );

    return {
        id: AiReply.VIEW_ID,
        type: UIKitSurfaceType.CONTEXTUAL_BAR,
        title: {
            type: TextObjectType.MRKDWN,
            text: AiReply.TITLE,
        },
        blocks,
        close,
    };
}
