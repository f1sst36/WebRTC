import React from "react";
import { Message } from "../types/chat";

type Store = {
	localStream: MediaStream | null;
	remoteStreams: MediaStream[];
	sendMessageToChat: ((text: string) => void) | null;
	messages: Message[];
	shareDisplay: (() => Promise<void>) | null;
	declineSharingDisplay: (() => void) | null;
	isSharedDisplay: boolean;
	isTurnedOnWebCamera: boolean;
	turnOnWebCamera: (() => void) | null;
	turnOffWebCamera: (() => void) | null;
	endCall: (() => void) | null;
};

export const StoreContext = React.createContext<Store>({
	localStream: null,
	remoteStreams: [],
	sendMessageToChat: null,
	messages: [],
	shareDisplay: null,
	declineSharingDisplay: null,
	isSharedDisplay: false,
	isTurnedOnWebCamera: false,
	turnOnWebCamera: null,
	turnOffWebCamera: null,
	endCall: null,
});

export const StoreProvider = StoreContext.Provider;
