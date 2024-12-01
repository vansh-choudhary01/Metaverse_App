import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import withAuth from "../utils/withAuth.jsx"
import io from "socket.io-client";
import server_url from "../environment.js"
import { createNewPlayer, playerMove, userDisconnected } from '../modules.js';
import Video from '../controllers/video.jsx';
import GameEventVideo from '../controllers/gameEventVideo.jsx';
import { useNavigate } from 'react-router-dom';

const phaserPlayers = {}; // To store Phaser player objects
const otherPlayers = new Map(); // Track other players (sprite and text)

const Metaverse = () => {
	const router = useNavigate();
	const gameContainerRef = useRef(null);
	const socketRef = useRef(null);
	const socketIdRef = useRef(null);
	const gameRef = useRef(null); // Reference for Phaser game instance
	const localVideoref = useRef(null);
	const peerConnection = useRef(null);
	const remoteVideoref = useRef(null);
	const localVideoref2 = useRef(null);
	const remoteVideoref2 = useRef(null);
	const config = {
		iceServers: [{ urls: 'stun:stun.l.google.com:19302 ' }]
	};
	const videoConfig = {
		maxBitrate: 800000, // 800 Kbps
		frameRate: 24,
		resolution: { width: 640, height: 480 }
	};
	let tableAccess = useRef(null);
	let player;



	// args (0 || 1) , 0 = camera video share, 1 = screen video share
	async function getPermissions(args) {
		try {
			const userMediaStream = (args && args === 1) ? await navigator.mediaDevices.getDisplayMedia({ video: videoConfig, audio: true }) : await navigator.mediaDevices.getUserMedia({ video: videoConfig, audio: true });
			if (userMediaStream) {
				window.localStream = userMediaStream;
				if (localVideoref.current) {
					localVideoref.current.srcObject = userMediaStream;
				}
				if (localVideoref2.current) {
					localVideoref2.current.srcObject = userMediaStream;
				}
			}
			if (args && args !== 0 && args !== 1) {
				socketRef.current.emit('join-call', args);
			} else if(tableAccess.current) {
				socketRef.current.emit('join-call', tableAccess.current);
			}
		} catch (e) {
			console.error("Error accessing user media:", e);
			if(e == "NotAllowedError: Permission denied") {
				if(!localVideoref.current) {
					router('/');
				}
			}
		}
	}

	getPermissions();

	async function gotMessageFromServer(fromId, message) {
		const signal = JSON.parse(message);

		if (fromId !== socketIdRef.current) {
			if (signal.sdp) {
				peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(async () => {
					if (signal.sdp.type === 'offer') {
						console.log('offer receved from : ', fromId);
						const answer = await peerConnection.current.createAnswer();
						await peerConnection.current.setLocalDescription(answer);
						socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': peerConnection.current.localDescription }));
					}
				}).catch((e) => {
					console.error("Error handling SDP:", e);
				});
			}

			if (signal.ice) {
				peerConnection.current.addIceCandidate(new RTCIceCandidate(signal.ice)).catch((e) => {
					console.error("Error adding ICE candidate:", e);
				})
			}
		}
	}

	const connectToSocket = (scene) => {
		try {
			socketRef.current = io.connect(server_url, { secure: true, query: { name: localStorage.getItem("name") } });
		} catch (e) {
			console.log(e);
		}

		socketRef.current.on('connect', () => {
			socketIdRef.current = socketRef.current.id;
			console.log(`Connected with socket ID: ${socketIdRef.current}`);

			// Listen for new player connections
			socketRef.current.on('user-connected', (AllSockets) => {
				console.log("All connected sockets : ", AllSockets);
				try {
					for (const socketId in AllSockets) {
						let user = AllSockets[socketId];
						if (user.socketId !== socketIdRef.current && !phaserPlayers[user.socketId]) {
							let newPlayer = createNewPlayer(scene, user);
							newPlayer.socketId = user.socketId;
							setupPlayerInteractions(scene, player, newPlayer);
						}
					}
				} catch (e) { console.log(e); };
			});

			// Listen for player movement updates
			socketRef.current.on('player-move', playerMove);

			socketRef.current.on('signal', gotMessageFromServer)

			socketRef.current.on('user-joined', async (id) => {
				peerConnection.current = new RTCPeerConnection(config);

				peerConnection.current.onicecandidate = function (event) {
					if (event.candidate != null) {
						socketRef.current.emit('signal', id, JSON.stringify({ "ice": event.candidate }));
					}
				}

				peerConnection.current.ontrack = (event) => {
					if (remoteVideoref.current) {
						remoteVideoref.current.srcObject = event.streams[0];
					}
					if (remoteVideoref2.current) {
						remoteVideoref2.current.srcObject = event.streams[0];
					}
				}

				try {
					if (window.localStream) {
						window.localStream.getTracks().forEach((track) => {
							peerConnection.current.addTrack(track, window.localStream);
						});
					}
				} catch (e) { console.error("Failed to add local stream to peer connection:", e); }

				if (id !== socketIdRef.current) {
					if (peerConnection.current.signalingState === 'stable') {
						peerConnection.current.createOffer()
							.then(async (description) => {
								await peerConnection.current.setLocalDescription(description);
								socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': peerConnection.current.localDescription }));
								console.log("Offer created and set successfully.");
							})
							.catch((error) => {
								console.error("Error creating and setting offer:", error);
							});
					} else {
						console.warn("Skipping offer creation. Current signaling state:", peerConnection.current.signalingState);
					}
				}
			})


			// Listen for player disconnections
			socketRef.current.on('user-disconnected', userDisconnected);
		});
	};

	let callBackIntervalId;
	let roomId = useRef();
	let [callStatus, setCallStatus] = useState(false);
	function setupPlayerInteractions(scene, player, newPlayer) {
		async function handlePlayerInteraction(playerA, playerB) {
			// stop default movement
			playerB.setVelocity(0);
			playerB.anims.stop();
			socketRef.current.emit('player-move', { socketId: socketIdRef.current, x: player.x, y: player.y });

			/*(Automatic movement) When two physics bodies collide in Phaser, they naturally exert forces on each other. This can cause:
			
			Continued movement after initial collision
			Unintended sliding or pushing
			Automatic direction changes*/

			console.log('Players have collided!');

			if (callBackIntervalId) {
				clearTimeout(callBackIntervalId);
			} else if (!localVideoref.current || !localVideoref.current.srcObject) {
				setCallStatus((prev) => {
					if (!prev) {
						socketRef.current.emit('video-event-on');
						
						console.log("Room id changed");
						setTimeout(() => {
							let room = socketIdRef.current < playerB.socketId ? socketIdRef.current + playerB.socketId : playerB.socketId + socketIdRef.current;
							localVideoref.current = undefined;
							remoteVideoref.current = undefined;
							joinCall(room);
							roomId.current = room;
						}, 1000);
					}
					return true;
				});
			}

			callBackIntervalId = setTimeout(async () => {
				socketRef.current.emit('video-event-off', roomId.current);
				setCallStatus(false);
				callBackIntervalId = undefined;
				roomId.current = undefined;
			}, 2000);
		}

		scene.physics.add.collider(player, newPlayer, handlePlayerInteraction, null, scene);
	}

	useEffect(() => {
		// Phaser game configuration
		const config = {
			type: Phaser.AUTO,
			width: window.innerWidth,
			height: window.innerHeight,
			physics: {
				default: 'arcade',
				arcade: {
					gravity: { y: 0 }, // No vertical gravity
					debug: false,
				},
			},
			scene: {
				preload,
				create,
				update,
			},
			parent: gameContainerRef.current,
		};

		gameRef.current = new Phaser.Game(config);
		let platforms, tables, cursors, usernameText, tableId = 0;

		// Preload ..assets
		function preload() {
			this.load.image('sky', './assets/metaverse.jpg');
			this.load.image('table', './assets/grayline.png');
			this.load.image('border', './assets/grayline.png');
			this.load.spritesheet('dude', './assets/character.png', {
				frameWidth: 400,
				frameHeight: 599,
			});
		}

		// Create the game scene
		function create() {
			// Add background image
			this.add.image(650, 300, 'sky');

			platforms = this.physics.add.staticGroup(); // Static group for non-moving objects

			// Furniture and decorative elements
			platforms.create(350, 220, 'border').setScale(0.2, 0.08).refreshBody();
			platforms.create(450, 150, 'border').setScale(0.05, 0.1).refreshBody();
			platforms.create(450, 280, 'border').setScale(0.05, 0.18).refreshBody();
			platforms.create(200, 300, 'border').setScale(2, 0.08).refreshBody();
			platforms.create(340, 420, 'border').setScale(0.15, 0.08).refreshBody();
			platforms.create(450, 400, 'border').setScale(0.2, 0.08).refreshBody();
			platforms.create(410, 400, 'border').setScale(0, 0.7).refreshBody();
			platforms.create(390, 500, 'border').setScale(0.15, 0).refreshBody();
			platforms.create(280, 540, 'border').setScale(0.2, 0.2).refreshBody();
			platforms.create(850, 600, 'border').setScale(1.7, 0.7).refreshBody();
			platforms.create(1000, 300, 'border').setScale(0.2, 0.15).refreshBody();
			platforms.create(1000, 430, 'border').setScale(0.2, 0.18).refreshBody();

			// Create initial table and calculate its width
			const firstTable = platforms.create(0, 0, 'table').setScale(0.22, 0.1).refreshBody();
			const tableWidth = firstTable.displayWidth;
			tables = this.physics.add.staticGroup();

			// Generate rows of tables for seating areas
			buildTables(544, 270, 10, tableWidth, 3);
			buildTables(765, 270, 10, tableWidth, 3);
			buildTables(544, 420, 10, tableWidth, 3);
			buildTables(765, 420, 10, tableWidth, 3);

			// Create border boundaries around the screen edges
			platforms.create(0, 0, 'border').setScale(10, 1).refreshBody(); // Top border
			platforms.create(0, 600, 'border').setScale(10, 0.1).refreshBody(); // Bottom border
			platforms.create(0, 0, 'border').setScale(2, 10).refreshBody(); // Left border
			platforms.create(1280, 0, 'border').setScale(1.7, 10).refreshBody(); // Right border

			// Create player character sprite
			player = this.physics.add.sprite(500, 0, 'dude').setScale(0.1);
			player.setCollideWorldBounds(true); // Keep player within game bounds

			// Add username text above the player
			usernameText = this.add.text(
				player.x,
				player.y - 25,
				"You",
				{ font: "16px Arial", fill: "#2BDB14" }
			).setOrigin(0.5);

			// Define animations for character movement
			this.anims.create({
				key: 'down',
				frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
				frameRate: 10,
				repeat: -1
			});

			this.anims.create({
				key: 'up',
				frames: this.anims.generateFrameNumbers('dude', { start: 4, end: 7 }),
				frameRate: 10,
				repeat: -1
			});

			this.anims.create({
				key: 'left',
				frames: this.anims.generateFrameNumbers('dude', { start: 8, end: 11 }),
				frameRate: 10,
				repeat: -1
			});

			this.anims.create({
				key: 'right',
				frames: this.anims.generateFrameNumbers('dude', { start: 12, end: 15 }),
				frameRate: 10,
				repeat: -1
			});

			cursors = this.input.keyboard.createCursorKeys(); // Set up keyboard controls

			// Enable collision for player with platforms and tables
			this.physics.add.collider(player, platforms);

			// Enable collision for player with tables, but add a process callback
			this.physics.add.collider(player, tables, null, (player, table) => {
				handleTableCollision(player, table);

				return true;
			}, this);

			let intervalId;
			// Function to handle logic when player interacts with a table
			function handleTableCollision(player, table) {
				tableAccess.current = table.id;

				if (intervalId) {
					clearInterval(intervalId);
				} else {
					socketRef.current.emit('show-video', tableAccess.current);
				}
				intervalId = setTimeout(() => {
					if (!localVideoref.current || (localVideoref.current.srcObject === null || localVideoref.current.srcObject === undefined)) {
						socketRef.current.emit("remove-video", joinedTable);
					}
					intervalId = undefined;
				}, 4000);
			}

			// Connect to Socket.IO and pass the current scene
			connectToSocket(this);

			// Emit initial player position to server
			socketRef.current.emit('player-move', { socketId: socketIdRef.current, x: player.x, y: player.y });
		}

		let valueUpdate = true;
		// Update function for handling game logic per frame
		function update() {
			try {
				// Check which arrow key is pressed and move player accordingly
				if (cursors.left.isDown) {
					valueUpdate = true;
					player.setVelocityX(-160);
					player.anims.play('left', true);
				} else if (cursors.right.isDown) {
					valueUpdate = true;
					player.setVelocityX(160);
					player.anims.play('right', true);
				} else if (cursors.up.isDown) {
					valueUpdate = true;
					player.setVelocityY(-160);
					player.anims.play('up', true);
				} else if (cursors.down.isDown) {
					valueUpdate = true;
					player.setVelocityY(160);
					player.anims.play('down', true);
				} else {
					// Stop player movement if no key is pressed
					player.setVelocity(0);
					player.anims.stop();
					if(valueUpdate) {
						socketRef.current.emit('player-move', { socketId: socketIdRef.current, x: player.x, y: player.y });
						socketRef.current.emit('player-move', { socketId: socketIdRef.current, x: player.x, y: player.y });
					}
					valueUpdate = false;
				}

				// Update "You" text position
				usernameText.setPosition(player.x, player.y - 25);

				// Update other players' text positions
				otherPlayers.forEach(({ sprite, text }) => {
					text.setPosition(sprite.x, sprite.y - 25);
				});

				if (valueUpdate) {
					// Emit player movement to server
					socketRef.current.emit('player-move', { socketId: socketIdRef.current, x: player.x, y: player.y });
				}

			} catch (e) {
				console.log(e);
			}
		}


		// Resize game on window resize
		window.addEventListener('resize', () => {
			if (gameRef.current && gameRef.current.scale) {
				gameRef.current.scale.setSnap(window.innerWidth, window.innerHeight);
				gameRef.current.scale.resize(window.innerWidth, window.innerHeight);
			}
		});

		// Helper function to create a row of tables
		function buildTables(x, y, distance, tableWidth, n) {
			for (let i = 0; i < n; i++) {
				let table = tables.create(x + (i * (tableWidth + distance)), y, 'table').setScale(0.22, 0.1).refreshBody();
				table.id = "Table " + ++tableId;
			}
		}

		// Cleanup on component unmount
		return () => {
			try {
				if (socketRef.current) {
					console.log("Disconnecting and removing token...");
					// Remove token if it matches 'tester'
					if (localStorage.getItem("token") === "tester") {
						localStorage.removeItem("token");
						console.log("Token removed");
					}
					socketRef.current.disconnect();
				}
				if (gameRef.current) {
					gameRef.current.destroy(true);
				}
			} catch (e) {
				console.log(e);
			}
		};
	}, []);

	let joinedTable;
	async function joinCall(room) {
		console.log(roomId.current);
		console.log(localVideoref.current);
		try {
			if (localVideoref.current && localVideoref.current != null && localVideoref.current.srcObject !== null && localVideoref.current.srcObject !== undefined) {
				socketRef.current.emit("remove-video", joinedTable);
			} else {
				if(!room && roomId.current) {
					socketRef.current.emit('video-event-off', (roomId.current));
					setCallStatus(false);
				}
				joinedTable = tableAccess.current;
				console.log("Joined table no. : ", tableAccess.current);
				await getPermissions(room);
				return true;
			}
			return false;
		} catch (e) {
			console.log(e);
		}
	}

	return <>
		<GameEventVideo data={{ socketRef, localVideoref2, remoteVideoref2 }} />
		<Video data={{ joinCall, localVideoref, remoteVideoref, socketRef, getPermissions }} />
		<div className='game' style={{ position: 'fixed' }} ref={gameContainerRef} />
	</>
};

export { phaserPlayers, otherPlayers };
export default withAuth(Metaverse);