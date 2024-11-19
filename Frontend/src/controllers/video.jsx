import { useState } from "react";
import Button from "./button";

function Video({ data }) {
    let { localVideoref, remoteVideoref, joinCall, socketRef, getPermissions } = data;
    let [show, setShow] = useState(false);
    let [canShare, setCanShare] = useState(false);

    setTimeout(() => {
        socketRef.current.on('show-video', () => {
            setShow(true);
        });

        socketRef.current.on('remove-video', () => {
            setShow(false);
            setCanShare(false);
            localVideoref = null;
            remoteVideoref = null;
        })
    }, 2000);

    function handleButton() {
        setCanShare(true);
        joinCall();
    }

    return (
        <>
            {show ? <div className='videos'>
                <video ref={localVideoref} autoPlay playsInline></video>
                <video ref={remoteVideoref} autoPlay playsInline></video>
                {canShare ? <Button fun={getPermissions} video={true} /> : <></>}
                <Button fun={handleButton} />
            </div> : <></>}
        </>
    );
}

export default Video;