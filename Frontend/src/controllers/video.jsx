import { useEffect, useState } from "react";
import Button from "./button";

function Video({ data }) {
    let { localVideoref, remoteVideoref, joinCall, callJoined, socketRef } = data;
    let [show, setShow] = useState(false);

    setTimeout(() => {
        socketRef.current.on('show-video', () => {
            setShow(true);
        });

        socketRef.current.on('remove-video', () => {
            setShow(false);
            localVideoref = null;
            remoteVideoref = null;
        })
    }, 2000);

    return (
        <>
            {show ? <div className='videos'>
                <video ref={localVideoref} autoPlay playsInline></video>
                <video ref={remoteVideoref} autoPlay playsInline></video>
                <Button joinCall={joinCall} />
            </div> : <></>}
        </>
    );
}

export default Video;