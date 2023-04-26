import { useRef } from "react";
import { TrackKind } from "../enums/webRTC";

export enum ConnectionRole {
	SENDER,
	RECEIVER,
}

type Params = {
	onOpen: (peerConnection: RTCPeerConnection) => any;
	onMessage: (e: MessageEvent<any>) => any;
	onIceCandidate: (e: RTCPeerConnectionIceEvent) => any;
	onTrack: (e: RTCTrackEvent) => any;
	onAfterInitConnection?: (peerConnection: RTCPeerConnection) => any;
	dataChannelLabel?: string;
	peerConnectionConfig?: RTCConfiguration;
};

export const useWebRTC = (params: Params) => {
	const peerConnections = useRef<RTCPeerConnection[]>([]);
	const dataChannels = useRef<RTCDataChannel[]>([]);
	const isConnected = useRef<boolean>(false);
    // const unsettedIceCandidates = useRef<RTCIceCandidate[]>([])

	const initPeerConnection = () => {
		// const iceServers = [{ urls: 'stun:stun.l.google.com:19302' }]
		const peerConnection = new RTCPeerConnection(params.peerConnectionConfig);
		const dataChannel = peerConnection.createDataChannel(params.dataChannelLabel ?? "data-channel-label");

		peerConnection.onicecandidate = (e) => {
			params.onIceCandidate(e);
		};

		peerConnection.ondatachannel = (e) => {
			console.log('ondatachannel', e);
			
			dataChannels.current.forEach((dataChannel, index, originalArray) => {
				console.log(dataChannel.id, e);
				
				// if (dataChannel.id === e.channel.id) {
					originalArray[index] = e.channel;
				// }
			});
		};

		dataChannel.onopen = () => params.onOpen(peerConnection);
		dataChannel.onmessage = (e) => params.onMessage(e);

		peerConnection.ontrack = (e) => {
			params.onTrack(e);
		};

		peerConnections.current.push(peerConnection);
		dataChannels.current.push(dataChannel);

		return peerConnection;
	};

	const sendOffer = async (
		joinedUsersCount: number,
		cb: (offers: RTCSessionDescriptionInit[]) => Promise<RTCSessionDescriptionInit[]>
	) => {
        console.log('joinedUsersCount', joinedUsersCount);
        
        if(joinedUsersCount <= 1) {
            return
        }

		for (let i = 0; i < joinedUsersCount - 1; i++) {
			initPeerConnection();
		}

		const offers: RTCSessionDescriptionInit[] = [];
		for (let i = 0; i < peerConnections.current.length; i++) {
			const offer = await peerConnections.current[i].createOffer();
			await peerConnections.current[i].setLocalDescription(offer);

			offers.push(offer);
		}

        console.log('deb 1');
        
		const answers = await cb(offers);
console.log('deb 2', peerConnections.current);

        if(answers.length !== peerConnections.current.length) {
            console.log(answers, peerConnections.current);
            
            throw new Error('answers !== peer connection')
        }

		for (let i = 0; i < answers.length; i++) {
            await peerConnections.current[i].setRemoteDescription(answers[i]);
		}

		isConnected.current = true;
	};

	const sendAnswer = async (offer: RTCSessionDescriptionInit, cb: (answer: RTCSessionDescriptionInit) => any) => {
        console.log('send answer');
        
		const peerConnection = initPeerConnection();

		await peerConnection.setRemoteDescription(offer);
		const answer = await peerConnection.createAnswer();
		await peerConnection.setLocalDescription(answer);
		await cb(answer);
	};

	const closeConnection = () => {
		// getPeerConnection().close();
		// getDataChannel().close();
	};

	const sendMessage = (message: string) => {
        console.log('peerConnections.current', peerConnections.current);
        
        dataChannels.current.forEach(dataChannel => {
			console.log(dataChannel.id, 123);
			
            dataChannel.send(message)
        })
	};

	const setIceCandidate = async (candidate: any) => {
        // if(!isConnected.current) {
        //     unsettedIceCandidates.current.push(candidate)
        // } else {
        //     for (let i = 0; i < unsettedIceCandidates.current.length; i++) {
        //         await peerConnections.current[i].addIceCandidate(new RTCIceCandidate(unsettedIceCandidates.current[i]));
        //     }
        //     unsettedIceCandidates.current = []

            for (let i = 0; i < peerConnections.current.length; i++) {
                await peerConnections.current[i].addIceCandidate(new RTCIceCandidate(candidate));
            }
        // }
	};

	const addTracksToStream = (stream: MediaStream) => {
		stream.getTracks().forEach((track) => {
			peerConnections.current.forEach(async (peerConnection) => {
				peerConnection.addTrack(track, stream);
			});
		});
	};

	const replaceTrack = async (newTrack: MediaStreamTrack, type: TrackKind) => {
		// TODO (BAG) - если пользователь отдает несколько дорожек, то они все заменятся
		peerConnections.current.forEach(async (peerConnection) => {
			peerConnection.getSenders().forEach(async (sender) => {
				if (sender.track?.kind === type) {
					await sender.replaceTrack(newTrack);
				}
			});
		});
	};

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
		replaceTrack,
	} as const;
};
