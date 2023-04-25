import { useContext, useEffect, useState } from "react";
import { Chat } from "../Chat/Chat";
import { VideoScreen } from "../VideoScreen/VideoScreen";
import styles from "./VideoChat.module.scss";
import { StoreContext } from "../../store";

export const VideoChat = () => {
	const [isMuted, setIsMuted] = useState<boolean>(true);
	const { localStream } = useContext(StoreContext);

	useEffect(() => {
		setIsMutedMicro(true);
	}, []);

	const setIsMutedMicro = (isMuted: boolean) => {
		try {
			if (!localStream) {
				throw new Error("local stream is null");
			}

			localStream.getAudioTracks()[0].enabled = !isMuted;
		} catch (e) {
			console.log("No audio track");
		}
		setIsMuted(isMuted);
	};

	return (
		<div className={styles.videoChat}>
			<VideoScreen isMuted={isMuted} changeMicroState={() => setIsMutedMicro(!isMuted)} />
			<Chat />
		</div>
	);
};
