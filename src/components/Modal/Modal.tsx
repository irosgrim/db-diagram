import { ReactElement, useRef } from "react"
import { useOnClickOutside } from "../../hooks/onClickOutside";
import "./style/modal.scss";

type ModalProps = {
    children: ReactElement | ReactElement[];
    onClose: () => void;
}
export const Modal = ({ children, onClose }: ModalProps) => {
    const modalRef = useRef(null);

    useOnClickOutside(modalRef, onClose);
    return (
        <div className="modal">
            <div className="modal-body" ref={modalRef}>
                {
                    children
                }
            </div>
        </div>
    )
}