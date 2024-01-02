import { currentModal$, localStorageCopy$ } from "../../state/globalState"
import { deleteDiagram } from "../../state/storage"

export const DeleteConfirm = () => {
    return (
        <div>
            <header>
                <h5>Delete {localStorageCopy$.value.files[localStorageCopy$.value.active!].name}</h5>
            </header>
            <section>
                <p>Are you sure you want to do that?</p>
            </section>
            <footer style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={() => currentModal$.value = null} className="normal-btn">Cancel</button>
                <button onClick={async () => {
                    await deleteDiagram(localStorageCopy$.value.active!)
                }} className="normal-btn" style={{ marginLeft: "0.5rem" }}>Delete diagram</button>
            </footer>
        </div>
    )
}