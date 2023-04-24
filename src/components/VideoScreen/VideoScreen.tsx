import { useMemo } from "react";
import styles from "./VideoScreen.module.scss";

type Props = {
	localStream: MediaStream;
	remoteStreams: MediaStream[];
	microStateText: string;
	changeMicroState: () => any;
	shareDisplay: () => Promise<any>;
};
export const VideoScreen = ({ localStream, remoteStreams, microStateText, changeMicroState, shareDisplay }: Props) => {
	const setStream = (videoElement: HTMLVideoElement, stream: MediaStream) => {
		videoElement.srcObject = stream;
	};

	const MemoizatedVideo = useMemo(() => {
		return (
			<>
				<video
					className={styles.remoteVideo}
					ref={(el) => {
						if (el) {
							setStream(el, remoteStreams[0]);
						}
					}}
					autoPlay
				></video>
				<video
					className={styles.localVideo}
					ref={(el) => {
						if (el) {
							el.volume = 0;
							setStream(el, localStream);
						}
					}}
					autoPlay
				></video>
			</>
		);
	}, [localStream, remoteStreams]);

	return (
		<div className={styles.screen}>
			{MemoizatedVideo}
			<button className={styles.muteButton} onClick={changeMicroState}>
				{microStateText}
			</button>
			<button className={styles.shareButton} onClick={shareDisplay}>Share screen</button>
		</div>
	);
};
