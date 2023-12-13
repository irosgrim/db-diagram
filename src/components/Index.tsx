import { useCallback } from 'react';

type IndexProps = {
    data: {
        columns: { id: string; name: string }[];
        unique: boolean;
    },
}

export const Index = ({ data }: IndexProps) => {
    const onClick = useCallback(() => {
        console.log(data);
    }, []);

    return (
        <div className="column-container nodrag" onClick={onClick}>
            <span className="col" style={{ fontSize: "0.75rem" }}> index: {data.columns.map(x => x.name).join(",")}</span>
        </div>
    );
}
