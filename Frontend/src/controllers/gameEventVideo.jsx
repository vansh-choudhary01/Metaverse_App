import { useRef, useState } from "react";
import "../styles/gameEventVideo.css"

function GameEventVideo({ data }) {
    let { socketRef, localVideoref2, remoteVideoref2 } = data;
    let [show, setShow] = useState(false);
    
    setTimeout(() => {
        socketRef.current.on('video-event-on', () => {
            setShow(true);
        });

        socketRef.current.on('video-event-off', () => {
            setShow(false);
            localVideoref2 = null;
            remoteVideoref2 = null;
        });
    }, 2000);

    return (
        <>
            {show ?
                <div className='event-videos'>
                    <video ref={localVideoref2} autoPlay playsInline></video>
                    <video ref={remoteVideoref2} autoPlay playsInline></video>
                </div>
                : <></>}
        </>
    );
}

export default GameEventVideo;