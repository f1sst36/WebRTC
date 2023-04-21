type ConstructorParams = {
    peerConnectionConfig: RTCConfiguration,
    dataChannelLabel?: string,
    onOpen: (peerConnection: RTCPeerConnection) => any,
    onMessage: (e: MessageEvent<any>) => any,
    onIceCandidate: (e: RTCPeerConnectionIceEvent, localDescription: RTCSessionDescription | null) => any,
    onTrack: (e: RTCTrackEvent) => any
}

export class WebRTCService {
    private peerConnection: RTCPeerConnection
    private dataChannel: RTCDataChannel

    constructor({
                    peerConnectionConfig,
                    dataChannelLabel,
                    onOpen,
                    onMessage,
                    onIceCandidate,
                    onTrack
                }: ConstructorParams) {
        this.peerConnection = new RTCPeerConnection(peerConnectionConfig)
        this.dataChannel = this.peerConnection.createDataChannel(dataChannelLabel ?? 'data-channel-label')

        this.dataChannel.onopen = () => onOpen(this.peerConnection)
        this.dataChannel.onmessage = e => onMessage(e)
        this.peerConnection.onicecandidate = e => {
            onIceCandidate(e, this.peerConnection.localDescription)
        }
        this.peerConnection.ondatachannel = e => {
            this.dataChannel = e.channel
        }
        this.peerConnection.ontrack = e => {
            onTrack(e)
        }
    }

    public async setOfferToLocalDescription() {
        const offer = await this.peerConnection.createOffer()
        await this.peerConnection.setLocalDescription(offer)
        return offer
    }

    public async setAnswerToLocalDescription() {
        const answer = await this.peerConnection.createAnswer()
        await this.peerConnection.setLocalDescription(answer)
        return answer
    }

    public async setRemoteDescription(sessionDescription: RTCSessionDescription) {
        await this.peerConnection.setRemoteDescription(sessionDescription)
    }

    public closeConnection() {
        this.peerConnection.close()
        this.dataChannel.close()
    }

    public sendMessage(message: string) {
        this.dataChannel.send(message)
    }

    public async setIceCandidate(candidate: any) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
    }
}