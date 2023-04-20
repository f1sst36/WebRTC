import express from "express";
import {createServer} from "http";
import {Server} from "socket.io";

const app = express();
const server = createServer(app)
const io = new Server(server)

const WebRTCActions = Object.freeze({
    CREATE_NEW_ROOM: 'createNewRoom',
    ROOM_HAS_CREATED: 'roomHasCreated',
    ALL_ROOMS: 'allRooms',
    JOIN_TO_CHANNEL: 'joinToChannel',
    USER_WANT_TO_JOIN: 'userWantToJoin'
})

const database = {
    rooms: [1, 2, 3],
    usersOnline: {}
}

io.on('connection', (socket) => {
    console.log('connection is success')
    io.emit(WebRTCActions.ALL_ROOMS, database.rooms)

    socket.on(WebRTCActions.CREATE_NEW_ROOM, () => {
        console.log(WebRTCActions.CREATE_NEW_ROOM)
        const roomId = Math.random()
        database.rooms.push(roomId)
        io.emit(WebRTCActions.ROOM_HAS_CREATED, roomId)
    })

    socket.on(WebRTCActions.JOIN_TO_CHANNEL, (offerDescription, socketId) => {
        console.log('JOIN_TO_CHANNEL socketId')
        if(!database.usersOnline.hasOwnProperty(socketId)) {
            database.usersOnline[socketId] = {
                offerDescription
            }
        }

        socket.broadcast.emit(WebRTCActions.USER_WANT_TO_JOIN, offerDescription)
    })
    //
    // socket.on('answer', (data) => {
    //     console.log('answer event')
    //     socket.broadcast.emit('answer2', data)
    // })

    socket.on('TO_JOINED_USER', (answer) => {
        // должен отсылаться только одному юзеру (который заходит в чат)
        socket.broadcast.emit('ANSWER_TO_NEW_USER', answer)
    })

    socket.on('ice-candidate', (data) => {
        socket.broadcast.emit('new-ice-candidate', data)
    })
})



server.listen(3000, () => {
    console.log('Server is working')
})