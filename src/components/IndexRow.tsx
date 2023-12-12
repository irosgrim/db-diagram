import { useCallback } from 'react';

type IndexRowProps = {
    data: {
        name: string;
        type: string;
        primaryKey: boolean;
        nullable: boolean;
        index: boolean;
    },
}

export const IndexRow = ({ data }: IndexRowProps) => {
    const onClick = useCallback(() => {
        console.log(data);
    }, []);

    return (
        <div className="column-container nodrag" onClick={onClick}>
            INDEX: {data.name}
        </div>
    );
}
