import React from 'react'
import "../App.css"
import { Link, useNavigate } from 'react-router-dom'
export default function LandingPage() {


    const router = useNavigate();

    return (
        <div className='landingPageContainer'>
            <nav>
                <div className='navHeader'>
                    <h2>Metaverse</h2>
                </div>
                <div className='navlist'>
                    <p onClick={() => {
                        localStorage.setItem("token", "tester");
                        localStorage.setItem("name", "Guest");
                        router("/game");
                    }}>Join as Guest</p>
                    <p onClick={() => {
                        router("/auth")

                    }}>Register</p>
                    <div onClick={() => {
                        router("/auth")

                    }} role='button'>
                        <p>Login</p>
                    </div>
                </div>
            </nav>


            <div className="landingMainContainer">
                <div>
                    <h1><span style={{ color: "#FF9839" }}>Connect</span> with your loved Ones</h1>

                    <p>Cover a distance by Video Call</p>
                    <div role='button'>
                        <Link to={"/game"}>Get Started</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
