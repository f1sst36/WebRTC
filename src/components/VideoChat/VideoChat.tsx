import { useEffect, useState } from "react";
import { Message } from "../../types/chat";
import { Chat } from "../Chat/Chat";
import { VideoScreen } from "../VideoScreen/VideoScreen";
import styles from "./VideoChat.module.scss";

type Props = {
	localStream: MediaStream;
	remoteStreams: MediaStream[];
	sendMessageToChat: (messageText: string) => any;
	messages: Message[];
	shareDisplay: () => Promise<any>
};

export const VideoChat = ({ localStream, remoteStreams, sendMessageToChat, messages, shareDisplay }: Props) => {
	const [isMuted, setIsMuted] = useState<boolean>(true);

	useEffect(() => {
		setIsMutedMicro(true);
	}, []);

	const setIsMutedMicro = (state: boolean) => {
		try {
			localStream.getAudioTracks()[0].enabled = !state;
		} catch (e) {
			console.log('No audio track');
		}
		setIsMuted(state);
	};

	const [microStateText, changeMicroState] = isMuted
		? ["Unmute micro", () => setIsMutedMicro(false)]
		: ["Mute micro", () => setIsMutedMicro(true)];

	return (
		<div className={styles.videoChat}>
			<VideoScreen
				localStream={localStream}
				remoteStreams={remoteStreams}
				microStateText={microStateText}
				changeMicroState={changeMicroState}
				shareDisplay={shareDisplay}
			/>
			<Chat messages={messages} sendMessage={sendMessageToChat} />
		</div>
	);
};
