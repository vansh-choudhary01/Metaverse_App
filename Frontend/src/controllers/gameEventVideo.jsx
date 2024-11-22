import { useState } from "react";
import "../styles/gameEventVideo.css"
import { useNavigate } from "react-router-dom";

function GameEventVideo({ data }) {
    let { socketRef, localVideoref2, remoteVideoref2 } = data;
    let [show, setShow] = useState(false);
    const router = useNavigate();

    setTimeout(() => {
        try {
            socketRef.current.on('video-event-on', () => {
                setShow(true);
            });

            socketRef.current.on('video-event-off', () => {
                setShow(false);
                localVideoref2 = null;
                remoteVideoref2 = null;
            });
        } catch {
            router('/game');
        }
    }, 100);

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