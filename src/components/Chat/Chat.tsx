import styles from './Chat.module.scss'
import React, {FormEventHandler, useState} from "react";
import {Message} from "../../types/chat";
import {ReactComponent as SendSVG} from "../../icons/send.svg";

type Props = {
    messages: Message[],
    sendMessage: (messageText: string) => any
}
export const Chat = ({messages, sendMessage}: Props) => {
    const [messageText, setMessageText] = useState<string>('')

    const sendMessageWrapper: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault()
        if(messageText === '') {
            return
        }

        try {
            sendMessage(JSON.stringify({
                id: Math.random(),
                text: messageText
            }))
        } catch(e) {
            console.error(e)
        }
        setMessageText('')
    }

    return <div className={styles.chat}>
        <ul className={styles.messages}>
            {messages.map(message => {
                return <li key={message.id} className={styles.message}>{message.text}</li>
            })}
        </ul>
        <form className={styles.sendingForm} onSubmit={sendMessageWrapper}>
             <input
                 placeholder='Message text'
                 className={styles.textfield}
                 value={messageText}
                 onChange={(e) => setMessageText(e.target.value)}
             ></input>
            <button type='submit'>
                <SendSVG />
            </button>
        </form>
    </div>
}