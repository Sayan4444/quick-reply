import { IUIKitSurfaceViewParam } from "@rocket.chat/apps-engine/definition/accessors";
import { QuickReplyApp } from "../../QuickReplyApp";
import { ModalInteractionStorage } from "../storage/ModalInteraction";
import { Block, TextObjectType } from "@rocket.chat/ui-kit";
import { inputElementComponent } from "./common/inputElementComponent";
import { UIKitSurfaceType } from "@rocket.chat/apps-engine/definition/uikit";

export async function createCommentContextualBar(
    app: QuickReplyApp,
    modalInteraction: ModalInteractionStorage,
    pageId?: string,
    refresh?: boolean
): Promise<IUIKitSurfaceViewParam | Error> {
    const { elementBuilder, blockBuilder } = app.getUtils();

    const blocks: Block[] = [];

    const commentMultiLineInput = inputElementComponent(
        {
            app,
            placeholder: "no placeholder",
            label: "label",
            optional: false,
            // multiline: true,
            dispatchActionConfigOnInput: true,
            initialValue: "initial value",
        },
        {
            actionId: "input-action-id",
            blockId: "input-block-id",
        }
    );

    const divider = blockBuilder.createDividerBlock();

    // const commentOnPageButton = ButtonInSectionComponent(
    //     {
    //         app,
    //         buttonText: CommentPage.SUBMIT_BUTTON_TEXT,
    //         style: ButtonStyle.PRIMARY,
    //         value: pageId,
    //     },
    //     {
    //         actionId: CommentPage.COMMENT_ON_PAGE_SUBMIT_ACTION,
    //         blockId: CommentPage.COMMENT_ON_PAGE_SUBMIT_BLOCK,
    //     }
    // );

    const mandatoryBlocks: Block[] = [
        commentMultiLineInput,
        // commentOnPageButton,
        divider,
    ];

    blocks.push(...mandatoryBlocks);

    const close = elementBuilder.addButton(
        { text: "Close", style: "danger" },
        {
            actionId: "close-action-id",
            blockId: "block-id",
        }
    );

    return {
        id: "view-id",
        type: UIKitSurfaceType.CONTEXTUAL_BAR,
        title: {
            type: TextObjectType.MRKDWN,
            text: "Title",
        },
        blocks,
        close,
    };
}
