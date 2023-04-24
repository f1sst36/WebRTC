import { socket } from "./services/socket";
import { useEffect, useState } from "react";
import { WebRTCActions } from "./enums/webRTC";
import { useWebRTC } from "./hooks/useWebRTC";
import { Message } from "./types/chat";
import { VideoChat } from "./components/VideoChat/VideoChat";

function App() {
	const [iceCandidates, setIceCandidates] = useState<RTCIceCandidate[]>([]);
	const [messages, setMessages] = useState<Message[]>([]);
	const [localStream, setLocalStream] = useState<MediaStream | null>(null);
	const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);

	const [rooms, setRooms] = useState<number[]>([]);
	const {
		initPeerConnection,
		sendOffer,
		sendAnswer,
		sendMessage,
		closeConnection,
		setIceCandidate,
		addTracksToStream,
		replaceTrack,
	} = useWebRTC({
		onOpen: async (_peerConnection) => {
			console.log("WEBRTC IS OPENED");
		},
		onTrack: (e) => {
			console.log("peerConnection.ontrack", e.streams);
			setRemoteStreams((p) => [...p, ...e.streams]);
		},
		onMessage: (e) => setMessages((p) => [JSON.parse(e.data), ...p]),
		onIceCandidate: async (e) => {
			console.log("onIceCandidate", e);

			if (e.candidate) {
				setIceCandidates([...iceCandidates, e.candidate]);
				socket.emit(WebRTCActions.ICE_CANDIDATE, JSON.stringify(e.candidate));
			}
		},
	});

	useEffect(() => {
		socket.io.on("open", () => {
			console.log("socket is open");
		});

		socket.on(WebRTCActions.ALL_ROOMS, (data) => {
			setRooms(data);
		});

		socket.on(WebRTCActions.USER_WANT_TO_JOIN, async (offer) => {
			console.log("USER_WANT_TO_JOIN");
			sendAnswer(offer, (answer) => {
				socket.emit(WebRTCActions.TO_JOINED_USER, answer);
			});
		});

		socket.on(WebRTCActions.NEW_ICE_CANDIDATE, async (data: string) => {
			const candidate = JSON.parse(data);
			await setIceCandidate(candidate);
		});

		return () => {
			closeConnection();
		};
	}, []);

	const joinToRoom = async () => {
		try {
			await sendOffer((offer) => {
				return new Promise((res) => {
					socket.emit(WebRTCActions.JOIN_TO_CHANNEL, offer, socket.id);
					socket.on(WebRTCActions.ANSWER_TO_NEW_USER, async (answer) => {
						console.log("ANSWER_TO_NEW_USER");
						res(answer);
					});
				});
			});
		} catch (e) {
			console.log(e);
		}
		socket.removeAllListeners(WebRTCActions.ANSWER_TO_NEW_USER);
	};

	const sendMessageToChat = (message: string) => {
		setMessages((p) => [JSON.parse(message), ...p]);
		sendMessage(message);
	};

	const startChatting = async () => {
		const stream = await navigator.mediaDevices.getUserMedia({
			audio: true,
			video: {
				width: 1280,
				height: 720,
			},
		});

		initPeerConnection();
		addTracksToStream(stream);
		setLocalStream(stream);
	};

	const shareDisplay = async () => {
		const stream = await navigator.mediaDevices.getDisplayMedia({
			video: true,
			audio: false,
		});

		const [screenShareTrack] = stream.getVideoTracks();
		await replaceTrack(screenShareTrack);
		setLocalStream(stream);
	};

	return (
		<div>
			{localStream && (
				<VideoChat
					localStream={localStream}
					remoteStreams={remoteStreams}
					sendMessageToChat={sendMessageToChat}
					messages={messages}
					shareDisplay={shareDisplay}
				/>
			)}
			<ul>
				{rooms.map((room) => {
					return (
						<li key={room}>
							{room}
							<button onClick={() => joinToRoom()}>Join</button>
						</li>
					);
				})}
			</ul>
			<ul>
				{iceCandidates.map((candidate, index) => {
					return <li key={index}>{candidate.candidate}</li>;
				})}
			</ul>
			<button onClick={startChatting}>Start chatting</button>
		</div>
	);
}

export default App;
