import {useEffect, useRef} from "react";

type Params = {
    onOpen?: (...args: any) => any,
    onMessage: (e: MessageEvent<any>) => any,
    onIceCandidate: (e: RTCPeerConnectionIceEvent, sessionDescription: RTCSessionDescription | null) => any,
    dataChannelLabel?: string,
}

export const useWebRTC = (params: Params) => {
    const peerConnection = useRef<RTCPeerConnection | null>(null)
    const dataChannel = useRef<RTCDataChannel | null>(null)

    const getPeerConnection = (): RTCPeerConnection => {
        if (!peerConnection.current) throw new Error('Peer connection is null')
        return peerConnection.current
    }

    const getDataChannel = (): RTCDataChannel => {
        if (!dataChannel.current) throw new Error('Data channel is null')
        return dataChannel.current
    }

    useEffect(() => {
        peerConnection.current = new RTCPeerConnection()
        dataChannel.current = getPeerConnection().createDataChannel(params.dataChannelLabel ?? 'data-channel-label')

        getDataChannel().onopen = params.onOpen || null
        getDataChannel().onmessage = e => params.onMessage(e)
        getPeerConnection().onicecandidate = e => {
            params.onIceCandidate(e, getPeerConnection().localDescription)
        }
        getPeerConnection().ondatachannel = e => {
            dataChannel.current = e.channel
        }
    }, [])

    const setOfferToLocalDescription = async (): Promise<RTCSessionDescriptionInit> => {
        const offer = await getPeerConnection().createOffer()
        await getPeerConnection().setLocalDescription(offer)
        return offer
    }

    const setAnswerToLocalDescription = async () => {
        const answer = await getPeerConnection().createAnswer()
        return getPeerConnection().setLocalDescription(answer)
    }

    const setRemoteDescription = async (sessionDescription: RTCSessionDescription) => {
        return getPeerConnection().setRemoteDescription(sessionDescription)
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
        sendMessage
    } as const
}