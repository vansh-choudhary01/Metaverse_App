import { useState } from "react";
import Button from "./button";
import "../styles/metaverse.css"

function Video({ data }) {
    let { localVideoref, remoteVideoref, joinCall, socketRef, getPermissions } = data;
    let [show, setShow] = useState(false);
    let [canShare, setCanShare] = useState(false);
    let [text, setText] = useState('');
    let [mapView, setMapView] = useState(false);

    setTimeout(() => {
        socketRef.current.on('show-video', (room) => {
            setShow(true);
            setText(room);
        });

        socketRef.current.on('remove-video', () => {
            setShow(false);
            setCanShare(false);
            setMapView(false);
            localVideoref = null;
            remoteVideoref = null;
        })
    }, 2000);

    function handleButton() {
        setCanShare(true);
        joinCall();
    }

    function changeStyle() {
        setMapView(!mapView);
    }

    return (
        <>
            {show ?
                <>
                    <div className="navbar">
                        <span>Vansh Choudhary's Table</span>
                        <Button fun={changeStyle} style={{color : ['#313133', '#313133'], text : ['Meeting view', 'Map view']}}/>
                    </div>
                    <div className={mapView ? 'map': 'videos'}>
                        <video ref={localVideoref} autoPlay playsInline></video>
                        <video ref={remoteVideoref} autoPlay playsInline></video>
                        {canShare ? <Button fun={getPermissions} style={{color : ['gray', 'gray'], text : ["Share Camera", "Share Screen"]}}/> : <></>}
                        <Button fun={handleButton} style={{color : ['red', 'green'], text : ["End Call", "Join Table"]}}/>
                    </div>
                </> : <></>}
        </>
    );
}

export default Video;