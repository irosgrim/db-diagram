import { currentModal$, indexes$ } from "../state/globalState";
import { ColumnsSelector } from "./ColumnsSelector"

type AddIndexesProps = {
    onClose: () => void;
}

export const AddIndexes = ({ onClose }: AddIndexesProps) => {
    const currentModal = currentModal$.value;

    if (!currentModal) {
        return <></>
    }
    const tableId = currentModal.props.id;

    const onSave = (selectedColumns: string[], isUnique: boolean = false) => {
        if (selectedColumns.length === 0) {
            return;
        }
        const currentIndexes = indexes$.value[tableId] || [];

        const indexPos = currentIndexes.findIndex(idx => idx.cols.join(",") === selectedColumns.join(","));
        const newIndex = { cols: selectedColumns, unique: isUnique };
        console.log(newIndex)
        if (currentIndexes.length === 0 || indexPos === -1) {
            currentIndexes.push(newIndex);
        }
        indexes$.value = { ...indexes$.value, [tableId]: currentIndexes };
        onClose()
    }

    return (
        <div>
            <ColumnsSelector table={currentModal.props} onSave={onSave} onClose={onClose} showUniqueCheck />
        </div>
    )
}