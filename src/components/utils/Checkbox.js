import React from 'react';

const Checkbox = ({link, text, onChange, left, right}) => (
    <div>
        {right ? text : ""}
        <input
            type="checkbox"
            onChange={onChange || function (e) {
                console.log(link, e.currentTarget.checked);
            }}
            checked={console.log(link)}/> {left ? text : ""}
    </div>
);

export default Checkbox;