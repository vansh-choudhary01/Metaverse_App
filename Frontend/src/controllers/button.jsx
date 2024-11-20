import React, { useState } from "react";

function Button({ fun, style }) {
    const [callJoin, setCallJoin] = useState(false);

    function handleButton() {
        fun(callJoin ? 0 : 1);
        setCallJoin((prev) => !prev);
    }

    return (
        <button style={{backgroundColor : callJoin ? style.color[0] : style.color[1]}} onClick={handleButton}>
            {callJoin ? style.text[0] : style.text[1]}
        </button>
    );
}

export default Button;
