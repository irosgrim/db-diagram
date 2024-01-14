import { currentModal$, edgeOptions$ } from "../../state/globalState"
import { DeleteConfirm } from "../Dialogs/DeleteConfirm"
import { ExportDialog } from "../Dialogs/ExportDialog"
import { AddConstraint } from "../EditTableOptions/AddConstraint"
import { AddIndexes } from "../EditTableOptions/AddIndexes"
import { AddReferentialActions } from "../EditTableOptions/AddReferentialActions"
import { EdgeOptions } from "../EditTableOptions/EdgeOption"
import { Modal } from "./Modal"

export const ModalWrapper = () => {
    return (
        <>
            {
                currentModal$.value && <Modal onClose={() => currentModal$.value = null}>
                    <>
                        {currentModal$.value.type === "add-constraint" && <AddConstraint onClose={() => currentModal$.value = null} />}
                        {currentModal$.value.type === "add-index" && (
                            <>
                                <h3>Add index</h3>
                                <AddIndexes onClose={() => currentModal$.value = null} />
                            </>
                        )}
                        {currentModal$.value.type === "add-referential-actions" && (
                            <AddReferentialActions onClose={() => currentModal$.value = null} />
                        )}
                        {
                            currentModal$.value.type === "delete-confirm" && (
                                <DeleteConfirm />
                            )
                        }
                        {
                            currentModal$.value.type === "export-diagram" && (
                                <ExportDialog onClose={() => currentModal$.value = null} />
                            )
                        }
                    </>
                </Modal>
            }
            {
                edgeOptions$.value &&
                <Modal onClose={() => edgeOptions$.value = null}>
                    <EdgeOptions />

                </Modal>
            }

        </>
    )
}