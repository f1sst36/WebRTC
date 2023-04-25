import express from "express";
import {createServer} from "http";
import {Server} from "socket.io";

const app = express();
const server = createServer(app)
const io = new Server(server)

const WebRTCActions = Object.freeze({
    JOIN_TO_CHANNEL: 'joinToChannel',
    USER_WANT_TO_JOIN: 'userWantToJoin',
    TO_JOINED_USER: 'TO_JOINED_USER',
    ANSWER_TO_NEW_USER: 'ANSWER_TO_NEW_USER',
    NEW_ICE_CANDIDATE: 'new-ice-candidate',
    ICE_CANDIDATE: 'ice-candidate'
})

const database = {
    usersOnline: []
}

io.on('connection', (socket) => {
    console.log('connection is success')
    database.usersOnline.push(socket.id)

    socket.on(WebRTCActions.JOIN_TO_CHANNEL, (offerDescription, socketId) => {
        console.log('JOIN_TO_CHANNEL socketId')
        socket.broadcast.emit(WebRTCActions.USER_WANT_TO_JOIN, offerDescription)
    })

    socket.on(WebRTCActions.TO_JOINED_USER, (answer) => {
        // должен отсылаться только одному юзеру (который заходит в чат)
        console.log('broadcast ANSWER_TO_NEW_USER')
        socket.broadcast.emit(WebRTCActions.ANSWER_TO_NEW_USER, answer)
    })

    socket.on(WebRTCActions.ICE_CANDIDATE, (data) => {
        socket.broadcast.emit(WebRTCActions.NEW_ICE_CANDIDATE, data)
    })

    socket.on('disconnect', () => {
        database.usersOnline = database.usersOnline.filter((id) => id !== socket.id)
        console.log('disconnect', database.usersOnline)
    })
})

server.listen(3000, () => {
    console.log('Server is working')
})