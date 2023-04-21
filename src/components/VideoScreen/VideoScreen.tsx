import styles from './VideoScreen.module.scss'

type Props = {
    localStream: MediaStream,
    remoteStreams: MediaStream[]
}
export const VideoScreen = ({localStream, remoteStreams}: Props) => {
    const setStream = (videoElement: HTMLVideoElement | null, stream: MediaStream) => {
        if (videoElement) {
            videoElement.srcObject = stream
        }
    }

    return <div className={styles.screen}>
        <video
            className={styles.remoteVideo}
            ref={(el) => setStream(el, remoteStreams[0])}
            autoPlay
        ></video>
        <video
            className={styles.localVideo}
            ref={(el) => setStream(el, localStream)}
            autoPlay
        ></video>
    </div>
}