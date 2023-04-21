import {socket} from './services/socket'
import {useEffect, useRef, useState} from "react";
import {WebRTCActions} from "./enums/webRTC";
import {useWebRTC} from "./hooks/useWebRTC";
import {Chat} from "./components/Chat/Chat";
import {Message} from "./types/chat";
import {VideoScreen} from "./components/VideoScreen/VideoScreen";

function App() {
    const [iceCandidates, setIceCandidates] = useState<RTCIceCandidate[]>([])
    const [messages, setMessages] = useState<Message[]>([])
    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([])

    const [rooms, setRooms] = useState<number[]>([])
    const {
        setOfferToLocalDescription,
        setAnswerToLocalDescription,
        setRemoteDescription,
        sendMessage,
        closeConnection,
        setIceCandidate
    } = useWebRTC({
        onOpen: async (peerConnection) => {
            console.log('WEBRTC IS OPENED')
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: {
                    width: 1280,
                    height: 720,
                }
            })
            stream.getTracks().forEach(track => {
                console.log('TRACK', track)
                peerConnection.addTrack(track, stream)
            })
            setLocalStream(stream)
        },
        onTrack: (e) => {
            console.log('peerConnection.ontrack', e.streams)
            setRemoteStreams(p => [...p, ...e.streams])
        },
        onMessage: (e) => setMessages(p => [JSON.parse(e.data), ...p]),
        onIceCandidate: async (e, sessionDescription) => {
            if (e.candidate) {
                setIceCandidates([...iceCandidates, e.candidate])
                socket.emit(WebRTCActions.ICE_CANDIDATE, JSON.stringify(e.candidate))
            }
        }
    })

    useEffect(() => {
        socket.io.on('open', () => {
            console.log('open')
        })

        socket.on(WebRTCActions.ROOM_HAS_CREATED, (data) => {
            setRooms(p => [...p, data])
        })

        socket.on(WebRTCActions.ALL_ROOMS, (data) => {
            setRooms(data)
        })

        socket.on(WebRTCActions.USER_WANT_TO_JOIN, async (offer) => {
            console.log('USER_WANT_TO_JOIN')
            await setRemoteDescription(offer)
            const answer = await setAnswerToLocalDescription()
            socket.emit(WebRTCActions.TO_JOINED_USER, answer)
        })

        socket.on(WebRTCActions.ANSWER_TO_NEW_USER, async (answer) => {
            console.log('ANSWER_TO_NEW_USER')
            try {
                await setRemoteDescription(answer)
            } catch(e) {
                console.log(e)
            }
        })

        socket.on(WebRTCActions.NEW_ICE_CANDIDATE, async (data: string) => {
            const candidate = JSON.parse(data)
            await setIceCandidate(candidate)
        })

        return () => {
            closeConnection()
        }
    }, [])

    const createNewRoom = () => {
        socket.emit(WebRTCActions.CREATE_NEW_ROOM)
    }

    const joinToRoom = async () => {
        const offer = await setOfferToLocalDescription()
        socket.emit(WebRTCActions.JOIN_TO_CHANNEL, offer, socket.id)
    }

    const sendMessageToChat = (message: string) => {
        setMessages(p => [JSON.parse(message), ...p])
        sendMessage(message)
    }

    return (
        <div>
            App
            <ul>
                {rooms.map(room => {
                    return <li key={room}>{room}
                        <button onClick={() => joinToRoom()}>Join</button>
                    </li>
                })}
            </ul>
            <ul>
                {iceCandidates.map((candidate, index) => {
                    return <li key={index}>{candidate.candidate}</li>
                })}
            </ul>
            <button onClick={createNewRoom}>Create new room</button>

            {localStream && <VideoScreen localStream={localStream} remoteStreams={remoteStreams}/>}
            <Chat messages={messages} sendMessage={sendMessageToChat}/>
        </div>
    )
}

export default App
