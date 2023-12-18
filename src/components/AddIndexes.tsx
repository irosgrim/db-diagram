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
    const tableName = currentModal.props.data.name;

    const onSave = (selectedColumns: string[]) => {
        const currentIndexes = indexes$.value[tableName] || [];
        const indexName = selectedColumns.join("_") + "_idx";

        const indexPos = currentIndexes.findIndex(idx => idx.name === indexName);
        const newIndex = { name: indexName, cols: selectedColumns.join(","), unique: true };

        const columns = selectedColumns.join(",");
        if (currentIndexes.length === 0) {
            currentIndexes.push(newIndex);
        } else {

            if (indexPos !== -1) {
                currentIndexes[indexPos] = newIndex;
            } else {
                const similarIndexPos = currentIndexes.findIndex(idx => idx.cols === columns);
                if (similarIndexPos === -1) {
                    currentIndexes.push(newIndex);
                } else {
                    currentIndexes.splice(similarIndexPos, 1, newIndex);
                }
            }
        }
        indexes$.value = { ...indexes$.value, [tableName]: currentIndexes };
        onClose()
    }

    return (
        <div>
            <ColumnsSelector table={currentModal.props} onSave={onSave} onClose={onClose} />
        </div>
    )
}