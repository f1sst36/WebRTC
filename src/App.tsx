import { socket } from "./services/socket";
import { useEffect, useState } from "react";
import { TrackKind, WebRTCActions } from "./enums/webRTC";
import { useWebRTC } from "./hooks/useWebRTC";
import { Message } from "./types/chat";
import { VideoChat } from "./components/VideoChat/VideoChat";
import { StoreProvider } from "./store";

function App() {
	const [iceCandidates, setIceCandidates] = useState<RTCIceCandidate[]>([]);
	const [messages, setMessages] = useState<Message[]>([]);
	const [localStream, setLocalStream] = useState<MediaStream | null>(null);
	const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);
	const [isSharedDisplay, setIsSharedDisplay] = useState<boolean>(false);
	const [isTurnedOnWebCamera, setIsTurnedOnWebCamera] = useState<boolean>(false);
	const [joinedUsersCount, setJoinedUsersCount] = useState<number | null>(null);

	const { sendOffer, sendAnswer, sendMessage, closeConnection, setIceCandidate, addTracksToStream, replaceTrack } =
		useWebRTC({
			onOpen: async (_peerConnection) => {
				console.log("WEBRTC IS OPENED");
				// socket.emit(WebRTCActions.USER_JOINED);
			},
			onTrack: (e) => {
				console.log("onTrack");

				e.streams.forEach((stream) => {
					if (!remoteStreams.find((remoteStream) => remoteStream.id === stream.id)) {
						setRemoteStreams([...remoteStreams, stream]);
					}
				});
			},
			onMessage: (e) => setMessages((p) => [JSON.parse(e.data), ...p]),
			onIceCandidate: async (e) => {
				if (e.candidate) {
					console.log("onIceCandidate", e);

					setIceCandidates([...iceCandidates, e.candidate]);
					socket.emit(WebRTCActions.ICE_CANDIDATE, JSON.stringify(e.candidate));
				}
			},
		});

	useEffect(() => {
		socket.io.on("open", () => {
			console.log("socket is open");
		});

		// socket.on(WebRTCActions.SENDED_OFFER_TO_SERVER, () => {
		// 	setConnection()
		// })

		socket.on(WebRTCActions.USER_WANT_TO_JOIN, async (offer) => {
			console.log("USER_WANT_TO_JOIN");
			sendAnswer(offer, (answer) => {
				socket.emit(WebRTCActions.TO_JOINED_USER, answer);
			});
		});

		socket.on(WebRTCActions.NEW_ICE_CANDIDATE, async (data: string) => {
			console.log("NEW_ICE_CANDIDATE");

			const candidate = JSON.parse(data);
			await setIceCandidate(candidate);
		});

		socket.on(WebRTCActions.JOINED_USERS_COUNT, (joinedUsersCount: number) => {
			console.log('JOINED_USERS_COUNT', joinedUsersCount);

			setJoinedUsersCount(joinedUsersCount);
		});

		startChatting();

		return () => {
			closeConnection();
		};
	}, []);


	const setConnection = async () => {
		if (joinedUsersCount === null) {
			alert("Something went wrong [joinToRoom]");
			return;
		}
		try {
			await sendOffer(joinedUsersCount, (offers) => {
				return new Promise((res) => {
					socket.on(WebRTCActions.ANSWERS_TO_NEW_USER, async (answers) => {
						console.log("ANSWER_TO_NEW_USER");
						res(answers);
					});
					socket.emit(WebRTCActions.JOIN_TO_CHANNEL, offers);
				});
			});
		} catch (e) {
			console.log(e);
		}
		if (localStream) {
			addTracksToStream(localStream);
		}
		socket.removeAllListeners(WebRTCActions.ANSWERS_TO_NEW_USER);
	};

	const sendMessageToChat = (message: string) => {
		setMessages((p) => [JSON.parse(message), ...p]);
		sendMessage(message);
	};

	const startChatting = async () => {
		socket.emit(WebRTCActions.JOIN)
		const stream = await navigator.mediaDevices.getUserMedia({
			audio: true,
			video: {
				width: 1280,
				height: 720,
			},
		});

		// initPeerConnection();
		// addTracksToStream(stream);
		setLocalStream(stream);
		setIsTurnedOnWebCamera(true);
	};

	// const start = () => {
	// 	socket.emit(WebRTCActions.START)
	// }

	const turnOnWebCamera = () => {
		if (!localStream) {
			return;
		}
		const [videoTrack] = localStream.getVideoTracks();

		videoTrack.enabled = true;
		setIsTurnedOnWebCamera(true);
	};

	const turnOffWebCamera = () => {
		if (!localStream) {
			return;
		}
		const [videoTrack] = localStream.getVideoTracks();

		videoTrack.enabled = false;
		setIsTurnedOnWebCamera(false);
	};

	const shareDisplay = async () => {
		const stream = await navigator.mediaDevices.getDisplayMedia({
			video: true,
			audio: false,
		});

		const [screenShareTrack] = stream.getVideoTracks();
		await replaceTrack(screenShareTrack, TrackKind.VIDEO);
		setLocalStream(stream);
		setIsSharedDisplay(true);
	};

	const declineSharingDisplay = () => {
		if (!localStream) {
			return;
		}
		const [screenShareTrack] = localStream.getVideoTracks();

		screenShareTrack.stop();
		setIsSharedDisplay(false);
	};

	const endCall = () => {
		closeConnection();
		setLocalStream(null);
		setRemoteStreams([]);
		setMessages([]);
		setIceCandidates([]);
		setIsSharedDisplay(false);
		setIsTurnedOnWebCamera(false);
	};

	return (
		<StoreProvider
			value={{
				localStream,
				remoteStreams,
				sendMessageToChat,
				messages,
				shareDisplay,
				declineSharingDisplay,
				isSharedDisplay,
				isTurnedOnWebCamera,
				turnOnWebCamera,
				turnOffWebCamera,
				endCall,
			}}
		>
			<div>
				{localStream && <VideoChat />}
				{/* <button onClick={startChatting}>Start chatting</button> */}
				{/* <button onClick={start}>Start</button> */}
				<button onClick={setConnection}>Set connection</button>
				<ul>
					{iceCandidates.map((candidate, index) => {
						return <li key={index}>{candidate.candidate}</li>;
					})}
				</ul>
			</div>
		</StoreProvider>
	);
}

export default App;
