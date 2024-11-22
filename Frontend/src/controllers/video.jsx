import { useState } from "react";
import Button from "./button";
import "../styles/metaverse.css"
import { useNavigate } from "react-router-dom";

function Video({ data }) {
    let { localVideoref, remoteVideoref, joinCall, socketRef, getPermissions } = data;
    let [show, setShow] = useState(false);
    let [canShare, setCanShare] = useState(false);
    let [mapView, setMapView] = useState(false);
    let [text, setText] = useState('')
    let [room, setRoom] = useState('');
    const router = useNavigate();

    setTimeout(() => {
        try {
            socketRef.current.on('show-video', (room) => {
                setShow(true);
                setRoom(room);
            });
            
            socketRef.current.on('remove-video', () => {
                setShow(false);
                setCanShare(false);
                setMapView(false);
                setText('');
                localVideoref = null;
                remoteVideoref = null;
            })
        } catch {
            router('/game');
        }
    }, 100);
    
    function handleButton() {
        setCanShare(true);
        setText(room);
        joinCall();
    }

    function changeStyle() {
        setMapView(!mapView);
    }

    return (
        <>
            {show ?
                <>
                    {canShare ? <div className="navbar">
                        <span>{text}</span>
                        <Button fun={changeStyle} style={{ color: ['#313133', '#313133'], text: ['Map view', 'Meeting view'] }} />
                    </div> : <></>}

                    <div className={mapView ? 'map' : 'videos'}>
                        <video ref={localVideoref} autoPlay playsInline></video>
                        <video ref={remoteVideoref} autoPlay playsInline></video>
                        {canShare ? <Button fun={getPermissions} style={{ color: ['gray', 'gray'], text: ["Share Camera", "Share Screen"] }} /> : <></>}
                        <Button fun={handleButton} style={{ color: ['red', 'green'], text: ["End Call", "Join Table"] }} />
                    </div>
                </> : <></>}
        </>
    );
}

export default Video;