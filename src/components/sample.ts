export const sampleNodes = [
    {
        "id": "table_1",
        "data": {
            "name": "users",
            "backgroundColor": "#f78ae0",
            "height": null
        },
        "position": {
            "x": -86.34255129348796,
            "y": -139.87511150758252
        },
        "className": "light",
        "style": {
            "backgroundColor": "#ffffff",
            "minWidth": "200px",
            "padding": 0,
            "width": 200,
            "height": 140
        },
        "resizing": true,
        "type": "group",
        "width": 200,
        "height": 140,
        "selected": false,
        "positionAbsolute": {
            "x": -86.34255129348796,
            "y": -139.87511150758252
        },
        "dragging": false
    },
    {
        "id": "table_1/col_1",
        "type": "column",
        "position": {
            "x": 0,
            "y": 20
        },
        "data": {
            "name": "id",
            "type": "SERIAL",
            "constraint": "primary_key",
            "notNull": true,
            "index": false
        },
        "parentNode": "table_1",
        "extent": "parent",
        "draggable": false,
        "expandParent": true,
        "width": 200,
        "height": 20
    },
    {
        "id": "table_1/col_21346f50-9d06-460e-982e-c7a97c882f43",
        "type": "column",
        "position": {
            "x": 0,
            "y": 40
        },
        "data": {
            "name": "username",
            "type": "VARCHAR(16)",
            "constraint": "unique",
            "notNull": true
        },
        "parentNode": "table_1",
        "extent": "parent",
        "draggable": false,
        "expandParent": true,
        "width": 200,
        "height": 20
    },
    {
        "id": "table_1/col_8b2c342c-2c8f-4432-8cd4-b72291704be1",
        "type": "column",
        "position": {
            "x": 0,
            "y": 60
        },
        "data": {
            "name": "name",
            "type": "VARCHAR(30)",
            "constraint": "none",
            "notNull": true
        },
        "parentNode": "table_1",
        "extent": "parent",
        "draggable": false,
        "expandParent": true,
        "width": 200,
        "height": 20,
        "selected": false
    },
    {
        "id": "table_1/col_7745629c-6e56-4c81-9caf-3456b6202e56",
        "type": "column",
        "position": {
            "x": 0,
            "y": 80
        },
        "data": {
            "name": "email",
            "type": "VARCHAR(50)",
            "constraint": "unique",
            "notNull": true
        },
        "parentNode": "table_1",
        "extent": "parent",
        "draggable": false,
        "expandParent": true,
        "width": 200,
        "height": 20
    },
    {
        "id": "table_1/col_261ff237-ef46-4361-919e-288b3714923c",
        "type": "column",
        "position": {
            "x": 0,
            "y": 100
        },
        "data": {
            "name": "password",
            "type": "VARCHAR",
            "constraint": "none",
            "notNull": true
        },
        "parentNode": "table_1",
        "extent": "parent",
        "draggable": false,
        "expandParent": true,
        "width": 200,
        "height": 20
    },
    {
        "id": "table_1/col_addff3ee-8646-49e0-857e-6bf109a9db5a",
        "type": "column",
        "position": {
            "x": 0,
            "y": 120
        },
        "data": {
            "name": "date_created",
            "type": "VARCHAR",
            "constraint": "none",
            "notNull": true
        },
        "parentNode": "table_1",
        "extent": "parent",
        "draggable": false,
        "expandParent": true,
        "width": 200,
        "height": 20
    },
    {
        "id": "table_2",
        "data": {
            "name": "articles",
            "backgroundColor": "#aadfaf",
            "height": null
        },
        "position": {
            "x": 260.07225691347014,
            "y": -139.57983942908118
        },
        "className": "light",
        "style": {
            "backgroundColor": "#ffffff",
            "width": "200px",
            "padding": 0,
            "height": 180
        },
        "resizing": true,
        "type": "group",
        "width": 200,
        "height": 220,
        "selected": false,
        "positionAbsolute": {
            "x": 260.07225691347014,
            "y": -139.57983942908118
        },
        "dragging": false
    },
    {
        "id": "table_2/col_1",
        "type": "column",
        "position": {
            "x": 0,
            "y": 20
        },
        "data": {
            "name": "id",
            "type": "SERIAL",
            "constraint": "primary_key",
            "notNull": true,
            "index": false
        },
        "parentNode": "table_2",
        "extent": "parent",
        "draggable": false,
        "expandParent": true,
        "width": 200,
        "height": 20
    },
    {
        "id": "table_2/col_5020c99c-e79d-40d0-a7ea-2e8c5641bb37",
        "type": "column",
        "position": {
            "x": 0,
            "y": 40
        },
        "data": {
            "name": "user_id",
            "type": "VARCHAR",
            "constraint": "none",
            "notNull": true
        },
        "parentNode": "table_2",
        "extent": "parent",
        "draggable": false,
        "expandParent": true,
        "width": 200,
        "height": 20
    },
    {
        "id": "table_2/col_b23d5a03-1d10-4846-8009-f5da92a2a5ef",
        "type": "column",
        "position": {
            "x": 0,
            "y": 60
        },
        "data": {
            "name": "title",
            "type": "VARCHAR",
            "constraint": "none",
            "notNull": true
        },
        "parentNode": "table_2",
        "extent": "parent",
        "draggable": false,
        "expandParent": true,
        "width": 200,
        "height": 20
    },
    {
        "id": "table_2/col_11dfa647-7b34-43b5-9f51-8f80d3f1e394",
        "type": "column",
        "position": {
            "x": 0,
            "y": 80
        },
        "data": {
            "name": "body",
            "type": "VARCHAR",
            "constraint": "none",
            "notNull": true
        },
        "parentNode": "table_2",
        "extent": "parent",
        "draggable": false,
        "expandParent": true,
        "width": 200,
        "height": 20
    },
    {
        "id": "table_2/col_dc8df1c7-74b8-4cc7-baf8-8654d32cb074",
        "type": "column",
        "position": {
            "x": 0,
            "y": 100
        },
        "data": {
            "name": "visible",
            "type": "BOOLEAN",
            "constraint": "none",
            "notNull": true
        },
        "parentNode": "table_2",
        "extent": "parent",
        "draggable": false,
        "expandParent": true,
        "width": 200,
        "height": 20,
        "selected": false
    },
    {
        "id": "table_2/col_9b0e1661-b78a-49f2-b492-ca7435631bbf",
        "type": "column",
        "position": {
            "x": 0,
            "y": 120
        },
        "data": {
            "name": "category_id",
            "type": "VARCHAR",
            "constraint": "none",
            "notNull": true
        },
        "parentNode": "table_2",
        "extent": "parent",
        "draggable": false,
        "expandParent": true,
        "width": 200,
        "height": 20
    },
    {
        "id": "table_2/col_af3a2abf-e25e-4de6-bfb9-7c21f9998009",
        "type": "column",
        "position": {
            "x": 0,
            "y": 140
        },
        "data": {
            "name": "date_created",
            "type": "VARCHAR",
            "constraint": "none",
            "notNull": true
        },
        "parentNode": "table_2",
        "extent": "parent",
        "draggable": false,
        "expandParent": true,
        "width": 200,
        "height": 20
    },
    {
        "id": "table_2/col_5c1d8969-5421-4e70-9453-17a4a0c1bb1d",
        "type": "column",
        "position": {
            "x": 0,
            "y": 160
        },
        "data": {
            "name": "date_updated",
            "type": "VARCHAR",
            "constraint": "none",
            "notNull": true
        },
        "parentNode": "table_2",
        "extent": "parent",
        "draggable": false,
        "expandParent": true,
        "width": 200,
        "height": 20
    },
    {
        "id": "table_3",
        "data": {
            "name": "categories",
            "backgroundColor": "#ff7605",
            "height": 120
        },
        "position": {
            "x": -83.65699834068758,
            "y": 129.93297262610207
        },
        "className": "light",
        "style": {
            "backgroundColor": "#ffffff",
            "width": "200px",
            "padding": 0,
            "height": 120
        },
        "resizing": true,
        "type": "group",
        "width": 200,
        "height": 140,
        "selected": true,
        "positionAbsolute": {
            "x": -83.65699834068758,
            "y": 129.93297262610207
        },
        "dragging": false
    },
    {
        "id": "table_3/col_1",
        "type": "column",
        "position": {
            "x": 0,
            "y": 20
        },
        "data": {
            "name": "id",
            "type": "SERIAL",
            "constraint": "primary_key",
            "notNull": true,
            "index": false
        },
        "parentNode": "table_3",
        "extent": "parent",
        "draggable": false,
        "expandParent": true,
        "width": 200,
        "height": 20
    },
    {
        "id": "table_3/col_6935a1da-1802-42cd-b15e-9d1e118df6bf",
        "type": "column",
        "position": {
            "x": 0,
            "y": 40
        },
        "data": {
            "name": "name",
            "type": "VARCHAR(100)",
            "constraint": "unique",
            "notNull": true
        },
        "parentNode": "table_3",
        "extent": "parent",
        "draggable": false,
        "expandParent": true,
        "width": 200,
        "height": 20
    },
    {
        "id": "table_3/col_12c99d46-6774-4d83-a6db-02e503ade7ab",
        "type": "column",
        "position": {
            "x": 0,
            "y": 60
        },
        "data": {
            "name": "user_id",
            "type": "INTEGER",
            "constraint": "none",
            "notNull": true
        },
        "parentNode": "table_3",
        "extent": "parent",
        "draggable": false,
        "expandParent": true,
        "width": 200,
        "height": 20
    },
    {
        "id": "table_3/col_736b0443-2167-41e5-acc5-826510b3a16e",
        "type": "column",
        "position": {
            "x": 0,
            "y": 80
        },
        "data": {
            "name": "date_created",
            "type": "VARCHAR",
            "constraint": "none",
            "notNull": true
        },
        "parentNode": "table_3",
        "extent": "parent",
        "draggable": false,
        "expandParent": true,
        "width": 200,
        "height": 20
    },
    {
        "id": "table_3/col_906d2cde-b127-47e4-b71b-e8c5834bd2f3",
        "type": "column",
        "position": {
            "x": 0,
            "y": 100
        },
        "data": {
            "name": "date_updated",
            "type": "VARCHAR",
            "constraint": "none",
            "notNull": true
        },
        "parentNode": "table_3",
        "extent": "parent",
        "draggable": false,
        "expandParent": true,
        "width": 200,
        "height": 20
    },
    
];

export const sampleEdges = [
    {
        "source": "table_2/col_5020c99c-e79d-40d0-a7ea-2e8c5641bb37",
        "sourceHandle": "left",
        "target": "table_1/col_1",
        "targetHandle": "right",
        "type": "floating",
        "markerEnd": {
            "type": "arrow"
        },
        "data": {
            "label": "relation",
            "type": "foreign-key"
        },
        "id": "reactflow__edge-table_2/col_5020c99c-e79d-40d0-a7ea-2e8c5641bb37left-table_1/col_1right"
    },
    {
        "source": "table_2/col_9b0e1661-b78a-49f2-b492-ca7435631bbf",
        "sourceHandle": "left",
        "target": "table_3/col_1",
        "targetHandle": "left",
        "type": "floating",
        "markerEnd": {
            "type": "arrow"
        },
        "data": {
            "label": "relation",
            "type": "foreign-key"
        },
        "id": "reactflow__edge-table_2/col_9b0e1661-b78a-49f2-b492-ca7435631bbfleft-table_3/col_1left"
    }
]