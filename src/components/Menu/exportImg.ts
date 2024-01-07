import { getNodesBounds, getViewportForBounds } from "reactflow";
import { localStorageCopy$, state } from "../../state/globalState";
import { toPng } from "html-to-image";

const BG_COLOR = "#f2f2f2";
const IMG_WIDTH = 1512;
const IMG_HEIGHT = 982;

const downloadImage = (dataUrl: string) => {
    const a = document.createElement('a');

    a.setAttribute('download', localStorageCopy$.value.files[localStorageCopy$.value.active!].name);
    a.setAttribute('href', dataUrl);
    a.click();
}

export const saveImage = () => {
    const nodesBounds = getNodesBounds(state.nodes$);
    const {x, y, zoom} = getViewportForBounds(nodesBounds, IMG_WIDTH, IMG_HEIGHT, 0.5, 3);
    const reactFlowViewportElement = document.querySelector('.react-flow__viewport') as HTMLElement;

    toPng(reactFlowViewportElement, {
        backgroundColor: BG_COLOR,
        width: IMG_WIDTH,
        height: IMG_HEIGHT,
        style: {
            width: IMG_WIDTH + "px",
            height: IMG_HEIGHT + "px",
            transform: `translate(${x}px, ${y}px) scale(${zoom})`,
        },
    }).then(downloadImage);
};
