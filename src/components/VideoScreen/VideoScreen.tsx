import { useContext, useMemo, useState } from "react";
import styles from "./VideoScreen.module.scss";
import { ReactComponent as MicroSVG } from "../../icons/micro.svg";
import { ReactComponent as WebCameraSVG } from "../../icons/web-camera.svg";
import { ReactComponent as ShareScreenSVG } from "../../icons/share-screen.svg";
import { ReactComponent as ShareScreenOffSVG } from "../../icons/share-screen-off.svg";
import { ReactComponent as EndCallSVG } from "../../icons/end-call.svg";
import cn from "classnames";
import { StoreContext } from "../../store";

type Props = {
	isMuted: boolean;
	changeMicroState: () => any;
};

export const VideoScreen = ({ isMuted, changeMicroState }: Props) => {
	const {
		localStream,
		remoteStreams,
		isTurnedOnWebCamera,
		turnOnWebCamera,
		turnOffWebCamera,
		shareDisplay,
		isSharedDisplay,
		declineSharingDisplay,
		endCall,
	} = useContext(StoreContext);
	const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);

	const setStream = (videoElement: HTMLVideoElement, stream: MediaStream) => {
		videoElement.srcObject = stream;
	};

	const resizeVideo = (streamId: string) => {
		if (selectedStreamId === streamId) {
			setSelectedStreamId(null);
			return;
		}

		setSelectedStreamId(streamId);
	};

	const MemoizatedVideo = useMemo(() => {
		return (
			<>
				{remoteStreams.map((remoteStream) => {
					return (
						<video
							key={remoteStream.id}
							onClick={() => {
								resizeVideo(remoteStream.id);
							}}
							className={cn(styles.video, selectedStreamId === remoteStream.id && styles.fullScreen)}
							ref={(el) => {
								if (el) {
									setStream(el, remoteStream);
								}
							}}
							autoPlay
						></video>
					);
				})}
				{localStream && (
					<video
						onClick={() => {
							resizeVideo(localStream.id);
						}}
						className={cn(styles.video, selectedStreamId === localStream.id && styles.fullScreen)}
						ref={(el) => {
							if (el) {
								el.volume = 0;
								setStream(el, localStream);
							}
						}}
						autoPlay
					></video>
				)}
			</>
		);
	}, [localStream, remoteStreams, selectedStreamId]);

	return (
		<div className={styles.screen}>
			<div className={styles.videos}>{MemoizatedVideo}</div>
			<div className={styles.callControls}>
				<div className={cn(styles.button, isMuted && styles.turnedOff)} onClick={changeMicroState}>
					<MicroSVG />
					{isMuted && <div className={styles.crossIcon} />}
				</div>
				{turnOnWebCamera && turnOffWebCamera && (
					<div
						className={cn(styles.button, !isTurnedOnWebCamera && styles.turnedOff)}
						onClick={isTurnedOnWebCamera ? turnOffWebCamera : turnOnWebCamera}
					>
						<WebCameraSVG />
						{!isTurnedOnWebCamera && <div className={styles.crossIcon} />}
					</div>
				)}
				{shareDisplay && declineSharingDisplay && (
					<div className={styles.button} onClick={isSharedDisplay ? declineSharingDisplay : shareDisplay}>
						{isSharedDisplay ? <ShareScreenOffSVG /> : <ShareScreenSVG />}
					</div>
				)}
				{endCall && (
					<div onClick={endCall} className={cn(styles.endCall, styles.button)}>
						<EndCallSVG />
					</div>
				)}
			</div>
		</div>
	);
};
