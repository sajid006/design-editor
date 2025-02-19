export enum CanvasActionType {
    INIT_CANVAS = "INIT_CANVAS",
    ADD_SHAPE = "ADD_SHAPE",
    SAVE_DESIGN = "SAVE_DESIGN",
    LOAD_DESIGN = "LOAD_DESIGN",
    EXPORT_PNG = "EXPORT_PNG",
    UNDO = "UNDO",
    REDO = "REDO",
    BLURR = "BLURR"
}

export interface CanvasState {
    canvas: fabric.Canvas | null;
    history: string[];
    historyIndex: number;
}

export type CanvasAction =
    | { type: CanvasActionType.INIT_CANVAS; payload: fabric.Canvas }
    | { type: CanvasActionType.ADD_SHAPE; payload: fabric.Object }
    | { type: CanvasActionType.SAVE_DESIGN }
    | { type: CanvasActionType.LOAD_DESIGN }
    | { type: CanvasActionType.EXPORT_PNG }
    | { type: CanvasActionType.UNDO }
    | { type: CanvasActionType.REDO }
    | { type: CanvasActionType.BLURR};