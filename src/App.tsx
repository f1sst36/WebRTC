import {socket} from './services/socket'
import {useEffect, useRef, useState} from "react";
import {WebRTCActions} from "./enums/webRTC";
import {useWebRTC} from "./hooks/useWebRTC";

function App() {
    const video1 = useRef<HTMLVideoElement>(null)
    const video2 = useRef<HTMLVideoElement>(null)
    const [iceCandidates, setIceCandidates] = useState<RTCIceCandidate[]>([])

    const [rooms, setRooms] = useState<number[]>([])
    const {
        setOfferToLocalDescription,
        setAnswerToLocalDescription,
        setRemoteDescription,
        sendMessage,
        closeConnection,
        getPeerConnection
    } = useWebRTC({
        onOpen: async (peerConnection, remotePeerConnections) => {
            console.log('WEBRTC IS OPENED')
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    width: 1280,
                    height: 720,
                }
            })
            stream.getTracks().forEach(track => {
                console.log('TRACK', track)
                peerConnection.addTrack(track, stream)
            })
            video1.current!.srcObject = stream

            console.log('iceCandidates', iceCandidates)
        },
        onTrack: (e) => {
            console.log('iceCandidates', iceCandidates)
            console.log('peerConnection.ontrack', e.streams)
            video2.current!.srcObject = e.streams[0]
        },
        onMessage: (e) => console.log('onMessage', e.data),
        onIceCandidate: async (e, sessionDescription) => {
            console.log('onIceCandidate')

            if (e.candidate) {
                setIceCandidates([...iceCandidates, e.candidate])
                socket.emit('ice-candidate', JSON.stringify(e.candidate))
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
            socket.emit('TO_JOINED_USER', answer)
        })

        socket.on('ANSWER_TO_NEW_USER', async (answer) => {
            console.log('ANSWER_TO_NEW_USER')
            await setRemoteDescription(answer)
        })

        socket.on('new-ice-candidate', async (data: string) => {
            const candidate = JSON.parse(data)
            console.log('new-ice-candidate', candidate)
            await getPeerConnection().addIceCandidate(new RTCIceCandidate(candidate))
            console.log(getPeerConnection())
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

    const sendTestMessage = () => {
        sendMessage('some test text ' + Math.random())
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
            <button onClick={sendTestMessage}>Send</button>
            <button onClick={createNewRoom}>Create new room</button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <video style={{ width: '100%' }} ref={video1} autoPlay></video>
                <video style={{ width: '100%' }} ref={video2} autoPlay></video>
            </div>
        </div>
    )
}

export default App
