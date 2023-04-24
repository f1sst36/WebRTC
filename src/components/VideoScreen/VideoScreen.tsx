import styles from './VideoScreen.module.scss'

type Props = {
    localStream: MediaStream,
    remoteStreams: MediaStream[],
    microStateText: string, 
    changeMicroState: () => any
}
export const VideoScreen = ({localStream, remoteStreams, microStateText, changeMicroState}: Props) => {
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
        <button className={styles.muteButton} onClick={changeMicroState}>{microStateText}</button>
    </div>
}