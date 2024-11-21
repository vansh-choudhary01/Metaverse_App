import { useRef, useState } from "react";
import "../styles/gameEventVideo.css"

function GameEventVideo({ data }) {
    let {socketRef} = data;
    let [show, setShow] = useState(false);
    
    let localVideo = useRef();
    let remoteVideo = useRef();

    setTimeout(() => {
        socketRef.current.on('video-event-on', () => {
            setShow(true);
        });

        socketRef.current.on('video-event-off', () => {
            setShow(true);
        });
    }, 2000);

    return (
        <>
            {show ?
                <div className='event-videos'>
                    <video ref={localVideo} autoPlay playsInline></video>
                    <video ref={remoteVideo} autoPlay playsInline></video>
                </div>
                : <></>}
        </>
    );
}

export default GameEventVideo;