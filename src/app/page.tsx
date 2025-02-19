"use client"
import { useEffect, useReducer, useRef } from "react";
import { fabric } from "fabric";
import { Button } from "@/components/ui/button";

import { CanvasActionType, CanvasState, CanvasAction } from './desitnEditorTypes';

const initialState: CanvasState = { canvas: null, history: [], historyIndex: -1 };

function reducer(state: CanvasState, action: CanvasAction): CanvasState {
    switch (action.type) {
        case CanvasActionType.INIT_CANVAS:
            state.canvas = action.payload;
            state.canvas?.renderAll();
            return { ...state, history: [JSON.stringify(state.canvas?.toJSON())], historyIndex: 0 };
        case CanvasActionType.ADD_SHAPE:
            state.canvas?.add(action.payload);
            state.canvas?.renderAll();
            return {
                ...state,
                history: [...state.history.slice(0, state.historyIndex + 1), JSON.stringify(state.canvas?.toJSON())],
                historyIndex: state.historyIndex + 1
            };
        case CanvasActionType.SAVE_DESIGN:
            if (state.canvas) {
                localStorage.setItem("canvasDesign", JSON.stringify(state.canvas.toJSON()));
            }
            return state;
        case CanvasActionType.LOAD_DESIGN:
            if (state.canvas) {
                const canvasData = localStorage.getItem("canvasDesign");
                if (!canvasData) {
                    alert('No design found');
                    return state;
                }
                state.canvas.loadFromJSON(canvasData, () => {
                    state.canvas?.renderAll();
                });
            }
            return {
                ...state,
                history: [...state.history.slice(0, state.historyIndex + 1), JSON.stringify(state.canvas?.toJSON())],
                historyIndex: state.historyIndex + 1
            };
        case CanvasActionType.EXPORT_PNG:
            if (state.canvas) {
                const dataURL = state.canvas.toDataURL({ format: "png", multiplier: 1 });
                const link = document.createElement("a");
                link.href = dataURL;
                link.download = "design.png";
                link.click();
            }
            return state;
        case CanvasActionType.UNDO:
            if (state.historyIndex > 0 && state.canvas) {
                const prevState = state.history[state.historyIndex - 1];
                state.canvas.loadFromJSON(prevState, () => {
                    state.canvas?.renderAll();
                });
                return { ...state, historyIndex: state.historyIndex - 1 };
            }
            return state;
        case CanvasActionType.REDO:
            if (state.historyIndex < state.history.length - 1 && state.canvas) {
                const nextState = state.history[state.historyIndex + 1];
                state.canvas.loadFromJSON(nextState, () => {
                    state.canvas?.renderAll();
                });
                return { ...state, historyIndex: state.historyIndex + 1 };
            }
            return state;
        case CanvasActionType.BLURR:
            if (state.canvas) {
                const overlay = new fabric.Rect({
                    left: 0,
                    top: 0,
                    width: state.canvas.width || 600,
                    height: state.canvas.height || 400,
                    fill: '#00000050',
                    selectable: false,
                    globalCompositeOperation: 'source-over'
                });
                state.canvas.add(overlay);
                state.canvas?.renderAll();
            }
            return {
                ...state,
                history: [...state.history.slice(0, state.historyIndex + 1), JSON.stringify(state.canvas?.toJSON())],
                historyIndex: state.historyIndex + 1
            };
        default:
            return state;
    }
}

const DesignEditor = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        const canvas = new fabric.Canvas(canvasRef.current as HTMLCanvasElement, { backgroundColor: "#add8e6" });
        dispatch({ type: CanvasActionType.INIT_CANVAS, payload: canvas });
        return () => {
            canvas.dispose();
        };
    }, []);


    const addShape = (type: "rectangle" | "circle") => {
        let shape: fabric.Object;
        if (type === "rectangle") {
            shape = new fabric.Rect({ width: 100, height: 100, fill: "green", left: 50, top: 50 });
        } else {
            shape = new fabric.Circle({ radius: 50, fill: "red", left: 50, top: 50 });
        }
        dispatch({ type: CanvasActionType.ADD_SHAPE, payload: shape });
    };

    const saveDesign = () => {
        if (state.canvas) {
            dispatch({ type: CanvasActionType.SAVE_DESIGN });
        }
    };

    const loadDesign = () => {
        dispatch({ type: CanvasActionType.LOAD_DESIGN });
    };

    const exportDesign = () => {
        if (state.canvas) {
            dispatch({ type: CanvasActionType.EXPORT_PNG });
        }
    };

    return (
        <div className="flex flex-col items-center p-4">
            <div className="flex gap-2 mb-4">
                <Button onClick={() => addShape("rectangle")}>Add Rectangle</Button>
                <Button onClick={() => addShape("circle")}>Add Circle</Button>
                <Button onClick={saveDesign}>Save</Button>
                <Button onClick={loadDesign}>Load</Button>
                <Button onClick={exportDesign}>Download</Button>
                <Button onClick={() => dispatch({ type: CanvasActionType.UNDO })}>Undo</Button>
                <Button onClick={() => dispatch({ type: CanvasActionType.REDO })}>Redo</Button>
                <Button onClick={() => dispatch({ type: CanvasActionType.BLURR })}>Blurr</Button>
            </div>
            <canvas ref={canvasRef} width={600} height={400} className="border" />
        </div>
    );
}

export default DesignEditor;
