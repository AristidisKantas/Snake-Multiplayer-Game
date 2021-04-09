const express = require('express')
const socketio = require('socket.io') // keep

const http = require('http')
const path = require('path')

const { gameLoop, getUpdatedVelocity, initGame } = require('./game')
const { makeId } = require('./utils')
const { FRAME_RATE } = require('./constants')

const state = {}
const clientRooms = {}
// Prepare the port

const port = process.env.PORT || 3000

// Prepare the server 

const app = express() // keep
const server = http.createServer(app) // keep
const io = socketio(server) // keep

const publicDirectoryPath = path.join(__dirname, '../public') // keep
app.use(express.static(publicDirectoryPath)) // keep

// Connection

io.on('connection', client => {


    client.on('keydown', handleKeyDown)
    client.on('newGame', handleNewGame)
    client.on('joinGame', handleJoinGame)

    function handleJoinGame(roomName){
        
        //console.log(io)
        const roomExist =  io.sockets.adapter.rooms.has(roomName);

        let allUsers
        if (roomExist){
            const room = roomData(roomName)
            console.log(room)
            allUsers = room.sockets.size
        }

        let numClients = 0 
        if ( allUsers ) {
            numClients = allUsers
        }

        if ( numClients === 0 ){
            client.emit('unknownGame')
            return
        }else if(numClients > 1 ){
            client.emit('tooManyPlayers')
            return
        }

        clientRooms[client.id] = roomName

        client.join(roomName)
        client.number = 2
        client.emit('init', 2)

        startGameInterval(roomName)
    }

    function handleNewGame() {
        let roomName = makeId(5)
        clientRooms[client.id] = roomName
        client.emit('gameCode', roomName)

        state[roomName] = initGame()

        client.join(roomName)
        client.number = 1
        client.emit('init', 1)
    }

    function handleKeyDown(keyCode){
        const roomName = clientRooms[client.id]

        if(!roomName){
            return
        }

        try{
            keyCode = parseInt(keyCode)
        }catch(e){
            console.error(e)
            return
        }

        const vel = getUpdatedVelocity(keyCode)

        if(vel){
            state[roomName].players[client.number - 1].vel = vel
        }
    }

})

function startGameInterval(roomName){
    const intervalId = setInterval(() => {
        const winner = gameLoop(state[roomName])

        if(!winner) {
            emitGameState(roomName, state[roomName])

        }else{
            emitGameOver(roomName, winner)
            state[roomName] = null
            clearInterval(intervalId)
        }
    }, 1000 / FRAME_RATE)
}

function emitGameState(room, state) {
    io.sockets.in(room)
        .emit('gameState', JSON.stringify(state))
}

function emitGameOver(room, winner) {
    io.sockets.in(room)
        .emit('gameOver', JSON.stringify( { winner } ))
}

function roomData(roomName){
    return room = {
        roomName: roomName,
        sockets: io.sockets.adapter.rooms.get(roomName)
    }
}


server.listen(port, () => {
    console.log('Server is up on port: ' + port)
})