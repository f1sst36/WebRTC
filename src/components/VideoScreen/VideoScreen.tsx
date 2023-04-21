import styles from './VideoScreen.module.scss'
import {useState} from "react";

type Props = {
    localStream: MediaStream,
    remoteStreams: MediaStream[]
}
export const VideoScreen = ({localStream, remoteStreams}: Props) => {
    const isEnabledMicro = localStream.getAudioTracks()[0].enabled
    const [isMuted, setIsMuted] = useState<boolean>(!isEnabledMicro)
    const offOnMicro = () => {
        localStream.getAudioTracks()[0].enabled = !isEnabledMicro
        setIsMuted(localStream.getAudioTracks()[0].enabled)
    }
    const setStream = (videoElement: HTMLVideoElement, stream: MediaStream) => {
        videoElement.srcObject = stream
    }

    return <div className={styles.screen}>
        <video
            className={styles.remoteVideo}
            ref={(el) => {
                if (el) {
                    setStream(el, remoteStreams[0])
                }
            }}
            autoPlay
        ></video>
        <video
            className={styles.localVideo}
            ref={(el) => {
                if (el) {
                    el.volume = 0
                    setStream(el, localStream)
                }
            }}
            autoPlay
        ></video>
        <button onClick={offOnMicro}>{isMuted ? 'Unmute micro' : 'Mute micro'}</button>
    </div>
}