export const Table = ({ id, data }: any) => {
    return (
        <div className="table" id={id}>
            <div style={{
                backgroundColor: data.nameBg || "red",
                borderRadius: "1.5px 1.5px 0 0",
                display: "flex", justifyContent: "space-between",
                borderBottom: "1px solid #ababab"
            }}>
                <span>&nbsp; :::</span>
                <span>{data.name}</span>
                <span></span>
            </div>
        </div>
    );
};
