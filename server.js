import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

const WebRTCActions = Object.freeze({
	// START: "START",
	// SEND_OFFER_TO_SERVER: "SEND_OFFER_TO_SERVER",
	// SENDED_OFFER_TO_SERVER: "SENDED_OFFER_TO_SERVER",
	// NEW_OFFER_TO_CLIENT: "NEW_OFFER_TO_CLIENT",
	// SENDED_ANSWER_TO_SERVER: "SENDED_ANSWER_TO_SERVER",
	// NEW_ANSWER_TO_CLEINT: "NEW_ANSWER_TO_CLEINT",
	// ICE_CANDIDATE: "ICE_CANDIDATE",
	// NEW_ICE_CANDIDATE: "NEW_ICE_CANDIDATE",
	// JOINED_USERS_COUNT: "JOINED_USERS_COUNT"

	JOIN_TO_CHANNEL: "joinToChannel",
	USER_WANT_TO_JOIN: "userWantToJoin",
	TO_JOINED_USER: "TO_JOINED_USER",
	ANSWERS_TO_NEW_USER: "ANSWERS_TO_NEW_USER",
	NEW_ICE_CANDIDATE: "new-ice-candidate",
	ICE_CANDIDATE: "ice-candidate",
	USER_JOINED: "user-joined",
	JOINED_USERS_COUNT: "joined-users-count",
	JOIN: "join",
});

const database = {
	usersOnline: [],
	joinedUsers: [],
	answersToNewUser: {},
	sortedIdsForAnswers: [],
	candidateToJoinId: null,
};

io.on("connection", (socket) => {
	console.log("connection is success");
	database.joinedUsers.push(socket.id);

	io.emit(WebRTCActions.JOINED_USERS_COUNT, database.joinedUsers.length);

	// socket.on(WebRTCActions.START, () => {
	// 	io.emit(WebRTCActions.SEND_OFFER_TO_SERVER)
	// })

	// socket.on(WebRTCActions.SENDED_OFFER_TO_SERVER, (offer) => {
	// 	io.broadcast.emit(WebRTCActions.NEW_OFFER_TO_CLIENT, offer)
	// })

	// socket.on(WebRTCActions.SENDED_ANSWER_TO_SERVER, (answer) => {
	// 	io.broadcast.emit(WebRTCActions.NEW_ANSWER_TO_CLEINT, answer)
	// })

	// socket.on(WebRTCActions.ICE_CANDIDATE, (data) => {
	// 	socket.broadcast.emit(WebRTCActions.NEW_ICE_CANDIDATE, data);
	// });

	socket.on(WebRTCActions.JOIN, () => {
		// database.joinedUsers.push(socket.id);
		database.answersToNewUser = [];
		io.emit(WebRTCActions.JOINED_USERS_COUNT, database.joinedUsers.length);
	});

	socket.on(WebRTCActions.JOIN_TO_CHANNEL, (offers) => {
		console.log("JOIN_TO_CHANNEL socketId");
		console.log("database.joinedUsers", database.joinedUsers);

		// database.joinedUsers.push(socket.id);
		database.candidateToJoinId = socket.id;

		const joinedUsersWithoutMe = database.joinedUsers.filter((socketId) => socketId !== socket.id);
		console.log("joinedUsersWithoutMe", joinedUsersWithoutMe);

		for (let i = 0; i < joinedUsersWithoutMe.length; i++) {
			// if (database.joinedUsers[i] === socket.id) {
			// 	continue;
			// }

			database.sortedIdsForAnswers.push(joinedUsersWithoutMe[i]);
			socket.to(joinedUsersWithoutMe[i]).emit(WebRTCActions.USER_WANT_TO_JOIN, offers[i]);
		}
	});

	socket.on(WebRTCActions.TO_JOINED_USER, (answer) => {
		// должен отсылаться только одному юзеру (который заходит в чат)
		console.log("broadcast ANSWERS_TO_NEW_USER");
		console.log(Object.entries(database.answersToNewUser).length + 1, database.joinedUsers.length - 1);
		if (Object.entries(database.answersToNewUser).length + 1 === database.joinedUsers.length - 1) {
			database.answersToNewUser[socket.id] = answer;

			const resultAnswers = [];
			database.sortedIdsForAnswers.forEach((socketId) => {
				if (database.answersToNewUser[socketId]) {
					resultAnswers.push(database.answersToNewUser[socketId]);
				}
			});
			console.log("resultAnswers", resultAnswers, database.candidateToJoinId);
			io.to(database.candidateToJoinId).emit(WebRTCActions.ANSWERS_TO_NEW_USER, resultAnswers);
			database.answersToNewUser = [];
		} else {
			database.answersToNewUser[socket.id] = answer;
		}
	});

	socket.on(WebRTCActions.ICE_CANDIDATE, (data) => {
		socket.broadcast.emit(WebRTCActions.NEW_ICE_CANDIDATE, data);
	});

	socket.on(WebRTCActions.USER_JOINED, () => {
		// database.joinedUsers.push(socket.id);
		database.candidateToJoinId = null;
		database.answersToNewUser = {};
		database.sortedIdsForAnswers = [];
	});

	socket.on("disconnect", () => {
		database.joinedUsers = database.joinedUsers.filter((id) => id !== socket.id);
	});
});

server.listen(3000, () => {
	console.log("Server is working");
});
