import { useState } from "react";
import { Message } from "../../types/chat";
import { Chat } from "../Chat/Chat";
import { VideoScreen } from "../VideoScreen/VideoScreen";
import styles from "./VideoChat.module.scss";

type Props = {
	localStream: MediaStream;
	remoteStreams: MediaStream[];
	sendMessageToChat: (messageText: string) => any;
	messages: Message[];
};

export const VideoChat = ({ localStream, remoteStreams, sendMessageToChat, messages }: Props) => {
	const [isMuted, setIsMuted] = useState<boolean>(!localStream.getAudioTracks()[0].enabled);

	const muteMicro = () => {
		localStream.getAudioTracks()[0].enabled = false;
		setIsMuted(true);
	};

	const unmuteMicro = () => {
		localStream.getAudioTracks()[0].enabled = true;
		setIsMuted(false);
	};

	const [microStateText, changeMicroState] = isMuted ? ["Unmute micro", unmuteMicro] : ["Mute micro", muteMicro];

	return (
		<div className={styles.videoChat}>
			<VideoScreen
				localStream={localStream}
				remoteStreams={remoteStreams}
				microStateText={microStateText}
				changeMicroState={changeMicroState}
			/>
			<Chat messages={messages} sendMessage={sendMessageToChat} />
		</div>
	);
};
