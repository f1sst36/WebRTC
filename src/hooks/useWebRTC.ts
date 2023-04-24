import {useRef} from "react";

export enum ConnectionRole {
    SENDER,
    RECEIVER
}

type Params = {
    onOpen: (peerConnection: RTCPeerConnection) => any
    onMessage: (e: MessageEvent<any>) => any
    onIceCandidate: (e: RTCPeerConnectionIceEvent) => any
    onTrack: (e: RTCTrackEvent) => any
    onAfterInitConnection?: (peerConnection: RTCPeerConnection) => any
    dataChannelLabel?: string,
    peerConnectionConfig?: RTCConfiguration
}

export const useWebRTC = (params: Params) => {
    const peerConnection = useRef<RTCPeerConnection | null>(null)
    // const resolvedPeerConnections = useRef<RTCPeerConnection[]>([])
    const dataChannel = useRef<RTCDataChannel | null>(null)
    const isConnected = useRef<boolean>(false)

    const getPeerConnection = (): RTCPeerConnection => {
        if (!peerConnection.current) throw new Error('Peer connection is null')
        return peerConnection.current
    }

    const getDataChannel = (): RTCDataChannel => {
        if (!dataChannel.current) throw new Error('Data channel is null')
        return dataChannel.current
    }

    const initPeerConnection = () => {
        // if(isConnected.current) {
        //     return
        // }
        // const iceServers = [{ urls: 'stun:stun.l.google.com:19302' }]
        peerConnection.current = new RTCPeerConnection(params.peerConnectionConfig)
        dataChannel.current = getPeerConnection().createDataChannel(params.dataChannelLabel ?? 'data-channel-label')
        
        getPeerConnection().onicecandidate = e => {
            params.onIceCandidate(e)
        }

        getPeerConnection().ondatachannel = e => {
            dataChannel.current = e.channel
        }

        getDataChannel().onopen = () => params.onOpen(getPeerConnection())
        getDataChannel().onmessage = e => params.onMessage(e)

        getPeerConnection().ontrack = e => {
            params.onTrack(e)
        }

        isConnected.current = true
    }

    const sendOffer = async (cb: (offer: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit>) => {
        if (!isConnected.current) {
            return
        }

        const offer = await getPeerConnection().createOffer()
        await getPeerConnection().setLocalDescription(offer)
        const answer = await cb(offer)
        
        return await getPeerConnection().setRemoteDescription(answer)
    }

    const sendAnswer = async (offer: RTCSessionDescriptionInit, cb: (answer: RTCSessionDescriptionInit) => any) => {
        if (!isConnected.current) {
            return
        }

        await getPeerConnection().setRemoteDescription(offer)
        const answer = await getPeerConnection().createAnswer()
        await getPeerConnection().setLocalDescription(answer)
        await cb(answer)
    }

    const closeConnection = () => {
        getPeerConnection().close()
        getDataChannel().close()
    }

    const sendMessage = (message: string) => {
        console.log(getPeerConnection())
        
        getDataChannel().send(message)
    }

    const setIceCandidate = async (candidate: any) => {
        await getPeerConnection().addIceCandidate(new RTCIceCandidate(candidate))
    }

    const addTracksToStream = (stream: MediaStream) => {
        stream.getTracks().forEach(track => {
            getPeerConnection().addTrack(track, stream)
        })
    }

    const replaceTrack = async (newTrack: MediaStreamTrack) => {
        console.log(getPeerConnection().getSenders());
        // TODO - refactor it
        const [,sender] = getPeerConnection().getSenders()
        await sender.replaceTrack(newTrack)
    }

    // Нужно реализовать хук так, чтобы можно было удобно манипулировать 
    // видео и аудио треками на большом кол-ве пир соединений

    return {
        initPeerConnection,
        sendOffer,
        sendAnswer,
        closeConnection,
        sendMessage,
        setIceCandidate,
        addTracksToStream,
        replaceTrack
    } as const
}