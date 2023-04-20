import {useEffect, useRef} from "react";

type Params = {
    onOpen: (peerConnection: RTCPeerConnection, remotePeerConnections: RTCPeerConnection[]) => any,
    onMessage: (e: MessageEvent<any>) => any,
    onIceCandidate: (e: RTCPeerConnectionIceEvent, sessionDescription: RTCSessionDescription | null) => any,
    onTrack: (e: RTCTrackEvent) => any
    dataChannelLabel?: string,
}

export const useWebRTC = (params: Params) => {
    const peerConnection = useRef<RTCPeerConnection | null>(null)
    const remotePeerConnections = useRef<RTCPeerConnection[]>([])
    const dataChannel = useRef<RTCDataChannel | null>(null)

    const getPeerConnection = (): RTCPeerConnection => {
        if (!peerConnection.current) throw new Error('Peer connection is null')
        return peerConnection.current
    }

    const getRemotePeerConnections = (): RTCPeerConnection[] => {
        if (!remotePeerConnections.current) throw new Error('Remote peer connections is null')
        return remotePeerConnections.current
    }

    const getDataChannel = (): RTCDataChannel => {
        if (!dataChannel.current) throw new Error('Data channel is null')
        return dataChannel.current
    }

    useEffect(() => {
        const iceServers = [{ urls: 'stun:stun.l.google.com:19302' }]
        peerConnection.current = new RTCPeerConnection({iceServers})
        dataChannel.current = getPeerConnection().createDataChannel(params.dataChannelLabel ?? 'data-channel-label')

        getDataChannel().onopen = () => params.onOpen(getPeerConnection(), getRemotePeerConnections())
        getDataChannel().onmessage = e => params.onMessage(e)
        getPeerConnection().onicecandidate = e => {
            params.onIceCandidate(e, getPeerConnection().localDescription)
        }
        getPeerConnection().ondatachannel = e => {
            dataChannel.current = e.channel
        }
        getPeerConnection().ontrack = e => {
            params.onTrack(e)
        }
    }, [])

    const setOfferToLocalDescription = async (): Promise<RTCSessionDescriptionInit> => {
        const offer = await getPeerConnection().createOffer()
        await getPeerConnection().setLocalDescription(offer)
        return offer
    }

    const setAnswerToLocalDescription = async () => {
        const answer = await getPeerConnection().createAnswer()
        await getPeerConnection().setLocalDescription(answer)
        return answer
    }

    const setRemoteDescription = async (sessionDescription: RTCSessionDescription) => {
        return await getPeerConnection().setRemoteDescription(sessionDescription)
    }

    const closeConnection = () => {
        getPeerConnection().close()
        getDataChannel().close()
    }

    const sendMessage = (message: string) => {
        getDataChannel().send(message)
    }

    return {
        setOfferToLocalDescription,
        setAnswerToLocalDescription,
        setRemoteDescription,
        closeConnection,
        sendMessage,
        getPeerConnection
    } as const
}