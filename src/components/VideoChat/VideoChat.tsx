import {useEffect, useState} from "react";
import {Message} from "../../types/chat";
import {Chat} from "../Chat/Chat";
import {VideoScreen} from "../VideoScreen/VideoScreen";
import styles from "./VideoChat.module.scss";

type Props = {
    localStream: MediaStream;
    remoteStreams: MediaStream[];
    sendMessageToChat: (messageText: string) => any;
    messages: Message[];
    shareDisplay: () => Promise<any>
    turnOnWebCamera: () => Promise<any>
    isSharedDisplay: boolean
    isTurnedOnWebCamera: boolean
};

export const VideoChat = ({
      localStream,
      remoteStreams,
      sendMessageToChat,
      messages,
      shareDisplay,
      isSharedDisplay,
      isTurnedOnWebCamera,
      turnOnWebCamera
    }: Props) => {
    const [isMuted, setIsMuted] = useState<boolean>(true);

    useEffect(() => {
        setIsMutedMicro(true);
    }, []);

    const setIsMutedMicro = (isMuted: boolean) => {
        try {
            localStream.getAudioTracks()[0].enabled = !isMuted;
        } catch (e) {
            console.log('No audio track');
        }
        setIsMuted(isMuted);
    };

    return (
        <div className={styles.videoChat}>
            <VideoScreen
                localStream={localStream}
                remoteStreams={remoteStreams}
                isMuted={isMuted}
                changeMicroState={() => setIsMutedMicro(!isMuted)}
                shareDisplay={shareDisplay}
                isSharedDisplay={isSharedDisplay}
                isTurnedOnWebCamera={isTurnedOnWebCamera}
                turnOnWebCamera={turnOnWebCamera}
            />
            <Chat messages={messages} sendMessage={sendMessageToChat}/>
        </div>
    );
};
