import React, { useState } from "react";

function Button({ joinCall }) {
    const [callJoin, setCallJoin] = useState(false);

    function handleButton() {
        if(joinCall()) {
            setCallJoin((prev) => !prev);
        }
    }

    return (
        <button style={{backgroundColor : callJoin ? "red" : "green"}} onClick={handleButton}>
            {callJoin ? "END CALL" : "JOIN"}
        </button>
    );
}

export default Button;
