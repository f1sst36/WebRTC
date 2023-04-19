import {socket} from './services/socket'
import {useEffect, useState} from "react";
import {WebRTCActions} from "./enums/webRTC";
import {useWebRTC} from "./hooks/useWebRTC";

function App() {
    const [rooms, setRooms] = useState<number[]>([])
    const {setOfferToLocalDescription, setAnswerToLocalDescription, setRemoteDescription, sendMessage, closeConnection} = useWebRTC({
        onMessage: (e) => console.log('onMessage', e.data),
        onIceCandidate: async (e, sessionDescription) => {
            console.log('onIceCandidate', e, sessionDescription)

            if (sessionDescription?.type === 'answer') {
                socket.emit('answer', sessionDescription)
            }
        }
    })

    useEffect(() => {
        socket.io.on('open', () => {
            console.log('open')
        })

        socket.on(WebRTCActions.ROOM_HAS_CREATED, (data) => {
            console.log('room has created', data)
            setRooms(p => [...p, data])
        })

        socket.on(WebRTCActions.ALL_ROOMS, (data) => {
            console.log('ALL_ROOMS received', data)
            setRooms(data)
        })

        socket.on(WebRTCActions.USER_WANT_TO_JOIN, async (data) => {
            console.log('USER_WANT_TO_JOIN', data)
            await setRemoteDescription(data)
            await setAnswerToLocalDescription()
        })

        socket.on('answer2', (data) => {
            console.log('answer2', data)
            setRemoteDescription(data)
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
        socket.emit(WebRTCActions.JOIN_TO_CHANNEL, offer)
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
            <button onClick={sendTestMessage}>Send</button>
            <button onClick={createNewRoom}>Create new room</button>
        </div>
    )
}

export default App
