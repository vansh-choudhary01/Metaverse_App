import React, { useState } from "react";

function Button({ fun, video }) {
    const [callJoin, setCallJoin] = useState(false);

    function handleButton() {
        fun(callJoin ? 0 : 1);
        setCallJoin((prev) => !prev);
    }

    return (
        <button style={{backgroundColor : callJoin ? "red" : "green"}} onClick={handleButton}>
            {video ? (callJoin ? "SHARE CAMERA" : "SHARE SCREEN") : (callJoin ? "END CALL" : "JOIN")}
        </button>
    );
}

export default Button;
