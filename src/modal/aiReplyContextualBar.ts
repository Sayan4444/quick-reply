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

export async function aiReplyContextualBar(
    app: QuickReplyApp
    // modalInteraction: ModalInteractionStorage
): Promise<IUIKitSurfaceViewParam | Error> {
    const { elementBuilder, blockBuilder } = app.getUtils();

    const blocks: Block[] = [];
    const aiReplyPreviewBlock = blockBuilder.createPreviewBlock({
        title: ["Connect your account"],
        description: [""],
    });

    const regenerateButton = ButtonInSectionComponent(
        {
            app,
            buttonText: AiReply.REGENERATE_BUTTON_TEXT,
            style: ButtonStyle.PRIMARY,
        },
        {
            actionId: AiReply.REGENERATE_BUTTON_ACTION,
            blockId: AiReply.REGENERATE_BUTTON_BLOCK,
        }
    );

    blocks.push(aiReplyPreviewBlock, regenerateButton);

    const close = elementBuilder.addButton(
        { text: AiReply.CLOSE_BUTTON_TEXT, style: ButtonStyle.DANGER },
        {
            actionId: AiReply.CLOSE_ACTION,
            blockId: AiReply.CLOSE_BLOCK,
        }
    );
    const send = elementBuilder.addButton(
        { text: AiReply.SEND_MESSAGE, style: ButtonStyle.DANGER },
        {
            actionId: AiReply.SEND_ACTION,
            blockId: AiReply.SEND_BLOCK,
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
        submit: send,
    };
}
