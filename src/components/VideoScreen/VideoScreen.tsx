import {useMemo} from "react";
import styles from "./VideoScreen.module.scss";
import {ReactComponent as MicroSVG} from '../../icons/micro.svg'
import {ReactComponent as WebCameraSVG} from '../../icons/web-camera.svg'
import {ReactComponent as ShareScreenSVG} from '../../icons/share-screen.svg'
import {ReactComponent as ShareScreenOffSVG} from '../../icons/share-screen-off.svg'
import {ReactComponent as EndCallSVG} from '../../icons/end-call.svg'
import cn from 'classnames'

type Props = {
    localStream: MediaStream;
    remoteStreams: MediaStream[];
    isMuted: boolean;
    isSharedDisplay: boolean;
    isTurnedOnWebCamera: boolean;
    changeMicroState: () => any;
    shareDisplay: () => Promise<any>;
    turnOnWebCamera: () => Promise<any>;
};
export const VideoScreen = ({
        localStream,
        remoteStreams,
        isMuted,
        changeMicroState,
        shareDisplay,
        isSharedDisplay,
        isTurnedOnWebCamera,
        turnOnWebCamera
    }: Props) => {
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
            <div className={styles.callControls}>
                <div className={cn(styles.button, isMuted && styles.turnedOff)} onClick={changeMicroState}>
                    <MicroSVG/>
                    {isMuted && <div className={styles.crossIcon}/>}
                </div>
                <div className={cn(styles.button, !isTurnedOnWebCamera && styles.turnedOff)} onClick={turnOnWebCamera}>
                    <WebCameraSVG/>
                    {!isTurnedOnWebCamera && <div className={styles.crossIcon}/>}
                </div>
                <div className={styles.button} onClick={shareDisplay}>
                    {isSharedDisplay ? <ShareScreenOffSVG/> : <ShareScreenSVG/>}
                </div>
                <div className={cn(styles.endCall, styles.button)}>
                    <EndCallSVG/>
                </div>
            </div>
        </div>
    );
};
